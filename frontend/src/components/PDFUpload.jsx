import { useState } from "react";
import axios from "axios";

function PDFUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState("");
  const [studyPlan, setStudyPlan] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("파일을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(res.data.message);

      // ⭐️ 추가: 요약 & 학습계획 결과도 같이 저장
      setSummary(res.data.summary || "");
      setStudyPlan(res.data.study_plan || "");

    } catch (err) {
      setMessage("업로드 실패 😥");
      console.error(err);
    }
  };

  return (
    <div className="p-4 border rounded max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-2">📁 PDF 업로드</h2>
      <input type="file" onChange={handleFileChange} className="mb-2" />
      <button onClick={handleUpload} className="px-4 py-1 bg-blue-500 text-white rounded">
        업로드
      </button>

      {message && <p className="mt-4">{message}</p>}

      {summary && (
        <div className="mt-4">
          <h3 className="font-semibold">📝 AI 요약</h3>
          <pre className="bg-gray-100 p-2 rounded">{summary}</pre>
        </div>
      )}

      {studyPlan && (
        <div className="mt-4">
          <h3 className="font-semibold">📌 AI 추천 학습 계획</h3>
          <pre className="bg-gray-100 p-2 rounded">{studyPlan}</pre>
        </div>
      )}
    </div>
  );
}

export default PDFUpload;
