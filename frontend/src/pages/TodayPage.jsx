import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function TodayPage() {
  const [todayTasks, setTodayTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);
  const navigate = useNavigate();

  // ⭐ 공통 문자열 처리 함수 ⭐
  const toStringTasks = (tasks) => {
    return (tasks || []).map((task) => {
      if (typeof task === "string") return task;
      if (typeof task === "object" && task.text) return task.text;
      return JSON.stringify(task);
    });
  };

  useEffect(() => {
    const fetchTodayTasks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/today-plan");
        const stringTasks = toStringTasks(res.data.todayTasks);
        setTodayTasks(stringTasks);
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

      // 문자열로 처리해서 저장
      const stringTasks = toStringTasks(res.data.remaining_plan);
      setTodayTasks(stringTasks);

      console.log("남은 계획:", stringTasks);
      alert("오늘 완료 항목이 저장되었어요!");
    } catch (err) {
      console.error(err);
      alert("저장 실패!");
    }
  };

  const handleDeleteTask = async (task) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/delete-today-task",
        { task: task }
      );
      alert("할 일을 삭제했습니다!");
      console.log(res.data.message);

      // 문자열로 처리해서 저장
      const stringTasks = toStringTasks(res.data.updatedTasks);
      setTodayTasks(stringTasks);
    } catch (err) {
      console.error(err);
      alert("삭제 실패!");
    }
  };

  const handleDeferTask = async (task) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/defer-today-task",
        { task: task }
      );
      console.log(res.data.message);
      alert("할 일을 내일로 미뤘습니다!");

      // 문자열로 처리해서 저장
      const stringTasks = toStringTasks(res.data.updatedTasks);
      setTodayTasks(stringTasks);
    } catch (err) {
      console.error(err);
      alert("미루기 실패!");
    }
  };

  // ⭐ 문자열 배열에서 줄바꿈 기준으로 쪼개기
  const lines = todayTasks.flatMap((task) => task.split("\n"));

  return (
    <div className="p-4">
      <h2 className="text-[30px] font-bold mb-2">📌 오늘 할 일 | Today's Plan</h2>
      <button
        onClick={() => navigate("/upload")}
        className="px-4 py-1 text-gray rounded mt-4"
      >
        📁 파일 업로드로 이동
      </button>

      {lines.length === 0 ? (
        <p className="mt-5">오늘 할 일이 아직 없습니다.</p>
      ) : (
        <ul className="list-disc pl-6 mt-2">
          {lines.map((line, index) => (
            <li key={index} className="flex items-start mb-2">
              {line.trim().match(/(\*+)?\s*\d+\./) ? (
                <>
                  <input
                    type="checkbox"
                    checked={doneTasks.includes(line)}
                    onChange={() => handleCheckboxChange(line)}
                    className="mr-2 mt-1"
                  />
                  <span className="flex-1 whitespace-pre-line">{line}</span>
                  <button
                    onClick={() => handleDeleteTask(line)}
                    className="px-2 py-1 text-gray rounded ml-4"
                  >
                    ❎ 삭제
                  </button>
                  <button
                    onClick={() => handleDeferTask(line)}
                    className="px-2 py-1 text-gray rounded ml-2"
                  >
                    🔜 미루기
                  </button>
                </>
              ) : (
                <span className="flex-1 whitespace-pre-line ml-8">{line}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {lines.length > 0 && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleDoneTodaySubmit}
            className="px-4 py-1 text-gray rounded"
          >
            ✅ 완료 항목 저장하기
          </button>
        </div>
      )}

      <button
        onClick={() => navigate("/")}
        className="px-4 py-1 text-gray rounded bg-gray-200 hover:bg-gray-300 mt-4"
      >
        🏠 홈으로 돌아가기 | Home
      </button>
      <button
        onClick={() => navigate("/calendar")}
        className="px-4 py-1 text-gray rounded bg-gray-200 hover:bg-gray-300 ml-2"
      >
        📅 캘린더 보러가기 | Calendar
      </button>
    </div>
  );
}

export default TodayPage;
