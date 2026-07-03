import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  Download,
  Save,
  FileCheck,
  CalendarClock,
  AlertCircle,
  Search,
  RefreshCw,
  LayoutGrid,
  Eye,
  Calendar,
} from "lucide-react";
import * as XLSX from "xlsx";
import AttendanceView from "./AttendanceView";
import ReportGenerationView from "./ReportGenerationView";
// import MenteeSmrTable from "../components/MenteeSmrTable";

const BRAND_GRADIENT = "var(--gradient-brand)";

const STATUS = {
  PRESENT: "P",
  ABSENT: "A",
  ON_DUTY: "OD",
};
const OD_REQUEST_TYPES = ["Higher Authority Verification", "Medical", "Event / Competition", "Other"];

const students = [
  { id: 1, usn: "2022508001", name: "Aarav Nair" },
  { id: 2, usn: "2022508002", name: "Ayaan Khan" },
  { id: 3, usn: "2022508003", name: "Abhinav Reddy" },
  { id: 4, usn: "2022508004", name: "Akshara Rao" },
  { id: 5, usn: "2022508011", name: "Ananya Iyer" },
  { id: 6, usn: "2022508012", name: "Arjun Menon" },
  { id: 7, usn: "2022508013", name: "Aishwarya J" },
  { id: 8, usn: "2022508014", name: "Bhavana S" },
  { id: 9, usn: "2022508015", name: "Bharath M" },
  { id: 10, usn: "2022508020", name: "Eshwar Kumar" },
  { id: 11, usn: "2022508029", name: "Devika A" },
  { id: 12, usn: "2022508043", name: "Mithun Manoj" },
  { id: 13, usn: "2022508051", name: "Mohammed Asim" },
  { id: 14, usn: "2022508052", name: "Muhammed Rishan" },
  { id: 15, usn: "2022508060", name: "Preetham Gowda" },
  { id: 16, usn: "2022508065", name: "Ritvik C" },
  { id: 17, usn: "2022508069", name: "Satvik Kulkarni" },
  { id: 18, usn: "2022508071", name: "Sinchana Murali" },
  { id: 19, usn: "2022508077", name: "Surya Narayanan" },
  { id: 20, usn: "2022508080", name: "Trisha Biradar" },
  { id: 21, usn: "2022508082", name: "Vaishnav B" },
  { id: 22, usn: "2022508083", name: "Vikas K S" },
  { id: 23, usn: "2022508089", name: "Tharun V" },
];

const timetable = [
  {
    department: "MCA",
    semester: "1",
    subject: "Programming in C",
    section: "A",
    date: "2026-04-06",
    slot: "09:00 - 10:00",
  },
  {
    department: "MCA",
    semester: "1",
    subject: "Mathematics for Computing",
    section: "B",
    date: "2026-04-07",
    slot: "10:00 - 11:00",
  },
  {
    department: "MCA",
    semester: "2",
    subject: "Data Structures",
    section: "A",
    date: "2026-04-08",
    slot: "11:15 - 12:15",
  },
  {
    department: "MCA",
    semester: "2",
    subject: "Operating Systems",
    section: "B",
    date: "2026-04-09",
    slot: "14:00 - 15:00",
  },
  {
    department: "MCA",
    semester: "3",
    subject: "Database Management Systems",
    section: "A",
    date: "2026-04-10",
    slot: "09:00 - 10:00",
  },
  {
    department: "MCA",
    semester: "3",
    subject: "Web Technologies",
    section: "B",
    date: "2026-04-11",
    slot: "10:00 - 11:00",
  },
  {
    department: "MCA",
    semester: "4",
    subject: "Machine Learning",
    section: "A",
    date: "2026-04-12",
    slot: "11:15 - 12:15",
  },
  {
    department: "MCA",
    semester: "4",
    subject: "Cloud Computing",
    section: "B",
    date: "2026-04-13",
    slot: "14:00 - 15:00",
  },
];

const sections = ["A", "B", "C", "D"];
const facultyNames = ["Dr.Bharathi", "Ajay Sir", "Dr.Kavya", "Ramesh Sir", "Dr.Manjula"];

function parseCsvLine(line) {
  const out = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      out.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  out.push(current.trim());
  return out;
}

async function parseExcelFile(file) {
  const workbook = XLSX.read(await file.arrayBuffer());
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
  return data.filter((row) => row.some((cell) => String(cell || "").trim() !== ""));
}

function getInitialRows() {
  return students.reduce((acc, student) => {
    acc[student.id] = {
      status: STATUS.PRESENT,
      showOD: false,
      comment: "",
      file: null,
      documentSent: false,
      odRequestType: "Higher Authority Verification",
      odAuthorityStatus: "Not Requested",
      mentorApproval: "Not Sent",
    };
    return acc;
  }, {});
}

function getUnique(values) {
  return [...new Set(values)];
}

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function normalizeStatus(value) {
  const text = String(value || "").trim().toUpperCase();
  if (text === "P" || text === "PRESENT") return STATUS.PRESENT;
  if (text === "A" || text === "ABSENT") return STATUS.ABSENT;
  if (text === "-" || text === "OD" || text === "ON DUTY") return STATUS.ON_DUTY;
  return null;
}

function isDateHeader(value) {
  const text = String(value || "").trim();
  if (!text) return false;

  const numeric = Number(text);
  if (Number.isFinite(numeric) && numeric > 20000 && numeric < 80000) {
    return true;
  }

  return !Number.isNaN(Date.parse(text));
}

function formatDateHeader(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  const numeric = Number(text);
  if (Number.isFinite(numeric) && numeric > 20000 && numeric < 80000) {
    return XLSX.SSF.format("dd mmm yyyy", numeric);
  }

  return text;
}

function findHeaderIndex(headers, names) {
  return headers.findIndex((header) => names.includes(normalizeHeader(header)));
}

function buildRowsFromAttendance(attendance = []) {
  return students.reduce((acc, student) => {
    const matched = attendance.find((row) => row.id === student.id || String(row.usn || "") === student.usn);
    acc[student.id] = {
      status: matched?.status || STATUS.PRESENT,
      showOD: false,
      comment: matched?.comment || "",
      file: null,
      documentSent: false,
      odRequestType: "Higher Authority Verification",
      odAuthorityStatus: "Not Requested",
      mentorApproval: "Not Sent",
    };
    return acc;
  }, {});
}

function buildWorkbookTemplateHeaders() {
  return ["Sl. No", "Class Name", "Register No.", "Student Name", "Course Code", ...getUnique(timetable.map((entry) => entry.date))];
}

