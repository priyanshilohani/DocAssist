from flask import Flask, request, jsonify
from flask_cors import CORS
import nltk
import re
import os
from collections import Counter
from werkzeug.utils import secure_filename
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize

# Download necessary NLTK resources
nltk.download("punkt")
nltk.download("stopwords")

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

SECTION_HEADERS = {
    "IEEE": ["Abstract", "Introduction", "Literature Review", "Methodology", "Results", "Conclusion", "References"],
    "Springer": ["Abstract", "Introduction", "Background", "Methods", "Results", "Discussion", "Conclusion", "References"],
    "Elsevier": ["Abstract", "Introduction", "Materials and Methods", "Results", "Discussion", "Conclusion", "References"]
}

def parse_sections(text, format_type):
    headers = SECTION_HEADERS.get(format_type, SECTION_HEADERS["IEEE"])
    sections = {header: "" for header in headers}
    current_section = None

    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue  # Skip empty lines

        # Check if line matches any section header
        for header in headers:
            if re.match(rf"^{header}", line, re.IGNORECASE):
                current_section = header
                break  # Stop checking once the correct header is found

        if current_section:
            # Append line without repeating the section title
            if not re.match(rf"^{current_section}", line, re.IGNORECASE):
                sections[current_section] += line + "\n"

    return sections

def extract_keywords(text, num_keywords=5):
    words = word_tokenize(text.lower())
    stop_words = set(stopwords.words("english"))
    filtered_words = [word for word in words if word.isalnum() and word not in stop_words]

    most_common_words = Counter(filtered_words).most_common(num_keywords)
    keywords = [word for word, _ in most_common_words]

    return ", ".join(keywords)

def format_document(sections, format_type):
    formatted_text = ""
    section_number = 1  # For numbering sections

    for header, content in sections.items():
        content = content.strip()

        # Add numbering only after "Abstract"
        if header.lower() != "abstract" and header.lower() != "references":
            numbered_header = f"{section_number}. {header}"
            section_number += 1
        else:
            numbered_header = header

        # Bold section headers
        if not content:
            formatted_text += f"**{numbered_header}**\n\n"
        else:
            # Preserve bullet points in "Methodology" or "Materials and Methods"
            if header in ["Methodology", "Materials and Methods"] and "\n" in content:
                content = "\n".join(f"- {line.strip()}" if not line.startswith("-") else line for line in content.split("\n"))

            formatted_text += f"**{numbered_header}**\n{content}\n\n"

    # Add bold-italic Keywords if Abstract exists
    if "Abstract" in sections and sections["Abstract"].strip():
        full_text = " ".join(sections.values())
        keywords = extract_keywords(full_text)
        formatted_text = formatted_text.replace(
    f"**Abstract**\n{sections['Abstract'].strip()}",
    f"**Abstract**\n{sections['Abstract'].strip()}\n\n**Keywords**\n{keywords}"
)

        

    return formatted_text.strip()


@app.route("/upload", methods=["POST"])
def upload_file():
    format_type = request.form.get("format", "IEEE")
    
    if "manual_text" in request.form:
        raw_text = request.form["manual_text"]
    elif "file" in request.files:
        file = request.files["file"]
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        with open(filepath, "r", encoding="utf-8") as f:
            raw_text = f.read()
    else:
        return jsonify({"error": "No input provided"}), 400

    sections = parse_sections(raw_text, format_type)
    formatted_text = format_document(sections, format_type)

    return jsonify({"formatted_text": formatted_text})


if __name__ == "__main__":
    app.run(debug=True, port=5005)
 




