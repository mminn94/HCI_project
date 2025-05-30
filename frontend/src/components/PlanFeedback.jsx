import React, { useState } from "react";
import axios from "axios";

function PlanFeedback({ updatedPlan }) {
  const [selectedTodayTasks, setSelectedTodayTasks] = useState([]);

  if (!updatedPlan) return null;

  const planLines = updatedPlan.split("\n").filter(line => line.trim() !== "");

  const handleCheckboxChange = (line) => {
    if (selectedTodayTasks.includes(line)) {
      setSelectedTodayTasks(selectedTodayTasks.filter((task) => task !== line));
    } else {
      setSelectedTodayTasks([...selectedTodayTasks, line]);
    }
  };

  const handleSaveTodayTasks = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/today-plan", {
        todayTasks: selectedTodayTasks,
      });
      console.log(res.data.message);
      alert("오늘 할 일 저장 완료!");
    } catch (err) {
      console.error(err);
      alert("오늘 할 일 저장 실패!");
    }
  };

  return (
    <div className="mt-4">
      <h3 className="font-semibold">✅ 수정된 AI 학습 계획 (오늘 할 일 선택)</h3>

      <div className="ml-5 mt-2">
        {planLines.map((line, index) => {
          const trimmedLine = line.trim();
          const isMainTask = /(\*+)?\s*\d+\./.test(trimmedLine);

          if (isMainTask) {
            return (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTodayTasks.includes(line)}
                  onChange={() => handleCheckboxChange(line)}
                  className="mr-2"
                />
                <span>{line}</span>
              </div>
            );
          } else {
            return (
              <div key={index} className="ml-6">{line}</div>
            );
          }
        })}
      </div>
      <button
        onClick={handleSaveTodayTasks}
        className="mt-2 px-4 py-1 text-gray rounded bg-gray-200 hover:bg-gray-300"
        disabled={selectedTodayTasks.length === 0}>
        오늘 할 일 저장
      </button>
    </div>
  );
}

export default PlanFeedback;
