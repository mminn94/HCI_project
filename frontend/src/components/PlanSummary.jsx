import React from "react";

function PlanSummary({ summary }) {
  if (!summary) return null;

  return (
    <div>
      <h3 className="font-semibold">📝 AI 요약</h3>
      <pre>{summary}</pre>
    </div>
  );
}
export default PlanSummary;