function buildWorkbookTemplateRows(classLabel, courseCode) {
  const dates = getUnique(timetable.map((entry) => entry.date));

  return students.map((student, index) => [
    index + 1,
    classLabel,
    student.usn,
    student.name,
    courseCode,
    ...dates.map(() => STATUS.PRESENT),
  ]);
}

function getWorkbookLayout(matrix) {
  if (!Array.isArray(matrix) || matrix.length < 3) {
    throw new Error("File is empty or missing attendance rows.");
  }

  const firstRow = matrix[0].map((cell) => String(cell || "").trim());
  const secondRow = matrix[1].map((cell) => String(cell || "").trim());
  const firstRowHasDates = firstRow.some((cell) => isDateHeader(cell));
  const secondRowHasLabels = secondRow.some((cell) => ["sl. no", "sl no", "register no.", "student name", "course code"].includes(cell.toLowerCase()));

  if (firstRowHasDates && secondRowHasLabels) {
    return {
      headerRow: firstRow,
      labelRow: secondRow,
      dataStartRow: 2,
    };
  }

  return {
    headerRow: firstRow,
    labelRow: firstRow,
    dataStartRow: 1,
  };
}

function buildDemoAttendanceRecords() {
  return timetable.slice(0, 5).map((entry, index) => ({
    context: {
      department: entry.department,
      semester: entry.semester,
      subject: entry.subject,
      section: entry.section,
      faculty: facultyNames[index % facultyNames.length],
      date: entry.date,
      slot: entry.slot,
    },
    recordId: `seed_record_${index + 1}`,
    submittedAt: `${entry.date}T08:00:00.000Z`,
    editedByAdmin: false,
    attendance: students.map((student, studentIndex) => {
      const mix = (index + studentIndex) % 6;
      const status = mix === 0 ? STATUS.ABSENT : mix === 1 ? STATUS.ON_DUTY : STATUS.PRESENT;
      return {
        id: student.id,
        usn: student.usn,
        name: student.name,
        status,
        comment: status === STATUS.ON_DUTY ? "Medical leave" : "",
      };
    }),
  }));
}

function buildMarchSeedRecords() {
  const marchDates = ["2026-03-03", "2026-03-10", "2026-03-17", "2026-03-24"];
  const marchContext = {
    department: "MCA",
    semester: "1",
    subject: "Programming in C",
    section: "A",
    slot: "09:00 - 10:00",
  };

  return marchDates.map((date, index) => ({
    context: {
      ...marchContext,
      faculty: facultyNames[index % facultyNames.length],
      date,
    },
    recordId: `seed_march_${index + 1}`,
    submittedAt: `${date}T08:00:00.000Z`,
    editedByAdmin: false,
    attendance: students.map((student) => {
      const isLowAttendanceSample = [1, 2, 3].includes(student.id);
      return {
        id: student.id,
        usn: student.usn,
        name: student.name,
        status: isLowAttendanceSample ? STATUS.ABSENT : STATUS.PRESENT,
        comment: "",
      };
    }),
  }));
}

function mergeMissingMarchSeeds(existingRecords = []) {
  const hasMarchSeed = existingRecords.some((record) => String(record.recordId || "").startsWith("seed_march_"));
  if (hasMarchSeed) {
    return existingRecords;
  }

  return [...existingRecords, ...buildMarchSeedRecords()];
}

