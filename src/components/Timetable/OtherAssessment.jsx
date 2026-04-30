import { useMemo, useState } from "react";
import { OTHER_ASSESSMENT_ROWS } from "./timetableData.js";

const BRAND = "#7B1D2E";
const OTHER_ASSESSMENT_TYPES = ["Class Participation", "CIA", "CIA Practical"];
const TEST_TYPES = ["Quiz", "Assessment", "Basic"];
const STUDENT_OPTIONS = ["Student A", "Student B", "Student C", "Student D", "Student E"];

export default function OtherAssessment() {
  const [selectedOtherType, setSelectedOtherType] = useState(OTHER_ASSESSMENT_TYPES[0]);
  const [showCreate, setShowCreate] = useState(false);
  const [createdRows, setCreatedRows] = useState([]);
  const [activeAssessmentId, setActiveAssessmentId] = useState(null);
  const [assignedStudents, setAssignedStudents] = useState({});
  const [form, setForm] = useState({
    title: "",
    section: "A",
    testType: "Quiz",
    startDate: "",
    endDate: "",
    submissionDate: "",
    deadline: "",
    note: "",
  });

  const allRows = useMemo(
    () => [...OTHER_ASSESSMENT_ROWS, ...createdRows],
    [createdRows],
  );
  const activeStudentSelection = assignedStudents[activeAssessmentId] || [];
  const isAllSelected = activeStudentSelection.length === STUDENT_OPTIONS.length;

  function handleCreateAssessment() {
    if (!form.title.trim()) return;
    const newRow = {
      id: `oa-${Date.now()}`,
      title: form.title.trim(),
      type: `${selectedOtherType} / ${form.testType}`,
      due: form.deadline || form.submissionDate || "--",
      section: form.section,
      startDate: form.startDate,
      endDate: form.endDate,
      submissionDate: form.submissionDate,
      deadline: form.deadline,
      note: form.note,
    };
    setCreatedRows((prev) => [newRow, ...prev]);
    setShowCreate(false);
    setForm({ title: "", section: "A", testType: "Quiz", startDate: "", endDate: "", submissionDate: "", deadline: "", note: "" });
  }

  return (
    <div className="fade-in max-w-6xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
        <span>Timetable</span>
        <span className="text-slate-300">/</span>
        <span>Other Assessment</span>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Other Assessment</h1>
          <p className="text-xs text-slate-500 mt-1">Other assessment: {selectedOtherType}</p>
        </div>
        <select
          value={selectedOtherType}
          onChange={(e) => setSelectedOtherType(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          {OTHER_ASSESSMENT_TYPES.map((type) => <option key={type}>{type}</option>)}
        </select>
        <button
          onClick={() => setShowCreate((prev) => !prev)}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-white"
          style={{ background: BRAND }}
        >
          Create New Assessment
        </button>
      </div>

      {showCreate ? (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 grid gap-3 md:grid-cols-3">
          <input placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <select value={form.testType} onChange={(e) => setForm((p) => ({ ...p, testType: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">{TEST_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          <input placeholder="Section" value={form.section} onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input type="date" value={form.submissionDate} onChange={(e) => setForm((p) => ({ ...p, submissionDate: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input type="date" value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input placeholder="Note" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2" />
          <button onClick={handleCreateAssessment} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Add</button>
        </div>
      ) : null}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-150">
          <thead>
            <tr style={{ background: "rgba(123,29,46,0.06)" }}>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Title</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Type</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Due</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Section</th>
            </tr>
          </thead>
          <tbody>
            {allRows.map((row) => (
              <tr
                key={row.id}
                onClick={() => setActiveAssessmentId(row.id)}
                className="border-t border-slate-100 hover:bg-slate-50/80 transition-colors"
              >
                <td className="px-4 py-3 text-slate-800 font-medium">{row.title}</td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(123,29,46,0.10)", color: BRAND }}
                  >
                    {row.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{row.due}</td>
                <td className="px-4 py-3 text-slate-800 font-medium">{row.section}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeAssessmentId ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 text-sm font-semibold text-slate-800">Assign to students</div>
          <label className="mb-2 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={(e) =>
                setAssignedStudents((prev) => ({
                  ...prev,
                  [activeAssessmentId]: e.target.checked ? [...STUDENT_OPTIONS] : [],
                }))
              }
            />
            Select All
          </label>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {STUDENT_OPTIONS.map((name) => (
              <label key={name} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={activeStudentSelection.includes(name)}
                  onChange={(e) =>
                    setAssignedStudents((prev) => {
                      const current = prev[activeAssessmentId] || [];
                      const next = e.target.checked ? [...current, name] : current.filter((item) => item !== name);
                      return { ...prev, [activeAssessmentId]: next };
                    })
                  }
                />
                {name}
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
