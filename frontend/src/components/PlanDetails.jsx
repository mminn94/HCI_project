import React from "react";
import axios from "axios";

function PlanDetails({
  studyPlan,
  feedback,
  setFeedback,
  setUpdatedPlan,
}) {
  const handleFeedbackSubmit = async () => {
    if (!feedback) {
      alert("피드백을 입력해주세요!");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/update-plan", {
        feedback,
        currentPlan: studyPlan,
      });
      setUpdatedPlan(res.data.updated_plan || "");
    } catch (err) {
      console.error(err);
      alert("피드백 반영 실패!");
    }
  };

  return (
    <div>
      <h3 className="font-semibold mt-2">📌 AI 추천 학습 계획</h3>

      <pre className="whitespace-pre-line ml-5 mt-2">
        {studyPlan}
      </pre>

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="예: 2번 항목을 빼줘 / 시간을 늘려줘"
        className="border p-2 rounded w-full ml-5 mt-2"/>

      <button
        onClick={handleFeedbackSubmit}
        className="mt-2 px-4 py-1 text-gray rounded">
        피드백 보내기
      </button>
    </div>
  );
}

export default PlanDetails;
