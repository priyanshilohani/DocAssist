from flask import Flask, request, jsonify
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from language_tool_python import LanguageTool
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Flask server!"})

class Paraphrase:
    def __init__(self):
        self.model = AutoModelForSeq2SeqLM.from_pretrained("ramsrigouthamg/t5-large-paraphraser-diverse-high-quality")
        self.tokenizer = AutoTokenizer.from_pretrained("ramsrigouthamg/t5-large-paraphraser-diverse-high-quality")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self.model.to(self.device)

    def rewrite(self, text) -> list:
        encoding = self.tokenizer.encode_plus(text, max_length=128, padding=True, return_tensors="pt")
        input_ids, attention_mask = encoding["input_ids"].to(self.device), encoding["attention_mask"].to(self.device)
        
        self.model.eval()
        diverse_beam_outputs = self.model.generate(
            input_ids=input_ids, attention_mask=attention_mask, max_length=128, early_stopping=True,
            num_beams=5, num_beam_groups=5, num_return_sequences=5, diversity_penalty=0.70
        )
        
        phc = []
        for beam_output in diverse_beam_outputs:
            sent = self.tokenizer.decode(beam_output, skip_special_tokens=True, clean_up_tokenization_spaces=True)
            if sent.lower() != text.lower() and sent not in phc:
                phc.append(sent)
        return phc

def extract_sentences(sentences) -> list:
    return [sentence.replace("paraphrasedoutput:", "").strip() for sentence in sentences]

def appropriation(sentences):
    tool = LanguageTool('en-US')
    best_sentence, best_grammar_score = "", float('-inf')
    for sentence in sentences:
        grammar_score = len(tool.check(sentence))
        if grammar_score > best_grammar_score:
            best_grammar_score, best_sentence = grammar_score, sentence
    return best_sentence


para = Paraphrase()

@app.route("/paraphrase", methods=["POST"])
def paraphrase_text():
    try:
        data = request.json
        text = data.get("text", "")
        
        if not text:
            return jsonify({"error": "No text provided!"}), 400
        
        paraphrases = para.rewrite(text)
        cleaned_paraphrases = extract_sentences(paraphrases) 
        #best_paraphrase = appropriation(extract_sentences(paraphrases))
        
        #return jsonify({"original": text, "paraphrase": best_paraphrase, "alternatives": paraphrases})
        #return jsonify({"original": text, "paraphrase": paraphrases, "alternatives": paraphrases})
        return jsonify({"original": text, "paraphrase": cleaned_paraphrases[0] if cleaned_paraphrases else "", "alternatives": cleaned_paraphrases})

    except Exception as e:
        return jsonify({"error": f"Error paraphrasing text: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(port=5003, debug=True)  # Run on a different port
