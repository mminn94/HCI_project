import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [doneTasks, setDoneTasks] = useState([]);
  const [remainingPlan, setRemainingPlan] = useState([]);
  const navigate = useNavigate();

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const dateString = date.toISOString().slice(0, 10);
    console.log("선택된 날짜:", dateString);
    fetchHistory(dateString);
  };

  const fetchHistory = async (date) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/history/${date}`);
      console.log("받아온 데이터:", res.data);
      setDoneTasks(res.data.doneTasks || []);
      setRemainingPlan(res.data.remainingPlan || []);
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📅 캘린더</h2>
      <Calendar onChange={handleDateChange} value={selectedDate} />

      {doneTasks.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-green-600">✅ 완료한 항목</h3>
          <ul className="list-disc pl-6">
            {doneTasks.map((task, index) => (
              <li key={index}>{task}</li>
            ))}
          </ul>
        </div>
      )}

      {(doneTasks.length > 0 || remainingPlan.length > 0) && (
        <hr className="my-4 border-gray-300" />
      )}

      {remainingPlan.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-blue-600">📌 남은 계획</h3>
          <ul className="list-disc pl-6">
            {remainingPlan.map((task, index) => (
              <li key={index}>{task}</li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={() => navigate("/")}
        className="px-4 py-1 text-gray rounded bg-gray-200 hover:bg-gray-300 mt-4 mb-4">
        홈으로 돌아가기
      </button>
    </div>
  );
}

export default CalendarPage;