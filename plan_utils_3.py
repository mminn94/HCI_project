def recommend_today_plan(plan, available_minutes):
    today_plan = []
    used = 0
    sorted_plan = sorted(plan, key=lambda x: x["priority"])
    for task in sorted_plan:
        if used + task["estimated_time"] <= available_minutes:
            today_plan.append(task)
            used += task["estimated_time"]
    return today_plan
