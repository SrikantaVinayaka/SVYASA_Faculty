import { useState, useMemo, useEffect } from "react";

// Static data from screenshots
const COURSE_INFO = {
  title: "MCA-DET-CC-Semester 2-2025-MCAP232-Cybersecurity, Ethical Hacking and Digital Forensics-D",
  totalPeriods: 23,
  month: "APRIL-2026",
  criteria: "ALL",
};

const DATES = [
  { id: "d1", label: "2 Mar", period: "P# 2" },
  { id: "d2", label: "4 Mar", period: "P# 2" },
  { id: "d3", label: "5 Mar", period: "P# 2" },
  { id: "d4", label: "6 Mar", period: "P# 1" },
  { id: "d5", label: "9 Mar", period: "P# 2" },
  { id: "d6", label: "11 Mar", period: "P# 2" },
  { id: "d7", label: "12 Mar", period: "P# 2" },
  { id: "d8", label: "13 Mar", period: "P# 1" },
  { id: "d9", label: "16 Mar", period: "P# 2" },
  { id: "d10", label: "18 Mar", period: "P# 2" },
  { id: "d11", label: "23 Mar", period: "P# 2" },
  { id: "d12", label: "25 Mar", period: "P# 2" },
  { id: "d13", label: "26 Mar", period: "P# 2" },
  { id: "d14", label: "27 Mar", period: "P# 1" },
  { id: "d15", label: "30 Mar", period: "P# 2" },
];

// T=present, F=absent
const T = true;
const F = false;

const STUDENTS_RAW = [
  { id: "s1", name: "Aarav Nair", usn: "2022508001", att: [F, F, F, F, F, F, F, F, F, F, F, F, F, F, F] },
  { id: "s2", name: "Ayaan Khan", usn: "2022508002", att: [F, F, F, F, F, F, F, F, F, F, F, F, F, F, F] },
  { id: "s3", name: "Abhinav Reddy", usn: "2022508003", att: [T, T, T, T, T, F, F, F, T, F, F, F, F, F, F] },
  { id: "s4", name: "Akshara Rao", usn: "2022508004", att: [T, T, T, T, T, T, T, F, T, T, T, T, T, T, T] },
  { id: "s5", name: "Ananya Iyer", usn: "2022508011", att: [T, T, T, F, T, F, T, T, T, T, T, T, T, T, T] },
  { id: "s6", name: "Arjun Menon", usn: "2022508012", att: [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T] },
  { id: "s7", name: "Aishwarya J", usn: "2022508013", att: [T, T, T, T, T, T, T, F, T, F, T, T, T, T, T] },
  { id: "s8", name: "Bhavana S", usn: "2022508014", att: [F, T, T, T, T, T, T, F, T, F, T, T, T, T, T] },
  { id: "s9", name: "Bharath M", usn: "2022508015", att: [T, T, F, T, F, T, T, F, F, F, F, T, T, F, F] },
  { id: "s10", name: "Eshwar Kumar", usn: "2022508020", att: [T, T, T, T, T, T, T, T, F, T, F, T, T, F, T] },
  { id: "s11", name: "Devika A", usn: "2022508029", att: [T, T, T, T, T, T, T, T, T, T, T, T, T, F, T] },
  { id: "s12", name: "Mithun Manoj", usn: "2022508043", att: [T, T, T, T, T, F, F, F, F, T, F, F, T, T, F] },
  { id: "s13", name: "Mohammed Asim", usn: "2022508051", att: [T, T, T, F, F, F, F, F, F, T, F, F, T, T, F] },
  { id: "s14", name: "Muhammed Rishan", usn: "2022508052", att: [T, T, T, T, T, T, T, T, F, T, F, F, T, T, T] },
  { id: "s15", name: "Preetham Gowda", usn: "2022508060", att: [T, T, F, T, T, T, T, T, F, T, F, F, T, T, T] },
  { id: "s16", name: "Ritvik C", usn: "2022508065", att: [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T] },
  { id: "s17", name: "Satvik Kulkarni", usn: "2022508069", att: [T, T, T, T, T, T, T, T, T, T, T, T, T, F, T] },
  { id: "s18", name: "Sinchana Murali", usn: "2022508071", att: [T, T, T, T, T, T, T, F, F, T, T, T, T, F, T] },
  { id: "s19", name: "Surya Narayanan", usn: "2022508077", att: [F, F, T, T, F, F, F, T, F, F, T, T, F, T, T] },
  { id: "s20", name: "Trisha Biradar", usn: "2022508080", att: [T, T, T, T, T, T, F, F, F, F, F, T, T, F, T] },
  { id: "s21", name: "Vaishnav B", usn: "2022508082", att: [T, T, T, T, T, T, T, F, F, T, F, T, T, T, T] },
  { id: "s22", name: "Vikas K S", usn: "2022508083", att: [T, T, T, T, T, T, T, T, F, T, F, F, T, T, T] },
  { id: "s23", name: "Tharun V", usn: "2022508089", att: [F, F, T, T, T, T, T, T, F, T, T, T, T, T, F] },
];

