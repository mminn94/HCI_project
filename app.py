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

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

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

    prompt_plan = f"""
    아래 내용을 바탕으로, 이 과목의 학습 계획을 짜줘.
    각 항목마다 줄바꿈(\n)을 포함해서 보기 좋게 정리해줘.
    내용: {final_summary}
    """
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

    return jsonify({
        "message": "텍스트 추출, 요약, 학습계획 자동 생성 완료!",
        "filename": file.filename,
        "summary": final_summary,
        "study_plan": final_plan
    })


@app.route("/api/update-plan", methods=["POST"])
def update_plan():
    data = request.get_json()
    feedback = data.get("feedback")
    current_plan = data.get("currentPlan")

    prompt_update = f"""
    아래의 학습 계획을 참고해서, 사용자의 피드백을 반영해서 새롭게 계획을 다시 짜줘.
    사용자 피드백: {feedback}
    현재 학습 계획: {current_plan}
    각 항목마다 줄바꿈(\n)으로 정리해줘.
    """

    headers = {"Content-Type": "application/json"}
    data_update = {
        "model": MODEL,
        "prompt": prompt_update
    }

    response_update = requests.post(
        OLLAMA_URL,
        headers=headers,
        data=json.dumps(data_update),
        stream=True
    )

    updated_plan = ""
    for line in response_update.iter_lines():
        if line:
            obj = json.loads(line.decode("utf-8"))
            updated_plan += obj.get("response", "")

    return jsonify({
        "status": "success",
        "updated_plan": updated_plan
    })

@app.route("/api/done-today", methods=["POST"])
def done_today():
    data = request.get_json()
    done_tasks = data.get("doneTasks")

    with open("done_today.json", "w", encoding="utf-8") as f:
        json.dump(done_tasks, f, ensure_ascii=False, indent=2)

    with open("study_plan.json", "r", encoding="utf-8") as f:
        study_plan = json.load(f)

    remaining_plan = [task for task in study_plan if task not in done_tasks]

    with open("remaining_plan.json", "w", encoding="utf-8") as f:
        json.dump(remaining_plan, f, ensure_ascii=False, indent=2)

    return jsonify({
        "message": "오늘 완료 항목 저장 & 남은 계획 갱신 완료!",
        "remaining_plan": remaining_plan
    })


if __name__ == "__main__":
    app.run(debug=True)