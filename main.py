import io
import sys
import json
import os
from datetime import datetime
from plan_utils_3 import recommend_today_plan  # 현재 사용하지 않지만 나중 확장 대비 유지
from file_io_2 import save_json
from pdf_utils_1 import extract_text_from_pdf, save_text_to_file

# 콘솔 UTF-8 출력 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 📅 오늘 날짜 폴더 생성
today_date = datetime.today().strftime("%Y-%m-%d")
folder = f"history/{today_date}"
os.makedirs(folder, exist_ok=True)

# 1. PDF 경로 입력 → 텍스트 추출
pdf_path = input("📁 공부 자료 PDF 경로를 입력하세요: ")
text = extract_text_from_pdf(pdf_path)
save_text_to_file(text)
print("✅ 텍스트 추출 완료 → output.txt 저장됨")

# 2. AI 요약 결과 붙여넣기
print("\n🔽 AI 요약 결과(JSON)를 붙여넣으세요 (Enter 2번 종료):")
lines = []
while True:
    line = input()
    if line == "":
        break
    lines.append(line)
response = "\n".join(lines)
study_plan = json.loads(response)

# 3. 전체 학습 계획 출력 (우선순위 순)
today_plan = sorted(study_plan, key=lambda x: x["priority"])

print("\n📋 전체 추천 학습 계획 (우선순위순):")
for i, task in enumerate(today_plan, 1):
    print(f"{i}. {task['topic']} ({task['estimated_time']}분)")

# 4. 오늘 공부할 항목 사용자 선택
selected_input = input("\n👉 오늘 할 항목 번호 입력 (쉼표 구분): ")
selected_indexes = [int(x.strip()) - 1 for x in selected_input.split(",")]
today_selected = [today_plan[i] for i in selected_indexes]

# 📂 today_tasks 저장
save_json(today_selected, f"{folder}/today_tasks.json")
print("📝 오늘의 할 일 리스트가 저장되었습니다.")

# 5. 완료한 항목 선택
print("\n✅ 위 항목 중 실제로 완료한 항목 번호 입력:")
for i, task in enumerate(today_selected, 1):
    print(f"{i}. {task['topic']}")
done_input = input("✔ 완료한 번호 (쉼표 구분): ")
done_indexes = [int(x.strip()) - 1 for x in done_input.split(",")]
done_tasks = [today_selected[i] for i in done_indexes]

# 📂 done_today 저장
save_json(done_tasks, f"{folder}/done_today.json")

# 📂 remaining_plan 저장
remaining_plan = [task for task in study_plan if task not in done_tasks]
save_json(remaining_plan, f"{folder}/remaining_plan.json")

# 6. 통계 출력
total = len(today_selected)
done = len(done_tasks)

if total > 0:
    percent = round((done / total) * 100, 1)
    print(f"\n📊 오늘 완료한 학습 비율: {done}/{total}개 ({percent}%)")
else:
    print("\n📊 오늘 선택된 항목이 없어 완료율을 계산할 수 없습니다.")

# 완료 안내
print(f"\n✅ 모든 데이터가 📁 {folder}/ 에 저장되었습니다.")