function calcStats(att, totalPeriods) {
  const present = att.filter(Boolean).length;
  const pct = totalPeriods > 0 ? Math.round((present / totalPeriods) * 100) : 0;
  const needed = Math.ceil(0.75 * totalPeriods);
  const minNeeded = present >= needed ? 0 : needed - present;
  return { present, pct, minNeeded };
}

function AttCell({ present, onClick, highlight }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 26,
        height: 26,
        borderRadius: 4,
        border: highlight ? "2px solid #f59e0b" : "1px solid transparent",
        background: present ? "#0f766e" : "#b91c1c",
        color: "#fff",
        fontSize: 11,
        fontWeight: 800,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
        transition: "all 0.1s",
        flexShrink: 0,
      }}
    >
      {present ? "✓" : "✕"}
    </button>
  );
}

function PctBadge({ pct }) {
  const [color, bg] = pct >= 75 ? ["#065f46", "#ccfbf1"] : pct >= 50 ? ["#7c2d12", "#ffedd5"] : ["#991b1b", "#fee2e2"];
  return (
    <span
      style={{
        background: bg,
        color,
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 7px",
        borderRadius: 6,
      }}
    >
      {pct}%
    </span>
  );
}

export default function AttendanceView() {
  const [dates, setDates] = useState(DATES);
  const [totalPeriods, setTotalPeriods] = useState(COURSE_INFO.totalPeriods);
  const [viewFilter, setViewFilter] = useState("monthly"); // "weekly", "monthly", "semester"

  const TOTAL = totalPeriods;

  const [attendance, setAttendance] = useState(() => {
    const s = {};
    STUDENTS_RAW.forEach((st) => {
      s[st.id] = [...st.att];
    });
    return s;
  });

  const [editColId, setEditColId] = useState(null);
  const [editRowId, setEditRowId] = useState(null);
  const [editSnapshot, setEditSnapshot] = useState(null);
  const [lastDeleted, setLastDeleted] = useState(null);

  const parseLabelToDate = (label) => {
    const parsed = new Date(`${label} 2026`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const getWeeklyDates = (allDates) => {
    const grouped = [];
    let currentWeek = null;
    let weekDates = [];

    allDates.forEach((date, index) => {
      const week = Math.ceil((index + 1) / 7);

      if (currentWeek !== week) {
        if (weekDates.length > 0) {
          grouped.push({
            label: `Week ${currentWeek} (${weekDates[0].label} - ${weekDates[weekDates.length - 1].label})`,
            dates: weekDates,
          });
        }
        currentWeek = week;
        weekDates = [];
      }
      weekDates.push(date);
    });

    if (weekDates.length > 0) {
      grouped.push({
        label: `Week ${currentWeek} (${weekDates[0].label} - ${weekDates[weekDates.length - 1].label})`,
        dates: weekDates,
      });
    }

    return grouped;
  };

  const getMonthlyDates = (allDates) => {
    const grouped = [];
    const monthMap = {};

    allDates.forEach((date) => {
      const month = date.label.split(" ")[1];
      if (!monthMap[month]) {
        monthMap[month] = [];
      }
      monthMap[month].push(date);
    });

    Object.entries(monthMap).forEach(([month, dates]) => {
      grouped.push({
        label: `${month} 2026`,
        dates,
      });
    });

    return grouped;
  };

  const getSemesterDates = (allDates) => {
    const grouped = [];
    const sem1 = [];
    const sem2 = [];

    allDates.forEach((date) => {
      const parsed = parseLabelToDate(date.label);
      const month = parsed ? parsed.getMonth() + 1 : null;
      if (month !== null && month >= 1 && month <= 6) {
        sem1.push(date);
      } else {
        sem2.push(date);
      }
    });

    if (sem1.length > 0) {
      grouped.push({
        label: "Semester 1 (Jan - Jun)",
        dates: sem1,
      });
    }
    if (sem2.length > 0) {
      grouped.push({
        label: "Semester 2 (Jul - Dec)",
        dates: sem2,
      });
    }

    return grouped;
  };

  const visibleDateIndices = useMemo(() => {
    if (!dates.length) return [];

    if (viewFilter === "weekly") {
      const start = Math.max(0, dates.length - 7);
      return dates.slice(start).map((_, idx) => start + idx);
    }

    if (viewFilter === "monthly") {
      const lastDate = parseLabelToDate(dates[dates.length - 1].label);
      if (!lastDate) return dates.map((_, idx) => idx);

      return dates
        .map((date, idx) => ({ date: parseLabelToDate(date.label), idx }))
        .filter(({ date }) => date && date.getMonth() === lastDate.getMonth() && date.getFullYear() === lastDate.getFullYear())
        .map(({ idx }) => idx);
    }

    return dates.map((_, idx) => idx);
  }, [dates, viewFilter]);

  const visibleDates = useMemo(() => visibleDateIndices.map((index) => dates[index]), [dates, visibleDateIndices]);

  useEffect(() => {
    if (!editColId) return;
    const stillVisible = visibleDates.some((date) => date.id === editColId);
    if (!stillVisible) {
      setEditColId(null);
      setEditSnapshot(null);
    }
  }, [editColId, visibleDates]);

  const getFilteredDatesDisplay = () => {
    if (viewFilter === "weekly") {
      return getWeeklyDates(visibleDates);
    } else if (viewFilter === "semester") {
      return getSemesterDates(visibleDates);
    } else {
      return getMonthlyDates(visibleDates);
    }
  };

  const cloneAttendance = (source) => {
    const cloned = {};
    Object.entries(source).forEach(([sid, row]) => {
      cloned[sid] = [...row];
    });
    return cloned;
  };

  const hasChangesSinceSnapshot = (snapshotAttendance, currentAttendance) => {
    return JSON.stringify(snapshotAttendance) !== JSON.stringify(currentAttendance);
  };

  const finalizeEdit = (mode) => {
    if (!editSnapshot || editSnapshot.mode !== mode) {
      if (mode === "col") setEditColId(null);
      if (mode === "row") setEditRowId(null);
      return true;
    }

    const changed = hasChangesSinceSnapshot(editSnapshot.attendance, attendance);
    if (changed) {
      const shouldSave = window.confirm("Save changes? Click OK to Save, or Cancel to discard.");
      if (!shouldSave) {
        setAttendance(editSnapshot.attendance);
      }
    }

    if (mode === "col") setEditColId(null);
    if (mode === "row") setEditRowId(null);
    setEditSnapshot(null);
    return true;
  };

  const beginColEdit = (dateId) => {
    if (editSnapshot?.mode === "row" && !finalizeEdit("row")) return;

    if (editSnapshot?.mode === "col" && editSnapshot.targetId !== dateId && !finalizeEdit("col")) return;

    if (editColId === dateId) {
      finalizeEdit("col");
      return;
    }

    setEditRowId(null);
    setEditColId(dateId);
    setEditSnapshot({ mode: "col", targetId: dateId, attendance: cloneAttendance(attendance) });
  };

  const beginRowEdit = (studentId) => {
    if (editSnapshot?.mode === "col" && !finalizeEdit("col")) return;

    if (editSnapshot?.mode === "row" && editSnapshot.targetId !== studentId && !finalizeEdit("row")) return;

    if (editRowId === studentId) {
      finalizeEdit("row");
      return;
    }

    setEditColId(null);
    setEditRowId(studentId);
    setEditSnapshot({ mode: "row", targetId: studentId, attendance: cloneAttendance(attendance) });
  };

  const saveEdit = (mode) => {
    if (mode === "col") setEditColId(null);
    if (mode === "row") setEditRowId(null);
    setEditSnapshot(null);
  };

  const cancelEdit = (mode) => {
    if (editSnapshot?.mode === mode) {
      setAttendance(editSnapshot.attendance);
    }
    if (mode === "col") setEditColId(null);
    if (mode === "row") setEditRowId(null);
    setEditSnapshot(null);
  };

  const deleteDate = (dateId, label) => {
    const dIdx = dates.findIndex((d) => d.id === dateId);
    if (dIdx < 0) return;

    const shouldDelete = window.confirm(`Delete ${label} column from attendance?`);
    if (!shouldDelete) return;

    const removedDate = dates[dIdx];
    const removedValues = {};
    Object.entries(attendance).forEach(([sid, row]) => {
      removedValues[sid] = row[dIdx];
    });

    setLastDeleted({
      date: removedDate,
      index: dIdx,
      values: removedValues,
      totalPeriods,
    });

    setDates((prev) => prev.filter((d) => d.id !== dateId));
    setTotalPeriods((prev) => Math.max(0, prev - 1));
    setAttendance((prev) => {
      const next = {};
      Object.entries(prev).forEach(([sid, row]) => {
        next[sid] = row.filter((_, index) => index !== dIdx);
      });
      return next;
    });

    setEditColId(null);
    setEditRowId(null);
    setEditSnapshot(null);
  };

  const undoDelete = () => {
    if (!lastDeleted) return;

    setDates((prev) => {
      const next = [...prev];
      next.splice(lastDeleted.index, 0, lastDeleted.date);
      return next;
    });

    setAttendance((prev) => {
      const next = {};
      Object.entries(prev).forEach(([sid, row]) => {
        const restored = [...row];
        const val = lastDeleted.values[sid] ?? false;
        restored.splice(lastDeleted.index, 0, val);
        next[sid] = restored;
      });
      return next;
    });

    setTotalPeriods(lastDeleted.totalPeriods);
    setLastDeleted(null);
  };

  useEffect(() => {
    if (!lastDeleted) return undefined;

    const timer = window.setTimeout(() => {
      setLastDeleted(null);
    }, 10000);

    return () => window.clearTimeout(timer);
  }, [lastDeleted]);

  const toggleCell = (sid, dIdx) => {
    const isColumnEditActive = editColId !== null;
    const isRowEditActive = editRowId !== null;

    if (!isColumnEditActive && !isRowEditActive) return;
    if (isColumnEditActive && dates[dIdx]?.id !== editColId) return;
    if (isRowEditActive && sid !== editRowId) return;

    setAttendance((prev) => {
      const row = [...prev[sid]];
      row[dIdx] = !row[dIdx];
      return { ...prev, [sid]: row };
    });
  };

  const setCol = (dIdx, val) => {
    if (editColId && dates[dIdx]?.id !== editColId) return;

    setAttendance((prev) => {
      const next = { ...prev };
      STUDENTS_RAW.forEach((s) => {
        const row = [...next[s.id]];
        row[dIdx] = val;
        next[s.id] = row;
      });
      return next;
    });
  };

  const setRow = (sid, val) => {
    if (editRowId && sid !== editRowId) return;

    setAttendance((prev) => {
      const currentRow = [...(prev[sid] || [])];
      visibleDateIndices.forEach((index) => {
        currentRow[index] = val;
      });
      return {
        ...prev,
        [sid]: currentRow,
      };
    });
  };

  const studentStats = useMemo(
    () => Object.fromEntries(STUDENTS_RAW.map((s) => [s.id, calcStats(attendance[s.id] || [], TOTAL)])),
    [attendance, TOTAL]
  );

  const dateAbsent = useMemo(
    () =>
      visibleDateIndices.map((dIdx) => {
        const absent = STUDENTS_RAW.filter((s) => !attendance[s.id]?.[dIdx]).length;
        return {
          absent,
          pct: Math.round((absent / STUDENTS_RAW.length) * 100),
        };
      }),
    [attendance, visibleDateIndices]
  );

  const below75 = STUDENTS_RAW.filter((s) => studentStats[s.id]?.pct < 75).length;
  const above75 = STUDENTS_RAW.length - below75;

  const hasRowPendingChanges = (studentId) => {
    if (!editSnapshot || editSnapshot.mode !== "row" || editSnapshot.targetId !== studentId) {
      return false;
    }
    const prevRow = editSnapshot.attendance[studentId] || [];
    const currentRow = attendance[studentId] || [];
    return JSON.stringify(prevRow) !== JSON.stringify(currentRow);
  };

  const TH = {
    background: "#f3f4f6",
    fontWeight: 600,
    fontSize: 11,
    color: "#4b5563",
    padding: "5px 3px",
    textAlign: "center",
    borderRight: "1px solid #e5e7eb",
    borderBottom: "2px solid #d1d5db",
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
    zIndex: 2,
  };

  const TD = {
    padding: "3px 3px",
    textAlign: "center",
    borderRight: "1px solid #f3f4f6",
    borderBottom: "1px solid #f3f4f6",
    verticalAlign: "middle",
  };

  return (
    <div
      style={{
        fontFamily: '"Manrope","Segoe UI",sans-serif',
        background: "#f8f4ee",
        minHeight: "100vh",
        padding: 16,
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>Selected Dropdown:</span>
          <span style={{ fontSize: 12, color: "#0f766e", fontWeight: 600 }}>{COURSE_INFO.title}</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <span
              style={{
                background: "#ffedd5",
                color: "#7c2d12",
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 6,
                border: "1px solid #fed7aa",
              }}
            >
              Extra Curricular Course
            </span>
            <span
              style={{
                background: "#ccfbf1",
                color: "#0f766e",
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 6,
                border: "1px solid #99f6e4",
              }}
            >
              Co Curricular Course
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#6b7280", flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>View:</label>
            <select
              value={viewFilter}
              onChange={(e) => setViewFilter(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                fontSize: 12,
                fontWeight: 500,
                backgroundColor: "#fff",
                color: "#374151",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="semester">Semester</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#6b7280", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                width: 16,
                height: 16,
                background: "#0f766e",
                borderRadius: 3,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 9,
                fontWeight: 800,
              }}
            >
              ✓
            </span>
            Attendance Marked
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                width: 16,
                height: 16,
                background: "#374151",
                borderRadius: 3,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 9,
                fontWeight: 800,
              }}
            >
              S
            </span>
            Special Class
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                width: 16,
                height: 16,
                background: "#6b7280",
                borderRadius: 3,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 9,
                fontWeight: 800,
              }}
            >
              T
            </span>
            Tutorial Class
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                width: 16,
                height: 16,
                background: "#0f766e",
                borderRadius: 3,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 9,
                fontWeight: 800,
              }}
            >
              O
            </span>
            Online Class
          </span>
          <span>
            <strong>P#</strong> - Timetable Period Numbers
          </span>
          <span>
            <strong>P#</strong> - Auto Generated Period Numbers
          </span>
          <span>
            <strong>OD</strong> - On Duty
          </span>
          <span>
            <strong>OD</strong> - On Duty
          </span>
        </div>
      </div>

      <div
        style={{
          overflowX: "auto",
          borderRadius: 10,
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
          background: "#fffdf8",
        }}
      >
        {/* Date Grouping Display */}
        {viewFilter !== "monthly" && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb", overflowX: "auto" }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11 }}>
              {getFilteredDatesDisplay().map((group, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 600, color: "#374151" }}>{group.label}:</span>
                  <span style={{ color: "#6b7280" }}>
                    {group.dates.map((d) => d.label).join(", ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <table
          style={{
            borderCollapse: "collapse",
            background: "#fff",
            tableLayout: "fixed",
            minWidth: 220 + visibleDates.length * 38 + 220,
          }}
        >
          <colgroup>
            <col style={{ width: 190 }} />
            {visibleDates.map((d) => (
              <col key={d.id} style={{ width: 38 }} />
            ))}
            <col style={{ width: 72 }} />
            <col style={{ width: 58 }} />
            <col style={{ width: 76 }} />
            <col style={{ width: 42 }} />
          </colgroup>

          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th
                style={{
                  ...TH,
                  textAlign: "left",
                  paddingLeft: 10,
                  position: "sticky",
                  left: 0,
                  zIndex: 3,
                  background: "#f8fafc",
                  fontSize: 10,
                  color: "#94a3b8",
                }}
              >
                ✎ Edit
              </th>
              {visibleDates.map((d) => (
                <th key={d.id} style={{ ...TH, padding: "4px 2px", background: editColId === d.id ? "#ccfbf1" : "#f8fafc" }}>
                  <button
                    onClick={() => beginColEdit(d.id)}
                    title={`Edit column: ${d.label}`}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      border: "1px solid #d1d5db",
                      background: editColId === d.id ? "#0f766e" : "#fff",
                      color: editColId === d.id ? "#fff" : "#6b7280",
                      cursor: "pointer",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                    }}
                  >
                    ✎
                  </button>
                </th>
              ))}
              <th colSpan={4} style={{ ...TH, background: "#f8fafc" }} />
            </tr>

            {editColId && (
              <tr style={{ background: "#f0fdfa" }}>
                <td
                  style={{
                    ...TD,
                    textAlign: "left",
                    paddingLeft: 10,
                    fontSize: 11,
                    color: "#0f766e",
                    fontWeight: 600,
                    position: "sticky",
                    left: 0,
                    background: "#f0fdfa",
                    zIndex: 2,
                    borderBottom: "1px solid #99f6e4",
                  }}
                >
                  Bulk: {visibleDates.find((d) => d.id === editColId)?.label || dates.find((d) => d.id === editColId)?.label}
                </td>
                {visibleDates.map((d, dIdx) => (
                  <td key={d.id} style={{ ...TD, background: d.id === editColId ? "#ccfbf1" : "transparent", borderBottom: "1px solid #99f6e4" }}>
                    {d.id === editColId ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
                        <button
                          onClick={() => setCol(visibleDateIndices[dIdx], true)}
                          style={{
                            width: 30,
                            height: 13,
                            background: "#0f766e",
                            color: "#fff",
                            fontSize: 8,
                            fontWeight: 800,
                            border: "none",
                            borderRadius: 3,
                            cursor: "pointer",
                            lineHeight: 1,
                          }}
                        >
                          All ✓
                        </button>
                        <button
                          onClick={() => setCol(visibleDateIndices[dIdx], false)}
                          style={{
                            width: 30,
                            height: 13,
                            background: "#b91c1c",
                            color: "#fff",
                            fontSize: 8,
                            fontWeight: 800,
                            border: "none",
                            borderRadius: 3,
                            cursor: "pointer",
                            lineHeight: 1,
                          }}
                        >
                          All ✕
                        </button>
                      </div>
                    ) : null}
                  </td>
                ))}
                <td colSpan={3} style={{ ...TD, borderBottom: "1px solid #99f6e4" }} />
                <td style={{ ...TD, borderBottom: "1px solid #99f6e4" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
                    <button
                      onClick={() => saveEdit("col")}
                      style={{
                        fontSize: 10,
                        background: "#0f766e",
                        border: "none",
                        borderRadius: 4,
                        padding: "2px 6px",
                        cursor: "pointer",
                        color: "#fff",
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => cancelEdit("col")}
                      style={{
                        fontSize: 10,
                        background: "#e5e7eb",
                        border: "none",
                        borderRadius: 4,
                        padding: "2px 6px",
                        cursor: "pointer",
                        color: "#4b5563",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            )}

            <tr>
              <th style={{ ...TH, textAlign: "left", paddingLeft: 10, position: "sticky", left: 0, zIndex: 3, background: "#f3f4f6" }}>Name / USN</th>
              {visibleDates.map((d) => (
                <th
                  key={d.id}
                  style={{
                    ...TH,
                    background: editColId === d.id ? "#99f6e4" : "#f3f4f6",
                    color: editColId === d.id ? "#0f766e" : "#4b5563",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, lineHeight: 1.2 }}>{d.label}</div>
                  <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 500 }}>{d.period}</div>
                </th>
              ))}
              <th style={{ ...TH, fontSize: 10, lineHeight: 1.3 }}>
                # of Periods
                <br />
                Present
              </th>
              <th style={{ ...TH, fontSize: 10, lineHeight: 1.3 }}>
                %
                <br />
                Present
              </th>
              <th style={{ ...TH, fontSize: 10, lineHeight: 1.3 }}>
                Min # of Classes
                <br />
                Needed
              </th>
              <th style={{ ...TH, fontSize: 10 }}>Edit</th>
            </tr>
          </thead>

          <tbody>
            {STUDENTS_RAW.map((s, sIdx) => {
              const stats = studentStats[s.id];
              const isRowActive = editRowId === s.id;
              const rowHasChanges = hasRowPendingChanges(s.id);
              const rowBg = isRowActive ? "#fffbeb" : sIdx % 2 === 0 ? "#fff" : "#f9fafb";

              return (
                <tr key={s.id}>
                  <td
                    style={{
                      ...TD,
                      textAlign: "left",
                      paddingLeft: 10,
                      position: "sticky",
                      left: 0,
                      zIndex: 1,
                      background: rowBg,
                      borderRight: "2px solid #e5e7eb",
                      minWidth: 190,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#1f2937",
                        lineHeight: 1.3,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {s.name}
                    </div>
                    <div style={{ fontSize: 10, color: "#9ca3af" }}>{s.usn}</div>
                    {isRowActive && (
                      <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
                        <button
                          onClick={() => setRow(s.id, true)}
                          style={{ fontSize: 9, background: "#0f766e", color: "#fff", border: "none", borderRadius: 3, padding: "2px 5px", cursor: "pointer" }}
                        >
                          All ✓
                        </button>
                        <button
                          onClick={() => setRow(s.id, false)}
                          style={{ fontSize: 9, background: "#b91c1c", color: "#fff", border: "none", borderRadius: 3, padding: "2px 5px", cursor: "pointer" }}
                        >
                          All ✕
                        </button>
                      </div>
                    )}
                  </td>

                  {visibleDates.map((d, dIdx) => {
                    const actualIdx = visibleDateIndices[dIdx];
                    const colActive = editColId === d.id;
                    const cellBg = colActive ? "#ccfbf1" : isRowActive ? "#fff7ed" : rowBg;
                    return (
                      <td key={d.id} style={{ ...TD, background: cellBg }}>
                        <AttCell
                          present={attendance[s.id]?.[actualIdx] ?? false}
                          highlight={colActive || isRowActive}
                          onClick={() => toggleCell(s.id, actualIdx)}
                        />
                      </td>
                    );
                  })}

                  <td style={{ ...TD, fontWeight: 700, fontSize: 12, color: "#1f2937", background: rowBg }}>
                    {stats.present}/{TOTAL}
                  </td>
                  <td style={{ ...TD, background: rowBg }}>
                    <PctBadge pct={stats.pct} />
                  </td>
                  <td style={{ ...TD, fontSize: 12, fontWeight: 600, background: rowBg, color: stats.pct >= 75 ? "#065f46" : "#b91c1c" }}>
                    {stats.pct >= 75 ? <span style={{ fontSize: 14 }}>✓</span> : stats.minNeeded}
                  </td>

                  <td style={{ ...TD, background: rowBg }}>
                    {isRowActive && rowHasChanges ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                        <button
                          onClick={() => saveEdit("row")}
                          style={{ fontSize: 9, background: "#0f766e", color: "#fff", border: "none", borderRadius: 3, padding: "2px 6px", cursor: "pointer" }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => cancelEdit("row")}
                          style={{ fontSize: 9, background: "#e5e7eb", color: "#4b5563", border: "none", borderRadius: 3, padding: "2px 6px", cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => beginRowEdit(s.id)}
                        title="Edit this student's attendance"
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 4,
                          border: "1px solid #d1d5db",
                          background: isRowActive ? "#f59e0b" : "#fff",
                          color: isRowActive ? "#fff" : "#6b7280",
                          cursor: "pointer",
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto",
                        }}
                      >
                        ✎
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr style={{ background: "#f3f4f6", borderTop: "2px solid #d1d5db" }}>
              <td
                style={{
                  ...TD,
                  textAlign: "left",
                  paddingLeft: 10,
                  fontWeight: 700,
                  fontSize: 11,
                  color: "#4b5563",
                  position: "sticky",
                  left: 0,
                  background: "#f3f4f6",
                  zIndex: 1,
                  borderRight: "2px solid #e5e7eb",
                }}
              >
                # of Absentees
              </td>
              {dateAbsent.map((da, i) => (
                <td key={i} style={{ ...TD, fontWeight: 700, fontSize: 11, color: "#1f2937", background: "#f3f4f6" }}>
                  {da.absent}
                </td>
              ))}
              <td colSpan={4} style={{ ...TD, background: "#f3f4f6" }} />
            </tr>
            <tr style={{ background: "#f9fafb" }}>
              <td
                style={{
                  ...TD,
                  textAlign: "left",
                  paddingLeft: 10,
                  fontWeight: 700,
                  fontSize: 11,
                  color: "#4b5563",
                  position: "sticky",
                  left: 0,
                  background: "#f9fafb",
                  zIndex: 1,
                  borderRight: "2px solid #e5e7eb",
                }}
              >
                % Absent
              </td>
              {dateAbsent.map((da, i) => (
                <td key={i} style={{ ...TD, fontSize: 11, color: "#6b7280", background: "#f9fafb" }}>
                  {da.pct}%
                </td>
              ))}
              <td colSpan={4} style={{ ...TD, background: "#f9fafb" }} />
            </tr>
            <tr style={{ background: "#f3f4f6" }}>
              <td
                style={{
                  ...TD,
                  textAlign: "left",
                  paddingLeft: 10,
                  fontWeight: 700,
                  fontSize: 11,
                  color: "#4b5563",
                  position: "sticky",
                  left: 0,
                  background: "#f3f4f6",
                  zIndex: 1,
                  borderRight: "2px solid #e5e7eb",
                }}
              >
                Delete
              </td>
              {visibleDates.map((d) => (
                <td key={d.id} style={{ ...TD, background: "#f3f4f6" }}>
                  <button
                    onClick={() => deleteDate(d.id, d.label)}
                    title={`Delete ${d.label}`}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13, padding: 0 }}
                  >
                    🗑
                  </button>
                </td>
              ))}
              <td colSpan={4} style={{ ...TD, background: "#f3f4f6" }} />
            </tr>
          </tfoot>
        </table>
      </div>

      {lastDeleted ? (
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #fed7aa",
            background: "#fff7ed",
            color: "#7c2d12",
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600 }}>Deleted {lastDeleted.date.label}. Revert if this was by mistake.</span>
          <button
            onClick={undoDelete}
            style={{
              fontSize: 12,
              fontWeight: 700,
              background: "#0f766e",
              color: "#fff",
              border: "none",
              borderRadius: 5,
              padding: "4px 10px",
              cursor: "pointer",
            }}
          >
            Undo Delete
          </button>
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        {[
          { label: "Total Students", value: STUDENTS_RAW.length, color: "#0f766e", bg: "#ccfbf1" },
          { label: "Total Classes", value: TOTAL, color: "#065f46", bg: "#ecfdf5" },
          { label: "Below 75%", value: below75, color: "#991b1b", bg: "#fef2f2" },
          { label: "At / Above 75%", value: above75, color: "#065f46", bg: "#ecfdf5" },
        ].map((c) => (
          <div
            key={c.label}
            style={{
              background: c.bg,
              border: `1px solid ${c.color}22`,
              borderRadius: 8,
              padding: "10px 18px",
              minWidth: 120,
            }}
          >
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

    
    </div>
  );
}