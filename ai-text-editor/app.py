import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"  
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "max_split_size_mb:128"  

import streamlit as st
from sentence_transformers import SentenceTransformer
from transformers import BartForConditionalGeneration, BartTokenizer
import pdfplumber
import docx
import re
import spacy
import numpy as np

# Load models
bart_model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn").to("cpu")
bert_model = SentenceTransformer('all-MiniLM-L6-v2', device="cpu")
bart_tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")
nlp = spacy.load("en_core_web_sm")  # For sentence segmentation

# Placeholder for document chunks
document_chunks = []

# Function to clean and g text
def clean_text(text):
    text = re.sub(r"\s+", " ", text).strip()  # Normalize spaces
    return text

# Function to split content into chunks
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

# Process and chunk text files
def process_text(file_content):
    global document_chunks
    cleaned_content = clean_text(file_content)
    chunks = split_into_chunks(cleaned_content)
    embeddings = bert_model.encode(chunks)
    
    document_chunks.extend([
        {"chunk_id": len(document_chunks) + i, "text": chunk, "embedding": embeddings[i]}
        for i, chunk in enumerate(chunks)
    ])
    return "Text file processed successfully!"

# Process PDF files
def process_pdf(uploaded_file):
    global document_chunks
    with pdfplumber.open(uploaded_file) as pdf:
        content = ""
        for page in pdf.pages:
            content += page.extract_text()
    return process_text(content)

# Process DOCX files
def process_docx(uploaded_file):
    global document_chunks
    doc = docx.Document(uploaded_file)
    content = "\n".join([para.text for para in doc.paragraphs])
    return process_text(content)

# Handle file uploads
def process_document(uploaded_file):
    if uploaded_file.name.endswith(".txt"):
        return process_text(uploaded_file.read().decode("utf-8"))
    elif uploaded_file.name.endswith(".pdf"):
        return process_pdf(uploaded_file)
    elif uploaded_file.name.endswith(".docx"):
        return process_docx(uploaded_file)
    else:
        return "Unsupported file format!"

# Function to generate suggestions using BART summarization
def get_suggestions(user_input, document_chunks):
    query_embedding = bert_model.encode(user_input)

    # Cosine similarity function
    def cosine_similarity(a, b):
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

    # Find and rank relevant chunks by similarity
    results = []
    for chunk in document_chunks:
        similarity = cosine_similarity(query_embedding, chunk["embedding"])
        results.append((chunk["text"], similarity))
    results = sorted(results, key=lambda x: x[1], reverse=True)[:3]

    # Concatenate top chunks for summarization
    relevant_texts = " ".join([r[0] for r in results])

    # Summarize using BART
    input_ids = bart_tokenizer.encode(relevant_texts, return_tensors='pt', max_length=1024, truncation=True)
    summary_ids = bart_model.generate(input_ids, max_length=300, min_length=100, length_penalty=2.0, num_beams=4, early_stopping=True)
    summarized_text = bart_tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    # Clean and reformat into bullet points
    summarized_text = clean_text(summarized_text)
    unique_sentences = list(dict.fromkeys(summarized_text.split('. ')))  # Remove duplicates

    bullet_points = "\n".join([f"- {sentence.strip()}" for sentence in unique_sentences if sentence.strip()])
    return bullet_points

# Streamlit App Layout
st.title("DocAssist: AI-Enhanced Document Summarizer")

# Upload Section
st.header("Step 1: Upload Your Documents")
uploaded_files = st.file_uploader("Upload files (.txt, .pdf, .docx)", type=["txt", "pdf", "docx"], accept_multiple_files=True)

if uploaded_files:
    for uploaded_file in uploaded_files:
        result = process_document(uploaded_file)
        st.success(f"{uploaded_file.name}: {result}")

# Text Editor Section
st.header("Step 2: Write Your Query or Notes")
user_input = st.text_area("Enter text here:")

if user_input:
    st.subheader("Suggestions Based on Your Input:")
    suggestions = get_suggestions(user_input, document_chunks)
    st.write(suggestions)

# Summarization and Notes Section
st.header("Step 3: Summarize and Generate Notes")
if document_chunks:
    # Combine all chunks
    combined_content = " ".join([chunk["text"] for chunk in document_chunks])
    
    st.subheader("Generated Notes:")
    input_ids = bart_tokenizer.encode(combined_content, return_tensors='pt', max_length=1024, truncation=True)
    summary_ids = bart_model.generate(input_ids, max_length=300, min_length=100, length_penalty=2.0, num_beams=4, early_stopping=True)
    summarized_text = bart_tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    # Clean and reformat into bullet points
    summarized_text = clean_text(summarized_text)
    unique_sentences = list(dict.fromkeys(summarized_text.split('. ')))  # Remove duplicates

    notes = "\n".join([f"- {sentence.strip()}" for sentence in unique_sentences if sentence.strip()])
    st.write(notes)

# Sidebar Debugging Info
st.sidebar.subheader("Processed Chunks")
if document_chunks:
    st.sidebar.write(f"Total Chunks: {len(document_chunks)}")
    for chunk in document_chunks[:5]:  # Display first 5 chunks for context
        st.sidebar.write(f"Chunk {chunk['chunk_id']}: {chunk['text'][:100]}...")
