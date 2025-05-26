import React, { useState } from "react";
import axios from "axios";
import PlanContainer from "./PlanContainer";
import PlanFeedback from "./PlanFeedback";

function PDFUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState("");
  const [studyPlan, setStudyPlan] = useState("");
  const [updatedPlan, setUpdatedPlan] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) {
      setMessage("파일을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data.message);
      setSummary(res.data.summary || "");
      setStudyPlan(res.data.study_plan || "");
    } catch (err) {
      setMessage("업로드 실패 😥");
      console.error(err);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-2">📁 PDF 업로드</h2>

      <input type="file" onChange={handleFileChange}
      className=" file:mr-4 file:py-2 file:px-4 file:font-base file:bg-gray-50 hover:file:bg-gray-200 file:rounded-xl"/>

      <button onClick={handleUpload} className="px-4 py-1 text-gray rounded">
        업로드
      </button>
      {message && <p className="mt-4">{message}</p>}

      <PlanContainer
        summary={summary}
        studyPlan={studyPlan}
        setUpdatedPlan={setUpdatedPlan}
      />

      <PlanFeedback updatedPlan={updatedPlan} />
    </div>
  );
}

export default PDFUpload;
