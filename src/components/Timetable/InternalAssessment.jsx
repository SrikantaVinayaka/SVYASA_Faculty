import { useState, useRef, useEffect } from "react";
import React from "react";
import {
  Plus,
  X,
  Pencil,
  Trash,
  Eye,
  Copy,
  ArrowLeft,
  FloppyDisk,
  ArrowCounterClockwise,
  CheckCircle,
  WarningCircle,
  CaretDown,
  UploadSimple,
  Download,
  ListBullets,
  SortAscending,
  Question,
  GearSix,
} from "@phosphor-icons/react";
import CKEditorComponent from "./CKEditorComponent";
import svyasaLogo from "../../assets/s-vyasa_logo.png";

// ─── Storage Keys & Helpers ───────────────────────────────────────────────────
const LS_ASSESSMENTS = "svyasa_ia_assessments";
const LS_QP = "svyasa_ia_question_papers";
const LS_QUESTIONS = "svyasa_ia_questions";
const LS_APP_STATE = "svyasa_ia_app_state";

function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const DUMMY_COURSES = [
  {
    id: "c1",
    label: "B.Tech-DET-CC-CSAIML,CSE(CY),CSIT",
    courseCode: "BTC5121",
    courseName: "PROBLEM SOLVING USING PROGRAMMING - I",
    degree: "B.Tech-DET-CC",
    deptSemSec:
      "B.Tech-DET-CC-CSIT-1(2025)-1BE01, B.Tech-DET-CC-CSAIML-1(2025)-1BE01, B.Tech-DET-CC-CSE(DS)-1(2025)-1BE01, B.Tech-DET-CC-CSE-1(2025)-1BE01, B.Tech-DET-CC-CSE(CY)-1(2025)-1BE01, B.Tech-DET-CC-CSSE-1(2025)-1BE01",
  },
  {
    id: "c2",
    label: "B.Tech-DET-CC-CSE,CSSE",
    courseCode: "BTC5122",
    courseName: "DATA STRUCTURES AND ALGORITHMS",
    degree: "B.Tech-DET-CC",
    deptSemSec:
      "B.Tech-DET-CC-CSE-1(2025)-1BE01, B.Tech-DET-CC-CSSE-1(2025)-1BE01",
  },
  {
    id: "c3",
    label: "B.Tech-DET-CC-CSAIML",
    courseCode: "BTC5123",
    courseName: "INTRODUCTION TO MACHINE LEARNING",
    degree: "B.Tech-DET-CC",
    deptSemSec: "B.Tech-DET-CC-CSAIML-1(2025)-1BE01",
  },
];
const DUMMY_MODULES = [
  "Module 1",
  "Module 2",
  "Module 3",
  "Module 4",
  "Module 5",
];
const DUMMY_UNITS = {
  "Module 1": ["Introduction to C", "Basics of Programming"],
  "Module 2": ["Control Statements and Loops", "Functions"],
  "Module 3": ["Arrays and Strings", "Pointers"],
  "Module 4": ["Structures and Unions", "File Handling"],
  "Module 5": ["Dynamic Memory", "Advanced Topics"],
};
const DUMMY_TOPICS = {
  "Introduction to C": [
    "Variables",
    "Constants",
    "Input/Output Statements in C",
    "Operators in C",
    "Type Conversion",
  ],
  "Basics of Programming": ["Algorithms", "Flowcharts", "Pseudocode"],
  "Control Statements and Loops": [
    "if-else",
    "switch",
    "for loop",
    "while loop",
    "do-while",
  ],
  Functions: ["Function Declaration", "Recursion", "Scope"],
  "Arrays and Strings": ["1D Arrays", "2D Arrays", "String Functions"],
  Pointers: ["Pointer Basics", "Pointer Arithmetic", "Pointer to Array"],
  "Structures and Unions": [
    "Defining Structures",
    "Nested Structures",
    "Unions",
  ],
  "File Handling": ["File Open/Close", "Read/Write", "File Modes"],
  "Dynamic Memory": ["malloc", "calloc", "free"],
  "Advanced Topics": ["Linked Lists", "Stacks", "Queues"],
};
const DUMMY_CO = ["CO 1", "CO 2", "CO 3", "CO 4", "CO 5"];
const DUMMY_PO = ["PO 1", "PO 2", "PO 3", "PO 4", "PO 5"];
const BLOOMS = [
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
  "Evaluate",
  "Create",
];
const ANSWER_TYPES = ["Descriptive", "Short Answer", "MCQ", "Diagram Based"];

