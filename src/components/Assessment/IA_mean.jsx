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

function getQuestionHeaders(questionCount) {
  const count = Math.max(1, questionCount || 0);
  return Array.from({ length: count }, (_, i) => `Q${i + 1}`);
}

export default function IA_Mean() {
  const [view, setView] = useState("dashboard");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("Semester 4-2024");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedIa, setSelectedIa] = useState("");

  const [editingStudentUsn, setEditingStudentUsn] = useState(null);
  const [draftMarks, setDraftMarks] = useState({});
  const [savedMarks, setSavedMarks] = useState({});

  const assessments = useMemo(
    () => safeLSRead(IA_ASSESSMENTS_KEY, []),
    [],
  );
  const questionsByAssessment = useMemo(
    () => safeLSRead(IA_QUESTIONS_KEY, {}),
    [],
  );

  const iaOptions = useMemo(() => {
    const values = Array.from(
      new Set(assessments.map((item) => `IA-${item.assessmentNumber}`)),
    );
    return values.sort();
  }, [assessments]);

  const courseOptions = useMemo(() => {
    const values = Array.from(
      new Set(assessments.map((item) => item.course?.label).filter(Boolean)),
    );
    return values;
  }, [assessments]);

  const subjectOptions = useMemo(() => {
    const values = Array.from(
      new Set(assessments.map((item) => item.course?.courseName).filter(Boolean)),
    );
    return values;
  }, [assessments]);

  const sectionOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        assessments
          .map((item) => item.course?.label?.split("-").pop())
          .filter(Boolean),
      ),
    );
    return values;
  }, [assessments]);

  const filteredAssessments = useMemo(() => {
    return assessments.filter((item) => {
      const iaName = `IA-${item.assessmentNumber}`;
      const section = item.course?.label?.split("-").pop() || "";
      const passCourse = !selectedCourse || item.course?.label === selectedCourse;
      const passSubject =
        !selectedSubject || item.course?.courseName === selectedSubject;
      const passSection = !selectedSection || section === selectedSection;
      const passIa = !selectedIa || selectedIa === iaName;
      return passCourse && passSubject && passSection && passIa;
    });
  }, [assessments, selectedCourse, selectedSubject, selectedSection, selectedIa]);

  const activeAssessment = filteredAssessments[0] || null;
  const activeQuestions = activeAssessment
    ? questionsByAssessment[activeAssessment.id] || []
    : [];
  const questionHeaders = getQuestionHeaders(activeQuestions.length);

  const studentRows = useMemo(() => {
    return STUDENTS.map((student, index) => {
      const questionMarks = questionHeaders.reduce((acc, question, qIdx) => {
        const key = `${student.usn}-${question}`;
        const defaultValue = (index + qIdx) % 3 === 0 ? "Ab" : ((index + qIdx + 2) % 3) + 1;
        acc[question] = savedMarks[key] ?? defaultValue;
        return acc;
      }, {});

      const total = Object.values(questionMarks).reduce((sum, value) => {
        const n = Number(value);
        return Number.isFinite(n) ? sum + n : sum;
      }, 0);
      const btcl = total > 0 ? "Apply" : "No Level";
      return { ...student, questionMarks, total, btcl };
    });
  }, [questionHeaders, savedMarks]);

  const passPercentage = studentRows.length
    ? Math.round((studentRows.filter((s) => s.total > 0).length / studentRows.length) * 100)
    : 0;

  function handleEdit(student) {
    const next = {};
    questionHeaders.forEach((header) => {
      const key = `${student.usn}-${header}`;
      next[header] = String(student.questionMarks[header] ?? "");
    });
    setDraftMarks(next);
    setEditingStudentUsn(student.usn);
  }

  function handleSave(student) {
    const next = { ...savedMarks };
    questionHeaders.forEach((header) => {
      next[`${student.usn}-${header}`] = draftMarks[header] || "0";
    });
    setSavedMarks(next);
    setEditingStudentUsn(null);
    setDraftMarks({});
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 pb-12">
      {view === "dashboard" ? (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
            <div>
              <h1 className="text-[18px] font-bold text-text">IA Mean %</h1>
              <p className="text-[12.5px] text-text2 mt-1">
                Internal assessment score dashboard and IA wise tabulation.
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
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 text-[12px] bg-white"
              >
                <option value="">Course Handled</option>
                {courseOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 text-[12px] bg-white"
              >
                <option>Semester 4-2024</option>
                <option>Semester 3-2024</option>
                <option>Semester 2-2024</option>
              </select>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 text-[12px] bg-white"
              >
                <option value="">Subject</option>
                {subjectOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 text-[12px] bg-white"
              >
                <option value="">CS / Section</option>
                {sectionOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {iaOptions.length > 0 ? (
                <select
                  value={selectedIa}
                  onChange={(e) => setSelectedIa(e.target.value)}
                  className="border border-border rounded-lg px-3 py-2 text-[12px] bg-white"
                >
                  <option value="">IA-1 / IA-2</option>
                  {iaOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
            <div className="rounded-xl border border-border bg-white p-4">
              <p className="text-[12px] text-text2">Pass %</p>
              <p className="text-[24px] font-bold text-text mt-1">{passPercentage}</p>
              <p className="text-[12px] text-text2">Pass %</p>
            </div>
            <div className="rounded-xl border border-border bg-white p-4">
              <p className="text-[12px] text-text2">Topper Score</p>
              <p className="text-[24px] font-bold text-text mt-1">
                {studentRows.length ? Math.max(...studentRows.map((s) => s.total)) : 0}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-white p-4">
              <p className="text-[12px] text-text2">Mean Score*</p>
              <p className="text-[24px] font-bold text-text mt-1">
                {studentRows.length
                  ? Math.round(
                      studentRows.reduce((sum, row) => sum + row.total, 0) / studentRows.length,
                    )
                  : 0}
              </p>
              <p className="text-[12px] text-[#9B2335] font-semibold mt-1">Apply Bloom's Level</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 overflow-x-auto">
            <h3 className="text-[13px] font-semibold text-text mb-3">Internal Assessment Scores</h3>
            <table className="w-full min-w-160">
              <thead>
                <tr className="bg-[#e7f0fb] text-[12px] text-text2">
                  <th className="text-left px-3 py-2 font-semibold">RESULT</th>
                  <th className="text-left px-3 py-2 font-semibold">% of Students</th>
                  <th className="text-left px-3 py-2 font-semibold">
                    # of Students ({studentRows.length})
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border text-[12px]">
                  <td className="px-3 py-2">&gt; 0</td>
                  <td className="px-3 py-2">{passPercentage}</td>
                  <td className="px-3 py-2">
                    {studentRows.filter((row) => row.total > 0).length}
                  </td>
                </tr>
                <tr className="border-b border-border text-[12px]">
                  <td className="px-3 py-2">0</td>
                  <td className="px-3 py-2">{100 - passPercentage}</td>
                  <td className="px-3 py-2">
                    {studentRows.filter((row) => row.total === 0).length}
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
              <h1 className="text-[18px] font-bold text-text">IA Mean % - Tabulate</h1>
              <p className="text-[12.5px] text-text2 mt-1">
                Student tiles and question table from Internal Assessment.
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
            <p className="text-[12px] text-text2">
              # of records : {studentRows.length}
            </p>
            <p className="text-[12px] text-text2 mt-1">
              # of Mandatory Questions : {questionHeaders.length}
            </p>
            <p className="text-[12px] text-[#9B2335] font-semibold mt-2">Status : SUBMITTED</p>
          </div>

          <div className="rounded-xl border border-border bg-white overflow-x-auto">
            <table className="w-full min-w-230">
              <thead>
                <tr className="bg-[#cfe1f4] text-[12px] text-text2">
                  <th className="text-left px-3 py-3 font-semibold">Sl #</th>
                  <th className="text-left px-3 py-3 font-semibold">USN</th>
                  <th className="text-left px-3 py-3 font-semibold">Name</th>
                  {questionHeaders.map((header) => (
                    <th key={header} className="text-left px-2 py-3 font-semibold">
                      {header}
                    </th>
                  ))}
                  <th className="text-left px-3 py-3 font-semibold">Total Score</th>
                  <th className="text-left px-3 py-3 font-semibold">BT/CL</th>
                  <th className="text-left px-3 py-3 font-semibold">Edit</th>
                </tr>
              </thead>
              <tbody>
                {studentRows.map((student) => {
                  const isEditing = editingStudentUsn === student.usn;
                  return (
                    <tr key={student.usn} className="border-b border-border text-[12px]">
                      <td className="px-3 py-3">{student.sl}</td>
                      <td className="px-3 py-3">{student.usn}</td>
                      <td className="px-3 py-3">{student.name}</td>
                      {questionHeaders.map((header) => (
                        <td key={header} className="px-2 py-3">
                          {isEditing ? (
                            <input
                              value={draftMarks[header] ?? ""}
                              onChange={(e) =>
                                setDraftMarks((prev) => ({
                                  ...prev,
                                  [header]: e.target.value.replace(/[^\d]/g, "").slice(0, 2),
                                }))
                              }
                              className="w-12 border border-border rounded px-2 py-1"
                            />
                          ) : (
                            student.questionMarks[header]
                          )}
                        </td>
                      ))}
                      <td className="px-3 py-3 font-semibold">{student.total}</td>
                      <td className="px-3 py-3">{student.btcl}</td>
                      <td className="px-3 py-3">
                        {isEditing ? (
                          <button
                            onClick={() => handleSave(student)}
                            className="text-[#9B2335] font-semibold hover:underline"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEdit(student)}
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

          <div className="rounded-xl border border-border bg-white p-4 mt-4">
            <p className="text-[12px] text-text2 font-semibold mb-2">
              IA Question Source (from Timetable Internal Assessment):
            </p>
            <div className="text-[12px] text-text2">
              {activeAssessment ? (
                <>
                  <p>Assessment: IA-{activeAssessment.assessmentNumber}</p>
                  <p>Course: {activeAssessment.course?.courseName || "-"}</p>
                  <p>Questions available: {activeQuestions.length}</p>
                </>
              ) : (
                <p>No Internal Assessment found. Create one in Timetable &gt; Internal Assessment.</p>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}