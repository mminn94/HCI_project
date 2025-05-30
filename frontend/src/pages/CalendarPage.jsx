import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [doneTasks, setDoneTasks] = useState([]);
  const [remainingPlan, setRemainingPlan] = useState([]);
  const navigate = useNavigate();
  const [weeklyData, setWeeklyData] = useState([]);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const pad = (num) => String(num).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const dateString = `${year}-${month}-${day}`;

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

  const fetchWeeklySummary = async () => {
    const today = new Date();
    const year = today.getFullYear();
    const weekNum = Math.ceil(
      (today - new Date(today.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)
    );
    const weekString = `${year}-W${weekNum}`;

    try {
      const res = await axios.get(`http://localhost:5000/api/weekly-summary?week=${weekString}`);
      console.log("주간 데이터:", res.data);

      // Recharts에 맞게 데이터 변환
      const data = res.data.dates.map((date, idx) => ({
        date: date,
        완료: res.data.doneCounts[idx],
        전체: res.data.totalCounts[idx],
      }));

      setWeeklyData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWeeklySummary();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-[30px] font-bold mb-4">📅 캘린더 | Calendar</h2>
      <p className="text-[15px] text-gray-500 mb-4">날짜를 선택하면 항목이 보입니다 !</p>
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

      {remainingPlan && (
        <div className="mt-4">
          <h3 className="font-semibold text-blue-600">📌 남은 계획</h3>
          <ul className="list-disc pl-6">
            {Array.isArray(remainingPlan) ? (
              remainingPlan.map((task, index) => (
                <li key={index}>{typeof task === "object" ? JSON.stringify(task) : task}</li>
              ))
            ) : (
              Object.entries(remainingPlan).map(([date, plan], index) => (
                <li key={index}>
                  <strong>{date}</strong>: {typeof plan === "object" ? JSON.stringify(plan) : plan}
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* 🚀 토글 버튼 */}
      {weeklyData.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowWeeklySummary(!showWeeklySummary)}
            className="px-4 py-2 rounded bg-purple-300 hover:bg-purple-400 mt-4 mb-2"
          >
            {showWeeklySummary ? "📊 주간 요약 닫기" : "📊 주간 요약 보기"}
          </button>

          {showWeeklySummary && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">📊 주간 학습 요약</h3>
              <LineChart
                width={500}
                height={300}
                data={weeklyData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="완료" stroke="#82ca9d" />
                <Line type="monotone" dataKey="전체" stroke="#8884d8" />
              </LineChart>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => navigate("/")}
        className="px-4 py-1 text-gray rounded bg-gray-200 hover:bg-gray-300 mt-2 mb-4">
        🏠 홈으로 돌아가기 | Home
      </button>
    </div>
  );
}

export default CalendarPage;
