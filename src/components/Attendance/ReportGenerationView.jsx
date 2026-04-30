import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Download, Layers3, RefreshCw, Table2 } from "lucide-react";
import * as XLSX from "xlsx";

const BRAND_GRADIENT = "var(--gradient-brand)";

function getContextKey(context = {}) {
  return [context.department || "", context.semester || "", context.subject || "", context.section || ""].join("|");
}

function getContextLabel(context = {}) {
  const department = context.department || "-";
  const semester = context.semester ? `Sem ${context.semester}` : "Sem -";
  const subject = context.subject || "-";
  const section = context.section ? `Sec ${context.section}` : "Sec -";
  return `${department} | ${semester} | ${subject} | ${section}`;
}

function formatMonthKey(dateValue) {
  if (!dateValue) return "UNKNOWN";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue).trim().toUpperCase();
  return date.toLocaleString("en-US", { month: "long", year: "numeric" }).toUpperCase();
}

function formatDisplayDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function downloadExcel(filename, rows) {
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");
  XLSX.writeFile(workbook, filename);
}

function getStudentSummaries(records, roster = []) {
  const studentMap = new Map();
  const rosterKeyById = new Map();
  const rosterKeyByUsn = new Map();

  roster.forEach((student) => {
    const key = String(student.id);
    studentMap.set(key, {
      id: student.id,
      usn: student.usn || "-",
      name: student.name || "Unknown",
      present: 0,
      total: 0,
    });
    rosterKeyById.set(String(student.id), key);
    if (student.usn) {
      rosterKeyByUsn.set(String(student.usn), key);
    }
  });

  records.forEach((record) => {
    record.attendance?.forEach((studentRecord) => {
      const idKey = studentRecord.id !== undefined && studentRecord.id !== null ? String(studentRecord.id) : "";
      const usnKey = String(studentRecord.usn || "").trim();
      let key = rosterKeyById.get(idKey) || rosterKeyByUsn.get(usnKey) || null;

      if (!key) {
        key = usnKey || idKey || `extra_${studentMap.size + 1}`;
      }

      if (!studentMap.has(key)) {
        studentMap.set(key, {
          id: studentRecord.id || key,
          usn: studentRecord.usn || "-",
          name: studentRecord.name || "Unknown",
          present: 0,
          total: 0,
        });
      }

      const current = studentMap.get(key);
      current.total += 1;
      if (studentRecord.status === "P") {
        current.present += 1;
      }
    });
  });

  return [...studentMap.values()]
    .map((student) => {
      const percentage = student.total > 0 ? Math.round((student.present / student.total) * 100) : 0;
      return {
        ...student,
        percentage,
        statusLabel: percentage >= 75 ? "Eligible" : "Below 75%",
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

export default function ReportGenerationView({
  records = [],
  students = [],
  currentClassInfo,
  currentTimetable,
  onOpenRecord,
  onGoToMark,
  onGoToView,
}) {
  const sortedRecords = useMemo(
    () => [...records].sort((left, right) => new Date(right.submittedAt || 0) - new Date(left.submittedAt || 0)),
    [records]
  );

  const contextOptions = useMemo(() => {
    const byKey = new Map();

    sortedRecords.forEach((record) => {
      const key = getContextKey(record.context);
      if (!byKey.has(key)) {
        byKey.set(key, {
          key,
          context: record.context,
          count: 0,
          latestDate: record.context?.date || "",
        });
      }

      const entry = byKey.get(key);
      entry.count += 1;
      if (String(record.context?.date || "") > String(entry.latestDate || "")) {
        entry.latestDate = record.context?.date || "";
      }
    });

    return [...byKey.values()];
  }, [sortedRecords]);

  const preferredContext = useMemo(() => {
    const currentContext = currentTimetable || currentClassInfo || {};
    const currentKey = getContextKey(currentContext);
    return contextOptions.find((option) => option.key === currentKey)?.context || contextOptions[0]?.context || null;
  }, [contextOptions, currentClassInfo, currentTimetable]);

  const [selectedDepartment, setSelectedDepartment] = useState(preferredContext?.department || "");
  const [selectedSemester, setSelectedSemester] = useState(preferredContext?.semester || "");
  const [selectedSubject, setSelectedSubject] = useState(preferredContext?.subject || "");
  const [selectedSection, setSelectedSection] = useState(preferredContext?.section || "");
  const [selectedMonth, setSelectedMonth] = useState("ALL");

  useEffect(() => {
    if (!preferredContext) return;

    setSelectedDepartment(preferredContext.department || "");
    setSelectedSemester(preferredContext.semester || "");
    setSelectedSubject(preferredContext.subject || "");
    setSelectedSection(preferredContext.section || "");
  }, [preferredContext]);

  const departmentOptions = useMemo(() => {
    return [...new Set(contextOptions.map((option) => option.context?.department).filter(Boolean))];
  }, [contextOptions]);

  const semesterOptions = useMemo(() => {
    return [
      ...new Set(
        contextOptions
          .filter((option) => !selectedDepartment || option.context?.department === selectedDepartment)
          .map((option) => option.context?.semester)
          .filter(Boolean)
      ),
    ];
  }, [contextOptions, selectedDepartment]);

  const subjectOptions = useMemo(() => {
    return [
      ...new Set(
        contextOptions
          .filter(
            (option) =>
              (!selectedDepartment || option.context?.department === selectedDepartment) &&
              (!selectedSemester || option.context?.semester === selectedSemester)
          )
          .map((option) => option.context?.subject)
          .filter(Boolean)
      ),
    ];
  }, [contextOptions, selectedDepartment, selectedSemester]);

  const sectionOptions = useMemo(() => {
    return [
      ...new Set(
        contextOptions
          .filter(
            (option) =>
              (!selectedDepartment || option.context?.department === selectedDepartment) &&
              (!selectedSemester || option.context?.semester === selectedSemester) &&
              (!selectedSubject || option.context?.subject === selectedSubject)
          )
          .map((option) => option.context?.section)
          .filter(Boolean)
      ),
    ];
  }, [contextOptions, selectedDepartment, selectedSemester, selectedSubject]);

  const monthOptions = useMemo(() => {
    const months = new Set(sortedRecords.map((record) => formatMonthKey(record.context?.date)));
    return ["ALL", ...months];
  }, [sortedRecords]);

  const contextRecords = useMemo(() => {
    return sortedRecords.filter((record) => {
      const context = record.context || {};
      return (
        (!selectedDepartment || context.department === selectedDepartment) &&
        (!selectedSemester || context.semester === selectedSemester) &&
        (!selectedSubject || context.subject === selectedSubject) &&
        (!selectedSection || context.section === selectedSection)
      );
    });
  }, [sortedRecords, selectedDepartment, selectedSemester, selectedSubject, selectedSection]);

  const visibleRecords = useMemo(() => {
    if (selectedMonth === "ALL") {
      return contextRecords;
    }
    return contextRecords.filter((record) => formatMonthKey(record.context?.date) === selectedMonth);
  }, [contextRecords, selectedMonth]);

  const studentSummaries = useMemo(() => getStudentSummaries(visibleRecords, students), [visibleRecords, students]);

  const selectedContext = visibleRecords[0]?.context || contextRecords[0]?.context || preferredContext || null;

  const summaryStats = useMemo(() => {
    const totalStudents = studentSummaries.length;
    const eligibleStudents = studentSummaries.filter((student) => student.percentage >= 75).length;
    const belowThresholdStudents = totalStudents - eligibleStudents;
    const totalSessions = visibleRecords.length;
    const averageAttendance =
      totalStudents > 0
        ? Math.round(studentSummaries.reduce((total, student) => total + student.percentage, 0) / totalStudents)
        : 0;

    return {
      totalStudents,
      eligibleStudents,
      belowThresholdStudents,
      totalSessions,
      averageAttendance,
    };
  }, [studentSummaries, visibleRecords]);

  const donutData = useMemo(() => {
    const total = summaryStats.totalStudents || 1;
    const eligibleShare = Math.round((summaryStats.eligibleStudents / total) * 100);
    const belowShare = 100 - eligibleShare;
    return { eligibleShare, belowShare };
  }, [summaryStats]);

  const latestRecord = visibleRecords[0] || contextRecords[0] || sortedRecords[0] || null;
  const isAllMonthsView = selectedMonth === "ALL";

  const exportRows = [
    ["USN", "Student Name", "Present", "Total", "Attendance %", "Status"],
    ...studentSummaries.map((student) => [
      student.usn,
      student.name,
      student.present,
      student.total,
      `${student.percentage}%`,
      isAllMonthsView ? student.statusLabel : "-",
    ]),
  ];

  const handleExport = () => {
    if (!studentSummaries.length) return;
    const contextLabel = selectedContext ? getContextLabel(selectedContext) : "attendance_report";
    const fileName = contextLabel.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").toLowerCase();
    downloadExcel(`${fileName || "attendance_report"}.xlsx`, exportRows);
  };

  const ringStyle = {
    background: `conic-gradient(#0f766e 0 ${donutData.eligibleShare}%, #ef4444 ${donutData.eligibleShare}% 100%)`,
  };

  return (
    <div
      style={{
        background:
          "radial-gradient(circle at top left, rgba(15, 118, 110, 0.14), transparent 28%), radial-gradient(circle at top right, rgba(249, 115, 22, 0.12), transparent 24%), #f8f4ee",
        borderRadius: 24,
        padding: 18,
      }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink">Attendance Report</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onGoToView}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Table2 size={16} /> View Attendance
          </button>
          <button
            onClick={onGoToMark}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
            style={{ background: BRAND_GRADIENT }}
          >
            <CalendarClock size={16} /> Mark Attendance
          </button>
        </div>
      </div>

      <section className="mb-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Department</label>
            <select
              value={selectedDepartment}
              onChange={(event) => {
                setSelectedDepartment(event.target.value);
                setSelectedSemester("");
                setSelectedSubject("");
                setSelectedSection("");
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[rgba(123,29,46,0.25)] focus:border-transparent"
            >
              <option value="">Department</option>
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Semester</label>
            <select
              value={selectedSemester}
              onChange={(event) => {
                setSelectedSemester(event.target.value);
                setSelectedSubject("");
                setSelectedSection("");
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[rgba(123,29,46,0.25)] focus:border-transparent"
            >
              <option value="">Semester</option>
              {semesterOptions.map((semester) => (
                <option key={semester} value={semester}>
                  {semester ? `Sem ${semester}` : "Semester"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Subject</label>
            <select
              value={selectedSubject}
              onChange={(event) => {
                setSelectedSubject(event.target.value);
                setSelectedSection("");
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[rgba(123,29,46,0.25)] focus:border-transparent"
            >
              <option value="">Subject</option>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Section</label>
            <select
              value={selectedSection}
              onChange={(event) => setSelectedSection(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[rgba(123,29,46,0.25)] focus:border-transparent"
            >
              <option value="">Section</option>
              {sectionOptions.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Month</label>
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[rgba(123,29,46,0.25)] focus:border-transparent"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month === "ALL" ? "All Months" : month}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-900">
            <Layers3 size={14} /> {selectedContext ? getContextLabel(selectedContext) : "No class selected"}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 font-semibold text-teal-800">
            <RefreshCw size={14} /> {visibleRecords.length} report session{visibleRecords.length === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      {!studentSummaries.length ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">
          No attendance records are available for the selected class.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-500">Attendance Snapshot</div>
                <div className="text-lg font-bold text-ink">{latestRecord ? formatDisplayDate(latestRecord.context?.date) : "No date"}</div>
              </div>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Download size={16} /> Export Excel
              </button>
            </div>

            <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-full" style={ringStyle}>
              <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                <div className="text-3xl font-extrabold text-ink">{summaryStats.averageAttendance}%</div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Average</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-teal-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-teal-700">Eligible</div>
                <div className="mt-1 text-2xl font-bold text-teal-900">{summaryStats.eligibleStudents}</div>
                <div className="text-xs text-teal-700">{donutData.eligibleShare}% of students</div>
              </div>
              <div className="rounded-xl bg-red-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-red-700">Below 75%</div>
                <div className="mt-1 text-2xl font-bold text-red-900">{summaryStats.belowThresholdStudents}</div>
                <div className="text-xs text-red-700">{donutData.belowShare}% of students</div>
              </div>
              <div className="rounded-xl bg-amber-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Sessions</div>
                <div className="mt-1 text-2xl font-bold text-amber-900">{summaryStats.totalSessions}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">Students</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{summaryStats.totalStudents}</div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-gray-500">Student-wise Report</div>
                  <div className="text-lg font-bold text-ink">{selectedContext ? getContextLabel(selectedContext) : "Report"}</div>
                </div>
                <div className="text-xs text-gray-500">Sorted by student name</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-orange-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold">USN</th>
                    <th className="px-4 py-3 font-semibold">Student Name</th>
                    <th className="px-4 py-3 text-center font-semibold">Present</th>
                    <th className="px-4 py-3 text-center font-semibold">Total</th>
                    <th className="px-4 py-3 text-center font-semibold">%</th>
                    <th className="px-4 py-3 text-center font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentSummaries.map((student, index) => (
                    <tr key={student.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 text-gray-700">{student.usn}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{student.present}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{student.total}</td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-900">{student.percentage}%</td>
                      <td className="px-4 py-3 text-center">
                        {isAllMonthsView ? (
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              student.percentage >= 75 ? "bg-teal-100 text-teal-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {student.statusLabel}
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

    </div>
  );
}
