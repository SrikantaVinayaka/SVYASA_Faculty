import { useState } from "react";
import ClassTimetable from "./ClassTimetable.jsx";
import InternalAssessment from "./InternalAssessment.jsx";
import OtherAssessment from "./OtherAssessment.jsx";
import ClassTransfer from "./ClassTransfer.jsx";

const TABS = ["Class Timetable", "Internal Assessment", "Other Assessment", "Class Transfer"];

export default function Timetable({ tab, onTabChange }) {
  const activeTab = TABS.includes(tab) ? tab : "Class Timetable";

  const renderTabContent = () => {
    switch (activeTab) {
      case "Class Timetable":
        return <ClassTimetable />;
      case "Internal Assessment":
        return <InternalAssessment />;
      case "Other Assessment":
        return <OtherAssessment />;
      case "Class Transfer":
        return <ClassTransfer />;
      default:
        return <ClassTimetable />;
    }
  };

  return (
    <main
      className="flex-1 overflow-y-auto p-6 pb-12"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#D1D5DB transparent" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-bold text-text mb-1">Timetable</h1>
          <p className="text-[12.5px] text-text2">Manage class schedules, assessments, and transfers.</p>
        </div>
        <div className="flex items-center p-1.5 bg-white border border-border rounded-full">
          {TABS.map((t) => {
            const isActive = t === activeTab;
            return (
              <button
                key={t}
                onClick={() => onTabChange?.(t)}
                className={[
                  "px-3 py-1.25 rounded-full text-[12.5px] font-semibold transition-all",
                  isActive ? "bg-[#9B2335] text-white" : "text-text2 hover:text-text hover:bg-page-bg",
                ].join(" ")}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
      {renderTabContent()}
    </main>
  );
}