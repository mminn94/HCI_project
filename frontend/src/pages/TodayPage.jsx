import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function TodayPage() {
  const [todayTasks, setTodayTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTodayTasks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/today-plan");
        setTodayTasks(res.data.todayTasks || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTodayTasks();
  }, []);

  const handleCheckboxChange = (task) => {
    if (doneTasks.includes(task)) {
      setDoneTasks(doneTasks.filter((t) => t !== task));
    } else {
      setDoneTasks([...doneTasks, task]);
    }
  };

  const handleDoneTodaySubmit = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/done-today", {
        doneTasks,
      });
      console.log(res.data.message);
      setTodayTasks(res.data.remaining_plan || []);
      
      console.log("남은 계획:", res.data.remaining_plan);
      alert("오늘 완료 항목이 저장되었어요!");
    } catch (err) {
      console.error(err);
      alert("저장 실패!");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-[30px] font-bold mb-2">📌 오늘 할 일</h2>

      {todayTasks.length === 0 ? (
        <p className="mt-5">오늘 할 일이 아직 없습니다.</p>
      ) : (
        <ul className="list-disc pl-6 mt-2">
          {todayTasks.map((task, index) => (
            <li key={index} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={doneTasks.includes(task)}
                onChange={() => handleCheckboxChange(task)}
                className="mr-2"
              />
              <span>{task}</span>
            </li>
          ))}
        </ul>
      )}

      {todayTasks.length > 0 && (
        <button
          onClick={handleDoneTodaySubmit}
          className="mt-4 px-4 py-1 text-gray rounded bg-green-300 hover:bg-green-400">
          완료 항목 저장하기
        </button>
      )}

      <button
        onClick={() => navigate("/")}
        className="px-4 py-1 text-gray rounded bg-gray-200 hover:bg-gray-300 ml-6 mt-4">
        홈으로 돌아가기
      </button>
    </div>
  );
}

export default TodayPage;
