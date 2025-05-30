import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function HowToUse() {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h1 className="text-[45px] font-semibold mb-6">How To Use This Page ?</h1>
      <h2 className="text-[30px] font-semibold mb-10">기능</h2>
      <h2 className="text-[24px] font-semibold mb-3">오늘 할 일 보러가기 페이지</h2>
      <p> 1. 파일 업로드로 이동 버튼 누르기</p>
      <p> 2. 파일 선택 후 업로드 버튼 누르기</p>
      <p> 3. AI가 계획을 세워주면, 체크박스 선택 후 오늘 할 일 저장 버튼 누르기</p>
      <p> 4. 오늘 할 일을 완료했다면, 완료 버튼 누르기</p>
      <p> 5. 삭제하고 싶다면 삭제 버튼 / 내일로 미루고 싶다면 미루기 버튼 누르기</p>

      <h2 className="text-[24px] font-semibold mt-6 mb-3">캘린더</h2>
      <h2 className="text-[24px] font-semibold mt-6 mb-3">장기 계획 세우기</h2>
      <h2 className="text-[24px] font-semibold mt-6 mb-3">단기 계획 세우기</h2>
      <h2 className="text-[24px] font-semibold mt-6 mb-3">AI와 대화하기</h2>
      <button
        onClick={() => navigate("/")}
        className="px-4 py-1 text-gray rounded bg-gray-200 hover:bg-gray-300 mt-4"
      >
        🏠 홈으로 돌아가기 | Home
      </button>
    </div>
  );
}

export default HowToUse;
