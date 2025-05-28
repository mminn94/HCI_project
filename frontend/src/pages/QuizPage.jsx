import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Quiz() {
  const navigate = useNavigate();

  return (
    <div className="p-4 max-w-md mx-auto">

      <h2 className="text-[30px] font-bold mb-4">🧠 Gemma3와 대화하기</h2>  
      <button onClick={() => navigate("/")}
        className="px-4 py-1 text-gray rounded bg-gray-200 hover:bg-gray-300 mt-4 mb-4">
        🏠 홈으로 돌아가기 | Home
      </button>
    </div>
  );
}

export default Quiz;