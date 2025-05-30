from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import json
from pdf_utils_1 import extract_text_from_pdf, save_text_to_file
from datetime import datetime, timedelta
import pytz

KST = pytz.timezone('Asia/Seoul')

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "gemma3:4b"

# -----------------------------------------
#파일 업로드
@app.route("/api/upload", methods=["POST"])
def upload_file_only():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    # 업로드 후 텍스트 추출해서 파일로만 저장 (선택)
    text = extract_text_from_pdf(filepath)
    save_text_to_file(text)

    return jsonify({
        "message": "파일 업로드 완료!",
        "filename": file.filename
    })

#파일 요약
@app.route("/api/summary", methods=["POST"])
def generate_summary():
    data = request.get_json()
    filename = data.get("filename")
    if not filename:
        return jsonify({"error": "파일명을 입력하세요!"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "업로드된 파일을 찾을 수 없어요!"}), 404

    text = extract_text_from_pdf(filepath)

    prompt_summary = f"""
    아래 내용을 한국어로 요약해줘:\n
    내용:
    {text}

    작성 시 주의사항:
    큰 항목은 "1.","2."처럼 번호를 붙여서 정리해줘.
    각 항목마다 줄바꿈(\n)을 포함해서 보기 좋게 정리해줘.
    ** 같은 기호 쓰지 말아줘. (즉, 볼드 처리 하지 말아줘)
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

    with open("summary.txt", "w", encoding="utf-8") as f:
        f.write(final_summary)

    return jsonify({
        "message": "요약 완료!",
        "summary": final_summary
    })

#파일 토대로 계획 작성하기
@app.route("/api/plan", methods=["POST"])
def generate_study_plan():
    data = request.get_json()
    filename = data.get("filename")
    summary = data.get("summary")
    if not filename or not summary:
        return jsonify({"error": "파일명과 요약 내용을 입력하세요!"}), 400

    prompt_plan = f"""
    아래 내용을 바탕으로, 이 과목의 학습 계획을 작성해줘.
    
    학습 내용 요약:
    {summary}

    작성 시 주의사항:
    큰 항목(예: 과목, 큰 챕터)은 "1.", "2."처럼 번호를 붙여서 작성해줘.
    각 항목의 세부 내용은 줄로 구분해줘.
    최종 결과는 아래 처럼 번호 있는 큰 항목들만 따로 선택할 수 있도록 해줘!
    그리고 중요한 항목을 순위대로 1,2,3.. 순위로 매겨줘.
    실제로 공부할 때 참고할 수 있도록 실용적으로 작성해줘.
    ** 같은 기호 쓰지 말아줘. (즉, 볼드 처리 하지 말아줘)

    예)
    1. 힙 정렬 (예상 소요 시간: 1시간) - 2순위
    * 이론 학습: 힙의 개념
    * 실습: 힙 구현 실습
    
    2. 해시 테이블 (예상 소요 시간: 2시간) - 1순위
    * 이론 학습: 충돌 처리
    * 실습: 해시 구현 실습

    각 항목마다 줄바꿈(\n)을 포함해서 보기 좋게 정리해줘.
    """

    headers = {"Content-Type": "application/json"}
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
        "message": "학습 계획 생성 완료!",
        "study_plan": final_plan
    })

# -------------------------------------------
#사용자 피드백 받아서 새로운 계획 작성
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
    그리고 중요한 거를 순위대로 1,2,3 .. 순위로 매겨줘.
    실제로 공부할 때 참고할 수 있도록 실용적으로 작성해줘.
    ** 같은 기호 쓰지 말아줘. (즉, 볼드 처리 하지 말아줘)
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

# --------------------------------------------------
#오늘 할일 조회
@app.route('/api/today-plan', methods=['GET'])
def get_today_plan():
    today = datetime.now(KST).strftime('%Y-%m-%d')
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

#오늘 할일 저장
@app.route('/api/today-plan', methods=['POST'])
def save_today_plan():
    data = request.json
    today_tasks = data.get('todayTasks', [])
    if not today_tasks:
        return jsonify({"message": "오늘 할 일 목록이 비어있어요!"}), 400
    
    today = datetime.now(KST).strftime('%Y-%m-%d')
    today_file_path = f"data/{today}_today_plan.json"
    remaining_file_path = f"data/{today}_remaining_plan.json"

    with open(today_file_path, 'w', encoding='utf-8') as f:
        json.dump(today_tasks, f, ensure_ascii=False, indent=2)

    with open(remaining_file_path, 'w', encoding='utf-8') as f:
        json.dump(today_tasks, f, ensure_ascii=False, indent=2)

    return jsonify({"message": "오늘 할 일 저장 완료!"})

#오늘 완료 항목 저장
@app.route("/api/done-today", methods=["POST"])
def done_today():
    data = request.get_json()
    new_done_tasks = data.get("doneTasks")

    today = datetime.now(KST).strftime('%Y-%m-%d')

    done_file = f"data/{today}_done_today.json"

    if os.path.exists(done_file):
        with open(done_file, "r", encoding="utf-8") as f:
            done_tasks = json.load(f)
    else:
        done_tasks = []

    # 새로운 완료 항목을 기존 done_tasks에 추가 (중복 제거)
    for task in new_done_tasks:
        if task not in done_tasks:
            done_tasks.append(task)

    # 업데이트된 완료 항목 저장
    with open(done_file, "w", encoding="utf-8") as f:
        json.dump(done_tasks, f, ensure_ascii=False, indent=2)

    # 남은 할일 갱신
    study_plan_file = f"data/{today}_today_plan.json"
    with open(study_plan_file, "r", encoding="utf-8") as f:
        study_plan = json.load(f)

    remaining_plan = [task for task in study_plan if task not in done_tasks]

    remaining_file = f"data/{today}_remaining_plan.json"
    with open(remaining_file, "w", encoding="utf-8") as f:
        json.dump(remaining_plan, f, ensure_ascii=False, indent=2)

    return jsonify({
        "message": f"{today} 완료 항목 append & 남은 계획 갱신 완료!",
        "remaining_plan": remaining_plan
    })

#오늘 할일 삭제
@app.route("/api/delete-today-task", methods=["POST"])
def delete_today_task():
    data = request.get_json()
    task_to_delete = data.get("task")

    today = datetime.now(KST).strftime('%Y-%m-%d')
    today_file = f"data/{today}_today_plan.json"
    remaining_file = f"data/{today}_remaining_plan.json"

    for file_path in [today_file, remaining_file]:
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                tasks = json.load(f)
            if task_to_delete in tasks:
                tasks.remove(task_to_delete)
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(tasks, f, ensure_ascii=False, indent=2)

    return jsonify({"message": f"'{task_to_delete}' 삭제 완료!", "updatedTasks": tasks})

#오늘 할일 내일로 미루기
@app.route("/api/defer-today-task", methods=["POST"])
def defer_today_task():
    data = request.get_json()
    task_to_defer = data.get("task")

    today = datetime.now(KST).strftime('%Y-%m-%d')
    tomorrow = (datetime.now(KST) + timedelta(days=1)).strftime('%Y-%m-%d')

    # 오늘 파일에서 삭제
    today_file = f"data/{today}_today_plan.json"
    remaining_file = f"data/{today}_remaining_plan.json"
    for file_path in [today_file, remaining_file]:
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                tasks = json.load(f)
            if task_to_defer in tasks:
                tasks.remove(task_to_defer)
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(tasks, f, ensure_ascii=False, indent=2)

    # 내일 파일에 추가 (append!)
    for file_path in [f"data/{tomorrow}_today_plan.json", f"data/{tomorrow}_remaining_plan.json"]:
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                tasks = json.load(f)
        else:
            tasks = []

        if task_to_defer not in tasks:
            tasks.append(task_to_defer)

        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(tasks, f, ensure_ascii=False, indent=2)

    return jsonify({"message": f"'{task_to_defer}'를 내일로 미뤘습니다!", "updatedTasks": tasks})

#할일 기록 만들기_history
@app.route("/api/history/<date>", methods=["GET"])
def get_history(date):
    folder = "data"
    today_plan_file = f"{folder}/{date}_today_plan.json"
    done_today_file = f"{folder}/{date}_done_today.json"
    remaining_plan_file = f"{folder}/{date}_remaining_plan.json"

    def read_json(file):
        if os.path.exists(file):
            with open(file, "r", encoding="utf-8") as f:
                data = json.load(f)
                # 🚀 딕셔너리면 배열로 변환!
                if isinstance(data, dict):
                    return [f"{date}: {plan}" for date, plan in data.items()]
                return data
        return []

    return jsonify({
        "todayTasks": read_json(today_plan_file),
        "doneTasks": read_json(done_today_file),
        "remainingPlan": read_json(remaining_plan_file),
    })

# ---------------------------------------
#AI와 대화하기
@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    message = data.get("message", "")
    history = data.get("history", [])
    topic = data.get("topic", "")

    # 1️⃣ 히스토리를 문자열로 합치기
    context_text = "\n".join(history)
    prompt = f"""
    주제: {topic}
    아래는 이전 대화 기록입니다:
    {context_text}

    사용자 질문: {message}
    답변:
    """

    # 2️⃣ Ollama API에 요청 보내기
    payload = {
        "model": MODEL,
        "prompt": prompt
    }
    headers = {"Content-Type": "application/json"}

    response = requests.post(OLLAMA_URL, headers=headers, data=json.dumps(payload))
    response.raise_for_status()


    # Ollama 응답에서 답변 텍스트 꺼내기
    lines = response.text.strip().split("\n")
    final_response = ""
    for line in lines:
        line_data = json.loads(line)
        final_response += line_data.get("response", "")

    return jsonify({"response": final_response})

# -------------------------------------------------
#장기계획 파일 업로드
@app.route("/api/long-term-upload", methods=["POST"])
def upload_long_term_file():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    return jsonify({
        "message": "파일 업로드 완료! 장기 계획 생성에서 활용 가능",
        "filename": file.filename
    })

#장기 계획 세우기
@app.route("/api/long-term-plan", methods=["POST"])
def generate_long_term_plan():
    data = request.get_json()
    start_date = data.get("startDate")
    end_date = data.get("endDate")
    hours_per_day = data.get("hoursPerDay")
    file_info = data.get("fileInfo")

    if not start_date or not end_date or not hours_per_day or not file_info:
        return jsonify({"error": "필수 정보가 빠졌어요!"}), 400

    uploaded_filename = file_info.get("filename")
    filepath = os.path.join(UPLOAD_FOLDER, uploaded_filename)

    if not os.path.exists(filepath):
        return jsonify({"error": "업로드된 파일을 찾을 수 없어요!"}), 404

    text = extract_text_from_pdf(filepath)

    prompt_plan = f"""
    아래는 내가 업로드한 자료 요약입니다:
    {text}

    이 자료를 기반으로 아래 기간 동안 매일 {hours_per_day}시간씩 공부할 수 있도록 장기 계획을 작성해줘.
    기간: {start_date} ~ {end_date}

    작성 시 주의사항:
    - 각 날짜별로 학습 목표를 정리해줘.
    - 번호와 줄바꿈(\n)을 포함해서 보기 좋게 정리해줘.
    - 하루 단위로 계획을 나눠서 작성해줘.
    - ** 같은 기호 쓰지 말아줘. (즉, 볼드 처리 하지 말아줘)
    """

    headers = {"Content-Type": "application/json"}
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

    # 🟡 날짜별로 분리하기 (예: AI가 하루 단위로 줄바꿈으로 보냈다면)
    plan_lines = final_plan.split("\n\n")  # 또는 "\n" 기준으로 적절히 쪼개기
    current_date = datetime.strptime(start_date, "%Y-%m-%d")
    end_date_dt = datetime.strptime(end_date, "%Y-%m-%d")

    date_plans = {}
    while current_date <= end_date_dt:
        date_str = current_date.strftime("%Y-%m-%d")
        today_plan = plan_lines.pop(0) if plan_lines else "계획 없음"
        date_plans[date_str] = today_plan.strip()
        current_date += timedelta(days=1)

    # 날짜별로 나눈 계획을 프론트로 반환
    return jsonify({
        "message": "장기 계획 생성 완료!",
        "datePlans": date_plans
    })


#장기 계획 세운 거 날짜 지정해서 저장하기
@app.route("/api/save-selected-plan", methods=["POST"])
def save_selected_plan():
    data = request.get_json()
    selected_plans = data.get("selectedPlans")  # {date: plan} 형태

    if not selected_plans:
        return jsonify({"error": "저장할 계획이 없습니다!"}), 400

    for date, plan in selected_plans.items():
        file_path = f"data/{date}_remaining_plan.json"
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump([plan], f, ensure_ascii=False, indent=2)

    return jsonify({"message": "선택한 날짜별 계획 저장 완료!"})

# ----------------------------------------
# 단기 계획 세우기
@app.route("/api/short-term-plan", methods=["POST"])
def generate_short_term_plan():
    data = request.get_json()
    filename = data.get("filename")
    duration = data.get("duration")

    if not filename or not duration:
        return jsonify({"error": "파일명과 계획 시간을 입력하세요!"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "업로드된 파일을 찾을 수 없어요!"}), 404

    text = extract_text_from_pdf(filepath)

    prompt_plan = f"""
