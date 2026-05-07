import React, { useMemo, useState } from "react";

const STORAGE_KEY = "svyasa.assessment.other.tabulate.v1";

const STUDENTS = [
  { sl: 1, usn: "2222408001", name: "Aakash B" },
  { sl: 2, usn: "2222408002", name: "Abhishek R" },
  { sl: 3, usn: "2222408004", name: "ABIN H.DANIEL" },
  { sl: 4, usn: "2222408010", name: "Bhumireddy Veera Bhavitha" },
  { sl: 5, usn: "2222408012", name: "Chethan K" },
];

function readSaved() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function OtherAssessmentDashboard() {
  const [view, setView] = useState("dashboard");
  const [savedScores, setSavedScores] = useState(() => readSaved());
  const [editingUsn, setEditingUsn] = useState(null);
  const [draftScore, setDraftScore] = useState("");

  const [course, setCourse] = useState("MCA-DET-CC");
  const [semester, setSemester] = useState("Semester 4-2024");
  const [subject, setSubject] = useState("Cloud Computing");
  const [assessmentType, setAssessmentType] = useState("CIA-1");

  const rows = useMemo(() => {
    return STUDENTS.map((student) => {
      const score = Number(savedScores[student.usn] ?? (student.sl % 2 === 0 ? 9 : 0));
      return {
        ...student,
        totalScore: Number.isFinite(score) ? score : 0,
      };
    });
  }, [savedScores]);

  const passPercentage = rows.length
    ? ((rows.filter((row) => row.totalScore >= 4).length / rows.length) * 100).toFixed(2)
    : "0.00";

  function startEdit(row) {
    setEditingUsn(row.usn);
    setDraftScore(String(row.totalScore));
  }

  function saveEdit(row) {
    const normalized = Math.max(0, Math.min(10, Number(draftScore || 0)));
    const next = { ...savedScores, [row.usn]: normalized };
    setSavedScores(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    setEditingUsn(null);
    setDraftScore("");
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 pb-12">
      {view === "dashboard" ? (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
            <div>
              <h1 className="text-[18px] font-bold text-text">Other Assessment</h1>
              <p className="text-[12.5px] text-text2 mt-1">
                Other assessment dashboard with score distribution.
              </p>
            </div>
            <button
              onClick={() => setView("tabulate")}
              className="px-4 py-2 rounded-lg bg-[#9B2335] text-white text-[12.5px] font-semibold"
            >
              Tabulate
            </button>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 mb-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 text-[12px] bg-white"
              >
                <option>MCA-DET-CC</option>
                <option>B.Tech-DET-CC</option>
              </select>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 text-[12px] bg-white"
              >
                <option>Semester 4-2024</option>
                <option>Semester 3-2024</option>
              </select>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 text-[12px] bg-white"
              >
                <option>Cloud Computing</option>
                <option>DevOps Fundamentals</option>
              </select>
              <select
                value={assessmentType}
                onChange={(e) => setAssessmentType(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 text-[12px] bg-white"
              >
                <option>CIA-1</option>
                <option>CIA-2</option>
                <option>CIA-3</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
            <div className="rounded-xl border border-border bg-white p-4">
              <p className="text-[12px] text-text2">Pass %</p>
              <p className="text-[24px] font-bold text-text mt-1">{passPercentage}</p>
            </div>
            <div className="rounded-xl border border-border bg-white p-4">
              <p className="text-[12px] text-text2">Topper Score</p>
              <p className="text-[24px] font-bold text-text mt-1">
                {rows.length ? Math.max(...rows.map((row) => row.totalScore)) : 0}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-white p-4">
              <p className="text-[12px] text-text2">Mean Score*</p>
              <p className="text-[24px] font-bold text-text mt-1">
                {rows.length
                  ? Math.round(rows.reduce((sum, row) => sum + row.totalScore, 0) / rows.length)
                  : 0}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 overflow-x-auto">
            <h3 className="text-[13px] font-semibold text-text mb-3">Internal Assessment Scores</h3>
            <table className="w-full min-w-140">
              <thead>
                <tr className="bg-[#e7f0fb] text-[12px] text-text2">
                  <th className="text-left px-3 py-2 font-semibold">RESULT</th>
                  <th className="text-left px-3 py-2 font-semibold">% of Students</th>
                  <th className="text-left px-3 py-2 font-semibold">
                    # of Students ({rows.length})
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border text-[12px]">
                  <td className="px-3 py-2">&lt;4</td>
                  <td className="px-3 py-2">
                    {((rows.filter((row) => row.totalScore < 4).length / rows.length) * 100).toFixed(2)}
                  </td>
                  <td className="px-3 py-2">{rows.filter((row) => row.totalScore < 4).length}</td>
                </tr>
                <tr className="border-b border-border text-[12px]">
                  <td className="px-3 py-2">&gt;7</td>
                  <td className="px-3 py-2">
                    {((rows.filter((row) => row.totalScore > 7).length / rows.length) * 100).toFixed(2)}
                  </td>
                  <td className="px-3 py-2">{rows.filter((row) => row.totalScore > 7).length}</td>
                </tr>
                <tr className="border-b border-border text-[12px]">
                  <td className="px-3 py-2">4-7</td>
                  <td className="px-3 py-2">
                    {(
                      (rows.filter((row) => row.totalScore >= 4 && row.totalScore <= 7).length / rows.length) *
                      100
                    ).toFixed(2)}
                  </td>
                  <td className="px-3 py-2">
                    {rows.filter((row) => row.totalScore >= 4 && row.totalScore <= 7).length}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
            <div>
              <h1 className="text-[18px] font-bold text-text">Other Assessment - Tabulate</h1>
              <p className="text-[12.5px] text-text2 mt-1">
                Student list with editable total score (Max: 10).
              </p>
            </div>
            <button
              onClick={() => setView("dashboard")}
              className="px-4 py-2 rounded-lg border border-border text-[12.5px] font-semibold text-text"
            >
              Back
            </button>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 mb-4">
            <p className="text-[12px] text-[#9B2335] font-semibold">Status : SUBMITTED</p>
            <p className="text-[12px] text-text2 mt-1">Tabulated Scores frozen</p>
          </div>

          <div className="rounded-xl border border-border bg-white overflow-x-auto">
            <table className="w-full min-w-170">
              <thead>
                <tr className="bg-[#cfe1f4] text-[12px] text-text2">
                  <th className="text-left px-3 py-3 font-semibold">Sl #</th>
                  <th className="text-left px-3 py-3 font-semibold">USN</th>
                  <th className="text-left px-3 py-3 font-semibold">Name</th>
                  <th className="text-left px-3 py-3 font-semibold">Total Score (Max: 10)</th>
                  <th className="text-left px-3 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isEditing = editingUsn === row.usn;
                  return (
                    <tr key={row.usn} className="border-b border-border text-[12px]">
                      <td className="px-3 py-3">{row.sl}</td>
                      <td className="px-3 py-3">{row.usn}</td>
                      <td className="px-3 py-3">{row.name}</td>
                      <td className="px-3 py-3">
                        {isEditing ? (
                          <input
                            value={draftScore}
                            onChange={(e) =>
                              setDraftScore(e.target.value.replace(/[^\d]/g, "").slice(0, 2))
                            }
                            className="w-28 border border-border rounded px-2 py-1"
                          />
                        ) : (
                          row.totalScore
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {isEditing ? (
                          <button
                            onClick={() => saveEdit(row)}
                            className="text-[#9B2335] font-semibold hover:underline"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(row)}
                            className="text-[#9B2335] font-semibold hover:underline"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
