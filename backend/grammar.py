from flask import Flask, request, jsonify
from transformers import T5ForConditionalGeneration, T5Tokenizer

app = Flask(__name__)

# Load Grammar Correction Model
MODEL_NAME = "t5-small"  # Try "grammarly/coedit-large" for better results
try:
    tokenizer = T5Tokenizer.from_pretrained(MODEL_NAME)
    model = T5ForConditionalGeneration.from_pretrained(MODEL_NAME)
    print("✅ Model Loaded Successfully")
except Exception as e:
    print(f"❌ Model Loading Failed: {str(e)}")
    exit(1)  # Stop execution if model fails to load

@app.route('/checkgrammar', methods=['POST'])
def grammar_check():
    try:
        data = request.json
        text = data.get("text", "").strip()

        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Prepare input for model
        input_text = "grammar: " + text
        inputs = tokenizer(input_text, return_tensors="pt", max_length=512, truncation=True)

        # Generate corrected text
        outputs = model.generate(**inputs, max_length=100, num_beams=5, early_stopping=True)
        corrected_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

        return jsonify({"corrected_text": corrected_text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5007, debug=True)
