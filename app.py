from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import json
from pdf_utils_1 import extract_text_from_pdf, save_text_to_file

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "gemma3:4b"

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
    save_text_to_file(text)

    # 1️⃣ Ollama에게 요약 요청
    prompt_summary = f"아래 내용을 한국어로 요약해줘:\n{text}"
    headers = {"Content-Type": "application/json"}
    data_summary = {
        "model": MODEL,
        "prompt": prompt_summary
    }

    response_summary = requests.post(
        OLLAMA_URL,
        headers=headers,
        data=json.dumps(data_summary),
        stream=True
    )

    final_summary = ""
    for line in response_summary.iter_lines():
        if line:
            obj = json.loads(line.decode("utf-8"))
            final_summary += obj.get("response", "")

    # 2️⃣ Ollama에게 학습 계획 요청 (요약본 기반)
    prompt_plan = f"아래 내용을 바탕으로, 이 과목의 학습 계획을 짜줘.\n내용: {final_summary}"
    data_plan = {
        "model": MODEL,
        "prompt": prompt_plan
    }

    response_plan = requests.post(
        OLLAMA_URL,
        headers=headers,
        data=json.dumps(data_plan),
        stream=True
    )

    final_plan = ""
    for line in response_plan.iter_lines():
        if line:
            obj = json.loads(line.decode("utf-8"))
            final_plan += obj.get("response", "")

    # ✅ React에게 요약 + 학습계획 둘 다 반환
    return jsonify({
        "message": "텍스트 추출, 요약, 학습계획 자동 생성 완료!",
        "filename": file.filename,
        "summary": final_summary,
        "study_plan": final_plan
    })

if __name__ == "__main__":
    app.run(debug=True)
