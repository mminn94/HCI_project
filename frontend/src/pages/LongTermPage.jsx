import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import axios from "axios";
import Spinner from "../components/Spinner"; // 🔥 스피너 추가

function LongTermPage() {
  const navigate = useNavigate();
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("");
  const [datePlans, setDatePlans] = useState({});
  const [selectedDates, setSelectedDates] = useState([]);
  const [loading, setLoading] = useState(false); // 🔥 로딩 상태

  const toStringPlan = (plan) => {
    if (typeof plan === "string") return plan;
    if (typeof plan === "object") return JSON.stringify(plan, null, 2);
    return String(plan);
  };

  const handleUploadComplete = (data) => {
    console.log("업로드 완료! 파일 정보: ", data);
    alert("업로드 완료! 이제 시작일, 종료일, 하루 목표 공부 시간을 입력하세요!");
    setUploadedFileInfo(data);
  };

  const handleGeneratePlan = async () => {
    if (!startDate || !endDate || !hoursPerDay) {
      alert("시작일, 종료일, 하루 목표 공부시간을 입력하세요!");
      return;
    }

    if (!uploadedFileInfo) {
      alert("먼저 파일을 업로드하세요!");
      return;
    }

    const payload = {
      startDate,
      endDate,
      hoursPerDay,
      fileInfo: uploadedFileInfo,
    };

    // 🔥 로딩 시작
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/long-term-plan",
        payload
      );
      console.log("AI로부터 받은 계획:", res.data.datePlans);

      const stringifiedPlan = toStringPlan(res.data.datePlans);
      setGeneratedPlan(stringifiedPlan || "계획 생성 실패!");

      const datePlansObj = {};
      let current = new Date(startDate);
      const end = new Date(endDate);
      while (current <= end) {
        const dateStr = current.toISOString().split("T")[0];
        datePlansObj[dateStr] = toStringPlan(res.data.datePlans);
        current.setDate(current.getDate() + 1);
      }

      setDatePlans(datePlansObj);
      setSelectedDates([]);
    } catch (err) {
      console.error(err);
      alert("계획 생성 실패!");
    } finally {
      // 🔥 로딩 종료
      setLoading(false);
    }
  };

  const toggleDateSelection = (date) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter((d) => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const handleSaveSelectedPlans = async () => {
    if (selectedDates.length === 0) {
      alert("저장할 날짜를 선택하세요!");
      return;
    }

    const selectedPlans = {};
    selectedDates.forEach((date) => {
      selectedPlans[date] = datePlans[date];
    });

    console.log("보내는 selectedPlans: ", selectedPlans);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/save-selected-plan",
        { selectedPlans }
      );
      alert(res.data.message || "선택한 계획 저장 완료!");
    } catch (err) {
      console.error(err);
      alert("선택한 계획 저장 실패!");
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">📚 장기 계획 생성 | Long-term Plan</h2>

      <FileUpload
        uploadUrl="http://localhost:5000/api/long-term-upload"
        onUploadComplete={handleUploadComplete}
      />

      <div className="flex flex-col gap-3 mb-4 mt-4">
        <label>
          🔜 시작 날짜:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        </label>
        <label>
          🔚 종료 날짜:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        </label>
        <label>
          하루 목표 공부 시간:
          <input
            type="number"
            min="1"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        </label>
      </div>

      <button
        onClick={handleGeneratePlan}
        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
      >
        AI에게 장기 계획 요청
      </button>

      {/* 🔥 로딩 중 스피너 */}
      {loading && <Spinner />}

      {generatedPlan && (
        <div className="mt-4 p-2 border rounded bg-gray-50 whitespace-pre-line">
          <h3 className="font-semibold mb-2">📋 생성된 계획</h3>
          <pre>{generatedPlan}</pre>
        </div>
      )}

      {Object.keys(datePlans).length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">✅ 날짜별로 저장할 계획 선택</h3>
          {Object.entries(datePlans).map(([date, plan]) => (
            <div key={date} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={selectedDates.includes(date)}
                onChange={() => toggleDateSelection(date)}
                className="mr-2"
              />
              <label>{date}</label>
            </div>
          ))}
          <button
            onClick={handleSaveSelectedPlans}
            className="px-4 py-2 rounded mt-2 bg-gray-200 hover:bg-gray-300"
          >
            선택한 계획 저장
          </button>
        </div>
      )}

      <button
        onClick={() => navigate("/")}
        className="px-4 py-1 text-gray rounded bg-gray-200 hover:bg-gray-300 mt-4 ml-4"
      >
        🏠 홈으로 돌아가기 | Home
      </button>
    </div>
  );
}

export default LongTermPage;
