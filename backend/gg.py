from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from transformers import BartForConditionalGeneration, BartTokenizer
import pdfplumber
import docx
import re
import spacy
import numpy as np
from flask_cors import CORS
import jwt
from pymongo import MongoClient
import datetime
import uuid
import os

app = Flask(__name__)
CORS(app)

# Secret key for decoding JWT tokens (Should be the same as the auth server's SECRET_KEY)
SECRET_KEY = "your_secret_key_here"

# MongoDB connection (If you want to store documents)
try:
    mongo_client = MongoClient("mongodb://localhost:27017/")  # Adjust if your MongoDB is hosted elsewhere
    db = mongo_client["DocAssist"]
    documents_collection = db["documents"]
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

# Maximum allowed file size for uploads (16 MB in this case)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB

# Load models
bart_model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn").to("cpu")
bert_model = SentenceTransformer('all-MiniLM-L6-v2', device="cpu")
bart_tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")
nlp = spacy.load("en_core_web_sm")

# Helper functions
def clean_text(text):
    return re.sub(r"\s+", " ", text).strip()

def split_into_chunks(text, max_chunk_size=512):
    doc = nlp(text)
    sentences = [sent.text.strip() for sent in doc.sents]
    chunks, current_chunk = [], ""
    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= max_chunk_size:
            current_chunk += " " + sentence
        else:
            chunks.append(current_chunk.strip())
            current_chunk = sentence
    if current_chunk:
        chunks.append(current_chunk.strip())
    return chunks

def process_text(content):
    cleaned_content = clean_text(content)
    chunks = split_into_chunks(cleaned_content)
    embeddings = bert_model.encode(chunks)
    return [{"text": chunk, "embedding": embeddings[i].tolist()} for i, chunk in enumerate(chunks)]

def process_pdf(file):
    try:
        with pdfplumber.open(file) as pdf:
            content = "".join(page.extract_text() for page in pdf.pages)
            if not content:
                print("No text found in the PDF.")  # If no text is extracted
            else:
                print(f"Extracted content: {content[:500]}...")  # Show first 500 characters for debugging
    except Exception as e:
        print(f"Error extracting PDF content: {str(e)}")
    return process_text(content) if content else []  # Return empty list if no content

def process_docx(file):
    doc = docx.Document(file)
    content = "\n".join(para.text for para in doc.paragraphs)
    return process_text(content)

def get_suggestions(user_input, document_chunks):
    query_embedding = bert_model.encode(user_input)
    def cosine_similarity(a, b):
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    results = sorted(
        [(chunk["text"], cosine_similarity(query_embedding, chunk["embedding"])) for chunk in document_chunks],
        key=lambda x: x[1],
        reverse=True
    )[:3]
    relevant_texts = " ".join([r[0] for r in results])
    input_ids = bart_tokenizer.encode(relevant_texts, return_tensors='pt', max_length=1024, truncation=True)
    summary_ids = bart_model.generate(input_ids, max_length=300, min_length=100, length_penalty=2.0, num_beams=4, early_stopping=True)
    summarized_text = bart_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    unique_sentences = list(dict.fromkeys(summarized_text.split('. ')))
    return [{"bullet_point": sentence.strip()} for sentence in unique_sentences if sentence.strip()]

# Helper function to decode JWT and get user information
def decode_jwt(token):
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        print(f"Decoded JWT Token: {decoded_token}")  # Debugging token
        return decoded_token
    except jwt.ExpiredSignatureError:
        print("JWT Token expired")  # Token expired
        return None
    except jwt.InvalidTokenError:
        print("Invalid JWT Token")  # Invalid token
        return None

@app.route("/process-document", methods=["POST"])
def process_document():
    try:
        # Extract JWT token from request headers
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Token is missing!"}), 401
        
        token = token.split(" ")[1]  # Assumes the token is sent as "Bearer <token>"
        user_data = decode_jwt(token)
        if not user_data:
            return jsonify({"error": "Invalid or expired token!"}), 401
        
        user_id = user_data["user_id"]  # Get the user_id from the decoded token

        # Process multiple documents
        uploaded_files = request.files.getlist("files")  # Get list of files from the request
        if not uploaded_files:
            return jsonify({"error": "No files uploaded!"}), 400
        
        # Log the received files
        for file in uploaded_files:
            print(f"Received file: {file.filename}")  # Log the filename to verify it's being received

        all_chunks = []
        for file in uploaded_files:
            if file.filename.endswith(".txt"):
                content = file.read().decode("utf-8")
                chunks = process_text(content)
                all_chunks.extend(chunks)

            elif file.filename.endswith(".pdf"):
                chunks = process_pdf(file)
                all_chunks.extend(chunks)

            elif file.filename.endswith(".docx"):
                chunks = process_docx(file)
                all_chunks.extend(chunks)

            else:
                return jsonify({"error": f"Unsupported file format: {file.filename}!"}), 400

        # Generate a unique document_id
        document_id = str(uuid.uuid4())

        # Document data to save to MongoDB
        document_data = {
            "document_id": document_id,
            "user_id": user_id,
            "document_name": [file.filename for file in uploaded_files],
            "document_chunks": all_chunks,  # Store chunks for all uploaded documents
            "embeddings": [chunk["embedding"] for chunk in all_chunks],
            "uploaded_at": datetime.datetime.utcnow()
        }

        try:
            documents_collection.insert_one(document_data)
            print("Document saved to MongoDB successfully!")
            return jsonify({"message": "Files processed successfully!", "chunks": all_chunks})

        except Exception as e:
            print(f"Error saving document to MongoDB: {e}")
            return jsonify({"error": f"Error saving documents: {e}"}), 500

    except Exception as e:
        print(f"Error during document processing: {e}")
        return jsonify({"error": f"Error processing document: {str(e)}"}), 500

@app.route("/get-suggestions", methods=["POST"])
def get_suggestions_api():
    data = request.json
    user_input = data.get("user_input", "")
    document_id = data.get("document_id", "")
    
    # Retrieve the document from MongoDB using document_id
    document = documents_collection.find_one({"document_id": document_id})
    
    if not document:
        return jsonify({"error": "Document not found!"}), 404
    
    document_chunks = document["document_chunks"]
    document_embeddings = document["embeddings"]

    # Get the embedding for the user's input
    query_embedding = bert_model.encode(user_input)

    def cosine_similarity(a, b):
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

    # Find the most similar chunks based on the cosine similarity of embeddings
    results = sorted(
        [(chunk, cosine_similarity(query_embedding, emb)) for chunk, emb in zip(document_chunks, document_embeddings)],
        key=lambda x: x[1],  # Sort by similarity score
        reverse=True
    )[:3]  # Top 3 suggestions

    relevant_texts = [r[0] for r in results]
    return jsonify({"suggestions": relevant_texts})

if __name__ == "__main__":
    app.run(debug=True)