// ─── 12-Hour Time Helpers ─────────────────────────────────────────────────────
function to24hr({ hour, minute, ampm }) {
  let h = parseInt(hour, 10);
  if (ampm === "AM" && h === 12) h = 0;
  if (ampm === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${minute}`;
}

function from24hr(str) {
  if (!str) return null;
  const [hStr, mStr] = str.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return { hour: String(h).padStart(2, "0"), minute: mStr || "00", ampm };
}

function defaultTimeObj(offsetMinutes = 0) {
  const now = new Date(Date.now() + offsetMinutes * 60000);
  let h = now.getHours();
  const m = now.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  const roundedM = Math.ceil(m / 5) * 5 >= 60 ? 0 : Math.ceil(m / 5) * 5;
  return {
    hour: String(h).padStart(2, "0"),
    minute: String(roundedM).padStart(2, "0"),
    ampm,
  };
}

function formatDate(val) {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Reusable UI Components ───────────────────────────────────────────────────
function Toast({ message, type = "success", onClose }) {
  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold
      ${type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}
    >
      {type === "success" ? (
        <CheckCircle size={18} weight="fill" className="text-green-600" />
      ) : (
        <WarningCircle size={18} weight="fill" className="text-red-600" />
      )}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-[14px] shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-[14px] font-bold text-text">{title}</h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-[13px] text-text2">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-page-bg border-t border-border">
          <BtnSecondary onClick={onCancel}>Cancel</BtnSecondary>
          <BtnDanger onClick={onConfirm} icon={<Trash size={13} />}>
            Delete
          </BtnDanger>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-widest text-text2 mb-1.5">
      {children}
      {required && <span className="text-[#9B2335] ml-0.5">*</span>}
    </label>
  );
}

function InputUnderline({ error, ...props }) {
  return (
    <div>
      <input
        {...props}
        className={`w-full border-b bg-transparent px-0 py-2.5 text-[13px] text-text outline-none transition ${error ? "border-red-500" : "border-border"} focus:border-[#9B2335]`}
      />
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

function SelectDropdown({ value, onChange, options, placeholder, error }) {
  return (
    <div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border-b bg-transparent px-0 py-2.5 text-[13px] text-text outline-none appearance-none transition ${error ? "border-red-500" : "border-border"} focus:border-[#9B2335]`}
        >
          <option value="">{placeholder || "Select..."}</option>
          {options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>
              {o.label ?? o}
            </option>
          ))}
        </select>
        <CaretDown
          size={13}
          className="pointer-events-none absolute right-0 top-3 text-text2"
        />
      </div>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

function MultiSelectCheckbox({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    function h(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between border-b border-border py-2.5 text-[13px] text-text bg-transparent outline-none"
      >
        <span className={selected.length ? "text-text" : "text-text2"}>
          {selected.length ? selected.join(", ") : label}
        </span>
        <CaretDown size={13} className="text-text2" />
      </button>
      {open && (
        <div className="absolute z-50 bottom-full mb-1 w-full bg-white border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {options.map((o) => (
            <label
              key={o}
              className="flex items-center gap-2.5 px-3 py-2 hover:bg-page-bg cursor-pointer text-[12.5px]"
            >
              <input
                type="checkbox"
                checked={selected.includes(o)}
                onChange={(e) =>
                  onChange(
                    e.target.checked
                      ? [...selected, o]
                      : selected.filter((x) => x !== o),
                  )
                }
                className="accent-[#9B2335]"
              />
              {o}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 12-Hour Time Input Component ────────────────────────────────────────────
function TimeInput12hr({ value, onChange, error }) {
  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const minutes = [
    "00","05","10","15","20","25","30","35","40","45","50","55",
  ];

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 border-b pb-2.5 pt-1 ${
          error ? "border-red-500" : "border-border"
        }`}
      >
        <div className="relative">
          <select
            value={value.hour}
            onChange={(e) => onChange({ ...value, hour: e.target.value })}
            className="bg-transparent text-[13px] text-text outline-none appearance-none pr-4 cursor-pointer"
          >
            {hours.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          <CaretDown size={11} className="pointer-events-none absolute right-0 top-1 text-text2" />
        </div>

        <span className="text-[13px] font-bold text-text2 select-none">:</span>

        <div className="relative">
          <select
            value={value.minute}
            onChange={(e) => onChange({ ...value, minute: e.target.value })}
            className="bg-transparent text-[13px] text-text outline-none appearance-none pr-4 cursor-pointer"
          >
            {minutes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <CaretDown size={11} className="pointer-events-none absolute right-0 top-1 text-text2" />
        </div>

        <span className="text-border select-none mx-0.5">|</span>

        <div className="relative">
          <select
            value={value.ampm}
            onChange={(e) => onChange({ ...value, ampm: e.target.value })}
            className="bg-transparent text-[12px] font-bold text-[#9B2335] outline-none appearance-none pr-4 cursor-pointer"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
          <CaretDown size={11} className="pointer-events-none absolute right-0 top-1 text-[#9B2335]" />
        </div>
      </div>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

function Modal({
  open,
  onClose,
  title,
  headerColor = "bg-[#9B2335]",
  headerText = "text-white",
  maxWidth = "max-w-xl",
  children,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className={`w-full ${maxWidth} bg-white rounded-[14px] shadow-2xl overflow-hidden`}>
        <div className={`flex items-center justify-between ${headerColor} px-6 py-4`}>
          <h3 className={`text-[14px] font-bold ${headerText}`}>{title}</h3>
          <button onClick={onClose} className={`${headerText} opacity-70 hover:opacity-100 transition`}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BtnPrimary({ children, onClick, type = "button", disabled, icon }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-bold text-white transition ${disabled ? "bg-slate-300 cursor-not-allowed" : "bg-[#9B2335] hover:bg-[#7A1A28]"}`}
    >
      {icon}
      {children}
    </button>
  );
}
function BtnSecondary({ children, onClick, type = "button", icon }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white text-[12.5px] font-bold text-text2 hover:text-text hover:bg-page-bg transition"
    >
      {icon}
      {children}
    </button>
  );
}
function BtnBlue({ children, onClick, type = "button", icon }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-bold text-white bg-sky-500 hover:bg-sky-600 transition"
    >
      {icon}
      {children}
    </button>
  );
}
function BtnDanger({ children, onClick, type = "button", icon }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-bold text-white bg-red-600 hover:bg-red-700 transition"
    >
      {icon}
      {children}
    </button>
  );
}

function InfoBar({ course, iaNumber }) {
  return (
    <div className="bg-[#9B2335] px-5 py-3 text-white text-[11.5px] leading-relaxed">
      <span className="font-bold">Course Code : {course.courseCode}</span>
      <span className="mx-3">|</span>
      <span>Course Name : {course.courseName}</span>
      <span className="mx-3">|</span>
      <span>Dept-Semester-Sec : {course.deptSemSec}</span>
      <span className="mx-3">|</span>
      <span>Degree : {course.degree}</span>
      <span className="mx-3">|</span>
      <span className="font-bold">IA-{iaNumber}</span>
    </div>
  );
}

// ─── CDN loader helper ───────────────────────────────────────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ─── Strip HTML tags to plain text ───────────────────────────────────────────
function stripHtml(html) {
  const d = document.createElement("div");
  d.innerHTML = html || "";
  return d.textContent || d.innerText || "";
}

// ─── Bloom's level → numeric RB-TL helper ────────────────────────────────────
function bloomsToLevel(label) {
  const idx = BLOOMS.indexOf(label);
  return idx >= 0 ? String(idx + 1) : "";
}

// ─── Arabic → Roman numeral helper ───────────────────────────────────────────
function toRoman(num) {
  const n = parseInt(num, 10);
  if (!n || n <= 0) return num || "";
  const romanMap = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let remaining = n;
  let result = "";
  for (const [value, symbol] of romanMap) {
    while (remaining >= value) { result += symbol; remaining -= value; }
  }
  return result;
}

function semesterToRoman(deptSemSec) {
  if (!deptSemSec) return "";
  const match = deptSemSec.match(/-(\d+)\(/);
  const num = match ? match[1] : deptSemSec.split("-")?.[4];
  return toRoman(num);
}

// ─── Indian Academic Year helper ─────────────────────────────────────────────
function getIndianAcademicYear(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = d.getMonth();
  const startYear = month >= 6 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

// ─── Compute "NQ x M = Total" summary ────────────────────────────────────────
function computePartSummary(rows) {
  if (!rows.length) return "";

  // Each qNum represents ONE question, even if it has OR alternatives
  // (e.g. 7a/7b are the same question slot, not two separate questions).
  // Keep only the first row seen per qNum for counting purposes.
  const seen = new Map();
  rows.forEach((r) => {
    if (!seen.has(r.qNum)) seen.set(r.qNum, r);
  });
  const uniqueRows = Array.from(seen.values());

  const counts = {};
  uniqueRows.forEach((r) => {
    const m = Number(r.totalMarks) || 0;
    counts[m] = (counts[m] || 0) + 1;
  });
  let modeMark = uniqueRows[0].totalMarks;
  let bestCount = -1;
  Object.entries(counts).forEach(([mark, count]) => {
    if (count > bestCount) { bestCount = count; modeMark = mark; }
  });
  const total = uniqueRows.reduce((sum, r) => sum + (Number(r.totalMarks) || 0), 0);
  const uniform = Object.keys(counts).length === 1;
  return uniform ? `${uniqueRows.length}Q x ${modeMark}M = ${total}` : `${uniqueRows.length}Q = ${total}M`;
}

// ─── Print View — A4 Paginated ────────────────────────────────────────────────
function QuestionPaperPrintView({ assessment, questionPaper, questions, onBack, isPreview }) {
  const course = assessment.course;
  const [downloading, setDownloading] = useState(null);

  // A4 at 96 dpi: 794 × 1123 px
  const A4_W = 794;
  const A4_H = 1123;
  const MARGIN = 28;

  // Height budget constants (px estimates)
  const HEADER_HEIGHT   = 345; // header block on page 1
  const PART_HEADER_H   = 52;  // "Part – X" + "Answer all questions" line
  const TABLE_HEADER_H  = 32;  // thead row
  const ROW_H           = 44;  // one question row (increase if questions are long)
  const OR_H            = 24;  // OR separator
  const BODY_PAD        = MARGIN * 2;

  const firstPageBodyH = A4_H - HEADER_HEIGHT - BODY_PAD;
  const fullPageBodyH  = A4_H - BODY_PAD;

  // ── Build flat row list ───────────────────────────────────────────────────
  const partOrder = [];
  const partMap   = {};

  questions.forEach((q, idx) => {
    const part = q.part || "A";
    if (!partMap[part]) { partMap[part] = []; partOrder.push(part); }
    const qNum = idx + 1;
    const subs = q.subQuestions || [];
    if (subs.length === 0) {
      partMap[part].push({ ...q, qNum, subLabel: "", isOr: false, isAlt: false });
    } else {
      partMap[part].push({ ...q, qNum, subLabel: "a", isOr: false, isAlt: true });
      subs.forEach((sq, sqIdx) => {
        partMap[part].push({ ...sq, qNum, subLabel: String.fromCharCode(98 + sqIdx), isOr: true, isAlt: true });
      });
    }
  });

  if (partOrder.length === 0 && questionPaper?.parts?.length > 0) {
    questionPaper.parts.forEach((p) => { partOrder.push(p.name); partMap[p.name] = []; });
  }

  const fileName = `IA-${assessment.assessmentNumber}_${course.courseCode}`;

  // ── Shared cell style helper ──────────────────────────────────────────────
  const cs = (extra = {}) => ({ border: "1px solid #555", padding: "5px 8px", ...extra });

  // ── Header component (rendered on page 1 only) ────────────────────────────
  function PaperHeader() {
    return (
      <div style={{ padding: `${MARGIN}px ${MARGIN}px 14px`, borderBottom: "2px solid #333" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "14px" }}>
          <img src={svyasaLogo} alt="S-VYASA Logo"
            style={{ width: "64px", height: "64px", objectFit: "cover", flexShrink: 0 }} />
          <div style={{ flex: 1, textAlign: "center", paddingRight: "64px" }}>
            <p style={{ fontSize: "20px", fontWeight: "bold", margin: 0, letterSpacing: "0.2px" }}>
              Swami Vivekananda Yoga AnusandhanaSamsthana (S-VYASA)
            </p>
            <p style={{ fontSize: "16px", fontWeight: "bold", margin: "4px 0 0" }}>
              Deemed to be University
            </p>
          </div>
        </div>

        {/* USN boxes */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
          <span style={{ fontSize: "12.5px", fontWeight: "600", marginRight: "4px" }}>USN</span>
          <div style={{ display: "flex", gap: "3px" }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ width: "22px", height: "24px", border: "1px solid #555" }} />
            ))}
          </div>
        </div>

        {/* Info table */}
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #555", fontSize: "12px" }}>
          <tbody>
            <tr>
              <td style={cs({ width: "20%", fontWeight: "600" })}>Examination</td>
              <td style={cs({ width: "30%" })}>Internal Assessment - {assessment.assessmentNumber}</td>
              <td style={cs({ width: "20%", fontWeight: "600" })}>Academic year</td>
              <td style={cs({ width: "30%" })}>{assessment.academicYear || getIndianAcademicYear(assessment.rawDate)}</td>
            </tr>
            <tr>
              <td style={cs({ fontWeight: "600" })}>Programme</td>
              <td style={cs()}>{course.degree}</td>
              <td style={cs({ fontWeight: "600" })}>Specialization</td>
              <td style={cs()}>{assessment.specialization || "All"}</td>
            </tr>
            <tr>
              <td style={cs({ fontWeight: "600" })}>Semester</td>
              <td style={cs()}>{semesterToRoman(course.deptSemSec)}</td>
              <td style={cs({ fontWeight: "600" })}>Date of Examination</td>
              <td style={cs()}>{assessment.dateLabel}</td>
            </tr>
            <tr>
              <td style={cs({ fontWeight: "600" })}>Course Code</td>
              <td style={cs()}>{course.courseCode}</td>
              <td style={cs({ fontWeight: "600" })}>Session</td>
              <td style={cs()}>{assessment.session || ""}</td>
            </tr>
            <tr>
              <td style={cs({ fontWeight: "600" })}>Course Name</td>
              <td colSpan={3} style={cs()}>{course.courseName}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginTop: "12px" }}>
          <p style={{ margin: 0, fontWeight: "600" }}>Maximum Duration: {assessment.timeRange}</p>
          <p style={{ margin: 0, fontWeight: "600" }}>Maximum Marks: {assessment.maxMarks}</p>
        </div>
      </div>
    );
  }

  // ── Build pagination items list ───────────────────────────────────────────
  // Each item has a type and an estimated height so we can paginate correctly.
  const allItems = [];
  partOrder.forEach((part) => {
    const rows = partMap[part] || [];
    allItems.push({ type: "partHeader", part, rows });
    allItems.push({ type: "tableHeader" });
    if (rows.length === 0) {
      allItems.push({ type: "emptyRow" });
    } else {
      rows.forEach((row) => {
        if (row.isOr) allItems.push({ type: "or" });
        allItems.push({ type: "row", data: row });
      });
    }
    allItems.push({ type: "tableClose", part });
  });

  function itemHeight(item) {
    switch (item.type) {
      case "partHeader":  return PART_HEADER_H;
      case "tableHeader": return TABLE_HEADER_H;
      case "or":          return OR_H;
      case "row":         return ROW_H;
      case "emptyRow":    return 40;
      case "tableClose":  return 0;
      default:            return 0;
    }
  }

  // Distribute items across pages
const pages = []; // [{ items, isFirst }]
let pageItems   = [];
let usedH       = 0;
let isFirstPage = true;
let availH      = firstPageBodyH;
let openTableHeader = null; // tracks the tableHeader for the table currently "open" across pages

allItems.forEach((item) => {
  const h = itemHeight(item);

  if (item.type === "tableHeader") {
    openTableHeader = item;
  }

  if (item.type === "tableClose") {
    // Always attach close marker to current page without consuming height
    pageItems.push(item);
    openTableHeader = null;
    return;
  }

  if (h > 0 && usedH + h > availH && pageItems.length > 0) {
    // Flush current page
    pages.push({ items: pageItems, isFirst: isFirstPage });
    pageItems   = [];
    usedH       = 0;
    isFirstPage = false;
    availH      = fullPageBodyH;

    // If we're breaking in the middle of an open table (header already
    // shown on the previous page), repeat the header on the new page so
    // rows have a table to render into.
    if (openTableHeader && item.type !== "tableHeader") {
      pageItems.push(openTableHeader);
      usedH += itemHeight(openTableHeader);
    }
  }

  pageItems.push(item);
  usedH += h;
});
if (pageItems.length > 0) pages.push({ items: pageItems, isFirst: isFirstPage });

  // ── Render body content for a single page ─────────────────────────────────
  function renderPageBody(pItems) {
    const elements = [];
    // Reconstruct part table groups from the flat item list
    let inTable    = false;
    let tableHead  = null;
    let tableBody  = [];
    let currentPart = null;
    let currentRows = [];

    const flushTable = (key) => {
      if (!inTable) return;
      elements.push(
        <table key={`tbl-${key}`} style={{
          width: "100%", borderCollapse: "collapse",
          border: "1px solid #555", fontSize: "12.5px", marginBottom: "6px",
        }}>
          {tableHead}
          <tbody>
            {tableBody.length === 0
              ? <tr><td colSpan={5} style={{ border: "1px solid #555", padding: "20px",
                  textAlign: "center", color: "#aaa", fontSize: "11px", fontStyle: "italic" }}>
                    No questions added for this part
                  </td></tr>
              : tableBody
            }
          </tbody>
        </table>
      );
      inTable    = false;
      tableHead  = null;
      tableBody  = [];
    };

    pItems.forEach((item, idx) => {
      if (item.type === "partHeader") {
        currentPart = item.part;
        currentRows = item.rows || [];
        const summary = computePartSummary(currentRows);
        elements.push(
          <div key={`ph-${item.part}-${idx}`}
            style={{ textAlign: "center", marginBottom: "2px", marginTop: idx > 0 ? "14px" : 0 }}>
            <p style={{ margin: 0, fontWeight: "bold", fontSize: "13.5px" }}>Part – {item.part}</p>
          </div>
        );
        elements.push(
          <div key={`pi-${item.part}-${idx}`}
            style={{ display: "flex", justifyContent: "space-between",
              alignItems: "baseline", marginBottom: "4px" }}>
            <p style={{ margin: 0, fontSize: "12px", fontStyle: "italic", textDecoration: "underline" }}>
              Answer all the questions
            </p>
            {summary && <p style={{ margin: 0, fontSize: "12px", fontWeight: "600" }}>{summary}</p>}
          </div>
        );

      } else if (item.type === "tableHeader") {
        inTable = true;
        tableHead = (
          <thead key="thead">
            <tr>
              {["Q.No", "Questions", "CO", "RB TL", "Marks"].map((h, i) => (
                <th key={i} style={{
                  border: "1px solid #555", padding: "6px 8px",
                  textAlign: i === 1 ? "left" : "center",
                  fontWeight: "600", fontSize: "12px", whiteSpace: "nowrap",
                  width: i === 0 ? "52px" : i === 2 ? "48px" : i === 3 ? "52px" : i === 4 ? "56px" : "auto",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        );

      } else if (item.type === "or") {
        tableBody.push(
          <tr key={`or-${idx}`}>
            <td colSpan={5} style={{ border: "1px solid #555", padding: "4px 0", textAlign: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "bold", color: "#444", letterSpacing: "1px" }}>OR</span>
            </td>
          </tr>
        );

      } else if (item.type === "row") {
        const row = item.data;
        tableBody.push(
          <tr key={`${row.id}-${idx}`}>
            <td style={{ border: "1px solid #555", padding: "7px 8px", textAlign: "center",
              fontWeight: "600", verticalAlign: "top" }}>
              {row.qNum}{row.isAlt ? row.subLabel : ""}.
            </td>
            <td style={{ border: "1px solid #555", padding: "7px 10px",
              verticalAlign: "top", lineHeight: "1.5" }}
              dangerouslySetInnerHTML={{ __html: row.question }} />
            <td style={{ border: "1px solid #555", padding: "7px 8px",
              textAlign: "center", verticalAlign: "top" }}>{row.co?.join(", ")}</td>
            <td style={{ border: "1px solid #555", padding: "7px 8px",
              textAlign: "center", verticalAlign: "top" }}>{bloomsToLevel(row.bloomsLevel)}</td>
            <td style={{ border: "1px solid #555", padding: "7px 8px",
              textAlign: "center", verticalAlign: "top" }}>{row.totalMarks}</td>
          </tr>
        );

      } else if (item.type === "emptyRow") {
        tableBody.push(
          <tr key={`empty-${idx}`}>
            <td colSpan={5} style={{ border: "1px solid #555", padding: "20px",
              textAlign: "center", color: "#aaa", fontSize: "11px", fontStyle: "italic" }}>
              No questions added for this part
            </td>
          </tr>
        );

      } else if (item.type === "tableClose") {
        flushTable(`${currentPart}-${idx}`);
      }
    });

    // Flush any open table at page end (page broke mid-part)
    flushTable("end");

    return elements;
  }

  // ── PDF download: one canvas per A4 page div ──────────────────────────────
  async function handleDownloadPDF() {
    setDownloading("pdf");
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");

      const { jsPDF } = window.jspdf;
      const pdf  = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      const pageEls = document.querySelectorAll(".a4-page");
      for (let i = 0; i < pageEls.length; i++) {
        const canvas = await window.html2canvas(pageEls[i], {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          width: A4_W,
          height: A4_H,
          windowWidth: A4_W,
        });
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pdfW, pdfH);
      }
      pdf.save(`${fileName}.pdf`);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("PDF download failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  }

  const noQuestions = partOrder.length === 0;

  return (
    <>
      {/* Print CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .a4-print-root, .a4-print-root * { visibility: visible !important; }
          .a4-print-root { position: absolute; left: 0; top: 0; }
          .a4-page { page-break-after: always; box-shadow: none !important; margin: 0 !important; }
          .a4-page:last-child { page-break-after: avoid; }
          .no-print { display: none !important; }
        }
        @page { size: A4 portrait; margin: 0; }
      `}</style>

      <div className="flex-1 overflow-y-auto bg-gray-100">
        {/* Toolbar */}
        <div className="no-print flex items-center justify-between px-4 py-3 border-b border-border bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2 text-[12px] text-text2">
            <span>Timetable</span><span>/</span>
            <span className="text-text font-semibold">Internal Assessment</span>
          </div>
          <div className="flex items-center gap-2">
            {!isPreview && (
              <button
                onClick={handleDownloadPDF}
                disabled={!!downloading}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-bold text-white transition
                  ${downloading === "pdf" ? "bg-red-300 cursor-wait" : "bg-red-600 hover:bg-red-700"}`}
              >
                <Download size={14} />
                {downloading === "pdf" ? "Generating PDF…" : "Download PDF"}
              </button>
            )}
            <button onClick={onBack}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#9B2335] hover:underline ml-2">
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        </div>

        {/* Pages */}
        <div className="a4-print-root py-8 flex flex-col items-center gap-6">
          {noQuestions ? (
            <div className="a4-page" style={{
              width: `${A4_W}px`, minHeight: `${A4_H}px`,
              background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
              fontFamily: "Times New Roman, serif", border: "1px solid #ccc", overflow: "hidden",
            }}>
              <PaperHeader />
              <div style={{ padding: `16px ${MARGIN}px` }}>
                <p style={{ textAlign: "center", color: "#999", fontSize: "13px", padding: "32px 0" }}>
                  No questions added yet.
                </p>
              </div>
            </div>
          ) : (
            pages.map((page, pageIdx) => (
              <div
                key={pageIdx}
                className="a4-page"
                style={{
                  width: `${A4_W}px`,
                  height: `${A4_H}px`,
                  background: "#fff",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
                  fontFamily: "Times New Roman, serif",
                  border: "1px solid #ccc",
                  overflow: "hidden",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                {/* Header on page 1 only */}
                {page.isFirst && <PaperHeader />}

                {/* Body */}
                <div style={{ padding: `${MARGIN}px ${MARGIN}px ${MARGIN}px` }}>
  {renderPageBody(page.items)}
</div>

                {/* Page number */}
                {pages.length > 1 && (
                  <div style={{
                    position: "absolute", bottom: "10px", right: `${MARGIN}px`,
                    fontSize: "10px", color: "#888", fontFamily: "Times New Roman, serif",
                  }}>
                    Page {pageIdx + 1} of {pages.length}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

// ─── Add / Edit Question Page ─────────────────────────────────────────────────
function AddQuestionPage({ assessment, questionPaper, onSave, onBack, editingQuestion, isSubQuestion, parentQuestion, subQuestionLabel }) {
  const course = assessment.course;
  const parts = questionPaper.parts || [];
  const isEditing = !!editingQuestion;

  const [module, setModule] = useState(editingQuestion?.module || "");
  const [unit, setUnit] = useState(editingQuestion?.unit || "");
  const [topics, setTopics] = useState(editingQuestion?.topics || []);
  const [question, setQuestion] = useState(editingQuestion?.question || "");
  const [co, setCo] = useState(editingQuestion?.co || []);
  const [po, setPo] = useState(editingQuestion?.po || []);
  const [bloomsLevel, setBloomsLevel] = useState(editingQuestion?.bloomsLevel || "");
  const [totalMarks, setTotalMarks] = useState(editingQuestion?.totalMarks || "");
  const [answerType, setAnswerType] = useState(editingQuestion?.answerType || "Descriptive");
  const [part, setPart] = useState(editingQuestion?.part || parentQuestion?.part || "");
  const [errors, setErrors] = useState({});

  const availableUnits = module ? DUMMY_UNITS[module] || [] : [];
  const availableTopics = unit ? DUMMY_TOPICS[unit] || [] : [];
  const partOptions =
    parts.length > 0
      ? parts.map((p) => ({ value: p.name, label: `Part ${p.name}` }))
      : [{ value: "A", label: "Part A" }, { value: "B", label: "Part B" }];

  function validate() {
    const e = {};
    if (!module) e.module = "Required";
    if (!unit) e.unit = "Required";
    if (!question || question === "<p></p>" || question === "<p><br></p>") e.question = "Question is required";
    if (!totalMarks) e.totalMarks = "Required";
    if (!part) e.part = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleReset() {
    if (isEditing) return;
    setModule(""); setUnit(""); setTopics([]); setQuestion(""); setCo([]); setPo([]);
    setBloomsLevel(""); setTotalMarks(""); setAnswerType(""); setPart(parentQuestion?.part || ""); setErrors({});
  }

  function handleSave() {
    if (!validate()) return;
    onSave({
      id: editingQuestion?.id || `q-${Date.now()}`,
      module, unit, topics, question, co, po, bloomsLevel,
      totalMarks: Number(totalMarks), answerType, part,
      questionType: editingQuestion?.questionType || "regular",
      subQuestions: editingQuestion?.subQuestions || [],
    });
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-white">
        <div className="flex items-center gap-2 text-[12px] text-text2">
          <span>Timetable</span><span>/</span>
          <span className="text-text font-semibold">INTERNAL</span>
          {isSubQuestion && (<><span>/</span><span className="text-[#9B2335] font-semibold">Sub Question {subQuestionLabel}</span></>)}
        </div>
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#9B2335] hover:underline">
          <ArrowLeft size={14} /> Back
        </button>
      </div>
      <InfoBar course={course} iaNumber={assessment.assessmentNumber} />
      <div className="p-5 space-y-5 max-w-4xl">
        {isSubQuestion && !isEditing && (
          <div className="bg-sky-50 border border-sky-200 text-sky-800 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold flex items-center gap-2">
            <Plus size={14} /> Adding Sub Question <span className="font-bold">{subQuestionLabel}</span> for Question above
          </div>
        )}
        {isEditing && !isSubQuestion && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold flex items-center gap-2">
            <Pencil size={14} /> Editing Question — make your changes and click Update
          </div>
        )}
        {isEditing && isSubQuestion && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold flex items-center gap-2">
            <Pencil size={14} /> Editing Sub Question <span className="font-bold">{subQuestionLabel}</span>
          </div>
        )}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <p className="text-[13px] font-bold text-text mb-4">Course Details</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <FieldLabel required>MODULE NAME</FieldLabel>
              <SelectDropdown value={module} onChange={(v) => { setModule(v); setUnit(""); setTopics([]); }} options={DUMMY_MODULES} placeholder="Select module" error={errors.module} />
            </div>
            <div>
              <FieldLabel required>UNIT</FieldLabel>
              <SelectDropdown value={unit} onChange={(v) => { setUnit(v); setTopics([]); }} options={availableUnits} placeholder="Select unit" error={errors.unit} />
            </div>
            <div>
              <FieldLabel>TOPIC</FieldLabel>
              <MultiSelectCheckbox label="Select topics" options={availableTopics} selected={topics} onChange={setTopics} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[14px] border border-border p-5">
          <FieldLabel required>Question</FieldLabel>
          <CKEditorComponent value={question} onChange={setQuestion} />
          {errors.question && <p className="text-[11px] text-red-600 mt-1">{errors.question}</p>}
        </div>
        <div className="bg-white rounded-[14px] border border-border p-5">
          <p className="text-[13px] font-bold text-text mb-4">Question Details</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <FieldLabel required>CO</FieldLabel>
              <MultiSelectCheckbox label="Select CO" options={DUMMY_CO} selected={co} onChange={setCo} />
            </div>
            <div>
              <FieldLabel required>PO</FieldLabel>
              <MultiSelectCheckbox label="Select PO" options={DUMMY_PO} selected={po} onChange={setPo} />
            </div>
            <div>
              <FieldLabel required>BLOOM'S LEVEL</FieldLabel>
              <SelectDropdown value={bloomsLevel} onChange={setBloomsLevel} options={BLOOMS} placeholder="Select level" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[14px] border border-border p-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <FieldLabel required>TOTAL MARKS</FieldLabel>
              <InputUnderline type="number" min={0} value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} placeholder="0" error={errors.totalMarks} />
            </div>
            <div>
              <FieldLabel required>ANSWER TYPE</FieldLabel>
              <SelectDropdown value={answerType} onChange={setAnswerType} options={ANSWER_TYPES} placeholder="Select type" />
            </div>
            <div>
              <FieldLabel required>PART</FieldLabel>
              <SelectDropdown value={part} onChange={setPart} options={partOptions} placeholder="Select part" error={errors.part} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pb-6">
          {!isEditing && (
            <BtnSecondary onClick={handleReset} icon={<ArrowCounterClockwise size={14} />}>Reset</BtnSecondary>
          )}
          <BtnPrimary onClick={handleSave} icon={<FloppyDisk size={14} />}>
            {isEditing ? "Update Question" : "Save"}
          </BtnPrimary>
        </div>
      </div>
    </div>
  );
}

// ─── Question Paper Detail Page ───────────────────────────────────────────────
function QuestionPaperDetailPage({
  assessment, questionPaper, questions, onBack, onAddQuestion, onAddSubQuestion,
  onEditQuestion, onEditSubQuestion, onDeleteQuestion, onDeleteSubQuestion,
  onSave, onSubmit, onDeleteQP, onEditQPSettings, onReorderQuestions,
  onUpdateAttemptSettings, onDownload, onPreview, toast, setToast,
}) {
  const course = assessment.course;
  const [actionsOpen, setActionsOpen] = useState(false);
  const [schemeModal, setSchemeModal] = useState(false);
  const [schemeFile, setSchemeFile] = useState(null);
  const [schemeFileName, setSchemeFileName] = useState(questionPaper.schemeFileName || "");
  const [questionTypeModal, setQuestionTypeModal] = useState(false);
  const [questionType, setQuestionType] = useState("regular");
  const [deleteQuestionId, setDeleteQuestionId] = useState(null);
  const [deleteSubQuestion, setDeleteSubQuestion] = useState(null);
  const [deleteQPConfirm, setDeleteQPConfirm] = useState(false);
  const [editQPSettingsModal, setEditQPSettingsModal] = useState(false);
  const [pendingSubParentId, setPendingSubParentId] = useState(null);
  const [reviewerFaculty, setReviewerFaculty] = useState([]);
  const [arrangeModal, setArrangeModal] = useState(false);
  const [arrangeList, setArrangeList] = useState([]);
  const [attemptModal, setAttemptModal] = useState(false);
  const [attemptValue, setAttemptValue] = useState("");

  const actionsRef = useRef();

  useEffect(() => {
    function h(e) {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) setActionsOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function handleSubmit() {
    const required = Number(questionPaper.totalQuestions) || 0;
    const actual = questions.length;
    if (required > 0 && actual < required) {
      setToast({ message: `Please add all ${required} questions before submitting. Only ${actual} question(s) added so far.`, type: "error" });
      return;
    }
    if (!schemeFile && !questionPaper.schemeFileName) {
      setToast({ message: "Error: Scheme of Evaluation is mandatory before submitting.", type: "error" });
      return;
    }
    onSubmit(schemeFileName || questionPaper.schemeFileName);
  }

  function handleSubQuestionClick(parentId) {
    onAddSubQuestion(parentId, "choice");
  }

  function handleAddQuestionClick() {
    const limit = Number(questionPaper.totalQuestions) || 0;
    if (limit <= 0) {
      setToast({
        message: '# of Questions to Attempt is 0. Please set it via Actions → "Questions to Attempt" before adding questions.',
        type: "error",
      });
      return;
    }
    if (questions.length >= limit) {
      setToast({
        message: `You've reached the limit of ${limit} question(s). Please update the limit in "Edit Paper Settings" under Actions to add more.`,
        type: "error",
      });
      return;
    }
    setPendingSubParentId(null);
    onAddQuestion("regular");
  }

  function handleOpenArrange() {
    setArrangeList(questions.map((q) => ({ ...q })));
    setArrangeModal(true);
  }

  function moveArrangeItem(index, direction) {
    setArrangeList((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSaveArrange() {
    onReorderQuestions(arrangeList);
    setArrangeModal(false);
  }

  function handleOpenAttempt() {
    setAttemptValue(String(questionPaper.totalQuestions ?? ""));
    setAttemptModal(true);
  }

  function handleSaveAttempt() {
    const val = Number(attemptValue);
    if (!attemptValue.trim() || isNaN(val) || val < 0) {
      setToast({ message: "Please enter a valid number of questions to attempt.", type: "error" });
      return;
    }
    onUpdateAttemptSettings(val);
    setAttemptModal(false);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-white">
        <div className="flex items-center gap-2 text-[12px] text-text2">
          <span>Timetable</span><span>/</span>
          <span className="text-text font-semibold">Internal Assessment</span>
        </div>
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#9B2335] hover:underline">
          <ArrowLeft size={14} /> Back
        </button>
      </div>
      <InfoBar course={course} iaNumber={assessment.assessmentNumber} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <p className="text-[12.5px] text-text2"><span className="font-semibold text-text">Modified By :</span> Dr. Sachin</p>
            <p className="text-[12.5px] text-text2"><span className="font-semibold text-text">Question Paper Status :</span> <span className="text-green-600 font-bold">{questionPaper.status}</span></p>
            <p className="text-[12.5px] text-text2"><span className="font-semibold text-text">Question Paper Type :</span> {questionPaper.paperType === "module-part-based" ? "Module And Part Based" : questionPaper.paperType}</p>
            <p className="text-[12.5px] text-text2"><span className="font-semibold text-text"># of Questions to Attempt :</span> {questionPaper.totalQuestions}</p>
          </div>
          <div className="flex items-center gap-2 relative">
            <BtnBlue onClick={handleAddQuestionClick} icon={<Question size={14} />}>Question</BtnBlue>
            <div ref={actionsRef} className="relative">
              <BtnBlue onClick={() => setActionsOpen((v) => !v)} icon={<GearSix size={14} />}>Actions <CaretDown size={12} /></BtnBlue>
              {actionsOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-border rounded-xl shadow-lg w-52 py-1">
                  {[
                    { label: "Edit Paper Settings", icon: <Pencil size={14} />, action: () => { setEditQPSettingsModal(true); setActionsOpen(false); } },
                    { label: "Arrange Questions", icon: <SortAscending size={14} />, disabled: questions.length === 0, action: () => { handleOpenArrange(); setActionsOpen(false); } },
                    { label: "Questions to Attempt", icon: <ListBullets size={14} />, action: () => { handleOpenAttempt(); setActionsOpen(false); } },
                    { label: "Scheme of Evaluation", icon: <UploadSimple size={14} />, action: () => { setSchemeModal(true); setActionsOpen(false); } },
                    { label: "Download Question Paper", icon: <Download size={14} />, disabled: questions.length === 0, action: () => { setActionsOpen(false); onDownload(); } },
                  ].map((item) => (
                    <button key={item.label} onClick={item.disabled ? undefined : item.action || (() => setActionsOpen(false))} disabled={item.disabled}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] transition ${item.disabled ? "text-text2 opacity-40 cursor-not-allowed" : "text-text hover:bg-page-bg"}`}>
                      <span className="text-[#9B2335]">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="bg-white rounded-[14px] border border-border py-20 text-center">
            <p className="text-[13px] font-medium text-text2">No questions were added, click on Question button to add the questions</p>
          </div>
        ) : (
          <div className="bg-white rounded-[14px] border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead className="bg-[#e8f4fc] border-b border-border">
                  <tr>
                    {["Sl. No", "Module", "Unit", "Topic", "Question", "Part", "Max Marks", "Choice With", "View", "CO", "PO", "RB TL", "Edit Q Type", "Edit", "Delete"].map((h) => (
                      <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold text-text2 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, idx) => {
                    const subs = q.subQuestions || [];
                    const hasSubQuestions = subs.length > 0;
                    const qNum = idx + 1;
                    const partConfig = (questionPaper.parts || []).find((p) => p.name === q.part);
                    const isChoicePart = partConfig && Number(partConfig.choiceBasedQuestions) > 0;

                    const orSeparator = (key) => (
                      <tr key={key} className="border-t border-border">
                        <td colSpan={15} className="py-1.5 text-center bg-slate-50">
                          <span className="inline-block text-[11px] font-bold text-text2 bg-white px-5 py-0.5 rounded-full border border-border shadow-sm">OR</span>
                        </td>
                      </tr>
                    );

                    const renderDataRow = (item, label, choiceWith, isParent) => (
                      <tr key={item.id} className="border-t border-border transition-colors bg-[#f0f8ff] hover:bg-[#e6f3fb]">
                        <td className="px-3 py-3 font-bold whitespace-nowrap text-[#9B2335] pl-8">{label}</td>
                        <td className="px-3 py-3 text-text2">{item.module}</td>
                        <td className="px-3 py-3 text-text2">{item.unit}</td>
                        <td className="px-3 py-3 text-text2 max-w-[100px]"><span className="line-clamp-2">{item.topics?.join(", ")}</span></td>
                        <td className="px-3 py-3 text-text max-w-[200px]">
                          <div className="border border-border rounded-lg p-2 bg-white max-h-16 overflow-y-auto text-[11.5px]" dangerouslySetInnerHTML={{ __html: item.question }} />
                        </td>
                        <td className="px-3 py-3 font-semibold text-text">{item.part}</td>
                        <td className="px-3 py-3 text-center">{item.totalMarks}</td>
                        <td className="px-3 py-3 text-center font-semibold text-[#9B2335]">{choiceWith}</td>
                        <td className="px-3 py-3">
                          <button className="w-8 h-5 rounded bg-sky-400 flex items-center justify-center"><Eye size={11} className="text-white" weight="fill" /></button>
                        </td>
                        <td className="px-3 py-3 text-text2">{item.co?.join(", ")}</td>
                        <td className="px-3 py-3 text-text2">{item.po?.join(", ")}</td>
                        <td className="px-3 py-3 text-text2 text-[11px]">{bloomsToLevel(item.bloomsLevel)}</td>
                        <td className="px-3 py-3"><button className="text-text2 hover:text-[#9B2335] transition" title="Edit Question Type"><Pencil size={13} /></button></td>
                        <td className="px-3 py-3">
                          <button onClick={() => isParent ? onEditQuestion(q) : onEditSubQuestion(q.id, item, label)} className="text-text2 hover:text-[#9B2335] transition" title="Edit"><Pencil size={13} /></button>
                        </td>
                        <td className="px-3 py-3">
                          <button onClick={() => isParent ? setDeleteQuestionId(q.id) : setDeleteSubQuestion({ parentId: q.id, subId: item.id })} className="text-text2 hover:text-red-600 transition" title="Delete"><Trash size={13} /></button>
                        </td>
                      </tr>
                    );

                    return (
                      <React.Fragment key={q.id}>
                        {!hasSubQuestions && (
                          <tr className="border-t border-border hover:bg-page-bg transition-colors">
                            <td className="px-3 py-3 font-bold text-text whitespace-nowrap">{qNum}</td>
                            <td className="px-3 py-3 text-text2">{q.module}</td>
                            <td className="px-3 py-3 text-text2">{q.unit}</td>
                            <td className="px-3 py-3 text-text2 max-w-[100px]"><span className="line-clamp-2">{q.topics?.join(", ")}</span></td>
                            <td className="px-3 py-3 text-text max-w-[200px]">
                              <div className="border border-border rounded-lg p-2 bg-white max-h-16 overflow-y-auto text-[11.5px]" dangerouslySetInnerHTML={{ __html: q.question }} />
                            </td>
                            <td className="px-3 py-3 font-semibold text-text">{q.part}</td>
                            <td className="px-3 py-3 text-center">{q.totalMarks}</td>
                            <td className="px-3 py-3 text-center font-semibold text-[#9B2335]">-</td>
                            <td className="px-3 py-3">
                              <button className="w-8 h-5 rounded bg-sky-400 flex items-center justify-center"><Eye size={11} className="text-white" weight="fill" /></button>
                            </td>
                            <td className="px-3 py-3 text-text2">{q.co?.join(", ")}</td>
                            <td className="px-3 py-3 text-text2">{q.po?.join(", ")}</td>
                            <td className="px-3 py-3 text-text2 text-[11px]">{bloomsToLevel(q.bloomsLevel)}</td>
                            <td className="px-3 py-3"><button className="text-text2 hover:text-[#9B2335] transition" title="Edit Question Type"><Pencil size={13} /></button></td>
                            <td className="px-3 py-3"><button onClick={() => onEditQuestion(q)} className="text-text2 hover:text-[#9B2335] transition" title="Edit"><Pencil size={13} /></button></td>
                            <td className="px-3 py-3"><button onClick={() => setDeleteQuestionId(q.id)} className="text-text2 hover:text-red-600 transition" title="Delete"><Trash size={13} /></button></td>
                          </tr>
                        )}
                        {hasSubQuestions && (
                          <>
                            <tr key={`${q.id}-header`} className="border-t border-border bg-white">
                              <td className="px-3 py-2 font-bold text-text">{qNum}</td>
                              <td colSpan={14} className="px-3 py-2 text-[11px] text-text2 italic">Choice based — attempt any one</td>
                            </tr>
                            {renderDataRow(q, `${qNum}a`, "-", true)}
                            {subs.map((sq, sqIdx) => (
                              <React.Fragment key={sq.id}>
                                {orSeparator(`${sq.id}-or`)}
                                {renderDataRow(sq, `${qNum}${String.fromCharCode(98 + sqIdx)}`, `${qNum}${String.fromCharCode(97 + sqIdx)}`, false)}
                              </React.Fragment>
                            ))}
                          </>
                        )}
                        {isChoicePart && (
                          <tr key={`${q.id}-sub`} className="border-t border-border bg-page-bg/30">
                            <td colSpan={15} className="px-3 py-2">
                              <button
                                onClick={() => handleSubQuestionClick(q.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-white text-[11px] font-semibold hover:bg-sky-600 transition"
                              >
                                <Plus size={11} /> Sub Question
                              </button>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(schemeFileName || questionPaper.schemeFileName) && (
          <div className="mt-4">
            <p className="text-[12px] font-semibold text-text2 mb-2">Attachment</p>
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-xl text-[12.5px] text-[#9B2335] font-semibold">
              <FloppyDisk size={14} /> {schemeFileName || questionPaper.schemeFileName}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="w-64">
            <MultiSelectCheckbox label="Select reviewer faculty" options={["Dr Y Mohamadi Begam", "Dr Karthiyayini", "Mr Hari Prasath"]} selected={reviewerFaculty} onChange={setReviewerFaculty} />
          </div>
          <div className="flex items-center gap-2">
            <BtnSecondary onClick={onSave} icon={<FloppyDisk size={14} />}>Save</BtnSecondary>
            <BtnSecondary onClick={onPreview} icon={<Eye size={14} />}>Preview</BtnSecondary>
            <BtnBlue onClick={handleSubmit} icon={<CheckCircle size={14} />}>Submit</BtnBlue>
            <BtnDanger onClick={() => setDeleteQPConfirm(true)} icon={<Trash size={14} />}>Delete</BtnDanger>
          </div>
        </div>
      </div>

      <Modal open={questionTypeModal} onClose={() => setQuestionTypeModal(false)} title="Type of Question to Add" maxWidth="max-w-sm" headerColor="bg-[#9B2335]">
        <div className="px-6 py-5 space-y-3">
          {["regular", "choice"].map((t) => (
            <label key={t} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-border hover:bg-page-bg transition">
              <input type="radio" name="qtype" value={t} checked={questionType === t} onChange={() => setQuestionType(t)} className="accent-[#9B2335]" />
              <span className="text-[13px] font-semibold text-text">{t === "regular" ? "Regular Question" : "Choice Based Question"}</span>
            </label>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 px-6 pb-5">
          <BtnSecondary onClick={() => { setQuestionTypeModal(false); setPendingSubParentId(null); }} icon={<X size={13} />}>Cancel</BtnSecondary>
          <BtnPrimary onClick={() => { setQuestionTypeModal(false); if (pendingSubParentId) { onAddSubQuestion(pendingSubParentId, questionType); setPendingSubParentId(null); } else { onAddQuestion(questionType); } }} icon={<CheckCircle size={13} />}>OK</BtnPrimary>
        </div>
      </Modal>

      <Modal open={schemeModal} onClose={() => setSchemeModal(false)} title="Scheme of Evaluation" maxWidth="max-w-sm" headerColor="bg-[#9B2335]">
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-2">
            <input type="text" readOnly value={schemeFileName} placeholder="No file chosen" className="flex-1 border border-border rounded-xl px-3 py-2 text-[12.5px] text-text2 bg-page-bg outline-none" />
            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500 text-white text-[12.5px] font-semibold cursor-pointer hover:bg-sky-600 transition">
              <UploadSimple size={14} /> Browse
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setSchemeFile(f); setSchemeFileName(f.name); } }} />
            </label>
          </div>
          <div className="flex items-center justify-end gap-2">
            <BtnSecondary onClick={() => setSchemeModal(false)} icon={<X size={13} />}>Cancel</BtnSecondary>
            <BtnPrimary onClick={() => { if (schemeFile) setSchemeModal(false); }} icon={<UploadSimple size={13} />}>Upload</BtnPrimary>
          </div>
        </div>
      </Modal>

      <Modal open={arrangeModal} onClose={() => setArrangeModal(false)} title="Arrange Questions" maxWidth="max-w-lg" headerColor="bg-[#9B2335]">
        <div className="px-6 py-5">
          {arrangeList.length === 0 ? (
            <p className="text-[13px] text-text2 text-center py-6">No questions to arrange.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {arrangeList.map((q, idx) => (
                <div key={q.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-page-bg">
                  <span className="w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center text-[11px] font-bold text-[#9B2335] shrink-0">{idx + 1}</span>
                  <div className="flex-1 text-[12px] text-text line-clamp-1" dangerouslySetInnerHTML={{ __html: stripHtml(q.question) }} />
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => moveArrangeItem(idx, -1)} disabled={idx === 0} className={`w-7 h-7 rounded-lg border border-border flex items-center justify-center transition ${idx === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-white hover:border-[#9B2335] text-text2 hover:text-[#9B2335]"}`} title="Move up">↑</button>
                    <button type="button" onClick={() => moveArrangeItem(idx, 1)} disabled={idx === arrangeList.length - 1} className={`w-7 h-7 rounded-lg border border-border flex items-center justify-center transition ${idx === arrangeList.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-white hover:border-[#9B2335] text-text2 hover:text-[#9B2335]"}`} title="Move down">↓</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 pb-5">
          <BtnSecondary onClick={() => setArrangeModal(false)} icon={<X size={13} />}>Cancel</BtnSecondary>
          <BtnPrimary onClick={handleSaveArrange} icon={<FloppyDisk size={13} />} disabled={arrangeList.length === 0}>Save Order</BtnPrimary>
        </div>
      </Modal>

      <Modal open={attemptModal} onClose={() => setAttemptModal(false)} title="Questions to Attempt" maxWidth="max-w-sm" headerColor="bg-[#9B2335]">
        <div className="px-6 py-5">
          <FieldLabel required>Total number of questions to attempt</FieldLabel>
          <InputUnderline type="number" min={0} value={attemptValue} onChange={(e) => setAttemptValue(e.target.value)} placeholder="0" />
          <p className="mt-2 text-[11.5px] text-text2">Currently {questions.length} question(s) added to this paper.</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 pb-5">
          <BtnSecondary onClick={() => setAttemptModal(false)} icon={<X size={13} />}>Cancel</BtnSecondary>
          <BtnPrimary onClick={handleSaveAttempt} icon={<FloppyDisk size={13} />}>Save</BtnPrimary>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteQuestionId} title="Delete Question" message="Are you sure you want to delete this question? All sub questions will also be deleted. This cannot be undone." onConfirm={() => { onDeleteQuestion(deleteQuestionId); setDeleteQuestionId(null); }} onCancel={() => setDeleteQuestionId(null)} />
      <ConfirmDialog open={!!deleteSubQuestion} title="Delete Sub Question" message="Are you sure you want to delete this sub question? This cannot be undone." onConfirm={() => { onDeleteSubQuestion(deleteSubQuestion.parentId, deleteSubQuestion.subId); setDeleteSubQuestion(null); }} onCancel={() => setDeleteSubQuestion(null)} />
      <QuestionPaperTypeModal open={editQPSettingsModal} onClose={() => setEditQPSettingsModal(false)} onSave={(data) => { setEditQPSettingsModal(false); onEditQPSettings(data); }} initialData={questionPaper} assessment={assessment} />
      <ConfirmDialog open={deleteQPConfirm} title="Delete Question Paper" message="Are you sure you want to delete this entire question paper? All questions and sub-questions will be permanently deleted. This cannot be undone." onConfirm={() => { setDeleteQPConfirm(false); onDeleteQP(); }} onCancel={() => setDeleteQPConfirm(false)} />
    </div>
  );
}

// ─── Question Paper Type Modal ────────────────────────────────────────────────
function QuestionPaperTypeModal({ open, onClose, onSave, initialData, assessment }) {
  const [paperType, setPaperType] = useState(initialData?.paperType || "regular");
  const [numParts, setNumParts] = useState(initialData?.numParts || "");
  const [customPartName, setCustomPartName] = useState(initialData?.customPartName || "no");
  const [parts, setParts] = useState(initialData?.parts || []);
  const [manualTotal, setManualTotal] = useState(initialData?.totalQuestions || "");
  const [instructions, setInstructions] = useState(initialData?.instructions || "");

  const autoTotal = parts.reduce((sum, p) => sum + (parseInt(p.choiceBasedQuestions) || 0) + (parseInt(p.regularQuestions) || 0), 0);
  const showPartConfig = paperType === "part-based" || paperType === "module-part-based";
  const totalQuestions = showPartConfig && parts.length > 0 ? autoTotal : Number(manualTotal) || 0;

  function handleNumPartsChange(val) {
    setNumParts(val);
    const n = parseInt(val);
    if (!isNaN(n) && n > 0) {
      setParts(Array.from({ length: n }, (_, i) => ({ id: i, name: String.fromCharCode(65 + i), addSubParts: "no", choiceBasedQuestions: "", regularQuestions: "" })));
    } else setParts([]);
  }

  function handlePartChange(id, field, value) {
    setParts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }

  function handleReset() {
    setPaperType("regular"); setNumParts(""); setCustomPartName("no");
    setParts([]); setManualTotal(""); setInstructions("");
  }

  const derivedAcademicYear = assessment?.academicYear || getIndianAcademicYear(assessment?.rawDate) || "—";
  const derivedSpecialization = assessment?.specialization || "All";
  const derivedSession = assessment?.session || "—";

  return (
    <Modal open={open} onClose={onClose} title="Question Paper Type" maxWidth="max-w-2xl" headerColor="bg-[#9B2335]">
      <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-3 gap-4 bg-page-bg rounded-[14px] border border-border p-4">
          <div>
            <FieldLabel>Academic Year</FieldLabel>
            <p className="text-[13px] font-semibold text-text py-2 border-b border-border">{derivedAcademicYear}</p>
          </div>
          <div>
            <FieldLabel>Specialization</FieldLabel>
            <p className="text-[13px] font-semibold text-text py-2 border-b border-border">{derivedSpecialization}</p>
          </div>
          <div>
            <FieldLabel>Session</FieldLabel>
            <p className="text-[13px] font-semibold text-text py-2 border-b border-border">{derivedSession}</p>
          </div>
        </div>

        <div>
          <p className="text-[12.5px] font-semibold text-text mb-3">Select question paper type <span className="text-red-500">*</span></p>
          <div className="flex flex-wrap gap-4">
            {[{ value: "regular", label: "Regular" }, { value: "part-based", label: "Part Based" }, { value: "module-based", label: "Module Based" }, { value: "module-part-based", label: "Module and Part based" }].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="paperType" value={opt.value} checked={paperType === opt.value} onChange={() => setPaperType(opt.value)} className="accent-[#9B2335]" />
                <span className="text-[13px] text-text">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {showPartConfig && (
          <>
            <div className="grid grid-cols-2 gap-6 items-start">
              <div>
                <FieldLabel required>Enter # of parts to be created</FieldLabel>
                <InputUnderline type="number" min={1} value={numParts} onChange={(e) => handleNumPartsChange(e.target.value)} placeholder="0" />
              </div>
              <div>
                <p className="text-[12.5px] font-semibold text-text mb-2">Would you like to give custom name for parts?</p>
                <div className="flex gap-4">
                  {["yes", "no"].map((v) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="customPart" value={v} checked={customPartName === v} onChange={() => setCustomPartName(v)} className="accent-[#9B2335]" />
                      <span className="text-[13px] text-text capitalize">{v}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {parts.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {parts.map((p) => (
                  <div key={p.id} className="border border-border rounded-[14px] p-4 space-y-3 bg-page-bg">
                    <p className="text-[12.5px] font-bold text-text">Part - {p.name}</p>
                    <div>
                      <p className="text-[12px] font-semibold text-text2 mb-2">Would you like to add sub parts?</p>
                      <div className="flex gap-4">
                        {["yes", "no"].map((v) => (
                          <label key={v} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name={`subparts-${p.id}`} value={v} checked={p.addSubParts === v} onChange={() => handlePartChange(p.id, "addSubParts", v)} className="accent-[#9B2335]" />
                            <span className="text-[12.5px] text-text capitalize">{v}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <FieldLabel required>Enter # of choice based questions to attend in part {p.name}</FieldLabel>
                      <InputUnderline type="number" min={0} value={p.choiceBasedQuestions} onChange={(e) => handlePartChange(p.id, "choiceBasedQuestions", e.target.value)} placeholder="0" />
                    </div>
                    <div>
                      <FieldLabel required>Enter # of regular questions to attend in part {p.name}</FieldLabel>
                      <InputUnderline type="number" min={0} value={p.regularQuestions} onChange={(e) => handlePartChange(p.id, "regularQuestions", e.target.value)} placeholder="0" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div>
          <FieldLabel required>Total number of Questions to attempt</FieldLabel>
          {showPartConfig && parts.length > 0 ? (
            <div className="relative">
              <input type="number" readOnly value={autoTotal} className="w-full border-b border-border bg-transparent px-0 py-2.5 text-[13px] font-semibold text-text outline-none cursor-not-allowed" />
              <span className="absolute right-0 top-2.5 text-[11px] text-text2 italic bg-white pl-1">auto-calculated</span>
            </div>
          ) : (
            <InputUnderline type="number" min={0} value={manualTotal} onChange={(e) => setManualTotal(e.target.value)} placeholder="0" />
          )}
        </div>

        <div>
          <FieldLabel>Instructions</FieldLabel>
          <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={5} placeholder="Enter instructions for students..." className="w-full border border-border rounded-xl px-3 py-2.5 text-[13px] text-text outline-none resize-none focus:border-[#9B2335] transition" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-page-bg">
        <BtnSecondary onClick={handleReset} icon={<ArrowCounterClockwise size={13} />}>Reset</BtnSecondary>
        <BtnPrimary onClick={() => onSave({ paperType, numParts, customPartName, parts, totalQuestions, instructions })} icon={<FloppyDisk size={13} />}>Save</BtnPrimary>
      </div>
    </Modal>
  );
}

// ─── Add / Edit IA Modal ──────────────────────────────────────────────────────
function AddIAModal({ open, onClose, onSave, editingIA, assessments }) {
  const isEditing = !!editingIA;

  const emptyForm = () => ({
    courseSections: "",
    assessmentNumber: "",
    date: "",
    startTime: defaultTimeObj(),
    endTime: defaultTimeObj(60),
  });

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm({
        courseSections: editingIA?.course?.id || "",
        assessmentNumber: editingIA?.assessmentNumber || "",
        date: editingIA?.rawDate || "",
        startTime: editingIA?.startTime ? from24hr(editingIA.startTime) || defaultTimeObj() : defaultTimeObj(),
        endTime: editingIA?.endTime ? from24hr(editingIA.endTime) || defaultTimeObj(60) : defaultTimeObj(60),
      });
      setErrors({});
    }
  }, [open, editingIA]);

  function handleChange(key, val) {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  }

  function validate() {
    const e = {};

    if (!form.courseSections) e.courseSections = "Course and section are required.";

    if (!String(form.assessmentNumber).trim())
      e.assessmentNumber = "Assessment number is required.";
    else if (![1, 2, 3].includes(Number(form.assessmentNumber)))
      e.assessmentNumber = "Assessment number must be 1, 2, or 3.";

    if (!e.assessmentNumber && form.courseSections) {
      const num = Number(form.assessmentNumber);
      const existingNums = assessments
        .filter((a) => a.course?.id === form.courseSections && a.id !== editingIA?.id)
        .map((a) => Number(a.assessmentNumber));
      for (let i = 1; i < num; i++) {
        if (!existingNums.includes(i)) {
          e.assessmentNumber = `IA-${i} doesn't exist yet for this course-section. Please create IA-${i} before IA-${num}.`;
          break;
        }
      }
    }

    if (!form.date) e.date = "Date is required.";
    else if (!isEditing || form.date !== editingIA?.rawDate) {
      const todayStr = new Date().toISOString().split("T")[0];
      if (form.date < todayStr) e.date = "Date cannot be in the past.";
    }

    const start24 = to24hr(form.startTime);
    const end24 = to24hr(form.endTime);
    if (start24 >= end24) e.endTime = "End time must be after start time.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const course = DUMMY_COURSES.find((c) => c.id === form.courseSections);
    const start24 = to24hr(form.startTime);
    const end24 = to24hr(form.endTime);
    const startLabel = `${form.startTime.hour}:${form.startTime.minute} ${form.startTime.ampm}`;
    const endLabel = `${form.endTime.hour}:${form.endTime.minute} ${form.endTime.ampm}`;

    const derivedAcademicYear = getIndianAcademicYear(form.date);
    const startHour24 = parseInt(start24.split(":")[0], 10);
    const derivedSession = startHour24 < 12 ? "FN" : "AN";
    const derivedSpecialization = "All";

    onSave({
      id: editingIA?.id || `ia-${Date.now()}`,
      assessmentNumber: form.assessmentNumber,
      rawDate: form.date,
      dateLabel: formatDate(form.date),
      startTime: start24,
      endTime: end24,
      timeRange: `${startLabel} - ${endLabel}`,
      course,
      maxMarks: editingIA?.maxMarks || 30,
      status: editingIA?.status || "Pending",
      createdBy: editingIA?.createdBy || "Mr Hari Prasath",
      questionPaperStatus: editingIA?.questionPaperStatus || "not-set",
      academicYear: derivedAcademicYear,
      specialization: derivedSpecialization,
      session: derivedSession,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Internal Assessment" : "Add Internal Assessment"}
      headerColor="bg-white border-b border-border"
      headerText="text-text"
    >
      <form onSubmit={handleSubmit} className="px-6 py-5">
        {isEditing && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold flex items-center gap-2">
            <Pencil size={14} /> Editing Assessment
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <div>
            <FieldLabel required>Courses-Sections</FieldLabel>
            <SelectDropdown
              value={form.courseSections}
              onChange={(v) => handleChange("courseSections", v)}
              options={DUMMY_COURSES.map((c) => ({ value: c.id, label: c.label }))}
              placeholder="Select course-section"
              error={errors.courseSections}
            />
          </div>

          <div>
            <FieldLabel required>Internal Assessment Number</FieldLabel>
            <InputUnderline
              type="number"
              min={1}
              max={3}
              value={form.assessmentNumber}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || (Number(val) >= 1 && Number(val) <= 3)) handleChange("assessmentNumber", val);
              }}
              placeholder="1, 2 or 3"
              error={errors.assessmentNumber}
            />
          </div>

          <div>
            <FieldLabel required>Date</FieldLabel>
            <InputUnderline
              type="date"
              value={form.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => handleChange("date", e.target.value)}
              error={errors.date}
            />
          </div>

          <div>
            <FieldLabel required>Start Time</FieldLabel>
            <TimeInput12hr value={form.startTime} onChange={(v) => handleChange("startTime", v)} error={errors.startTime} />
          </div>

          <div>
            <FieldLabel required>End Time</FieldLabel>
            <TimeInput12hr value={form.endTime} onChange={(v) => handleChange("endTime", v)} error={errors.endTime} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <BtnSecondary type="button" onClick={() => setForm(emptyForm())} icon={<ArrowCounterClockwise size={13} />}>
            Reset
          </BtnSecondary>
          <BtnPrimary type="submit" icon={<FloppyDisk size={13} />}>
            {isEditing ? "Update" : "Save"}
          </BtnPrimary>
        </div>
      </form>
    </Modal>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function InternalAssessment() {
  const [assessments, setAssessments] = useState(() => lsGet(LS_ASSESSMENTS, []));
  const [questionPapers, setQuestionPapers] = useState(() => lsGet(LS_QP, {}));
  const [questions, setQuestions] = useState(() => lsGet(LS_QUESTIONS, {}));

  const savedNav = lsGet(LS_APP_STATE, {});
  const [view, setView] = useState("list");
  const [activeAssessmentId, setActiveAssessmentId] = useState(savedNav.activeAssessmentId || null);
  const [activeTab, setActiveTab] = useState(savedNav.activeTab || null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [subQuestionContext, setSubQuestionContext] = useState(null);
  const [addIAModal, setAddIAModal] = useState(false);
  const [editingIA, setEditingIA] = useState(null);
  const [existingPaperModal, setExistingPaperModal] = useState(false);
  const [qpTypeModal, setQpTypeModal] = useState(false);
  const [deleteIAId, setDeleteIAId] = useState(null);
  const [toast, setToast] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [archiveModal, setArchiveModal] = useState(false);
  const [cloneSourceModal, setCloneSourceModal] = useState(false);

  useEffect(() => { lsSet(LS_ASSESSMENTS, assessments); }, [assessments]);
  useEffect(() => { lsSet(LS_QP, questionPapers); }, [questionPapers]);
  useEffect(() => { lsSet(LS_QUESTIONS, questions); }, [questions]);
  useEffect(() => { lsSet(LS_APP_STATE, { view: "list", activeAssessmentId, activeTab }); }, [view, activeAssessmentId, activeTab]);

  const activeAssessment = assessments.find((a) => a.id === activeAssessmentId);
  const activeQP = activeAssessmentId ? questionPapers[activeAssessmentId] : null;
  const activeQuestions = activeAssessmentId ? questions[activeAssessmentId] || [] : [];
  const editingQuestion = editingQuestionId ? activeQuestions.find((q) => q.id === editingQuestionId) : null;
  const editingSubQuestion =
    subQuestionContext?.subId && subQuestionContext?.parentId
      ? activeQuestions.find((q) => q.id === subQuestionContext.parentId)?.subQuestions?.find((sq) => sq.id === subQuestionContext.subId)
      : null;

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  function navigate(newView, assessmentId) {
    setView(newView);
    if (assessmentId !== undefined) setActiveAssessmentId(assessmentId);
  }

  function handleSaveIA(ia) {
    const isNew = !assessments.find((a) => a.id === ia.id);
    if (isNew) {
      const isDuplicate = assessments.find(
        (a) => a.assessmentNumber === ia.assessmentNumber && a.course?.id === ia.course?.id
      );
      if (isDuplicate) {
        showToast(`Internal Assessment ${ia.assessmentNumber} already exists for this course!`, "error");
        return;
      }
    }
    setAssessments((prev) => isNew ? [ia, ...prev] : prev.map((a) => (a.id === ia.id ? ia : a)));
    setActiveTab(ia.id);
    setAddIAModal(false);
    setEditingIA(null);
    showToast(isNew ? "Success! Internal added" : "Assessment updated successfully!");
  }

  function handleEditIA(ia) {
    setEditingIA(ia);
    setAddIAModal(true);
  }

  function handleDeleteIA(id) {
    setAssessments((prev) => prev.filter((a) => a.id !== id));
    setQuestionPapers((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setQuestions((prev) => { const n = { ...prev }; delete n[id]; return n; });
    if (activeTab === id) {
      const remaining = assessments.filter((a) => a.id !== id);
      setActiveTab(remaining.length > 0 ? remaining[0].id : null);
    }
    setDeleteIAId(null);
    showToast("Assessment deleted.");
  }

  function handleSetQP(assessmentId) {
    setActiveAssessmentId(assessmentId);
    setExistingPaperModal(true);
  }

  function handleCreateQP() {
    setExistingPaperModal(false);
    setQpTypeModal(true);
  }

  function handleOpenClonePicker() {
    setExistingPaperModal(false);
    setCloneSourceModal(true);
  }

  function handleConfirmClone(sourceAssessmentId) {
    const sourcePaper = questionPapers[sourceAssessmentId];
    if (!sourcePaper) return;
    const sourceQuestions = questions[sourceAssessmentId] || [];
    setQuestionPapers((prev) => ({
      ...prev,
      [activeAssessmentId]: { ...sourcePaper, status: "Saved", schemeFileName: "", createdAt: new Date().toLocaleDateString("en-GB") },
    }));
    setQuestions((prev) => ({
      ...prev,
      [activeAssessmentId]: sourceQuestions.map((q) => ({
        ...q,
        id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        subQuestions: (q.subQuestions || []).map((sq) => ({
          ...sq,
          id: `sq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        })),
      })),
    }));
    setAssessments((prev) => prev.map((a) => a.id === activeAssessmentId ? { ...a, questionPaperStatus: "in-progress" } : a));
    setCloneSourceModal(false);
    navigate("questionPaperDetail");
    showToast("Question paper cloned successfully!");
  }

  function handleSaveQPType(data) {
    setQpTypeModal(false);
    const existing = questionPapers[activeAssessmentId];
    setQuestionPapers((prev) => ({
      ...prev,
      [activeAssessmentId]: {
        ...data,
        status: "Saved",
        schemeFileName: existing?.schemeFileName || "",
        createdAt: existing?.createdAt || new Date().toLocaleDateString("en-GB"),
      },
    }));
    setAssessments((prev) => prev.map((a) => a.id === activeAssessmentId ? { ...a, questionPaperStatus: "in-progress" } : a));
    navigate("questionPaperDetail");
  }

  const [pendingQuestionType, setPendingQuestionType] = useState("regular");

  function handleAddQuestion(qType) {
    setEditingQuestionId(null);
    setSubQuestionContext(null);
    setPendingQuestionType(qType || "regular");
    navigate("addQuestion");
  }

  function handleEditQuestion(q) {
    setEditingQuestionId(q.id);
    setSubQuestionContext(null);
    navigate("addQuestion");
  }

  function handleSaveQuestion(q) {
    const qWithType = { ...q, questionType: q.questionType || pendingQuestionType };
    setQuestions((prev) => {
      const list = prev[activeAssessmentId] || [];
      const exists = list.find((x) => x.id === qWithType.id);
      return {
        ...prev,
        [activeAssessmentId]: exists ? list.map((x) => (x.id === qWithType.id ? qWithType : x)) : [...list, qWithType],
      };
    });
    setEditingQuestionId(null);
    navigate("questionPaperDetail");
    showToast(editingQuestionId ? "Question updated!" : "Question saved successfully!");
  }

  function handleDeleteQuestion(qid) {
    setQuestions((prev) => ({
      ...prev,
      [activeAssessmentId]: (prev[activeAssessmentId] || []).filter((q) => q.id !== qid),
    }));
    showToast("Question deleted.");
  }

  function handleAddSubQuestion(parentId, qType) {
    const parentList = questions[activeAssessmentId] || [];
    const parentIdx = parentList.findIndex((q) => q.id === parentId);
    const parent = parentList[parentIdx];
    const existingSubs = parent?.subQuestions || [];
    const nextLetterIdx = existingSubs.length + 1;
    const label = `${parentIdx + 1}${String.fromCharCode(97 + nextLetterIdx)}`;
    setSubQuestionContext({ parentId, subId: null, label, parentIdx });
    setEditingQuestionId(null);
    navigate("addQuestion");
  }

  function handleEditSubQuestion(parentId, sq, label) {
    const parentList = questions[activeAssessmentId] || [];
    const parentIdx = parentList.findIndex((q) => q.id === parentId);
    setSubQuestionContext({ parentId, subId: sq.id, label, parentIdx });
    setEditingQuestionId(null);
    navigate("addQuestion");
  }

  function handleSaveSubQuestion(sq) {
    const { parentId, subId } = subQuestionContext;
    setQuestions((prev) => {
      const list = prev[activeAssessmentId] || [];
      return {
        ...prev,
        [activeAssessmentId]: list.map((q) => {
          if (q.id !== parentId) return q;
          const subs = q.subQuestions || [];
          const exists = subs.find((s) => s.id === sq.id);
          return { ...q, subQuestions: exists ? subs.map((s) => (s.id === sq.id ? sq : s)) : [...subs, sq] };
        }),
      };
    });
    setSubQuestionContext(null);
    navigate("questionPaperDetail");
    showToast(subQuestionContext.subId ? "Sub question updated!" : "Sub question saved successfully!");
  }

  function handleDeleteSubQuestion(parentId, subId) {
    setQuestions((prev) => {
      const list = prev[activeAssessmentId] || [];
      return {
        ...prev,
        [activeAssessmentId]: list.map((q) => {
          if (q.id !== parentId) return q;
          return { ...q, subQuestions: (q.subQuestions || []).filter((s) => s.id !== subId) };
        }),
      };
    });
    showToast("Sub question deleted.");
  }

  function handleEditQPSettings(data) {
    setQuestionPapers((prev) => ({
      ...prev,
      [activeAssessmentId]: { ...prev[activeAssessmentId], ...data, status: "Saved" },
    }));
    showToast("Question paper settings updated successfully!");
  }

  function handleReorderQuestions(orderedQuestions) {
    setQuestions((prev) => ({ ...prev, [activeAssessmentId]: orderedQuestions }));
    showToast("Questions reordered successfully!");
  }

  function handleUpdateAttemptSettings(totalQuestions) {
    setQuestionPapers((prev) => ({
      ...prev,
      [activeAssessmentId]: { ...prev[activeAssessmentId], totalQuestions, status: "Saved" },
    }));
    showToast("Questions to attempt updated successfully!");
  }

  function handleDeleteQP() {
    setQuestionPapers((prev) => { const n = { ...prev }; delete n[activeAssessmentId]; return n; });
    setQuestions((prev) => { const n = { ...prev }; delete n[activeAssessmentId]; return n; });
    setAssessments((prev) =>
      prev.map((a) => a.id === activeAssessmentId ? { ...a, questionPaperStatus: "not-set", status: "Pending" } : a)
    );
    showToast("Question paper deleted successfully.");
    navigate("list");
  }

  function handleSubmitQP(schemeFileName) {
    setAssessments((prev) =>
      prev.map((a) => a.id === activeAssessmentId ? { ...a, questionPaperStatus: "completed", status: "Completed" } : a)
    );
    setQuestionPapers((prev) => ({
      ...prev,
      [activeAssessmentId]: { ...prev[activeAssessmentId], status: "Submitted", schemeFileName },
    }));
    showToast("Success! Question paper submitted and approved successfully.");
    navigate("list");
  }

  // ── Render views ──
  if (view === "printView" && activeAssessment) {
    return (
      <QuestionPaperPrintView
        assessment={activeAssessment}
        questionPaper={activeQP}
        questions={activeQuestions}
        onBack={() => navigate(isPreviewing ? "questionPaperDetail" : "list")}
        isPreview={isPreviewing}
      />
    );
  }

  if (view === "addQuestion" && activeAssessment) {
    const isSubQ = !!subQuestionContext;
    const parentQ = isSubQ ? activeQuestions.find((q) => q.id === subQuestionContext.parentId) : null;
    return (
      <AddQuestionPage
        assessment={activeAssessment}
        questionPaper={activeQP}
        onSave={isSubQ ? handleSaveSubQuestion : handleSaveQuestion}
        onBack={() => { setSubQuestionContext(null); navigate("questionPaperDetail"); }}
        editingQuestion={isSubQ ? editingSubQuestion : editingQuestion}
        isSubQuestion={isSubQ}
        parentQuestion={parentQ}
        subQuestionLabel={subQuestionContext?.label}
      />
    );
  }

  if (view === "questionPaperDetail" && activeAssessment && activeQP) {
    return (
      <QuestionPaperDetailPage
        assessment={activeAssessment}
        questionPaper={activeQP}
        questions={activeQuestions}
        onBack={() => navigate("list")}
        onAddQuestion={handleAddQuestion}
        onAddSubQuestion={handleAddSubQuestion}
        onEditQuestion={handleEditQuestion}
        onEditSubQuestion={handleEditSubQuestion}
        onDeleteQuestion={handleDeleteQuestion}
        onDeleteSubQuestion={handleDeleteSubQuestion}
        onSave={() => showToast("Saved!")}
        onSubmit={handleSubmitQP}
        onDeleteQP={handleDeleteQP}
        onEditQPSettings={handleEditQPSettings}
        onReorderQuestions={handleReorderQuestions}
        onUpdateAttemptSettings={handleUpdateAttemptSettings}
        onDownload={() => { setIsPreviewing(false); navigate("printView"); }}
        onPreview={() => { setIsPreviewing(true); navigate("printView"); }}
        toast={toast}
        setToast={setToast}
      />
    );
  }

  // ── List view ──
  const hasAssessments = assessments.length > 0;

  return (
    <div className="flex-1 overflow-y-auto p-5 pb-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-[12px] text-text2">
          <span>Timetable</span>
          <span className="text-border">/</span>
          <span className="font-semibold text-text uppercase tracking-wide">INTERNAL</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setArchiveModal(true)} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-text2 hover:text-[#9B2335] transition">
            <Eye size={14} /> View Archive
          </button>
          <button
            onClick={() => { setEditingIA(null); setAddIAModal(true); }}
            className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center text-text2 hover:bg-[#9B2335] hover:text-white hover:border-[#9B2335] transition shadow-sm"
          >
            <Plus size={16} weight="bold" />
          </button>
        </div>
      </div>

      {!hasAssessments && (
        <div className="min-h-[55vh] flex items-center justify-center bg-white rounded-[14px] border border-border">
          <p className="text-[14px] font-medium text-text2">No internals scheduled</p>
        </div>
      )}

      {hasAssessments && (
        <div className="bg-white rounded-[14px] border border-border overflow-hidden">
          <div className="flex border-b border-border px-4 pt-2 gap-1 overflow-x-auto">
            {assessments.map((a) => (
              <button
                key={a.id}
                onClick={() => setActiveTab(a.id)}
                className={`px-4 py-2 text-[12.5px] font-semibold whitespace-nowrap border-b-2 transition ${
                  activeTab === a.id ? "border-[#9B2335] text-[#9B2335]" : "border-transparent text-text2 hover:text-text"
                }`}
              >
                Internal Assessment {a.assessmentNumber}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="bg-[#e8f4fc] border-b border-border">
                  {["Date", "Course", "Degree-Dept-Semester-Sec", "Max Marks", "Status", "Created/Modified By", "Question Paper", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11.5px] font-semibold text-text2 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assessments
                  .filter((a) => !activeTab || a.id === activeTab)
                  .map((a) => (
                    <tr key={a.id} className="border-t border-border hover:bg-page-bg transition-colors">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-text">{a.dateLabel}</p>
                        <p className="text-text2 text-[11.5px] mt-0.5">{a.timeRange}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className={`font-semibold ${a.questionPaperStatus === "completed" ? "text-green-600" : "text-text"}`}>{a.course?.courseName}</p>
                        <p className="text-text2 text-[11.5px] mt-0.5">{a.course?.courseCode}</p>
                      </td>
                      <td className="px-4 py-4 max-w-[220px]">
                        <p className="text-text2 text-[11.5px] line-clamp-3">{a.course?.deptSemSec}</p>
                      </td>
                      <td className="px-4 py-4 text-text font-semibold">{a.maxMarks}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          a.status === "Completed" ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-text2">{a.createdBy}</td>
                      <td className="px-4 py-4">
                        {a.questionPaperStatus === "completed" ? (
                          <button onClick={() => { setIsPreviewing(false); setActiveAssessmentId(a.id); navigate("printView", a.id); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-white text-[11.5px] font-semibold hover:bg-sky-600 transition">
                            <Eye size={12} weight="fill" /> View
                          </button>
                        ) : a.questionPaperStatus === "in-progress" ? (
                          <button onClick={() => { setActiveAssessmentId(a.id); navigate("questionPaperDetail", a.id); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[11.5px] font-semibold hover:bg-amber-600 transition">
                            Resume
                          </button>
                        ) : (
                          <button onClick={() => handleSetQP(a.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-white text-[11.5px] font-semibold hover:bg-sky-600 transition">
                            Set
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          {a.questionPaperStatus !== "completed" ? (
                            <button onClick={() => handleEditIA(a)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text2 hover:text-[#9B2335] hover:border-[#9B2335] transition" title="Edit">
                              <Pencil size={13} />
                            </button>
                          ) : (
                            <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text2 opacity-30 cursor-not-allowed" title="Cannot edit after question paper is completed">
                              <Pencil size={13} />
                            </div>
                          )}
                          <button onClick={() => setDeleteIAId(a.id)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text2 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition" title="Delete">
                            <Trash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      <Modal open={archiveModal} onClose={() => setArchiveModal(false)} title="Archived Internal Assessments" headerColor="bg-white border-b border-border" headerText="text-text" maxWidth="max-w-3xl">
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {assessments.filter((a) => a.status === "Completed").length === 0 ? (
            <p className="text-[13px] text-text2 text-center py-10">No completed internal assessments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="bg-[#e8f4fc] border-b border-border">
                    {["Date", "Course", "IA No.", "Max Marks", "Created/Modified By"].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-[11.5px] font-semibold text-text2 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assessments.filter((a) => a.status === "Completed").map((a) => (
                    <tr key={a.id} className="border-t border-border">
                      <td className="px-3 py-2.5"><p className="font-semibold text-text">{a.dateLabel}</p><p className="text-text2 text-[11px]">{a.timeRange}</p></td>
                      <td className="px-3 py-2.5"><p className="font-semibold text-text">{a.course?.courseName}</p><p className="text-text2 text-[11px]">{a.course?.courseCode}</p></td>
                      <td className="px-3 py-2.5 text-text">{a.assessmentNumber}</td>
                      <td className="px-3 py-2.5 text-text font-semibold">{a.maxMarks}</td>
                      <td className="px-3 py-2.5 text-text2">{a.createdBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      <AddIAModal
        open={addIAModal}
        onClose={() => { setAddIAModal(false); setEditingIA(null); }}
        onSave={handleSaveIA}
        editingIA={editingIA}
        assessments={assessments}
      />

      <Modal open={existingPaperModal} onClose={() => setExistingPaperModal(false)} title="Existing Paper View Confirmation" headerColor="bg-white border-b border-border" headerText="text-text">
        <div className="px-6 py-5">
          <p className="text-[13px] text-text2 leading-relaxed">
            Do you want to clone from existing question paper? Click on either{" "}
            <span className="font-bold text-text">Create</span> button to create the new question paper or{" "}
            <span className="font-bold text-text">Clone</span> button to clone the existing question paper.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 px-6 pb-5">
          <BtnBlue onClick={handleOpenClonePicker} icon={<Copy size={13} />}>Clone</BtnBlue>
          <BtnPrimary onClick={handleCreateQP} icon={<Plus size={13} />}>Create</BtnPrimary>
          <BtnSecondary onClick={() => setExistingPaperModal(false)} icon={<X size={13} />}>Cancel</BtnSecondary>
        </div>
      </Modal>

      <Modal open={cloneSourceModal} onClose={() => setCloneSourceModal(false)} title="Clone Question Paper" headerColor="bg-white border-b border-border" headerText="text-text">
        <div className="px-6 py-5">
          {(() => {
            const sources = assessments.filter(
              (a) => a.id !== activeAssessmentId && questionPapers[a.id] &&
                (questionPapers[a.id].status === "Saved" || questionPapers[a.id].status === "Submitted")
            );
            if (sources.length === 0) {
              return <p className="text-[13px] text-text2 text-center py-6">No existing question papers available to clone from.</p>;
            }
            return (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                <p className="text-[12px] font-semibold text-text2 mb-2">Select a question paper to clone:</p>
                {sources.map((a) => (
                  <button key={a.id} onClick={() => handleConfirmClone(a.id)} className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border hover:border-[#9B2335] hover:bg-page-bg transition text-left">
                    <span>
                      <span className="block text-[12.5px] font-semibold text-text">IA-{a.assessmentNumber} · {a.course?.courseName}</span>
                      <span className="block text-[11.5px] text-text2">{a.course?.courseCode} · {a.dateLabel}</span>
                    </span>
                    <Copy size={14} className="text-[#9B2335] shrink-0" />
                  </button>
                ))}
              </div>
            );
          })()}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 pb-5">
          <BtnSecondary onClick={() => setCloneSourceModal(false)} icon={<X size={13} />}>Cancel</BtnSecondary>
        </div>
      </Modal>

      <QuestionPaperTypeModal
        open={qpTypeModal}
        onClose={() => setQpTypeModal(false)}
        onSave={handleSaveQPType}
        initialData={null}
        assessment={activeAssessment}
      />

      <ConfirmDialog
        open={!!deleteIAId}
        title="Delete Internal Assessment"
        message="Are you sure? All associated question papers and questions will also be permanently deleted."
        onConfirm={() => handleDeleteIA(deleteIAId)}
        onCancel={() => setDeleteIAId(null)}
      />
    </div>
  );
}