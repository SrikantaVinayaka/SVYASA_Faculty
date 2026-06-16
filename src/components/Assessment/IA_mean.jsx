import React, { useMemo, useState } from "react";

const IA_ASSESSMENTS_KEY = "svyasa_ia_assessments";
const IA_QUESTIONS_KEY = "svyasa_ia_questions";

const STUDENTS = [
  { sl: 1, usn: "2222408001", name: "Aakash B" },
  { sl: 2, usn: "2222408002", name: "Abhishek R" },
  { sl: 3, usn: "2222408004", name: "ABIN H. DANIEL" },
  { sl: 4, usn: "2222408010", name: "Bhumireddy Veera Bhavitha" },
  { sl: 5, usn: "2222408011", name: "Bhavya S" },
];

function safeLSRead(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function buildTableColumns(questions) {
  if (!questions?.length) {
    return [{ key: "Q1", label: "Q1", maxMarks: 0, allKeys: ["Q1"] }];
  }
  return questions.map((q, idx) => {
    const qNum = idx + 1;
    const subs = q.subQuestions || [];
    if (subs.length === 0) {
      const key = `Q${qNum}`;
      return { key, label: key, maxMarks: Number(q.totalMarks) || 0, allKeys: [key] };
    }
    const options = [
      { key: `Q${qNum}.a`, marks: Number(q.totalMarks) || 0 },
      ...subs.map((sq, sqIdx) => ({
        key: `Q${qNum}.${String.fromCharCode(98 + sqIdx)}`,
        marks: Number(sq.totalMarks) || 0,
      })),
    ];
    const highest = options.reduce((a, b) => (b.marks >= a.marks ? b : a));
    return { key: highest.key, label: highest.key, maxMarks: highest.marks, allKeys: options.map((o) => o.key) };
  });
}

function buildEditFields(questions) {
  if (!questions?.length) return [{ key: "Q1", label: "Q1", maxMarks: 0 }];
  const fields = [];
  questions.forEach((q, idx) => {
    const qNum = idx + 1;
    const subs = q.subQuestions || [];
    if (subs.length === 0) {
      fields.push({ key: `Q${qNum}`, label: `Q${qNum}`, maxMarks: Number(q.totalMarks) || 0 });
    } else {
      fields.push({ key: `Q${qNum}.a`, label: `Q${qNum}.a`, maxMarks: Number(q.totalMarks) || 0 });
      subs.forEach((sq, sqIdx) => {
        fields.push({
          key: `Q${qNum}.${String.fromCharCode(98 + sqIdx)}`,
          label: `Q${qNum}.${String.fromCharCode(98 + sqIdx)}`,
          maxMarks: Number(sq.totalMarks) || 0,
        });
      });
    }
  });
  return fields;
}

export default function IA_Mean() {
  const [view, setView] = useState("dashboard");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("Semester 4-2024");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedIa, setSelectedIa] = useState("");
  const [modalStudent, setModalStudent] = useState(null);
  const [draftMarks, setDraftMarks] = useState({});
  const [savedMarks, setSavedMarks] = useState({});

  const assessments = useMemo(() => safeLSRead(IA_ASSESSMENTS_KEY, []), []);
  const questionsByAssessment = useMemo(() => safeLSRead(IA_QUESTIONS_KEY, {}), []);

  const iaOptions = useMemo(
    () => Array.from(new Set(assessments.map((item) => `IA-${item.assessmentNumber}`))).sort(),
    [assessments],
  );
  const courseOptions = useMemo(
    () => Array.from(new Set(assessments.map((item) => item.course?.label).filter(Boolean))),
    [assessments],
  );
  const subjectOptions = useMemo(
    () => Array.from(new Set(assessments.map((item) => item.course?.courseName).filter(Boolean))),
    [assessments],
  );
  const sectionOptions = useMemo(
    () =>
      Array.from(
        new Set(assessments.map((item) => item.course?.label?.split("-").pop()).filter(Boolean)),
      ),
    [assessments],
  );

  const filteredAssessments = useMemo(() => {
    return assessments.filter((item) => {
      const iaName = `IA-${item.assessmentNumber}`;
      const section = item.course?.label?.split("-").pop() || "";
      return (
        (!selectedCourse || item.course?.label === selectedCourse) &&
        (!selectedSubject || item.course?.courseName === selectedSubject) &&
        (!selectedSection || section === selectedSection) &&
        (!selectedIa || selectedIa === iaName)
      );
    });
  }, [assessments, selectedCourse, selectedSubject, selectedSection, selectedIa]);

  const activeAssessment = filteredAssessments[0] || null;
  const activeQuestions = activeAssessment ? questionsByAssessment[activeAssessment.id] || [] : [];
  const tableColumns = useMemo(() => buildTableColumns(activeQuestions), [activeQuestions]);
  const editFields = useMemo(() => buildEditFields(activeQuestions), [activeQuestions]);

  const studentRows = useMemo(() => {
    return STUDENTS.map((student, index) => {
      const questionMarks = {};
      tableColumns.forEach((col, cIdx) => {
        const displayKey = col.key;
        const stored = savedMarks[`${student.usn}-${displayKey}`];
        const fallback = ((index + cIdx + 2) % 3) + 1;
        questionMarks[displayKey] = stored ?? String(fallback);
      });

      const total = Object.values(questionMarks).reduce((sum, value) => {
        const n = Number(value);
        return Number.isFinite(n) ? sum + n : sum;
      }, 0);
      return { ...student, questionMarks, total, btcl: total > 0 ? "Apply" : "No Level" };
    });
  }, [tableColumns, savedMarks]);

  const passPercentage = studentRows.length
    ? Math.round((studentRows.filter((s) => s.total > 0).length / studentRows.length) * 100)
    : 0;

  function openModal(student) {
    const next = {};
    editFields.forEach((field) => {
      const displayCol = tableColumns.find((c) => c.allKeys.includes(field.key));
      const fromDisplay = displayCol ? student.questionMarks[displayCol.key] : "";
      next[field.key] = savedMarks[`${student.usn}-${field.key}`] ?? fromDisplay ?? "";
    });
    setDraftMarks(next);
    setModalStudent(student);
  }

  function saveModal() {
    if (!modalStudent) return;
    const next = { ...savedMarks };
    editFields.forEach((field) => {
      next[`${modalStudent.usn}-${field.key}`] = draftMarks[field.key] || "0";
      const col = tableColumns.find((c) => c.allKeys.includes(field.key));
      if (col) next[`${modalStudent.usn}-${col.key}`] = draftMarks[field.key] || "0";
    });
    setSavedMarks(next);
    setModalStudent(null);
    setDraftMarks({});
  }

  const filterSelects = (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
      <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-[12px] bg-white">
        <option value="">Course Handled</option>
        {courseOptions.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
      <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-[12px] bg-white">
        <option>Semester 4-2024</option>
        <option>Semester 3-2024</option>
        <option>Semester 2-2024</option>
      </select>
      <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-[12px] bg-white">
        <option value="">Subject</option>
        {subjectOptions.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
      <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-[12px] bg-white">
        <option value="">CS / Section</option>
        {sectionOptions.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
      {iaOptions.length > 0 ? (
        <select value={selectedIa} onChange={(e) => setSelectedIa(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-[12px] bg-white">
          <option value="">IA-1 / IA-2</option>
          {iaOptions.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      ) : null}
    </div>
  );

  return (
    <main className="flex-1 overflow-y-auto p-6 pb-12">
      {view === "dashboard" ? (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
            <div>
              <h1 className="text-[18px] font-bold text-text">IA Mean %</h1>
              <p className="text-[12.5px] text-text2 mt-1">Internal assessment score dashboard and IA wise tabulation.</p>
            </div>
            <button onClick={() => setView("tabulate")} className="px-4 py-2 rounded-lg bg-[#9B2335] text-white text-[12.5px] font-semibold">Tabulate</button>
          </div>
          <div className="rounded-xl border border-border bg-white p-4 mb-5">{filterSelects}</div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
            <div className="rounded-xl border border-border bg-white p-4">
              <p className="text-[12px] text-text2">Pass %</p>
              <p className="text-[24px] font-bold text-text mt-1">{passPercentage}</p>
            </div>
            <div className="rounded-xl border border-border bg-white p-4">
              <p className="text-[12px] text-text2">Topper Score</p>
              <p className="text-[24px] font-bold text-text mt-1">{studentRows.length ? Math.max(...studentRows.map((s) => s.total)) : 0}</p>
            </div>
            <div className="rounded-xl border border-border bg-white p-4">
              <p className="text-[12px] text-text2">Mean Score*</p>
              <p className="text-[24px] font-bold text-text mt-1">
                {studentRows.length ? Math.round(studentRows.reduce((sum, row) => sum + row.total, 0) / studentRows.length) : 0}
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
            <div>
              <h1 className="text-[18px] font-bold text-text">IA Mean % - Tabulate</h1>
              <p className="text-[12.5px] text-text2 mt-1">Click a student row to edit question marks.</p>
            </div>
            <button onClick={() => setView("dashboard")} className="px-4 py-2 rounded-lg border border-border text-[12.5px] font-semibold text-text">Back</button>
          </div>
          <div className="rounded-xl border border-border bg-white p-4 mb-4">
            <p className="text-[12px] text-text2"># of records : {studentRows.length}</p>
            <p className="text-[12px] text-text2 mt-1"># of Mandatory Questions : {tableColumns.length}</p>
            <p className="text-[12px] text-[#9B2335] font-semibold mt-2">Status : SUBMITTED</p>
          </div>
          <div className="rounded-xl border border-border bg-white overflow-x-auto">
            <table className="w-full min-w-230">
              <thead>
                <tr className="bg-[#cfe1f4] text-[12px] text-text2">
                  <th className="text-left px-3 py-3 font-semibold">Sl #</th>
                  <th className="text-left px-3 py-3 font-semibold">USN</th>
                  <th className="text-left px-3 py-3 font-semibold">Name</th>
                  {tableColumns.map((col) => (
                    <th key={col.key} className="text-left px-2 py-3 font-semibold">{col.label}</th>
                  ))}
                  <th className="text-left px-3 py-3 font-semibold">Total Score</th>
                  <th className="text-left px-3 py-3 font-semibold">BT/CL</th>
                </tr>
              </thead>
              <tbody>
                {studentRows.map((student) => (
                  <tr
                    key={student.usn}
                    onClick={() => openModal(student)}
                    className="border-b border-border text-[12px] cursor-pointer hover:bg-page-bg"
                  >
                    <td className="px-3 py-3">{student.sl}</td>
                    <td className="px-3 py-3">{student.usn}</td>
                    <td className="px-3 py-3">{student.name}</td>
                    {tableColumns.map((col) => (
                      <td key={col.key} className="px-2 py-3">{student.questionMarks[col.key]}</td>
                    ))}
                    <td className="px-3 py-3 font-semibold">{student.total}</td>
                    <td className="px-3 py-3">{student.btcl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modalStudent ? (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-white shadow-2xl">
            <div className="border-b border-border px-4 py-3">
              <div className="text-[14px] font-bold text-text">{modalStudent.name}</div>
              <div className="text-[12px] text-text2">{modalStudent.usn} · Edit marks per question</div>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {editFields.map((field) => (
                <div key={field.key} className="flex items-center justify-between gap-3">
                  <label className="text-[13px] font-semibold text-text">
                    {field.label}
                    <span className="text-text2 font-normal"> (max {field.maxMarks})</span>
                  </label>
                  <input
                    value={draftMarks[field.key] ?? ""}
                    onChange={(e) =>
                      setDraftMarks((prev) => ({
                        ...prev,
                        [field.key]: e.target.value.replace(/[^\d]/g, "").slice(0, 2),
                      }))
                    }
                    className="w-16 border border-border rounded-lg px-2 py-1 text-[13px] text-center"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
              <button onClick={() => setModalStudent(null)} className="rounded-lg border border-border px-3 py-2 text-[12.5px] font-semibold">Cancel</button>
              <button onClick={saveModal} className="rounded-lg bg-[#9B2335] px-3 py-2 text-[12.5px] font-semibold text-white">Save Marks</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
