import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center my-6 mb-10">📚 SmartStudy With AI</h1>
      <TodayButton />
      <CalendarButton />
      <PDFUploadButton />
      <QuizButton />
      <p className="text-sm font-medium text-gray-500 text-center mt-10">by C335119 Kim Chaemin</p>
    </div>
  );
}

function TodayButton() {
  const navigate = useNavigate();
  return (
    <div className="text-center mb-6">
      <button
        onClick={() => navigate("/today")}
        className="px-4 py-1 text-gray rounded bg-gray-200 hover:bg-gray-300">
        ✅ 오늘 할 일 보러가기 | Today's Plan
      </button>
    </div>
  );
}

function CalendarButton() {
  const navigate = useNavigate();
  return (
    <div className="text-center mb-6">
      <button
        onClick={() => navigate("/calendar")}
        className="px-4 py-1 text-gray rounded bg-gray-200 hover:bg-gray-300">
        📅 캘린더 보러가기 | Calendar
      </button>
    </div>
  );
}

function PDFUploadButton() {
  const navigate = useNavigate();
  return (
    <div className="text-center mb-6">
      <button
        onClick={() => navigate("/upload")}
        className="px-4 py-1 text-gray rounded bg-gray-200 hover:bg-gray-300">
        📁 파일 업로드하기 | Upload your File
      </button>
    </div>
  );
}

function QuizButton() {
  const navigate = useNavigate();
  return (
    <div className="text-center mb-6">
      <button
        onClick={() => navigate("/quiz")}
        className="px-4 py-1 text-gray rounded bg-gray-200 hover:bg-gray-300">
        🧠 AI와 대화하러 가기 | Chat with AI
      </button>
    </div>
  );
}

export default Home;