from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from transformers import BartForConditionalGeneration, BartTokenizer
import pdfplumber
import docx
import re
import spacy
import numpy as np
import jwt
import datetime
import logging
import os
from pymongo import MongoClient
from flask_cors import CORS
from functools import wraps

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True)  # Allow frontend to send credentials (cookies)

# Load environment variables
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default_secret_key")

# Set up logging
logging.basicConfig(level=logging.INFO)

# Connect to MongoDB
try:
    mongo_client = MongoClient("mongodb://localhost:27017/")
    db = mongo_client["DocAssist"]
    documents_collection = db["documents"]
    logging.info("Connected to MongoDB successfully!")
except Exception as e:
    logging.error(f"Error connecting to MongoDB: {e}")
    exit(1)

# Load NLP models
try:
    bart_model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn").to("cpu")
    bert_model = SentenceTransformer('all-MiniLM-L6-v2', device="cpu")
    bart_tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")
    nlp = spacy.load("en_core_web_sm")
except Exception as e:
    logging.error(f"Error loading models: {e}")
    exit(1)

# JWT Authentication Middleware
# JWT Authentication Middleware
def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        logging.info(f"Headers received: {request.headers}")
        logging.info(f"Cookies received: {request.cookies}")

        token = request.headers.get("Authorization")  # Check Header

        if token:
            logging.info(f"Raw Authorization Header: {token}")
            token_parts = token.split(" ")
            if len(token_parts) == 2 and token_parts[0] == "Bearer":
                token = token_parts[1]  # Extract token after "Bearer"
            else:
                logging.error("Invalid Authorization format!")
                return jsonify({"error": "Invalid Authorization format!"}), 401
        else:
            token = request.cookies.get("token")  # Try from cookies
            if not token:
                logging.error("Authentication token is missing!")
                return jsonify({"error": "Authentication token is missing!"}), 401

        try:
            decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            logging.info(f"Decoded Token: {decoded_token}")
            request.user_id = decoded_token["user_id"]
        except jwt.ExpiredSignatureError:
            logging.error("Token has expired!")
            return jsonify({"error": "Token has expired!"}), 401
        except jwt.InvalidTokenError:
            logging.error("Invalid token!")
            return jsonify({"error": "Invalid token!"}), 401

        return f(*args, **kwargs)

    return decorated_function

# Helper functions for text extraction
def extract_text_from_pdf(file):
    with pdfplumber.open(file) as pdf:
        return "\n".join(page.extract_text() for page in pdf.pages if page.extract_text())

def extract_text_from_docx(file):
    doc = docx.Document(file)
    return "\n".join(para.text for para in doc.paragraphs)

def clean_text(text):
    return re.sub(r"\s+", " ", text).strip()

# API Endpoint: Process Document
@app.route("/process-document", methods=["POST"])
@auth_required
def process_document():
    try:
        file = request.files.get("file")
        if not file:
            return jsonify({"error": "No file provided!"}), 400

        logging.info(f"Processing file: {file.filename}")

        # Extract text based on file type
        if file.filename.endswith(".txt"):
            content = file.read().decode("utf-8")
        elif file.filename.endswith(".pdf"):
            content = extract_text_from_pdf(file)
        elif file.filename.endswith(".docx"):
            content = extract_text_from_docx(file)
        else:
            return jsonify({"error": "Unsupported file format!"}), 400

        cleaned_content = clean_text(content)

        # Generate document embeddings
        document_embedding = bert_model.encode(cleaned_content).tolist()

        logging.info(f"Embedding generated with length: {len(document_embedding)}")

        # Save document and embeddings in MongoDB
        document_entry = {
            "user_id": request.user_id,
            "filename": file.filename,
            "content": cleaned_content,
            "embedding": document_embedding,
            "timestamp": datetime.datetime.utcnow()
        }
        documents_collection.insert_one(document_entry)
        logging.info("Document successfully saved in MongoDB")

        return jsonify({"message": "File processed and embedded successfully!"})

    except Exception as e:
        logging.error(f"Error processing document: {str(e)}")
        return jsonify({"error": f"Error processing document: {str(e)}"}), 500

# Run Flask App
if __name__ == "__main__":
    app.run(debug=False, port=5002)