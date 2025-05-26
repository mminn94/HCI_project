import React, { useState } from "react";
import PlanSummary from "./PlanSummary";
import PlanDetails from "./PlanDetails";

function PlanContainer({ summary, studyPlan, setUpdatedPlan }) {
  const [feedback, setFeedback] = useState("");
  const [selectedTasks, setSelectedTasks] = useState([]);

  if (!studyPlan) return null;

  return (
    <div className="mt-4">
      <PlanSummary summary={summary} />
      <PlanDetails
        studyPlan={studyPlan}
        feedback={feedback}
        setFeedback={setFeedback}
        setUpdatedPlan={setUpdatedPlan}
        selectedTasks={selectedTasks}
        setSelectedTasks={setSelectedTasks}
      />
    </div>
  );
}

export default PlanContainer;
