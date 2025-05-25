import { useState } from "react";
import axios from "axios";

function PDFUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState("");
  const [studyPlan, setStudyPlan] = useState("");
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [updatedPlan, setUpdatedPlan] = useState("");

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

      setSummary(res.data.summary || "");
      setStudyPlan(res.data.study_plan || "");

    } catch (err) {
      setMessage("업로드 실패 😥");
      console.error(err);
    }
  };

  const handleCheckboxChange = (task) => {
    if (selectedTasks.includes(task)) {
      setSelectedTasks(selectedTasks.filter((t) => t !== task));
    } else {
      setSelectedTasks([...selectedTasks, task]);
    }
  };

  const handleDoneToday = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/done-today", {
        doneTasks: selectedTasks
      });
      console.log(res.data.message);
      console.log("남은 계획:", res.data.remaining_plan);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback) {
      alert("피드백을 입력해주세요!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/update-plan", {
        feedback,
        currentPlan: studyPlan
      });
      setUpdatedPlan(res.data.updated_plan || "");
    } catch (err) {
      console.error(err);
      alert("피드백 반영 실패!");
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
          <pre className="bg-gray-100 p-2 rounded whitespace-pre-line">{studyPlan}</pre>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="예: 2번 항목을 빼줘 / 시간을 늘려줘"
            className="border p-2 rounded w-full ml-5"/>
          <button onClick={handleFeedbackSubmit}
            className="mt-2 px-4 py-1 bg-green-500 text-white rounded">
            피드백 보내기
          </button>
        </div>
      )}
      {updatedPlan && (
        <div className="mt-4">
          <h3 className="font-semibold">✅ 수정된 AI 학습 계획</h3>
          <pre className="bg-yellow-100 p-2 rounded whitespace-pre-line">{updatedPlan}</pre>
        </div>
      )}
      <button onClick={handleDoneToday}
        className="mt-2 px-4 py-1 bg-green-500 text-white rounded">
        오늘 완료 항목 저장
      </button>
    </div>
  );
}

export default PDFUpload;
