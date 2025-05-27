from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import json
from pdf_utils_1 import extract_text_from_pdf, save_text_to_file
from datetime import datetime

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

    # Ollama에게 요약 요청
    prompt_summary = f"""
    아래 내용을 한국어로 요약해줘:\n
    내용:
    {text}

    작성 시 주의사항:
    큰 항목은 "1.","2."처럼 번호를 붙여서 정리해줘.
    각 항목마다 줄바꿈(\n)을 포함해서 보기 좋게 정리해줘.
    """

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

    # 계획 짜줌
    prompt_plan = f"""
    아래 내용을 바탕으로, 이 과목의 학습 계획을 작성해줘.
    
    학습 내용 요약:
    {final_summary}

    작성 시 주의사항:
    큰 항목(예: 과목, 큰 챕터)은 "1.", "2."처럼 번호를 붙여서 작성해줘.
    각 항목의 세부 내용은 줄로 구분해줘.
    최종 결과는 아래 처럼 번호 있는 큰 항목들만 따로 선택할 수 있도록 해줘 !
    예)
    1. 힙 정렬 (약 1시간)
    * 이론 학습: 힙의 개념
    * 실습: 힙 구현 실습
    
    2. 해시 테이블 (약 2시간)
    * 이론 학습: 충돌 처리
    * 실습: 해시 구현 실습

    각 항목마다 줄바꿈(\n)을 포함해서 보기 좋게 정리해줘.
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
    아래의 학습 계획을 참고해서, 사용자의 피드백을 반영해서 새롭게 계획을 다시 작성해줘.

    기존 학습 계획:
    {current_plan}

    사용자 피드백:
    {feedback}

    작성 시 주의사항:
    큰 항목은 "1.", "2."처럼 번호를 붙여서 구분해줘.
    각 항목의 세부 내용은 줄로 구분해줘.
    각 항목마다 줄바꿈(\n)을 넣어서 보기 좋게 정리해줘.
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

@app.route('/api/today-plan', methods=['GET'])
def get_today_plan():
    today = datetime.now().strftime('%Y-%m-%d')
    remaining_file_path = f"data/{today}_remaining_plan.json"
    today_file_path = f"data/{today}_today_plan.json"
    
    if os.path.exists(remaining_file_path):
        with open(remaining_file_path, 'r', encoding='utf-8') as f:
            tasks = json.load(f)

    elif os.path.exists(today_file_path):
        with open(today_file_path, 'r', encoding='utf-8') as f:
            tasks = json.load(f)
    else:
        tasks = []
    
    return jsonify({"todayTasks": tasks})

@app.route('/api/today-plan', methods=['POST'])
def save_today_plan():
    data = request.json
    today_tasks = data.get('todayTasks', [])
    if not today_tasks:
        return jsonify({"message": "오늘 할 일 목록이 비어있어요!"}), 400
    
    today = datetime.now().strftime('%Y-%m-%d')
    file_path = f"data/{today}_today_plan.json"
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(today_tasks, f, ensure_ascii=False, indent=2)
    
    return jsonify({"message": "오늘 할 일 저장 완료!"})

@app.route("/api/done-today", methods=["POST"])
def done_today():
    data = request.get_json()
    done_tasks = data.get("doneTasks")

    today = datetime.now().strftime('%Y-%m-%d')

    # 오늘 완료 항목 저장
    done_file = f"data/{today}_done_today.json"
    with open(done_file, "w", encoding="utf-8") as f:
        json.dump(done_tasks, f, ensure_ascii=False, indent=2)

    study_plan_file = f"data/{today}_today_plan.json"
    if not os.path.exists(study_plan_file):
        study_plan_file = "data/{today}_today_plan.json"

    with open(study_plan_file, "r", encoding="utf-8") as f:
        study_plan = json.load(f)

    remaining_plan = [task for task in study_plan if task not in done_tasks]

    remaining_file = f"data/{today}_remaining_plan.json"
    with open(remaining_file, "w", encoding="utf-8") as f:
        json.dump(remaining_plan, f, ensure_ascii=False, indent=2)

    return jsonify({
        "message": f"{today} 완료 항목 저장 & 남은 계획 갱신 완료!",
        "remaining_plan": remaining_plan
    })

@app.route("/api/history/<date>", methods=["GET"])
def get_history(date):
    folder = "data"
    today_plan_file = f"{folder}/{date}_today_plan.json"
    done_today_file = f"{folder}/{date}_done_today.json"
    remaining_plan_file = f"{folder}/{date}_remaining_plan.json"

    def read_json(file):
        if os.path.exists(file):
            with open(file, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    return jsonify({
        "todayTasks": read_json(today_plan_file),
        "doneTasks": read_json(done_today_file),
        "remainingPlan": read_json(remaining_plan_file),
    })

if __name__ == "__main__":
    app.run(debug=True)