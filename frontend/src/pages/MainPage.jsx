import React from "react";
import { useNavigate } from "react-router-dom";
import GrayButton from "../components/Button"; // 공통 버튼 컴포넌트 불러오기

function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center my-6 mb-10">📚 SmartStudy With AI</h1>
      <HowtouseButton />
      <TodayButton />
      <CalendarButton />
      <LongTermButton />
      <ShortTermButton />
      <QuizButton />
      <p className="text-sm font-medium text-gray-500 text-center mt-10">by C335119 Kim Chaemin</p>
    </div>
  );
}

function HowtouseButton() {
  const navigate = useNavigate();
  return (
    <div className="text-center mb-6">
      <GrayButton onClick={() => navigate("/howtouse")}>📝 페이지 사용법 | How to Use this Page ?</GrayButton>
    </div>
  );
}

function TodayButton() {
  const navigate = useNavigate();
  return (
    <div className="text-center mb-6">
      <GrayButton onClick={() => navigate("/today")}>📌 오늘 할 일 보러가기 | Today's Plan</GrayButton>
    </div>
  );
}

function CalendarButton() {
  const navigate = useNavigate();
  return (
    <div className="text-center mb-6">
      <GrayButton onClick={() => navigate("/calendar")}>📅 캘린더 보러가기 | Calendar</GrayButton>
    </div>
  );
}

function QuizButton() {
  const navigate = useNavigate();
  return (
    <div className="text-center mb-6">
      <GrayButton onClick={() => navigate("/quiz")}>🧠 AI와 대화하러 가기 | Chat with AI</GrayButton>
    </div>
  );
}

function LongTermButton() {
  const navigate = useNavigate();
  return (
    <div className="text-center mb-6">
      <GrayButton onClick={() => navigate("/longterm")}>🗒️ 장기 계획 생성하러 가기 | Long-term Plan</GrayButton>
    </div>
  );
}

function ShortTermButton() {
  const navigate = useNavigate();
  return (
    <div className="text-center mb-6">
      <GrayButton onClick={() => navigate("/shortterm")}>⏱️ 단기 계획 생성하러 가기 | Short-term Plan</GrayButton>
    </div>
  );
}

export default Home;
