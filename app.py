from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from pdf_utils_1 import extract_text_from_pdf, save_text_to_file

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/upload", methods=["POST"])
def upload_pdf():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    # 파일 저장
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    # 텍스트 추출
    text = extract_text_from_pdf(filepath)
    save_text_to_file(text)  # output.txt 저장됨

    return jsonify({
        "message": "텍스트 추출 완료!",
        "filename": file.filename
    })

if __name__ == "__main__":
    app.run(debug=True)
