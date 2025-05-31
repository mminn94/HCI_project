import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import PlanContainer from "../components/PlanContainer";
import PlanFeedback from "../components/PlanFeedback";
import axios from "axios";
import Spinner from "../components/Spinner"; // 로딩 스피너 컴포넌트 추가
import GrayButton from "../components/Button";

function PDFUpload() {
  const [uploadedFile, setUploadedFile] = useState(null); // 업로드된 파일 정보
  const [summary, setSummary] = useState("");
  const [studyPlan, setStudyPlan] = useState("");
  const [updatedPlan, setUpdatedPlan] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // 로딩 상태

  const handleUploadComplete = async (data) => {
    console.log("업로드 완료:", data);
    alert("업로드한 파일을 토대로 요약, 계획을 세우는 중입니다!");
    setUploadedFile(data.filename);

    // 🚀 로딩 시작
    setLoading(true);

    try {
      // 1️⃣ 업로드된 파일명으로 요약 요청
      const summaryRes = await axios.post("http://localhost:5000/api/summary", {
        filename: data.filename
      });
      console.log("요약:", summaryRes.data.summary);
      setSummary(summaryRes.data.summary || "");

      // 2️⃣ 요약 결과로 계획 요청
      const planRes = await axios.post("http://localhost:5000/api/plan", {
        filename: data.filename,
        summary: summaryRes.data.summary
      });
      console.log("계획:", planRes.data.study_plan);
      setStudyPlan(planRes.data.study_plan || "");
    } catch (err) {
      console.error(err);
      alert("요약/계획 요청 실패!");
    } finally {
      // 🚀 로딩 종료
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-[30px] font-bold mb-2">📁 PDF 업로드 | Upload your PDF File</h2>

      {/* 1️⃣ 파일 업로드 */}
      <FileUpload
        uploadUrl="http://localhost:5000/api/upload"
        onUploadComplete={handleUploadComplete}
      />

      {/* 🔥 로딩 중 스피너 */}
      {loading && <Spinner />}

      {/* 2️⃣ 요약과 계획 보여주는 컴포넌트 */}
      <div className="max-w-screen-xl">
        <PlanContainer
          summary={summary}
          studyPlan={studyPlan}
          setUpdatedPlan={setUpdatedPlan}
        />
      </div>


      {/* 3️⃣ 사용자 피드백 입력 */}
      <div className="max-w-screen-xl">
        <PlanFeedback updatedPlan={updatedPlan} />
      </div>


      {/* 홈/오늘 할 일로 이동 */}
      <GrayButton onClick={() => navigate("/")} className="mt-4 mb-4">🏠 홈으로 돌아가기 | Home</GrayButton>
      <div>
        <GrayButton onClick={() => navigate("/today")}>📌 오늘 할 일 보러가기 | Today's Plan</GrayButton>
      </div>
    </div>
  );
}

export default PDFUpload;
