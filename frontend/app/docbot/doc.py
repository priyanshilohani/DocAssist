from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.embeddings import SentenceTransformerEmbeddings
#from sentence_transformers import SentenceTransformer
from langchain_community.vectorstores import FAISS
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain_community.llms import HuggingFaceHub
import os
import numpy as np


app = Flask(__name__)
CORS(app)

# Initialize SentenceTransformer model
embedding_model = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
#embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

@app.route('/')
def home():
    return jsonify({"message": "Welcome to DocBot! Upload a PDF and start chatting."})

vectorstore = None
conversation_chain = None

@app.route('/test-vectorstore', methods=['GET'])
def test_vectorstore_creation():
    """Test the creation of a vectorstore."""
    try:
        text_chunks = ["This is a test document.", "It contains multiple sentences."]
        embeddings = embedding_model.encode(text_chunks)
        test_vectorstore = FAISS.from_texts(texts=text_chunks, embedding=embeddings)

        if test_vectorstore:
            print(f"Test vectorstore created successfully: {test_vectorstore}")
            return jsonify({"message": "Test vectorstore created successfully"})
        else:
            print("Failed to create test vectorstore.")
            return jsonify({"error": "Failed to create test vectorstore"}), 500
    except Exception as e:
        print(f"Error creating vectorstore: {e}")
        return jsonify({"error": f"Error creating vectorstore: {e}"}), 500

def process_pdf(file):
    """Extracts text from a PDF file, processes it into chunks, and creates a vectorstore."""
    global vectorstore, conversation_chain

    text = ""
    pdf_reader = PdfReader(file)
    for page in pdf_reader.pages:
        text += page.extract_text() or ""

    print(f"Extracted text length: {len(text)}")  # Debugging log

    if len(text) == 0:
        print("Error: No text extracted from PDF.")  # Debugging log
        return

    text_splitter = CharacterTextSplitter(
        separator="\n", chunk_size=1000, chunk_overlap=200, length_function=len
    )
    text_chunks = text_splitter.split_text(text)

    print(f"Total text chunks: {len(text_chunks)}")  # Debugging log

    if len(text_chunks) == 0:
        print("Error: No chunks created.")  # Debugging log
        return

    #embeddings = embedding_model.encode(text_chunks, convert_to_numpy=True)
    #embeddings=np.array(embeddings)
    
    vectorstore = FAISS.from_texts(texts=text_chunks, embedding=embedding_model)
    print("Vectorstore successfully created!")  # Debugging log

    llm = HuggingFaceHub(repo_id="google/flan-t5-xxl", model_kwargs={"temperature": 0.5, "max_length": 512})
    memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True)

    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm=llm, retriever=vectorstore.as_retriever(), memory=memory
    )

    print("Conversational retrieval chain initialized!")  # Debugging log


@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handles PDF file uploads and processes them."""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    print("Processing PDF:", file.filename)  # Debugging log

    process_pdf(file)

    print(f"Vectorstore created: {vectorstore}") #log

    if vectorstore is None:
        return jsonify({"error": "Failed to process file"}), 500

    return jsonify({"message": "File processed successfully"})

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handles user questions and retrieves AI-generated responses."""
    global conversation_chain, vectorstore

    if not vectorstore:
        print("Error: No vectorstore found")  # Debugging log
    if not conversation_chain:
        return jsonify({"answer": "No document processed yet. Please upload a file first."})
    
    data = request.json
    user_question = data.get("question", "")

    if not user_question:
        return jsonify({"answer": "Question cannot be empty."})
    
    print(f"User asked: {user_question}")  # Debugging log

    response = conversation_chain({'question': user_question})
    print(f"AI Response: {response}")  # Debugging log

    return jsonify({"answer": response['chat_history'][-1].content})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)


