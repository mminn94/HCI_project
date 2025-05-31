import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import axios from "axios";
import GrayButton from "../components/Button";
import LoadingSpinner from "../components/Spinner";

function ShortTermPage() {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [shortPlan, setShortPlan] = useState("");
  const [summary, setSummary] = useState("");
  const [quiz, setQuiz] = useState("");
  const [loading, setLoading] = useState(false); // ✅ 로딩 상태

  const handleUploadComplete = (data) => {
    console.log("파일 업로드 완료:", data);
    setUploadedFile(data.filename);
  };

  const handleGeneratePlan = async () => {
    if (!uploadedFile || !selectedDuration) {
      alert("파일과 시간을 선택하세요!");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/short-term-plan", {
        filename: uploadedFile,
        duration: selectedDuration,
      });
      setShortPlan(res.data.shortPlan || "계획 생성 실패!");
    } catch (err) {
      console.error(err);
      alert("계획 생성 실패!");
    } finally {
      setLoading(false);
    }
  };

  const handleSummary = async () => {
    if (!uploadedFile) {
      alert("파일을 먼저 업로드하세요!");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/short-term-summary", {
        filename: uploadedFile,
      });
      setSummary(res.data.summary || "요약 실패!");
    } catch (err) {
      console.error(err);
      alert("요약 실패!");
    } finally {
      setLoading(false);
    }
  };

  const handleQuiz = async () => {
    if (!uploadedFile) {
      alert("파일을 먼저 업로드하세요!");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/short-term-quiz", {
        filename: uploadedFile,
      });
      setQuiz(res.data.quiz || "퀴즈 생성 실패!");
    } catch (err) {
      console.error(err);
      alert("퀴즈 생성 실패!");
    } finally {
      setLoading(false);
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

      <GrayButton onClick={handleGeneratePlan} className="mb-4">
        AI에게 짧은 계획 요청
      </GrayButton>

      <div className="mb-4">
        {/* 요약 버튼 */}
        <GrayButton onClick={handleSummary} className="mr-2">
          📚 요약 보기
        </GrayButton>

        {/* 퀴즈 버튼 */}
        <GrayButton onClick={handleQuiz}>
          🧠 퀴즈 풀기
        </GrayButton>
      </div>

      {/* ✅ 로딩 중에 스피너 표시 */}
      {loading && <LoadingSpinner />}

      {/* 결과 표시 */}
      {shortPlan && (
        <div className="mt-4 p-2 whitespace-pre-wrap break-words overflow-x-auto bg-gray-100 rounded">
          <h3 className="font-semibold">✅ 짧은 계획</h3>
          <div>{shortPlan}</div>
        </div>
      )}

      {summary && (
        <div className="mt-4 p-2 whitespace-pre-wrap break-words overflow-x-auto bg-gray-100 rounded">
          <h3 className="font-semibold">📚 요약</h3>
          <div>{summary}</div>
        </div>
      )}

      {quiz && (
        <div className="mt-4 p-2 whitespace-pre-wrap break-words overflow-x-auto bg-gray-100 rounded">
          <h3 className="font-semibold">📝 퀴즈</h3>
          <div>{quiz}</div>
        </div>
      )}

      <GrayButton
        onClick={() => navigate("/")}
        className="mt-4 text-gray rounded bg-gray-200 hover:bg-gray-300">
        🏠 홈으로 돌아가기 | Home
      </GrayButton>
    </div>
  );
}

export default ShortTermPage;