아래 내용을 {duration}분 내로 학습할 수 있는 짧은 계획을 작성해줘.

내용:
{text}

작성 시 주의사항:
- 간단하게 큰 항목 위주로 정리해줘.
- 번호와 줄바꿈(\\n)을 포함해서 보기 좋게 해줘.
- ** 같은 기호 쓰지 말아줘. (볼드 처리하지 말아줘)
"""

    headers = {"Content-Type": "application/json"}
    data_plan = {
        "model": MODEL,
        "prompt": prompt_plan
    }

    response = requests.post(
        OLLAMA_URL,
        headers=headers,
        data=json.dumps(data_plan),
        stream=True
    )

    final_plan = ""
    for line in response.iter_lines():
        if line:
            obj = json.loads(line.decode("utf-8"))
            final_plan += obj.get("response", "")

    return jsonify({
        "shortPlan": final_plan
    })

# 단기 계획 요약본
@app.route("/api/short-term-summary", methods=["POST"])
def generate_short_term_summary():
    data = request.get_json()
    filename = data.get("filename")
    if not filename:
        return jsonify({"error": "파일명을 입력하세요!"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "업로드된 파일을 찾을 수 없어요!"}), 404

    text = extract_text_from_pdf(filepath)

    prompt_summary = f"""
아래 내용을 한국어로 간단히 요약해줘.
내용:
{text}

