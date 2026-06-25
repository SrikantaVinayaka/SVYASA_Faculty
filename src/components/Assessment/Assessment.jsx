import React from "react";
import MarksScore from "./Marks_scored.jsx";
import IA_Mean from "./IA_mean.jsx";
import OtherAssessmentDashboard from "./Other_assessment.jsx";
export default function Assessment({ tab, onTabChange }) {
  if (tab === "Marks Scored") {
    return <MarksScore />;
  }

  if (tab === "IA Mean %" || tab === "Internal Assessment") {
    return <IA_Mean />;
  }

  if (tab === "Other Assessment") {
    return <OtherAssessmentDashboard />;
  }

  // For other tabs, show under development
  return (
    <main className="flex-1 overflow-y-auto p-6 pb-12">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-[18px] font-bold text-text">Module Under Development</h2>
        <p className="mt-2 text-[13px] text-text2">
          The {tab} feature is not available yet. Currently, only Marks Scored is implemented.
        </p>
      </div>
    </main>
  );
}
