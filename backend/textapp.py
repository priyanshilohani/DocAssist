from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from transformers import BartForConditionalGeneration, BartTokenizer
import pdfplumber
import docx
import re
import spacy
import numpy as np
import logging
from flask_cors import CORS

# Initialize the Flask app and CORS
app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)

# Root route
@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Flask server!"})

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
    with pdfplumber.open(file) as pdf:
        content = "".join(page.extract_text() for page in pdf.pages)
    return process_text(content)

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
    
    suggestions = []
    for i, (text, score) in enumerate(results):
        input_ids = bart_tokenizer.encode(text, return_tensors='pt', max_length=1024, truncation=True)
        summary_ids = bart_model.generate(input_ids, max_length=300, min_length=100, length_penalty=2.0, num_beams=4, early_stopping=True)
        summarized_text = bart_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        
        # Remove bullet points and format as plain text
        plain_text = summarized_text.replace("\n", " ").replace("•", "").strip()
        suggestions.append({"id": i + 1, "text": plain_text})
    
    return suggestions

# API Endpoints
@app.route("/process-document", methods=["POST"])
def process_document():
    try:
        document_chunks = []
        file = request.files.get("file")
        
        if not file:
            return jsonify({"error": "No file provided!"}), 400
        
        logging.info(f"Processing file: {file.filename}")
        
        if file.filename.endswith(".txt"):
            content = file.read().decode("utf-8")
            document_chunks = process_text(content)
        elif file.filename.endswith(".pdf"):
            document_chunks = process_pdf(file)
        elif file.filename.endswith(".docx"):
            document_chunks = process_docx(file)
        else:
            return jsonify({"error": "Unsupported file format!"}), 400
        
        logging.info(f"Processed {len(document_chunks)} chunks.")
        return jsonify({"message": "File processed successfully!", "chunks": document_chunks})

    except Exception as e:
        logging.error(f"Error processing document: {str(e)}")
        return jsonify({"error": f"Error processing document: {str(e)}"}), 500

@app.route("/get-suggestions", methods=["POST"])
def get_suggestions_api():
    try:
        data = request.json
        user_input = data.get("user_input", "")
        document_chunks = data.get("document_chunks", [])

        if not user_input or not document_chunks:
            return jsonify({"error": "Missing user input or document chunks!"}), 400

        logging.info(f"User input: {user_input}")
        logging.info(f"Number of document chunks: {len(document_chunks)}")

        suggestions = get_suggestions(user_input, document_chunks)
        logging.info(f"Suggestions generated: {suggestions}")

        return jsonify(suggestions)

    except Exception as e:
        logging.error(f"Error generating suggestions: {str(e)}")
        return jsonify({"error": f"Error generating suggestions: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)