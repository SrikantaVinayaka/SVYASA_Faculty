import { useState } from "react";
import MarksPage from "./pages/MarksPage";
import MentoringPage from "./pages/MentoringPage";
import { staticAttendanceStudents } from "./data/mockStudents";

const tabs = [
  { id: "mentoring", label: "Mentoring" },
  { id: "marks", label: "Marks Score" },
];

export default function Dashboard() {
  const [students] = useState(staticAttendanceStudents);
  const [activeTab, setActiveTab] = useState("mentoring");

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-red-900 text-white px-6 py-4 shadow">
        <h1 className="font-semibold text-lg">S-VYASA Dashboard</h1>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex gap-3 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-red-800 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "mentoring" && <MentoringPage />}

        {activeTab === "marks" && <MarksPage students={students} />}
      </main>
    </div>
  );
}