작성 시 주의사항:
- 번호와 줄바꿈(\\n)을 포함해 보기 좋게 정리해줘.
- ** 같은 기호 쓰지 말아줘. (볼드 처리 하지 말아줘.)
"""

    headers = {"Content-Type": "application/json"}
    data_summary = {
        "model": MODEL,
        "prompt": prompt_summary
    }

    response = requests.post(
        OLLAMA_URL,
        headers=headers,
        data=json.dumps(data_summary),
        stream=True
    )

    final_summary = ""
    for line in response.iter_lines():
        if line:
            obj = json.loads(line.decode("utf-8"))
            final_summary += obj.get("response", "")

    return jsonify({
        "summary": final_summary
    })

# 단기 계획 퀴즈
@app.route("/api/short-term-quiz", methods=["POST"])
def generate_short_term_quiz():
    data = request.get_json()
    filename = data.get("filename")
    if not filename:
        return jsonify({"error": "파일명을 입력하세요!"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "업로드된 파일을 찾을 수 없어요!"}), 404

    text = extract_text_from_pdf(filepath)

    prompt_quiz = f"""
아래 내용을 바탕으로 간단한 퀴즈를 만들어줘.
내용:
{text}

작성 시 주의사항:
- 번호와 줄바꿈(\\n)을 포함해 퀴즈 형태로 정리해줘.
- 정답은 쓰지 말고, 질문만 줘.
- ** 같은 기호 쓰지 말아줘. (볼드 처리 하지 말아줘)
"""

    headers = {"Content-Type": "application/json"}
    data_quiz = {
        "model": MODEL,
        "prompt": prompt_quiz
    }

    response = requests.post(
        OLLAMA_URL,
        headers=headers,
        data=json.dumps(data_quiz),
        stream=True
    )

    final_quiz = ""
    for line in response.iter_lines():
        if line:
            obj = json.loads(line.decode("utf-8"))
            final_quiz += obj.get("response", "")

    return jsonify({
        "quiz": final_quiz
    })

# 주간 대시보드
@app.route("/api/weekly-summary", methods=["GET"])
def weekly_summary():
    from datetime import datetime
    import calendar

    # 요청: /api/weekly-summary?week=2025-W23
    week_str = request.args.get("week")
    year, week_num = map(int, week_str.split("-W"))
    # ISO 주간 시작일 (월요일)
    monday = datetime.strptime(f"{year}-W{week_num - 1}-1", "%Y-W%W-%w")

    done_counts = []
    total_counts = []

    for i in range(7):
        date = (monday + timedelta(days=i)).strftime("%Y-%m-%d")
        done_file = f"data/{date}_done_today.json"
        today_file = f"data/{date}_today_plan.json"

        done_tasks = json.load(open(done_file, encoding="utf-8")) if os.path.exists(done_file) else []
        today_tasks = json.load(open(today_file, encoding="utf-8")) if os.path.exists(today_file) else []

        done_counts.append(len(done_tasks))
        total_counts.append(len(today_tasks))

    # 날짜 리스트도 같이 반환 (프론트 그래프 X축 표시용)
    dates = [(monday + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]

    return jsonify({
        "dates": dates,
        "doneCounts": done_counts,
        "totalCounts": total_counts
    })



if __name__ == "__main__":
    app.run(debug=True)