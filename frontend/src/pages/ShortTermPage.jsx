import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import axios from "axios";

function ShortTermPage() {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [shortPlan, setShortPlan] = useState("");
  const [summary, setSummary] = useState("");
  const [quiz, setQuiz] = useState("");

  const handleUploadComplete = (data) => {
    console.log("파일 업로드 완료:", data);
    setUploadedFile(data.filename);
  };

  const handleGeneratePlan = async () => {
    if (!uploadedFile || !selectedDuration) {
      alert("파일과 시간을 선택하세요!");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/short-term-plan", {
        filename: uploadedFile,
        duration: selectedDuration,
      });
      setShortPlan(res.data.shortPlan || "계획 생성 실패!");
    } catch (err) {
      console.error(err);
      alert("계획 생성 실패!");
    }
  };

  const handleSummary = async () => {
    if (!uploadedFile) {
      alert("파일을 먼저 업로드하세요!");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/short-term-summary", {
        filename: uploadedFile,
      });
      setSummary(res.data.summary || "요약 실패!");
    } catch (err) {
      console.error(err);
      alert("요약 실패!");
    }
  };

  const handleQuiz = async () => {
    if (!uploadedFile) {
      alert("파일을 먼저 업로드하세요!");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/short-term-quiz", {
        filename: uploadedFile,
      });
      setQuiz(res.data.quiz || "퀴즈 생성 실패!");
    } catch (err) {
      console.error(err);
      alert("퀴즈 생성 실패!");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-[30px] font-bold mb-4">⏱️ 단기 계획 생성 | Short-term Plan</h2>

      <FileUpload
        uploadUrl="http://localhost:5000/api/upload"
        onUploadComplete={handleUploadComplete}
      />

      {/* 시간 선택 */}
      <div className="flex gap-2 my-4">
        {[10, 20, 30].map((min) => (
          <button
            key={min}
            onClick={() => setSelectedDuration(min)}
            className={`px-4 py-2 rounded ${selectedDuration === min ? "bg-blue-300" : "bg-gray-200"}`}>
            {min}분
          </button>
        ))}
      </div>

      <button
        onClick={handleGeneratePlan}
        className="px-4 py-2 rounded mb-4">
        AI에게 짧은 계획 요청
      </button>

    <div className="mb-4">
      {/* 요약 버튼 */}
      <button
        onClick={handleSummary}
        className="px-4 py-2 rounded">
        📚 요약 보기
      </button>

      {/* 퀴즈 버튼 */}
      <button
        onClick={handleQuiz}
        className="px-4 py-2 rounded ml-4">
        🧠 퀴즈 풀기
      </button>
    </div>

      {/* 결과 표시 */}
      {shortPlan && (
        <div className="mt-4 p-2 bg-gray-50 whitespace-pre-line">
          <h3 className="font-semibold">✅ 짧은 계획</h3>
          <pre>{shortPlan}</pre>
        </div>
      )}

      {summary && (
        <div className="mt-4 p-2 bg-gray-50 whitespace-pre-line">
          <h3 className="font-semibold">📚 요약</h3>
          <pre>{summary}</pre>
        </div>
      )}

      {quiz && (
        <div className="mt-4 p-2 bg-gray-50 whitespace-pre-line">
          <h3 className="font-semibold">📝 퀴즈</h3>
          <pre>{quiz}</pre>
        </div>
      )}

      <button
        onClick={() => navigate("/")}
        className="px-4 py-1 text-gray rounded bg-gray-200 hover:bg-gray-300">
        🏠 홈으로 돌아가기 | Home
      </button>
    </div>
  );
}

export default ShortTermPage;