export default function Attendance({ tab = "Student Attendance", onTabChange } = {}) {
  const defaultTimetable = timetable[0];
  const defaultMarkAllStatus = STATUS.PRESENT;
  const [rows, setRows] = useState({});
  const tabToModule = {
    "Student Attendance": "mark",
    "View Attendance": "view",
    "View Report": "report",
    "Attendance Report": "report",
  };
  const [activeModule, setActiveModule] = useState(() => tabToModule[tab] || "mark");
  const [markAllStatus, setMarkAllStatus] = useState(defaultMarkAllStatus);
  const [selectedFaculty, setSelectedFaculty] = useState(facultyNames[0]);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const uploadInputRef = useRef(null);
  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    const existing = JSON.parse(localStorage.getItem("attendance_records") || "[]");
    if (existing.length > 0) {
      const merged = mergeMissingMarchSeeds(existing);
      if (merged.length !== existing.length) {
        localStorage.setItem("attendance_records", JSON.stringify(merged));
      }
      return merged;
    }

    const seeded = [...buildDemoAttendanceRecords(), ...buildMarchSeedRecords()];
    localStorage.setItem("attendance_records", JSON.stringify(seeded));
    return seeded;
  });
  const [classInfo, setClassInfo] = useState({
    department: defaultTimetable.department,
    semester: defaultTimetable.semester,
    subject: defaultTimetable.subject,
    section: defaultTimetable.section,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [classType, setClassType] = useState("Regular");
  const [selectedDate, setSelectedDate] = useState(defaultTimetable.date);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergedSections, setMergedSections] = useState([]);
  const [syncSelections, setSyncSelections] = useState(() =>
    students.slice(0, 8).map((student) => ({ id: student.id, usn: student.usn, name: student.name, selected: true }))
  );

  useEffect(() => {
    const module = tabToModule[tab] || "mark";
    setActiveModule(module);
  }, [tab]);

  useEffect(() => {
    setRows(getInitialRows());
  }, []);

  const semesterOptions = useMemo(() => {
    return getUnique(timetable.filter((entry) => entry.department === "MCA").map((entry) => entry.semester));
  }, []);

  const subjectOptions = useMemo(() => {
    if (!classInfo.semester) return [];
    return getUnique(
      timetable
        .filter((entry) => entry.department === "MCA" && entry.semester === classInfo.semester)
        .map((entry) => entry.subject)
    );
  }, [classInfo.semester]);

  const attendanceStatsMap = useMemo(() => {
    const stats = new Map();

    students.forEach((student) => {
      stats.set(student.id, { attended: 0, total: 0, percentage: 0 });
    });

    attendanceRecords.forEach((record) => {
      record.attendance?.forEach((studentRecord) => {
        const current = stats.get(studentRecord.id);
        if (!current) return;

        current.total += 1;
        if (studentRecord.status === STATUS.PRESENT) {
          current.attended += 1;
        }
      });
    });

    stats.forEach((value, key) => {
      value.percentage = value.total > 0 ? Math.round((value.attended / value.total) * 100) : 0;
      stats.set(key, value);
    });

    return stats;
  }, [attendanceRecords]);

  const selectedTimetable = useMemo(() => {
    return (
      timetable.find(
        (entry) =>
          entry.department === classInfo.department &&
          entry.semester === classInfo.semester &&
          entry.subject === classInfo.subject
      ) || null
    );
  }, [classInfo]);

  const contextLabel = useMemo(() => {
    if (!selectedTimetable) {
      return "Select Semester, Subject, and Section to view timetable details.";
    }

    return `${selectedTimetable.department} | Sem ${selectedTimetable.semester} | ${selectedTimetable.subject} | Sec ${classInfo.section || "-"} | ${selectedTimetable.date} | ${selectedTimetable.slot}`;
  }, [selectedTimetable, classInfo.section]);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return students;
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) || student.usn.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const selectionSummary = useMemo(() => {
    const dept = "MCA-DET-CC";
    const sem = classInfo.semester ? `Semester ${classInfo.semester}-2025` : "Semester -";
    const subj = classInfo.subject || "Course";
    const courseCode =
      classInfo.subject?.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "MCAP256";
    const sec = classInfo.section ? `MCA-${classInfo.section}` : "MCA-";
    const mergedLabel =
      mergedSections.length > 1
        ? mergedSections.map((section) => `MCA-${section}`).join(", ")
        : sec;
    return `${dept}-${sem}-${courseCode}-${mergedLabel}`;
  }, [classInfo, mergedSections]);

  const freezingDate = useMemo(() => {
    const base = selectedTimetable?.date || selectedDate;
    const date = new Date(base);
    if (Number.isNaN(date.getTime())) return "26 Jun 2026";
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }, [selectedTimetable, selectedDate]);

  const previousClassDate = useMemo(() => {
    const base = selectedTimetable?.date || selectedDate;
    const date = new Date(base);
    if (Number.isNaN(date.getTime())) return "24 Jun 2026";
    date.setDate(date.getDate() - 1);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }, [selectedTimetable, selectedDate]);

  useEffect(() => {
    if (selectedTimetable?.date) {
      setSelectedDate(selectedTimetable.date);
    }
  }, [selectedTimetable]);

  const goToMark = () => {
    setActiveModule("mark");
    onTabChange?.("Student Attendance");
  };

  const goToView = () => {
    setActiveModule("view");
    onTabChange?.("View Attendance");
  };

  const goToReport = () => {
    setActiveModule("report");
    onTabChange?.("View Report");
  };

  const isClassSelected = Boolean(selectedTimetable && classInfo.section);
  const isEditLocked = false;

  const isStudentEditEnabled = () => !isEditLocked;

  const updateRow = (id, status) => {
    if (!isStudentEditEnabled(id) || !isClassSelected) return;
    setRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        status,
        showOD: false,
        comment: status === STATUS.ON_DUTY ? prev[id]?.comment || "" : "",
        file: status === STATUS.ON_DUTY ? prev[id]?.file : null,
        odRequestType:
          status === STATUS.ON_DUTY
            ? prev[id]?.odRequestType || "Higher Authority Verification"
            : "Higher Authority Verification",
        odAuthorityStatus:
          status === STATUS.ON_DUTY
            ? prev[id]?.odAuthorityStatus || "Not Requested"
            : "Not Requested",
        mentorApproval:
          status === STATUS.ON_DUTY ? prev[id]?.mentorApproval || "Pending" : "Pending",
      },
    }));
  };

  const openOD = (id) => {
    if (!isStudentEditEnabled(id) || !isClassSelected) return;
    setRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        showOD: true,
      },
    }));
    setError("");
  };

  const sendODDocument = (id) => {
    if (!isStudentEditEnabled(id) || !isClassSelected) return;
    if (!rows[id]?.file) {
      setError("Choose a document before sending to mentor.");
      return;
    }

    setRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        documentSent: true,
        mentorApproval: "Approval Pending",
      },
    }));
    setMessage(`Document sent to mentor for ${students.find((s) => s.id === id)?.name || "student"}. Approval pending.`);
    setError("");
  };

  const saveOD = (id) => {
    if (!isStudentEditEnabled(id) || !isClassSelected) return;
    if (!rows[id]?.file) {
      setError("Choose a supporting document before saving OD.");
      return;
    }
    if (!rows[id]?.documentSent) {
      setError("Send the document to mentor before saving.");
      return;
    }
    if (!rows[id]?.comment?.trim()) {
      setError("OD requires a comment before saving.");
      return;
    }
    if (rows[id]?.mentorApproval !== "Approved") {
      setError(
        rows[id]?.mentorApproval === "Rejected"
          ? "Mentor rejected this OD request. Update details or exit."
          : "Mentor approval is still pending. Wait for approval before saving."
      );
      return;
    }

    setRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: STATUS.ON_DUTY,
        showOD: false,
        comment: prev[id].comment.trim(),
        file: prev[id].file || null,
      },
    }));
    setMessage("OD saved after mentor approval.");
    setError("");
  };

  const exitOD = (id) => {
    if (!isStudentEditEnabled(id) || !isClassSelected) return;
    setRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: STATUS.PRESENT,
        showOD: false,
        comment: "",
        file: null,
        documentSent: false,
        odRequestType: "Higher Authority Verification",
        odAuthorityStatus: "Not Requested",
        mentorApproval: "Not Sent",
      },
    }));
    setMessage("OD canceled. Student reverted to Present.");
    setError("");
  };

  const applySyncMeetingAttendees = () => {
    const selectedIds = new Set(syncSelections.filter((entry) => entry.selected).map((entry) => entry.id));
    if (selectedIds.size === 0) {
      setError("Select at least one attendee to sync.");
      return;
    }

    setRows((prev) => {
      const next = { ...prev };
      students.forEach((student) => {
        if (selectedIds.has(student.id)) {
          next[student.id] = {
            ...next[student.id],
            status: STATUS.PRESENT,
            showOD: false,
          };
        }
      });
      return next;
    });

    setShowSyncModal(false);
    setMessage(`Synced ${selectedIds.size} meeting attendee${selectedIds.size === 1 ? "" : "s"} as Present.`);
    setError("");
  };

  const applyMergedSections = (sections) => {
    setMergedSections(sections);
    setShowMergeModal(false);
    if (sections.length > 0) {
      setClassInfo((prev) => ({ ...prev, section: sections[0] }));
      setMessage(`Merged sections: ${sections.map((s) => `MCA-${s}`).join(", ")}`);
    } else {
      setMessage("Course sections unmerged.");
    }
    setError("");
  };

  const markAll = (status) => {
    if (isEditLocked || !isClassSelected) return;
    const updated = {};
    students.forEach((student) => {
      updated[student.id] = {
        ...rows[student.id],
        status,
        showOD: false,
        comment: status === STATUS.ON_DUTY ? rows[student.id]?.comment || "" : "",
        file: status === STATUS.ON_DUTY ? rows[student.id]?.file : null,
        odRequestType:
          status === STATUS.ON_DUTY
            ? rows[student.id]?.odRequestType || "Higher Authority Verification"
            : "Higher Authority Verification",
        odAuthorityStatus:
          status === STATUS.ON_DUTY
            ? rows[student.id]?.odAuthorityStatus || "Not Requested"
            : "Not Requested",
        mentorApproval:
          status === STATUS.ON_DUTY ? rows[student.id]?.mentorApproval || "Pending" : "Pending",
      };
    });
    setRows(updated);
    setMarkAllStatus(status);
    setMessage(`All students marked as ${status}.`);
    setError("");
  };

  const flipMarkAll = () => {
    markAll(markAllStatus === STATUS.PRESENT ? STATUS.ABSENT : STATUS.PRESENT);
  };

  const downloadTemplate = () => {
    if (!isClassSelected) {
      setError("Select a timetable class first to download template.");
      return;
    }

    const classLabel = `${selectedTimetable.department}-${selectedTimetable.semester}-${selectedTimetable.subject}-${classInfo.section}`;
    const courseCode = selectedTimetable.subject.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "COURSE";
    const dates = getUnique(timetable.map((entry) => entry.date));
    const headerRow = ["", "", "", "", "", ...dates];
    const labelRow = ["Sl. No", "Class Name", "Register No.", "Student Name", "Course Code", ...dates.map(() => STATUS.PRESENT)];
    const worksheetData = [headerRow, labelRow, ...buildWorkbookTemplateRows(classLabel, courseCode)];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "attendance_template.xlsx");
    setMessage("Template downloaded in Excel format.");
    setError("");
  };

  const processUploadFile = async (file) => {
    if (isEditLocked || !isClassSelected) return false;
    if (!file) return false;

    try {
      if (!file.name.toLowerCase().endsWith(".xlsx")) {
        setError("Please upload an Excel .xlsx file.");
        return false;
      }

      const matrix = await parseExcelFile(file);
      const layout = getWorkbookLayout(matrix);
      const headers = layout.labelRow;
      const dateHeaders = layout.headerRow;
      const registerIndex = findHeaderIndex(headers, ["registerno", "usn", "rollno", "studentid"]);
      const nameIndex = findHeaderIndex(headers, ["studentname", "name"]);
      const classIndex = findHeaderIndex(headers, ["classname", "class"]);
      const courseIndex = findHeaderIndex(headers, ["coursecode", "course", "subjectcode"]);

      if (registerIndex === -1 || nameIndex === -1) {
        setError("The Excel sheet must include Register No. and Student Name columns.");
        return false;
      }

      const dateColumns = dateHeaders
        .map((header, index) => ({ header, index }))
        .filter(({ header, index }) => index >= 5 && isDateHeader(header));

      if (dateColumns.length === 0) {
        setError("No date columns found in the Excel sheet.");
        return false;
      }

      const dataRows = matrix.slice(layout.dataStartRow).filter((row) => row.some((cell) => String(cell || "").trim() !== ""));

      for (let rowOffset = 0; rowOffset < dataRows.length; rowOffset += 1) {
        const row = dataRows[rowOffset];
        for (let dateOffset = 0; dateOffset < dateColumns.length; dateOffset += 1) {
          const { header, index } = dateColumns[dateOffset];
          const rawValue = String(row[index] || "").trim();
          if (!rawValue) continue;

          if (!normalizeStatus(rawValue)) {
            setError(
              `Invalid status "${rawValue}" at Excel row ${layout.dataStartRow + rowOffset + 1} (${formatDateHeader(header)}). Use only P, A, - (dash for OD).`
            );
            return false;
          }
        }
      }

      const importedRecords = dateColumns.map(({ header, index }) => ({
        context: {
          department: classInfo.department,
          semester: classInfo.semester,
          subject: String(dataRows[0]?.[courseIndex] || selectedTimetable?.subject || defaultTimetable.subject).trim(),
          section: classInfo.section,
          faculty: selectedFaculty,
          date: formatDateHeader(header),
          slot: "Imported from Excel",
          className: String(dataRows[0]?.[classIndex] || "").trim(),
          courseCode: String(dataRows[0]?.[courseIndex] || "").trim(),
        },
        recordId: `import_${Date.now()}_${index}`,
        submittedAt: new Date().toISOString(),
        submissionTimestamp: Date.now(),
        attendance: dataRows.map((row, rowIndex) => ({
          id: rowIndex + 1,
          usn: String(row[registerIndex] || "").trim() || `ROW_${rowIndex + 1}`,
          name: String(row[nameIndex] || "").trim() || `Student ${rowIndex + 1}`,
          status: normalizeStatus(row[index]) || STATUS.PRESENT,
          comment: "",
        })),
        editedByAdmin: false,
      }));

      const nextRecords = [...attendanceRecords, ...importedRecords];
      localStorage.setItem("attendance_records", JSON.stringify(nextRecords));
      setAttendanceRecords(nextRecords);

      const matchingRecord =
        importedRecords.find((record) => String(record.context?.date || "").trim() === String(selectedTimetable?.date || "").trim()) ||
        importedRecords[0];

      if (matchingRecord) {
        setRows(buildRowsFromAttendance(matchingRecord.attendance));
        setCurrentRecordId(matchingRecord.recordId);
        setIsSubmitted(true);
      }

      setMessage(`Imported ${importedRecords.length} attendance sheet${importedRecords.length === 1 ? "" : "s"} from Excel.`);
      setError("");
      return true;
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : "Invalid Excel file. Upload a workbook with date columns.");
      setMessage("");
      return false;
    }
  };

  const uploadSelectedTemplate = async () => {
    const chosenFile = selectedUploadFile || uploadInputRef.current?.files?.[0] || null;

    if (!chosenFile) {
      setError("Select a file before clicking upload.");
      setMessage("");
      return;
    }

    const success = await processUploadFile(chosenFile);
    if (success) {
      setSelectedUploadFile(null);
      setShowUploadPopup(false);
      if (uploadInputRef.current) {
        uploadInputRef.current.value = "";
      }
    }
  };

  const handleUploadFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedUploadFile(file);
    if (file) {
      setError("");
    }
  };

  const openUploadPopup = () => {
    setShowUploadPopup(true);
    setError("");
  };

  const closeUploadPopup = () => {
    setShowUploadPopup(false);
    setSelectedUploadFile(null);
    if (uploadInputRef.current) {
      uploadInputRef.current.value = "";
    }
  };

  const validateBeforeSubmit = () => {
    if (!isClassSelected) {
      return "Choose a timetable class before submitting attendance.";
    }

    const pendingOD = students.find((student) => rows[student.id]?.showOD);
    if (pendingOD) {
      return "There are unsaved OD cards. Save or exit them before submit.";
    }

    const invalidOD = students.find((student) => {
      const row = rows[student.id];
      return row?.status === STATUS.ON_DUTY && !row?.comment?.trim();
    });

    if (invalidOD) {
      return `OD comment is required for ${invalidOD.usn}.`;
    }

    const pendingApproval = students.find((student) => {
      const row = rows[student.id];
      return row?.status === STATUS.ON_DUTY && row?.documentSent && row?.mentorApproval !== "Approved";
    });
    if (pendingApproval) {
      return `Mentor approval pending for ${pendingApproval.usn}.`;
    }

    return "";
  };

  const handleSubmit = () => {
    const validationError = validateBeforeSubmit();
    if (validationError) {
      setError(validationError);
      return;
    }

    const snapshot = students.map((student) => ({
      id: student.id,
      usn: student.usn,
      name: student.name,
      status: rows[student.id]?.status || STATUS.PRESENT,
      comment: rows[student.id]?.status === STATUS.ON_DUTY ? rows[student.id]?.comment || "" : "",
    }));

    const payload = {
      context: {
        department: selectedTimetable.department,
        semester: selectedTimetable.semester,
        subject: selectedTimetable.subject,
        section: selectedTimetable.section,
        faculty: selectedFaculty,
        date: selectedTimetable.date,
        slot: selectedTimetable.slot,
      },
      recordId: currentRecordId || `record_${Date.now()}`,
      submittedAt: new Date().toISOString(),
      submissionTimestamp: Date.now(),
      attendance: snapshot,
      editedByAdmin: false,
    };

    const existing = [...attendanceRecords];
    const recordIndex = existing.findIndex((record) => record.recordId === payload.recordId);
    if (recordIndex >= 0) {
      existing[recordIndex] = payload;
    } else {
      existing.push(payload);
    }
    localStorage.setItem("attendance_records", JSON.stringify(existing));
    setAttendanceRecords(existing);

    setIsSubmitted(true);
    setCurrentRecordId(payload.recordId);
    setError("");
    setMessage(recordIndex >= 0 ? "Attendance submitted." : "Attendance submitted.");
    console.log("Final Attendance Snapshot", payload);
  };

  const openRecordInMarkingPage = (record) => {
    if (!record) return;

    const restoredRows = students.reduce((acc, student) => {
      const fromRecord = record.attendance.find((row) => row.id === student.id);
      const status = fromRecord?.status || STATUS.PRESENT;
      acc[student.id] = {
        status,
        showOD: false,
        comment: fromRecord?.comment || "",
        file: null,
        documentSent: false,
        mentorApproval: "Not Sent",
      };
      return acc;
    }, {});

    setRows(restoredRows);
    setClassInfo({
      department: record.context?.department || defaultTimetable.department,
      semester: record.context?.semester || defaultTimetable.semester,
      subject: record.context?.subject || defaultTimetable.subject,
      section: record.context?.section || defaultTimetable.section,
    });
    setSelectedFaculty(record.context?.faculty || facultyNames[0]);
    setCurrentRecordId(record.recordId || null);
    setIsSubmitted(true);
    goToMark();
    setMessage("Record opened in marking page.");
    setError("");
  };

  const deleteRecord = (recordId) => {
    if (!recordId) return;
    const next = attendanceRecords.filter((record) => record.recordId !== recordId);
    localStorage.setItem("attendance_records", JSON.stringify(next));
    setAttendanceRecords(next);
    setMessage("Attendance record deleted.");
    setError("");
  };

  const clearAllRecords = () => {
    localStorage.setItem("attendance_records", JSON.stringify([]));
    setAttendanceRecords([]);
    setMessage("All attendance records cleared.");
    setError("");
  };

  const statusPillClass = (status) => {
    if (status === STATUS.PRESENT) return "bg-green-500 text-white";
    if (status === STATUS.ABSENT) return "bg-red-500 text-white";
    if (status === STATUS.ON_DUTY) return "bg-na text-white";
    return "bg-red-500 text-white";
  };

  return (
    <main
      className="flex-1 overflow-y-auto p-6 pb-12"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#D1D5DB transparent" }}
    >
      {activeModule === "view" ? (
        <div style={{ maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[12px] text-text2">Student Attendance / View Attendance</p>
              <h1 className="text-[18px] font-bold text-text">Attendance View</h1>
            </div>
            <button
              onClick={goToMark}
              className="rounded-lg border border-border px-4 py-2 text-[13px] font-semibold text-text hover:bg-page-bg"
            >
              ← Back to Mark Attendance
            </button>
          </div>
          <AttendanceView
            records={attendanceRecords}
            onOpenRecord={openRecordInMarkingPage}
            onDeleteRecord={deleteRecord}
            onClearAll={clearAllRecords}
          />
        </div>
      ) : activeModule === "report" ? (
        <div style={{ maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[12px] text-text2">Student Attendance / View Report</p>
              <h1 className="text-[18px] font-bold text-text">Attendance Report</h1>
            </div>
            <button
              onClick={goToMark}
              className="rounded-lg border border-border px-4 py-2 text-[13px] font-semibold text-text hover:bg-page-bg"
            >
              ← Back to Mark Attendance
            </button>
          </div>
          <ReportGenerationView
            records={attendanceRecords}
            students={students}
            currentClassInfo={classInfo}
            currentTimetable={selectedTimetable}
            onOpenRecord={openRecordInMarkingPage}
            onGoToMark={goToMark}
            onGoToView={goToView}
          />
        </div>
      ) : (
        <div style={{ maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
          {/* Page header */}
          <div className="mb-4">
            <p className="text-[12px] text-text2 mb-1">Student Attendance / Mark Attendance</p>
            <h1 className="text-[20px] font-bold text-text">Mark Attendance</h1>
          </div>

          {/* Filter dropdowns */}
          <section className="mb-4 rounded-xl border border-border bg-white p-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              <select
                value={classInfo.department}
                className="rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] text-text"
                disabled
              >
                <option value="MCA">MCA-DET-CC</option>
              </select>

              <select
                value={classInfo.semester}
                onChange={(event) =>
                  setClassInfo((prev) => ({
                    ...prev,
                    semester: event.target.value,
                    subject: "",
                    section: "",
                  }))
                }
                className="rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] text-text outline-none focus:ring-2 focus:ring-[rgba(155,35,53,0.2)]"
                disabled={isEditLocked}
              >
                <option value="">Semester</option>
                {semesterOptions.map((semester) => (
                  <option key={semester} value={semester}>
                    Semester {semester}-2025
                  </option>
                ))}
              </select>

              <select
                value={classInfo.subject}
                onChange={(event) =>
                  setClassInfo((prev) => ({
                    ...prev,
                    subject: event.target.value,
                    section: "",
                  }))
                }
                className="rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] text-text outline-none focus:ring-2 focus:ring-[rgba(155,35,53,0.2)]"
                disabled={!classInfo.semester || isEditLocked}
              >
                <option value="">Course</option>
                {subjectOptions.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject} ({subject.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)})
                  </option>
                ))}
              </select>

              <select
                value={classInfo.section}
                onChange={(event) => setClassInfo((prev) => ({ ...prev, section: event.target.value }))}
                className="rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] text-text outline-none focus:ring-2 focus:ring-[rgba(155,35,53,0.2)]"
                disabled={!classInfo.subject || isEditLocked}
              >
                <option value="">Section</option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    MCA-{section}
                  </option>
                ))}
              </select>

              <select
                value={classType}
                onChange={(event) => setClassType(event.target.value)}
                className="rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] text-text outline-none focus:ring-2 focus:ring-[rgba(155,35,53,0.2)]"
              >
                <option value="Regular">Regular</option>
                <option value="Special">Special Class</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Online">Online</option>
              </select>

              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text2" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-[12.5px] text-text outline-none focus:ring-2 focus:ring-[rgba(155,35,53,0.2)]"
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-50">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by Name or USN"
                  className="w-full rounded-lg border border-border bg-page-bg py-2 pl-9 pr-3 text-[12.5px] text-text outline-none focus:border-[#9B2335] focus:ring-1 focus:ring-[#9B2335]"
                />
              </div>
              <span className="text-[12px] font-semibold text-red-600">Freezing On : {freezingDate}</span>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSyncModal(true)}
                  disabled={!isClassSelected}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw size={14} /> Sync meeting attendees
                </button>
                <button
                  type="button"
                  onClick={() => setShowMergeModal(true)}
                  disabled={!isClassSelected}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LayoutGrid size={14} /> Merge/Unmerge Courses
                </button>
                <button
                  type="button"
                  onClick={goToView}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#1d4ed8]"
                >
                  <Eye size={14} /> View Attendance
                </button>
                <button
                  type="button"
                  onClick={goToReport}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#1d4ed8]"
                >
                  <Eye size={14} /> View Report
                </button>
                <button
                  type="button"
                  onClick={openUploadPopup}
                  disabled={!isClassSelected}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Upload size={14} /> Upload
                </button>
              </div>
            </div>
          </section>

          {/* Context info & legend */}
          <section className="mb-4 rounded-xl border border-border bg-[#E8F4FD] p-4">
            <div className="mb-2 flex flex-wrap items-center gap-4 text-[11px]">
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-pink-400" /> Extra Curricular Course
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-orange-400" /> Co Curricular Course
              </span>
              <button type="button" className="text-[#2563EB] underline hover:no-underline">
                View Attendance Configuration
              </button>
            </div>
            <p className="mb-3 text-[12px] text-text2">
              <span className="font-semibold text-text">Selected Dropdown:</span> {selectionSummary}
            </p>
            <div className="rounded-lg border border-border bg-white p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text2">Indicator</p>
              <div className="flex flex-wrap gap-3 text-[11px]">
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-4 w-4 rounded bg-blue-500" /> Special Class
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-4 w-4 rounded bg-orange-400" /> Tutorial Class
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-4 w-4 rounded bg-pink-400" /> Online Class
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-green-600 text-[10px] text-white">✓</span> Present
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-red-600 text-[10px] text-white">✕</span> Absent
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-gray-600">NA</span>
                <span className="inline-flex items-center gap-1 font-semibold text-gray-600">OD</span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-4 w-4 rounded bg-gray-800" /> Attendance Marked
                </span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-text2">
              <CalendarClock size={12} />
              <span>{contextLabel}</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-900">
                Faculty: {selectedFaculty}
              </span>
            </div>
          </section>

            {error ? (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle size={16} /> {error}
              </div>
            ) : null}

            {message ? (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
                <FileCheck size={16} /> {message}
              </div>
            ) : null}

            {showUploadPopup ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6" onClick={closeUploadPopup}>
                <div
                  className="w-full max-w-4xl rounded-xl border border-gray-200 bg-white shadow-2xl"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-ink">Upload Attendance</h3>
                      <button onClick={closeUploadPopup} className="text-xl leading-none text-gray-500 hover:text-gray-800">
                        ×
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 px-4 py-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={uploadInputRef}
                        type="file"
                        accept=".xlsx"
                        className="min-w-62.5 flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-[#7B1D2E] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
                        onChange={handleUploadFileChange}
                        disabled={!isClassSelected || isEditLocked}
                      />
                      <input
                        type="text"
                        value={selectedUploadFile?.name || "No file selected"}
                        readOnly
                        className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600"
                      />
                    </div>

                    <p className="text-sm font-semibold text-gray-700">
                      NOTE: Template accepts only "P", "A", "-" values. Use dash (-) for OD.
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button
                        onClick={downloadTemplate}
                        className="inline-flex items-center gap-1 rounded px-3 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ background: BRAND_GRADIENT }}
                        disabled={!isClassSelected}
                      >
                        <Download size={16} /> Template
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={uploadSelectedTemplate}
                          className="inline-flex items-center gap-1 rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={!isClassSelected || isEditLocked}
                        >
                          <Upload size={16} /> Upload
                        </button>
                        <button
                          onClick={closeUploadPopup}
                          className="rounded bg-red-900 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {showSyncModal ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6" onClick={() => setShowSyncModal(false)}>
                <div
                  className="w-full max-w-lg rounded-xl border border-border bg-white shadow-2xl"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="border-b border-border px-4 py-3">
                    <h3 className="text-base font-semibold text-text">Sync Meeting Attendees</h3>
                    <p className="mt-1 text-[12px] text-text2">
                      Online class participants detected from the latest meeting session.
                    </p>
                  </div>
                  <div className="max-h-72 overflow-y-auto px-4 py-3">
                    {syncSelections.map((entry) => (
                      <label
                        key={entry.id}
                        className="mb-2 flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 hover:bg-page-bg"
                      >
                        <input
                          type="checkbox"
                          checked={entry.selected}
                          onChange={(event) =>
                            setSyncSelections((prev) =>
                              prev.map((row) =>
                                row.id === entry.id ? { ...row, selected: event.target.checked } : row
                              )
                            )
                          }
                        />
                        <div>
                          <p className="text-[13px] font-semibold text-text">{entry.name}</p>
                          <p className="text-[11px] text-text2">{entry.usn}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setShowSyncModal(false)}
                      className="rounded-lg border border-border px-4 py-2 text-[13px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={applySyncMeetingAttendees}
                      className="rounded-lg bg-[#2563EB] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1d4ed8]"
                    >
                      Mark Selected as Present
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {showMergeModal ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6" onClick={() => setShowMergeModal(false)}>
                <div
                  className="w-full max-w-md rounded-xl border border-border bg-white shadow-2xl"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="border-b border-border px-4 py-3">
                    <h3 className="text-base font-semibold text-text">Merge / Unmerge Course Sections</h3>
                    <p className="mt-1 text-[12px] text-text2">
                      Combine sections for joint attendance marking in this session.
                    </p>
                  </div>
                  <div className="space-y-2 px-4 py-4">
                    {sections.map((section) => {
                      const checked = mergedSections.includes(section);
                      return (
                        <label
                          key={section}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 hover:bg-page-bg"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              setMergedSections((prev) =>
                                event.target.checked
                                  ? [...prev, section]
                                  : prev.filter((item) => item !== section)
                              );
                            }}
                          />
                          <span className="text-[13px] font-medium text-text">
                            MCA-{section} · {classInfo.subject || "Selected course"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setMergedSections([]);
                        applyMergedSections([]);
                      }}
                      className="rounded-lg border border-border px-4 py-2 text-[13px]"
                    >
                      Unmerge All
                    </button>
                    <button
                      type="button"
                      onClick={() => applyMergedSections(mergedSections)}
                      className="rounded-lg bg-[#2563EB] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1d4ed8]"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <section className="overflow-hidden rounded-xl border border-border bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full text-[12.5px]">
                  <thead className="bg-[#FFF7ED]">
                    <tr>
                      <th className="px-3 py-3 text-left font-semibold text-text">Sl #</th>
                      <th className="px-3 py-3 text-left font-semibold text-text">USN / Candidate Id</th>
                      <th className="px-3 py-3 text-left font-semibold text-text">Student Name</th>
                      <th className="px-3 py-3 text-center font-semibold text-text">
                        Previous Class
                        <div className="text-[10px] font-normal text-text2">({previousClassDate})</div>
                      </th>
                      <th className="px-3 py-3 text-center font-semibold text-text">
                        <div className="flex items-center justify-center gap-2">
                          <span>
                            Period Number - 3
                            <div className="text-[10px] font-normal text-text2">
                              ({selectedTimetable?.slot || "10:50 AM - 11:40 AM"})
                            </div>
                          </span>
                          <button
                            onClick={flipMarkAll}
                            disabled={!isClassSelected || isEditLocked}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              markAllStatus === STATUS.PRESENT ? "bg-green-500 text-white" : "bg-red-500 text-white"
                            }`}
                          >
                            All {markAllStatus}
                          </button>
                        </div>
                        <div className="mt-1 text-[10px] font-normal text-text2">Mark Present / Absent / NA</div>
                      </th>
                      <th className="px-3 py-3 text-left font-semibold text-text">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => {
                      const row = rows[student.id] || {};
                      const status = row.status || STATUS.PRESENT;
                      const stats = attendanceStatsMap.get(student.id) || { attended: 0, total: 0, percentage: 0 };
                      const isLowAttendance = stats.total > 0 && stats.percentage < 75;

                      return (
                        <tr
                          key={student.id}
                          className={`border-t border-border ${
                            status === STATUS.ON_DUTY ? "bg-naSoft" : isLowAttendance ? "bg-red-50" : "bg-white"
                          }`}
                        >
                          <td className="px-3 py-3 text-text2">{index + 1}</td>
                          <td className="px-3 py-3 font-medium text-text">{student.usn}</td>
                          <td className="px-3 py-3 text-text">{student.name}</td>

                          <td className="px-3 py-3 text-center align-top">
                            {stats.total > 0 ? (
                              <div className="text-[11px] text-text2">
                                <div># of Periods Marked: {stats.total}</div>
                                <div className={isLowAttendance ? "font-semibold text-red-600" : "text-green-700"}>
                                  {stats.attended}/{stats.total} ({stats.percentage}%)
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-text2">—</span>
                            )}
                          </td>

                          <td className="px-3 py-3 text-center align-top">
                            <div className="mx-auto inline-flex rounded-full border border-gray-300 p-1">
                              <button
                                onClick={() => updateRow(student.id, STATUS.PRESENT)}
                                disabled={!isClassSelected || !isStudentEditEnabled(student.id)}
                                className={`rounded-full px-4 py-1 text-xs font-bold transition ${
                                  status === STATUS.PRESENT ? "bg-green-500 text-white" : "text-gray-600"
                                } disabled:cursor-not-allowed disabled:opacity-50`}
                              >
                                P
                              </button>
                              <button
                                onClick={() => updateRow(student.id, STATUS.ABSENT)}
                                disabled={!isClassSelected || !isStudentEditEnabled(student.id)}
                                className={`rounded-full px-4 py-1 text-xs font-bold transition ${
                                  status === STATUS.ABSENT ? "bg-red-500 text-white" : "text-gray-600"
                                } disabled:cursor-not-allowed disabled:opacity-50`}
                              >
                                A
                              </button>
                              <button
                                onClick={() => openOD(student.id)}
                                disabled={!isClassSelected || !isStudentEditEnabled(student.id)}
                                className={`rounded-full px-4 py-1 text-xs font-bold transition ${
                                  status === STATUS.ON_DUTY ? "bg-na text-white" : "text-gray-600"
                                } disabled:cursor-not-allowed disabled:opacity-50`}
                              >
                                OD
                              </button>
                            </div>

                            {stats.total > 0 ? (
                              <div className="mt-2 text-xs">
                                <div className={isLowAttendance ? "font-semibold text-red-700" : "text-gray-600"}>
                                  {stats.attended}/{stats.total} ({stats.percentage}%)
                                </div>
                                {isLowAttendance ? <div className="text-[11px] text-red-600">Below 75%</div> : null}
                              </div>
                            ) : null}

                            {row.showOD ? (
                              <div className="mx-auto mt-3 w-full max-w-xs rounded-lg border border-orange-200 bg-orange-50 p-3 text-left">
                                <p className="mb-2 text-xs font-semibold text-orange-900">OD reason / exception</p>

                                <input
                                  type="file"
                                  className="mb-2 block w-full text-xs file:mr-2 file:rounded file:border-0 file:bg-orange-200 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-orange-900"
                                  onChange={(event) =>
                                    setRows((prev) => ({
                                      ...prev,
                                      [student.id]: {
                                        ...prev[student.id],
                                        file: event.target.files?.[0] || null,
                                        documentSent: false,
                                        mentorApproval: "Not Sent",
                                      },
                                    }))
                                  }
                                  disabled={!isStudentEditEnabled(student.id)}
                                />
                                {row.file ? (
                                  <p className="mb-2 truncate text-[11px] text-orange-800">Selected: {row.file.name}</p>
                                ) : (
                                  <p className="mb-2 text-[11px] text-orange-700">No file chosen</p>
                                )}

                                <input
                                  type="text"
                                  value={row.comment || ""}
                                  onChange={(event) =>
                                    setRows((prev) => ({
                                      ...prev,
                                      [student.id]: {
                                        ...prev[student.id],
                                        comment: event.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="Comment is required"
                                  className="mb-2 w-full rounded border border-orange-300 px-2 py-1 text-xs"
                                  disabled={!isStudentEditEnabled(student.id)}
                                />

                                <div className="mb-2 rounded border border-orange-200 bg-white px-2 py-2 text-xs">
                                  <div className="mb-2 font-semibold text-orange-900">
                                    Mentor approval:{" "}
                                    <span
                                      className={
                                        row.mentorApproval === "Approved"
                                          ? "text-green-700"
                                          : row.mentorApproval === "Rejected"
                                            ? "text-red-700"
                                            : row.mentorApproval === "Approval Pending"
                                              ? "text-amber-700"
                                              : "text-gray-600"
                                      }
                                    >
                                      {row.mentorApproval || "Not Sent"}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => sendODDocument(student.id)}
                                    disabled={
                                      !isStudentEditEnabled(student.id) ||
                                      !row.file ||
                                      row.documentSent
                                    }
                                    className="rounded border border-orange-400 bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-900 hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {row.documentSent ? "Document Sent" : "Send Document to Mentor"}
                                  </button>
                                  {row.documentSent && row.mentorApproval === "Approval Pending" ? (
                                    <p className="mt-2 text-[10px] text-amber-800">
                                      Waiting for mentor review. Demo: simulate mentor response below.
                                    </p>
                                  ) : null}
                                  {row.documentSent && row.mentorApproval === "Approval Pending" ? (
                                    <div className="mt-2 flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setRows((prev) => ({
                                            ...prev,
                                            [student.id]: {
                                              ...prev[student.id],
                                              mentorApproval: "Approved",
                                            },
                                          }))
                                        }
                                        className="rounded border border-green-300 px-2 py-1 text-xs text-green-800 hover:bg-green-50"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setRows((prev) => ({
                                            ...prev,
                                            [student.id]: {
                                              ...prev[student.id],
                                              mentorApproval: "Rejected",
                                            },
                                          }))
                                        }
                                        className="rounded border border-red-300 px-2 py-1 text-xs text-red-800 hover:bg-red-50"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  ) : null}
                                </div>

                                <div className="flex justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => saveOD(student.id)}
                                    className="inline-flex items-center gap-1 rounded bg-na px-2 py-1 text-xs font-semibold maroon"
                                  >
                                    <Save size={12} /> Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => exitOD(student.id)}
                                    className="rounded border border-gray-300 px-2 py-1 text-xs"
                                  >
                                    Exit
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="flex min-w-65 flex-col items-start gap-2">
                              {status === STATUS.ON_DUTY ? (
                                <>
                                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusPillClass(status)}`}>
                                    OD
                                  </span>
                                  <input
                                    type="text"
                                    value={row.comment || ""}
                                    onChange={(event) =>
                                      setRows((prev) => ({
                                        ...prev,
                                        [student.id]: {
                                          ...prev[student.id],
                                          comment: event.target.value,
                                        },
                                      }))
                                    }
                                    placeholder="Add comment"
                                    className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                                    disabled={!isStudentEditEnabled(student.id)}
                                  />
                                  {row.file ? (
                                    <span className="max-w-full truncate text-xs text-gray-700">
                                      File: {row.file.name}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400">Attachment: none</span>
                                  )}
                                  <span className="text-xs text-gray-600">
                                    Document: {row.documentSent ? "Sent" : "Not sent"} | Mentor:{" "}
                                    {row.mentorApproval || "Not Sent"}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusPillClass(status)}`}>
                                    {status === STATUS.PRESENT ? "Present" : "Absent"}
                                  </span>
                                  <input
                                    type="text"
                                    value={row.comment || ""}
                                    onChange={(event) =>
                                      setRows((prev) => ({
                                        ...prev,
                                        [student.id]: {
                                          ...prev[student.id],
                                          comment: event.target.value,
                                        },
                                      }))
                                    }
                                    placeholder="Add remarks"
                                    className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                                    disabled={!isStudentEditEnabled(student.id)}
                                  />
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <footer className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                onClick={handleSubmit}
                disabled={!isClassSelected}
                className="rounded-lg px-6 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: BRAND_GRADIENT }}
              >
                {isSubmitted ? "Submitted" : "Submit Attendance"}
              </button>

              <button
                onClick={() => {
                  setRows(getInitialRows());
                  setMarkAllStatus(defaultMarkAllStatus);
                  setIsSubmitted(false);
                  setSelectedFaculty(facultyNames[0]);
                  setCurrentRecordId(null);
                  setSelectedUploadFile(null);
                  setError("");
                  setMessage("Form reset.");
                  setClassInfo({
                    department: defaultTimetable.department,
                    semester: defaultTimetable.semester,
                    subject: defaultTimetable.subject,
                    section: defaultTimetable.section,
                  });
                }}
                className="rounded-lg border border-gray-300 px-6 py-2 text-sm"
              >
                Back
              </button>
            </footer>

            {isSubmitted ? (
              <div className="mt-3 text-xs">
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-800">Attendance status: Submitted</div>
              </div>
            ) : null}
        </div>
      )}
    </main>
  );
}
