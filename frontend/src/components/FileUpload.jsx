import React, { useState } from "react";
import axios from "axios";
import GrayButton from "./Button";

function FileUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) {
      setMessage("파일을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data.message);
      onUploadComplete && onUploadComplete(res.data);
    } catch (err) {
      setMessage("업로드 실패: " + (err.response?.data?.error || "서버 오류"));
      console.error(err);
    }
  };

  return (
    <div className="mb-4">
      <input
        type="file"
        onChange={handleFileChange}
        className="file:mr-4 file:py-2 file:px-4 file:font-base file:bg-gray-50 hover:file:bg-gray-200 file:rounded-xl"
      />
      <button onClick={handleUpload} className="ml-2 px-4 py-1 text-gray rounded bg-gray-200 hover:bg-gray-300">
        업로드 | Upload
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
export default FileUpload;
