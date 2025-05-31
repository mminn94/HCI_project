import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GrayButton from "../components/Button";

function HowToUse() {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h1 className="text-[45px] font-semibold mb-6">📝 페이지 사용법 | How To Use This Page ?</h1>
      <p className="mb-4 text-gray-600">이 페이지는 오늘 할 일과 계획을 AI의 도움으로 효율적으로 관리할 수 있도록 구성되어 있습니다. 아래 기능들을 확인하고 활용해보세요!</p>

      <h2 className="text-[24px] font-semibold mb-3">✅ 1. 오늘 할 일 등록 및 관리</h2>
        <li> 파일 업로드로 이동: 페이지 상단의 버튼을 눌러 업로드 페이지로 이동하세요. </li>
        <li> 파일 업로드: 파일을 선택한 뒤 ‘업로드’ 버튼을 클릭하면 AI가 자동으로 계획을 세워줍니다.</li>
        <li> 체크박스 선택 후 오늘 할 일 저장: AI가 제안한 계획 중 오늘 할 일을 선택하고 저장하여 오늘의 계획을 확정하세요. </li>
        <li> 완료 처리: 오늘 할 일을 완료하면 ‘완료’ 버튼을 눌러 상태를 업데이트하세요.</li>
        <li> 삭제: 필요 없는 항목은 '삭제' 버튼을 눌러 제거할 수 있습니다.</li>
        <li> 미루기: 오늘 하기 어려운 일은 '미루기' 버튼을 눌러 내일로 연기할 수 있습니다.</li>
      <GrayButton onClick={() => navigate("/today")} className="mt-4">✅ 오늘 할 일 페이지 가기</GrayButton>

      <h2 className="text-[24px] font-semibold mt-6 mb-3">📅 2. 캘린더</h2>
      <p>캘린더에서 각 날짜별로 남은 계획과 완료한 계획을 확인할 수 있습니다. 캘린더를 클릭하면 상세한 일정이 보입니다.</p>
      <p>주간 요약 보기 버튼을 눌러 한 주의 달성률을 확인할 수 있습니다.</p>
      <GrayButton onClick={() => navigate("/calendar")} className="mt-4">📅 캘린더 페이지 가기</GrayButton>

      <h2 className="text-[24px] font-semibold mt-6 mb-3">🗒️ 3. 장기 계획 세우기</h2>
      <p>장기 계획 세우기 페이지에서는 더 긴 호흡으로 공부 계획을 세울 수 있습니다.</p>
      <GrayButton onClick={() => navigate("/longterm")} className="mt-4">🗒️ 장기 계획 페이지 가기</GrayButton>

      <h2 className="text-[24px] font-semibold mt-6 mb-3">⏱️ 4. 단기 계획 세우기</h2>
      <p>단기 계획 세우기 페이지를 통해 시험 직전 짧은 시간 효율적으로 공부할 수 있습니다.</p>
      <p>짜투리 시간에 단기 계획 세우기 페이지를 활용해보세요!</p>
      <GrayButton onClick={() => navigate("/shortterm")} className="mt-4">⏱️ 단기 계획 페이지 가기</GrayButton>

      <h2 className="text-[24px] font-semibold mt-6 mb-3">🧠 5. AI와 대화하기</h2>
      <p>AI와의 대화 페이지를 통해, AI에게 질문하거나 퀴즈를 요청하세요 !</p>
      <GrayButton onClick={() => navigate("/quiz")} className="mt-4">🧠 AI와 대화하러 가기</GrayButton>
      <div>
        <GrayButton onClick={() => navigate("/")} className="mt-4 mb-4">🏠 홈으로 돌아가기 | Home</GrayButton>
      </div>
    </div>
  );
}

export default HowToUse;
