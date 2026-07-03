import { useEffect, useMemo, useState } from "react";
import AttendancePage from "./pages/AttendancePage";
import StudentRecordPage from "./pages/StudentRecordPage";
import MenteeSmrTable from "./components/MenteeSmrTable";
import {
  staticAttendanceStudents,
  defaultTheorySubjects,
  defaultLabSubjects,
} from "./data/mockStudents";

const navItems = [
  { label: "My Dashboard", icon: "▦", hasArrow: false },
  { label: "My Profile", icon: "○", hasArrow: false },
  { label: "Timetable", icon: "▦", hasArrow: true },
  { label: "Events", icon: "◷", hasArrow: false },
  { label: "View SMR", icon: "▦", hasArrow: true },
  { label: "Lesson Plan", icon: "📄", hasArrow: true },
  { label: "Mentoring", icon: "👤", hasArrow: true },
  { label: "Create", icon: "⊕", hasArrow: true },
  { label: "MCQ", icon: "☑", hasArrow: false },
  { label: "Marks Scored", icon: "★", hasArrow: true },
  { label: "Grievance", icon: "?", hasArrow: false },
  { label: "Reports", icon: "📋", hasArrow: true },
  { label: "Performance", icon: "📈", hasArrow: true },
];

function Dashboard() {
  const [students, setStudents] = useState(staticAttendanceStudents);

  const updateStudent = (usn, patch) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.usn !== usn) return s;
        const next = { ...s, ...patch };
        if (patch.education && s.education) {
          next.education = { ...s.education, ...patch.education };
        }
        return next;
      })
    );
  };

  const [activeTab, setActiveTab] = useState("mentoring");
  const [selectedUSN, setSelectedUSN] = useState("");
  const [recordReturnTab, setRecordReturnTab] = useState("attendance");
  const [recordSmrMode, setRecordSmrMode] = useState("view");

  const openSmr = (usn, fromTab) => {
    setSelectedUSN(usn);
    setRecordReturnTab(fromTab);
    setRecordSmrMode("view");
    setActiveTab("studentRecord");
  };

  const openMarks = (usn) => {
    setSelectedUSN(usn);
    setActiveTab("marks");
  };

  const openQuickUpdate = (usn) => {
    setSelectedUSN(usn);
    setRecordReturnTab("attendance");
    setRecordSmrMode("quickUpdate");
    setActiveTab("studentRecord");
  };

  const closeQuickUpdate = () => {
    setRecordSmrMode("view");
  };

  // Marks local state
  const [marksSearch, setMarksSearch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("2");

  const [quickEdit, setQuickEdit] = useState(false);
  const [draftTheoryMarks, setDraftTheoryMarks] = useState([]);
  const [draftLabMarks, setDraftLabMarks] = useState([]);

  const selectedStudent = useMemo(
    () => students.find((s) => s.usn === selectedUSN),
    [selectedUSN, students]
  );

  useEffect(() => {
  if (!selectedStudent) return;

  setQuickEdit(false);

  const theory =
    Array.isArray(selectedStudent.theoryMarks)
      ? selectedStudent.theoryMarks
      : defaultTheorySubjects;

  const lab =
    Array.isArray(selectedStudent.labMarks)
      ? selectedStudent.labMarks
      : defaultLabSubjects;

  setDraftTheoryMarks(theory.map((r) => ({ ...r })));
  setDraftLabMarks(lab.map((r) => ({ ...r })));

}, [selectedUSN, selectedStudent, defaultTheorySubjects, defaultLabSubjects]);

  const activeSidebarLabel = useMemo(() => {
    if (activeTab === "attendance") return "View SMR";
    if (activeTab === "marks") return "Marks Scored";
    if (activeTab === "mentoring") return "Mentoring";
    return "";
  }, [activeTab]);

  const showTopTabs = activeTab !== "studentRecord";

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      {/* HEADER */}
      <div className="bg-red-900 text-white flex justify-between items-center px-5 py-3 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-400 flex items-center justify-center font-bold text-sm text-white">
            SV
          </div>
          <span className="font-semibold text-base tracking-wide">
            S-VYASA Deemed to be University
          </span>
        </div>

        <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5">
          <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search Profile"
            className="bg-transparent text-white placeholder-white/60 text-sm outline-none w-40"
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Dr Dr. Bharathi [ FACULTY ]</span>
          <button className="text-white/80 hover:text-white" aria-label="Profile action">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button className="text-white/80 hover:text-white" aria-label="Help action">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <button className="text-white/80 hover:text-white" aria-label="Logout action">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* SIDEBAR */}
        <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
          <ul className="py-2">
            {navItems.map((item) => {
              const isActive = item.label === activeSidebarLabel;
              return (
                <li key={item.label}>
                  <button
                    onClick={() => {
                      if (item.label === "Mentoring") setActiveTab("mentoring");
                      if (item.label === "View SMR") setActiveTab("attendance");
                      if (item.label === "Marks Scored") setActiveTab("marks");
                    }}
                    className={`w-full flex items-center justify-between px-5 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-red-50 text-red-800 font-semibold border-l-4 border-red-800"
                        : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base w-5 text-center">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.hasArrow && (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 p-6 overflow-auto">
          {showTopTabs && (
            <div className="flex gap-8 border-b border-gray-200 mb-1">
              <button
                onClick={() => setActiveTab("mentoring")}
                className={`pb-3 text-sm font-medium transition-colors ${
                  activeTab === "mentoring"
                    ? "border-b-2 border-red-800 text-red-800"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Mentoring
              </button>
              <button
                onClick={() => setActiveTab("marks")}
                className={`pb-3 text-sm font-medium transition-colors ${
                  activeTab === "marks"
                    ? "border-b-2 border-red-800 text-red-800"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Marks & Attendance
              </button>
              <button
                onClick={() => setActiveTab("attendance")}
                className={`pb-3 text-sm font-medium transition-colors ${
                  activeTab === "attendance"
                    ? "border-b-2 border-red-800 text-red-800"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                View SMR
              </button>
            </div>
          )}

          {/* ATTENDANCE LIST */}
          {activeTab === "attendance" && (
            <AttendancePage
              students={students}
              onOpenStudent={(usn) => openSmr(usn, "attendance")}
              onOpenMarks={openMarks}
              onOpenQuickUpdate={openQuickUpdate}
              onUpdateStudent={updateStudent}
            />
          )}

          {/* STUDENT RECORD */}
          {activeTab === "studentRecord" && (
            <StudentRecordPage
              student={selectedStudent}
              onBack={() => setActiveTab(recordReturnTab)}
              onUpdateStudent={updateStudent}
              smrMode={recordSmrMode}
              onQuickUpdateClose={closeQuickUpdate}
            />
          )}

          {/* MENTORING VIEW */}
          {activeTab === "mentoring" && (
            <MenteeSmrTable
              students={students}
              onOpenStudent={(usn) => openSmr(usn, "mentoring")}
              onOpenMarks={openMarks}
              onOpenQuickUpdate={openQuickUpdate}
              onUpdateStudent={updateStudent}
              breadcrumbTitle="Mentoring"
            />
          )}

          {/* MARKS & ATTENDANCE VIEW */}
          {activeTab === "marks" && (
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-1 text-sm my-4">
                <span
                  className="text-red-800 font-medium cursor-pointer hover:underline"
                  onClick={() => setActiveTab("mentoring")}
                >
                  Mentoring
                </span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-500">Marks & Attendance</span>
              </div>

              {/* Semester Dropdown */}
              <div className="mb-4">
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent w-64"
                >
                  <option value="1">Semester 1-2025-REGULAR</option>
                  <option value="2">Semester 2-2025-REGULAR</option>
                  <option value="3">Semester 3-2025-REGULAR</option>
                  <option value="4">Semester 4-2025-REGULAR</option>
                </select>
              </div>

              {/* Search + export — left-aligned, not centered */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 bg-white w-full lg:max-w-md">
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    

                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search student name or USN"
                    value={marksSearch}
                    onChange={(e) => {
                      setMarksSearch(e.target.value);
                      const q = e.target.value.trim().toLowerCase();
                      const found = students.find(
                        (s) =>
                          s.name.toLowerCase().includes(q) || s.usn.toLowerCase().includes(q)
                      );
                      if (found) setSelectedUSN(found.usn);
                      else if (e.target.value === "") setSelectedUSN("");
                    }}
                    className="text-sm outline-none w-full min-w-0 text-gray-700 placeholder-gray-400"
                  />
                </div>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors self-start lg:self-auto"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Export report
                </button>
              </div>

              {/* Marks Content */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {selectedUSN && selectedStudent ? (
                  <div className="p-6">
                    <h2 className="text-base font-semibold text-gray-800 mb-1">
                      {selectedStudent.name} — {selectedUSN}
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                      Semester {selectedSemester} • {selectedStudent.dept} • Section{" "}
                      {selectedStudent.section}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-gray-800">Internal Assessment</p>
                      {!quickEdit ? (
                        <button
                          type="button"
                          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
                          onClick={() => setQuickEdit(true)}
                        >
                          Quick Edit
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="bg-red-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-900"
                            onClick={() => {
                              if (!selectedUSN) return;
                              updateStudent(selectedUSN, {
                                theoryMarks: draftTheoryMarks,
                                labMarks: draftLabMarks,
                              });
                              setQuickEdit(false);
                            }}
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
                            onClick={() => {
                              if (!selectedStudent) return;
                              setDraftTheoryMarks(
                                (selectedStudent.theoryMarks ?? defaultTheorySubjects).map((r) => ({ ...r }))
                              );
                              setDraftLabMarks(
                                (selectedStudent.labMarks ?? defaultLabSubjects).map((r) => ({ ...r }))
                              );
                              setQuickEdit(false);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="overflow-x-auto mb-8">
                      <table className="w-full text-sm min-w-[640px]">
                        <thead>
                          <tr className="bg-gray-100 text-gray-700">
                            <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">SI #</th>
                            <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Subjects</th>
                            <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Attendance %</th>
                            <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">IA-1 (out of 30)</th>
                            <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">IA-2 (out of 30)</th>
                            <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">CIA (out of 30)</th>
                            <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Total (out of 50)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(quickEdit
                            ? draftTheoryMarks
                            : selectedStudent.theoryMarks ?? defaultTheorySubjects
                          ).map((row, idx) => (
                            <tr
                              key={`${row.subject}-${idx}`}
                              className="border-t border-gray-100 hover:bg-gray-50"
                            >
                              <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{idx + 1}</td>
                              <td className="px-4 py-3 text-gray-800">{row.subject}</td>
                              <td className="px-4 py-3 text-center text-gray-600 whitespace-nowrap">
                                {quickEdit ? (
                                  <input
                                    type="number"
                                    step={1}
                                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={row.attendancePct ?? 0}
                                    onChange={(e) => {
                                      const v = Number(e.target.value);
                                      setDraftTheoryMarks((prev) =>
                                        prev.map((r, i) =>
                                          i === idx ? { ...r, attendancePct: v } : r
                                        )
                                      );
                                    }}
                                  />
                                ) : (
                                  `${row.attendancePct ?? 0}%`
                                )}
                              </td>
                              <td className="px-4 py-3 text-center text-gray-600 whitespace-nowrap">
                                {quickEdit ? (
                                  <input
                                    type="number"
                                    step={0.1}
                                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={row.ia1 ?? 0}
                                    onChange={(e) => {
                                      const v = Number(e.target.value);
                                      setDraftTheoryMarks((prev) =>
                                        prev.map((r, i) => (i === idx ? { ...r, ia1: v } : r))
                                      );
                                    }}
                                  />
                                ) : (
                                  `${Number(row.ia1 ?? 0).toFixed(1)} / 30`
                                )}
                              </td>
                              <td className="px-4 py-3 text-center text-gray-600 whitespace-nowrap">
                                {quickEdit ? (
                                  <input
                                    type="number"
                                    step={0.1}
                                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={row.ia2 ?? 0}
                                    onChange={(e) => {
                                      const v = Number(e.target.value);
                                      setDraftTheoryMarks((prev) =>
                                        prev.map((r, i) => (i === idx ? { ...r, ia2: v } : r))
                                      );
                                    }}
                                  />
                                ) : (
                                  `${Number(row.ia2 ?? 0).toFixed(1)} / 30`
                                )}
                              </td>
                              <td className="px-4 py-3 text-center font-medium text-gray-800 whitespace-nowrap">
                                {quickEdit ? (
                                  <input
                                    type="number"
                                    step={1}
                                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={row.ciaTotal ?? 0}
                                    onChange={(e) => {
                                      const v = Number(e.target.value);
                                      setDraftTheoryMarks((prev) =>
                                        prev.map((r, i) => (i === idx ? { ...r, ciaTotal: v } : r))
                                      );
                                    }}
                                  />
                                ) : (
                                  `${Number(row.ciaTotal ?? 0)} / 30`
                                )}
                              </td>
                              <td className="px-4 py-3 text-center font-medium text-gray-800 whitespace-nowrap">
                                {quickEdit ? (
                                  <input
                                    type="number"
                                    step={1}
                                    className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={row.total ?? 0}
                                    onChange={(e) => {
                                      const v = Number(e.target.value);
                                      setDraftTheoryMarks((prev) =>
                                        prev.map((r, i) => (i === idx ? { ...r, total: v } : r))
                                      );
                                    }}
                                  />
                                ) : (
                                  `${Number(row.total ?? 0)} / 50`
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <p className="text-sm font-semibold text-gray-800 mb-2">Lab</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[480px]">
                        <thead>
                          <tr className="bg-gray-100 text-gray-700">
                            <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">SI #</th>
                            <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Subjects</th>
                            <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Attendance %</th>
                            <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">CIA (out of 30)</th>
                            <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Total (out of 30)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(quickEdit
                            ? draftLabMarks
                            : selectedStudent.labMarks ?? defaultLabSubjects
                          ).map((row, idx) => (
                            <tr
                              key={`${row.subject}-${idx}`}
                              className="border-t border-gray-100 hover:bg-gray-50"
                            >
                              <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{idx + 1}</td>
                              <td className="px-4 py-3 text-gray-800">{row.subject}</td>
                              <td className="px-4 py-3 text-center text-gray-600 whitespace-nowrap">
                                {quickEdit ? (
                                  <input
                                    type="number"
                                    step={1}
                                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={row.attendancePct ?? 0}
                                    onChange={(e) => {
                                      const v = Number(e.target.value);
                                      setDraftLabMarks((prev) =>
                                        prev.map((r, i) =>
                                          i === idx ? { ...r, attendancePct: v } : r
                                        )
                                      );
                                    }}
                                  />
                                ) : (
                                  `${row.attendancePct ?? 0}%`
                                )}
                              </td>
                              <td className="px-4 py-3 text-center font-medium text-gray-800 whitespace-nowrap">
                                {quickEdit ? (
                                  <input
                                    type="number"
                                    step={1}
                                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={row.labInternal ?? 0}
                                    onChange={(e) => {
                                      const v = Number(e.target.value);
                                      setDraftLabMarks((prev) =>
                                        prev.map((r, i) =>
                                          i === idx ? { ...r, labInternal: v } : r
                                        )
                                      );
                                    }}
                                  />
                                ) : (
                                  `${Number(row.labInternal ?? 0)} / 30`
                                )}
                              </td>
                              <td className="px-4 py-3 text-center font-medium text-gray-800 whitespace-nowrap">
                                {quickEdit ? (
                                  <input
                                    type="number"
                                    step={1}
                                    className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={row.labTotal ?? 0}
                                    onChange={(e) => {
                                      const v = Number(e.target.value);
                                      setDraftLabMarks((prev) =>
                                        prev.map((r, i) =>
                                          i === idx ? { ...r, labTotal: v } : r
                                        )
                                      );
                                    }}
                                  />
                                ) : (
                                  `${Number(row.labTotal ?? 0)} / 30`
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <svg
                      className="w-14 h-14 mb-3 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <p className="text-sm">
                      Search for a student by name or USN to view their subject-wise marks and attendance.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;