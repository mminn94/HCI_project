import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

response = '''
[
  {
    "topic": "Heap Priority Queue Analysis",
    "estimated_time": 45,
    "priority": 1,
    "details": "Understanding the behavior of priority queues with finite priorities. Addressing the question of whether items with the same priority are always popped in the same order. Exploring the use of a hash table to implement constant-time push and pop operations within priority queues of equal priorities."
  },
  {
    "topic": "Character Counting Program Optimization",
    "estimated_time": 90,
    "priority": 2,
    "details": "Analyzing the C program designed to count ASCII characters in ‘anna-karenina.txt’. Focusing on optimization strategies for speed, considering the 2MB file size and target execution time (less than 1 second on a 1.6 GHz Intel CPU)."
  },
  {
    "topic": "Human Coding and Compression Size Estimation",
    "estimated_time": 30,
    "priority": 3,
    "details": "Examining the concept of Human coding and the compression it enables. Calculating an estimate of the compressed file size based on the sum of the values in the Hu!man code tree, given the character counts. Understanding the implications of using an inner node for the sum of inner nodes."
  },
  {
    "topic": "Binary Search Tree Letter Probability",
    "estimated_time": 60,
    "priority": 1,
    "details": "Analyzing the binary search tree structure and its relation to the probability of each letter (A, B, C, D, E, F) when a random number r is drawn from (0, 1). Determining the probabilities for each letter and understanding the decision-making process within the tree."
  },
  {
    "topic": "Huffman Coding and Optimal Tree Construction (Application)",
    "estimated_time": 75,
    "priority": 2,
    "details": "Applying Huffman's algorithm to construct a tree that produces letters based on specified probabilities, minimizing the average number of comparisons. This involves understanding the Huffman coding principles and their application to tree construction."
  }
]
'''

study_plan = json.loads(response)

with open("today_plan.txt", "w", encoding="utf-8") as f:
    for task in study_plan:
        f.write(f"{task['priority']}순위: {task['topic']} (예상 {task['estimated_time']}분)\n")

def recommend_today_plan(plan, available_minutes):
    today_plan = []
    used = 0
    # priority 기준 정렬
    sorted_plan = sorted(plan, key=lambda x: x["priority"])
    for task in sorted_plan:
        if used + task["estimated_time"] <= available_minutes:
            today_plan.append(task)
            used += task["estimated_time"]
    return today_plan

# 예: 오늘 90분 공부 가능
available_time = 90
today_plan = recommend_today_plan(study_plan, available_time)

print(f"\n✅ 오늘 공부 계획 (총 {available_time}분 가능):\n")
for task in today_plan:
    print(f"- {task['topic']} ({task['estimated_time']}분)")
