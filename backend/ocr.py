import pytesseract
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import os

app = Flask(__name__)
CORS(app)  # Enable CORS

# Set the Tesseract OCR path 
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"  

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        image = Image.open(file_path)
        extracted_text = pytesseract.image_to_string(image, lang="eng")
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"text": extracted_text})

if __name__ == "__main__":
    app.run(port=5004, debug=True)

