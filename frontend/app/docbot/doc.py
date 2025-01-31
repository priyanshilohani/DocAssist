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

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)

@app.route('/')
def home():
    return jsonify({"message": "Welcome to DocBot! Upload a PDF and start chatting."})

bart_model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn").to("cpu")
bert_model = SentenceTransformer('all-MiniLM-L6-v2', device="cpu")
bart_tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")
nlp = spacy.load("en_core_web_sm")

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

def get_answer(user_input, document_chunks):
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

@app.route('/api/process-document', methods=['POST'])
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

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_input = data.get("user_input", "")
        document_chunks = data.get("document_chunks", [])

        if not user_input or not document_chunks:
            return jsonify({"error": "Missing user input or document chunks!"}), 400

        logging.info(f"User input: {user_input}")
        logging.info(f"Number of document chunks: {len(document_chunks)}")

        logging.info(f"First chunk: {document_chunks[0]}")

        answer= get_answer(user_input, document_chunks)
        logging.info(f"answer generated: {answer}")

        return jsonify(answer)
    
    except Exception as e:
        logging.error(f"Error generating answer: {str(e)}")
        return jsonify({"error": f"Error generating answer: {str(e)}"}), 500
    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from PyPDF2 import PdfReader
# from langchain.text_splitter import CharacterTextSplitter
# from langchain_community.embeddings import SentenceTransformerEmbeddings
# #from sentence_transformers import SentenceTransformer
# from langchain_community.vectorstores import FAISS
# from langchain.memory import ConversationBufferMemory
# from langchain.chains import ConversationalRetrievalChain
# from langchain_community.llms import HuggingFaceHub
# import os
# import numpy as np


# app = Flask(__name__)
# CORS(app)

# # Initialize SentenceTransformer model
# embedding_model = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
# #embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# @app.route('/')
# def home():
#     return jsonify({"message": "Welcome to DocBot! Upload a PDF and start chatting."})

# vectorstore = None
# conversation_chain = None

# @app.route('/test-vectorstore', methods=['GET'])
# def test_vectorstore_creation():
#     """Test the creation of a vectorstore."""
#     try:
#         text_chunks = ["This is a test document.", "It contains multiple sentences."]
#         embeddings = embedding_model.encode(text_chunks)
#         test_vectorstore = FAISS.from_texts(texts=text_chunks, embedding=embeddings)

#         if test_vectorstore:
#             print(f"Test vectorstore created successfully: {test_vectorstore}")
#             return jsonify({"message": "Test vectorstore created successfully"})
#         else:
#             print("Failed to create test vectorstore.")
#             return jsonify({"error": "Failed to create test vectorstore"}), 500
#     except Exception as e:
#         print(f"Error creating vectorstore: {e}")
#         return jsonify({"error": f"Error creating vectorstore: {e}"}), 500

# def process_pdf(file):
#     """Extracts text from a PDF file, processes it into chunks, and creates a vectorstore."""
#     global vectorstore, conversation_chain

#     text = ""
#     pdf_reader = PdfReader(file)
#     for page in pdf_reader.pages:
#         text += page.extract_text() or ""

#     print(f"Extracted text length: {len(text)}")  # Debugging log

#     if len(text) == 0:
#         print("Error: No text extracted from PDF.")  # Debugging log
#         return

#     text_splitter = CharacterTextSplitter(
#         separator="\n", chunk_size=1000, chunk_overlap=200, length_function=len
#     )
#     text_chunks = text_splitter.split_text(text)

#     print(f"Total text chunks: {len(text_chunks)}")  # Debugging log

#     if len(text_chunks) == 0:
#         print("Error: No chunks created.")  # Debugging log
#         return

#     #embeddings = embedding_model.encode(text_chunks, convert_to_numpy=True)
#     #embeddings=np.array(embeddings)
    
#     vectorstore = FAISS.from_texts(texts=text_chunks, embedding=embedding_model)
#     print("Vectorstore successfully created!")  # Debugging log

#     llm = HuggingFaceHub(repo_id="google/flan-t5-xxl", model_kwargs={"temperature": 0.5, "max_length": 512})
#     memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True)

#     conversation_chain = ConversationalRetrievalChain.from_llm(
#         llm=llm, retriever=vectorstore.as_retriever(), memory=memory
#     )

#     print("Conversational retrieval chain initialized!")  # Debugging log


# @app.route('/api/upload', methods=['POST'])
# def upload_file():
#     """Handles PDF file uploads and processes them."""
#     if 'file' not in request.files:
#         return jsonify({"error": "No file uploaded"}), 400
    
#     file = request.files['file']
#     if file.filename == '':
#         return jsonify({"error": "No selected file"}), 400

#     print("Processing PDF:", file.filename)  # Debugging log

#     process_pdf(file)

#     print(f"Vectorstore created: {vectorstore}") #log

#     if vectorstore is None:
#         return jsonify({"error": "Failed to process file"}), 500

#     return jsonify({"message": "File processed successfully"})

# @app.route('/api/chat', methods=['POST'])
# def chat():
#     """Handles user questions and retrieves AI-generated responses."""
#     global conversation_chain, vectorstore

#     if not vectorstore:
#         print("Error: No vectorstore found")  # Debugging log
#     if not conversation_chain:
#         return jsonify({"answer": "No document processed yet. Please upload a file first."})
    
#     data = request.json
#     user_question = data.get("question", "")

#     if not user_question:
#         return jsonify({"answer": "Question cannot be empty."})
    
#     print(f"User asked: {user_question}")  # Debugging log

#     response = conversation_chain({'question': user_question})
#     print(f"AI Response: {response}")  # Debugging log

#     return jsonify({"answer": response['chat_history'][-1].content})


# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=8000, debug=True)

