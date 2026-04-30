import { useState, useRef, useEffect } from "react";
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
const timePattern = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;

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
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-100 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold
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
    <div className="fixed inset-0 z-60 bg-black/40 flex items-center justify-center p-4">
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
        <div className="absolute z-50 mt-1 w-full bg-white border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
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
      <div
        className={`w-full ${maxWidth} bg-white rounded-[14px] shadow-2xl overflow-hidden`}
      >
        <div
          className={`flex items-center justify-between ${headerColor} px-6 py-4`}
        >
          <h3 className={`text-[14px] font-bold ${headerText}`}>{title}</h3>
          <button
            onClick={onClose}
            className={`${headerText} opacity-70 hover:opacity-100 transition`}
          >
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

// ─── S-VYASA University Seal SVG ──────────────────────────────────────────────
function SVyasaSeal({ size = 80 }) {
  const petals = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer border ring */}
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="#fff"
        stroke="#8B1A2A"
        strokeWidth="2.5"
      />
      {/* Inner border ring */}
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="#fff"
        stroke="#8B1A2A"
        strokeWidth="1"
      />

      {/* Lotus petals ring */}
      {petals.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const px = 50 + 28 * Math.sin(rad);
        const py = 50 - 28 * Math.cos(rad);
        return (
          <ellipse
            key={i}
            cx={px}
            cy={py}
            rx="5"
            ry="9"
            fill="#8B1A2A"
            opacity="0.75"
            transform={`rotate(${deg}, ${px}, ${py})`}
          />
        );
      })}

      {/* Center circle */}
      <circle cx="50" cy="50" r="18" fill="#8B1A2A" />
      <circle cx="50" cy="50" r="14" fill="#fff" />

      {/* Flame / lamp shape in center */}
      <ellipse cx="50" cy="52" rx="5" ry="7" fill="#8B1A2A" />
      <ellipse cx="50" cy="46" rx="3" ry="5" fill="#8B1A2A" />

      {/* Top text arc — S-VYASA */}
      <text
        x="50"
        y="18"
        textAnchor="middle"
        fontSize="7"
        fontWeight="bold"
        fill="#8B1A2A"
        fontFamily="Georgia, serif"
        letterSpacing="1.5"
      >
        S-VYASA
      </text>

      {/* Bottom text arc — BENGALURU */}
      <text
        x="50"
        y="88"
        textAnchor="middle"
        fontSize="5.5"
        fill="#8B1A2A"
        fontFamily="Georgia, serif"
        letterSpacing="1"
      >
        BENGALURU
      </text>

      {/* Left text */}
      <text
        x="50"
        y="76"
        textAnchor="middle"
        fontSize="4.5"
        fill="#8B1A2A"
        fontFamily="Georgia, serif"
        letterSpacing="0.5"
      >
        DEEMED UNIVERSITY
      </text>
    </svg>
  );
}

// ─── CDN loader helper ───────────────────────────────────────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
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

// ─── Print View ───────────────────────────────────────────────────────────────
function QuestionPaperPrintView({
  assessment,
  questionPaper,
  questions,
  onBack,
  readOnly = false,
}) {
  const course = assessment.course;
  const paperRef = useRef(null);
  const [downloading, setDownloading] = useState(null);

  const partOrder = [];
  const partMap = {};

  questions.forEach((q, idx) => {
    const part = q.part || "A";
    if (!partMap[part]) {
      partMap[part] = [];
      partOrder.push(part);
    }
    const qNum = idx + 1;
    const subs = q.subQuestions || [];

    if (subs.length === 0) {
      partMap[part].push({ ...q, qNum, subLabel: "", isOr: false });
    } else {
      partMap[part].push({ ...q, qNum, subLabel: "a", isOr: false });
      subs.forEach((sq, sqIdx) => {
        partMap[part].push({
          ...sq,
          qNum: "",
          subLabel: String.fromCharCode(98 + sqIdx),
          isOr: true,
        });
      });
    }
  });

  if (partOrder.length === 0 && questionPaper?.parts?.length > 0) {
    questionPaper.parts.forEach((p) => {
      partOrder.push(p.name);
      partMap[p.name] = [];
    });
  }

  const fileName = `IA-${assessment.assessmentNumber}_${course.courseCode}`;

  // async function handleDownloadPDF() {
  //   setDownloading("pdf");
  //   try {
  //     await loadScript(
  //       "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  //     );
  //     await loadScript(
  //       "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  //     );

  //     const el = paperRef.current;
  //     const canvas = await window.html2canvas(el, {
  //       scale: 2,
  //       useCORS: true,
  //       backgroundColor: "#ffffff",
  //       logging: false,
  //     });

  //     const { jsPDF } = window.jspdf;
  //     const pdf = new jsPDF({
  //       orientation: "portrait",
  //       unit: "mm",
  //       format: "a4",
  //     });

  //     const pageW = pdf.internal.pageSize.getWidth();
  //     const pageH = pdf.internal.pageSize.getHeight();
  //     const margin = 8;
  //     const contentW = pageW - margin * 2;
  //     const imgH = (canvas.height * contentW) / canvas.width;

  //     let yOffset = 0;
  //     const pageContentH = pageH - margin * 2;

  //     while (yOffset < imgH) {
  //       if (yOffset > 0) pdf.addPage();
  //       pdf.addImage(
  //         canvas.toDataURL("image/jpeg", 0.95),
  //         "JPEG",
  //         margin,
  //         margin - yOffset,
  //         contentW,
  //         imgH,
  //       );
  //       yOffset += pageContentH;
  //     }

  //     pdf.save(`${fileName}.pdf`);
  //   } catch (err) {
  //     console.error("PDF download failed:", err);
  //     alert("PDF download failed. Please try again.");
  //   } finally {
  //     setDownloading(null);
  //   }
  // }

  async function handleDownloadWord() {
    setDownloading("word");
    try {
      await loadScript("https://unpkg.com/docx@8.5.0/build/index.js");

      const {
        Document,
        Packer,
        Paragraph,
        TextRun,
        Table,
        TableRow,
        TableCell,
        AlignmentType,
        BorderStyle,
        WidthType,
        ShadingType,
        VerticalAlign,
      } = window.docx;

      const maroon = "8B1A2A";
      const lightBlue = "E8F4FC";
      const borderColor = "AAAAAA";
      const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
      const solidBorder = {
        style: BorderStyle.SINGLE,
        size: 4,
        color: borderColor,
      };
      const cellBorders = {
        top: solidBorder,
        bottom: solidBorder,
        left: solidBorder,
        right: solidBorder,
      };
      const noBorders = {
        top: noBorder,
        bottom: noBorder,
        left: noBorder,
        right: noBorder,
      };

      const PAGE_W = 9026;

      function cell(children, opts = {}) {
        return new TableCell({
          children,
          borders: opts.borders ?? cellBorders,
          width: opts.width
            ? { size: opts.width, type: WidthType.DXA }
            : undefined,
          shading: opts.shading
            ? { fill: opts.shading, type: ShadingType.CLEAR }
            : undefined,
          verticalAlign: opts.vAlign ?? VerticalAlign.CENTER,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          columnSpan: opts.colSpan,
        });
      }

      function para(text, opts = {}) {
        return new Paragraph({
          alignment: opts.align ?? AlignmentType.LEFT,
          spacing: {
            before: opts.spaceBefore ?? 0,
            after: opts.spaceAfter ?? 0,
          },
          children: [
            new TextRun({
              text: String(text ?? ""),
              bold: opts.bold ?? false,
              size: opts.size ?? 20,
              color: opts.color ?? "000000",
              font: "Times New Roman",
            }),
          ],
        });
      }

      const children = [];

      // Header table
      children.push(
        new Table({
          width: { size: PAGE_W, type: WidthType.DXA },
          columnWidths: [1200, 6626, 1200],
          borders: {
            top: noBorder,
            bottom: noBorder,
            left: noBorder,
            right: noBorder,
            insideH: noBorder,
            insideV: noBorder,
          },
          rows: [
            new TableRow({
              children: [
                cell(
                  [
                    para("S-VYASA", {
                      bold: true,
                      align: AlignmentType.CENTER,
                      color: maroon,
                      size: 16,
                    }),
                  ],
                  { borders: noBorders, width: 1200, shading: "FFFFFF" },
                ),
                cell(
                  [
                    para("S-VYASA DEEMED TO BE UNIVERSITY", {
                      bold: true,
                      align: AlignmentType.CENTER,
                      size: 26,
                    }),
                    para("Bengaluru", {
                      bold: true,
                      align: AlignmentType.CENTER,
                      size: 22,
                    }),
                    para(
                      "School of Advanced Studies, Sattva Global City, Mysore Road, RV Vidyaniketan, Rajarajeshwari Nagar,",
                      {
                        align: AlignmentType.CENTER,
                        size: 16,
                        color: "555555",
                      },
                    ),
                    para(course.degree, {
                      bold: true,
                      align: AlignmentType.CENTER,
                      size: 22,
                    }),
                    para(`IA-${assessment.assessmentNumber}`, {
                      bold: true,
                      align: AlignmentType.CENTER,
                      size: 24,
                    }),
                  ],
                  { borders: noBorders, width: 6626 },
                ),
                cell(
                  [
                    para("USN :", {
                      bold: true,
                      align: AlignmentType.RIGHT,
                      size: 20,
                    }),
                    new Table({
                      width: { size: 1100, type: WidthType.DXA },
                      columnWidths: [1100],
                      rows: [
                        new TableRow({
                          children: [
                            cell([para("")], {
                              width: 1100,
                              borders: cellBorders,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                  { borders: noBorders, width: 1200 },
                ),
              ],
            }),
          ],
        }),
      );

      children.push(
        new Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: borderColor },
          },
          spacing: { before: 120, after: 120 },
          children: [],
        }),
      );

      children.push(
        new Table({
          width: { size: PAGE_W, type: WidthType.DXA },
          columnWidths: [5000, 4026],
          borders: {
            top: noBorder,
            bottom: noBorder,
            left: noBorder,
            right: noBorder,
            insideH: noBorder,
            insideV: noBorder,
          },
          rows: [
            new TableRow({
              children: [
                cell(
                  [
                    para(`Semester: 1-2025`, { size: 20 }),
                    para(
                      `Subject: ${course.courseName} (${course.courseCode})`,
                      { size: 20 },
                    ),
                  ],
                  { borders: noBorders, width: 5000 },
                ),
                cell(
                  [
                    para(`Date: ${assessment.dateLabel}`, {
                      align: AlignmentType.RIGHT,
                      size: 20,
                    }),
                    para(`Time: ${assessment.timeRange}`, {
                      align: AlignmentType.RIGHT,
                      size: 20,
                    }),
                    para(`Max Marks: ${assessment.maxMarks}`, {
                      align: AlignmentType.RIGHT,
                      size: 20,
                    }),
                  ],
                  { borders: noBorders, width: 4026 },
                ),
              ],
            }),
          ],
        }),
      );

      children.push(
        new Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: borderColor },
          },
          spacing: { before: 80, after: 200 },
          children: [],
        }),
      );

      // Parts
      for (const part of partOrder) {
        const rows = partMap[part] || [];
        const colWidths = [500, 400, 5626, 700, 700, 1100];
        const tableRows = [];

        tableRows.push(
          new TableRow({
            children: [
              cell(
                [
                  para(`PART ${part}`, {
                    bold: true,
                    align: AlignmentType.CENTER,
                    size: 24,
                    color: "1a56db",
                  }),
                ],
                { borders: cellBorders, colSpan: 6, shading: "FFFFFF" },
              ),
            ],
          }),
        );

        tableRows.push(
          new TableRow({
            children: [
              cell(
                [
                  para("Answer All Questions", {
                    align: AlignmentType.CENTER,
                    size: 18,
                    color: "1a56db",
                  }),
                ],
                { borders: cellBorders, colSpan: 6, shading: "FFFFFF" },
              ),
            ],
          }),
        );

        tableRows.push(
          new TableRow({
            children: [
              cell([para("Q.No", { bold: true, size: 18 })], {
                borders: cellBorders,
                width: colWidths[0],
              }),
              cell([para("", { bold: true, size: 18 })], {
                borders: cellBorders,
                width: colWidths[1],
              }),
              cell([para("Question", { bold: true, size: 18 })], {
                borders: cellBorders,
                width: colWidths[2],
              }),
              cell(
                [
                  para("Marks", {
                    bold: true,
                    size: 18,
                    align: AlignmentType.CENTER,
                  }),
                ],
                { borders: cellBorders, width: colWidths[3] },
              ),
              cell(
                [
                  para("CO", {
                    bold: true,
                    size: 18,
                    align: AlignmentType.CENTER,
                  }),
                ],
                { borders: cellBorders, width: colWidths[4] },
              ),
              cell(
                [
                  para("BT/CL", {
                    bold: true,
                    size: 18,
                    align: AlignmentType.CENTER,
                  }),
                ],
                { borders: cellBorders, width: colWidths[5] },
              ),
            ],
          }),
        );

        if (rows.length === 0) {
          tableRows.push(
            new TableRow({
              children: [
                cell(
                  [
                    para("No questions added for this part", {
                      align: AlignmentType.CENTER,
                      size: 18,
                      color: "AAAAAA",
                    }),
                  ],
                  { borders: cellBorders, colSpan: 6 },
                ),
              ],
            }),
          );
        }

        for (const row of rows) {
          if (row.isOr) {
            tableRows.push(
              new TableRow({
                children: [
                  cell(
                    [
                      para("OR", {
                        bold: true,
                        align: AlignmentType.CENTER,
                        size: 18,
                        color: "666666",
                      }),
                    ],
                    { borders: cellBorders, colSpan: 6, shading: "FFFFFF" },
                  ),
                ],
              }),
            );
          }

          const btcl = row.bloomsLevel
            ? `L${BLOOMS.indexOf(row.bloomsLevel) + 1}`
            : "";

          tableRows.push(
            new TableRow({
              children: [
                cell(
                  [
                    para(String(row.qNum ?? ""), {
                      align: AlignmentType.CENTER,
                      size: 20,
                    }),
                  ],
                  { borders: cellBorders, width: colWidths[0] },
                ),
                cell(
                  [
                    para(row.subLabel ?? "", {
                      bold: true,
                      align: AlignmentType.CENTER,
                      size: 20,
                    }),
                  ],
                  { borders: cellBorders, width: colWidths[1] },
                ),
                cell([para(stripHtml(row.question), { size: 20 })], {
                  borders: cellBorders,
                  width: colWidths[2],
                }),
                cell(
                  [
                    para(String(row.totalMarks ?? ""), {
                      align: AlignmentType.CENTER,
                      size: 20,
                    }),
                  ],
                  { borders: cellBorders, width: colWidths[3] },
                ),
                cell(
                  [
                    para((row.co || []).join(", "), {
                      align: AlignmentType.CENTER,
                      size: 20,
                    }),
                  ],
                  { borders: cellBorders, width: colWidths[4] },
                ),
                cell([para(btcl, { align: AlignmentType.CENTER, size: 20 })], {
                  borders: cellBorders,
                  width: colWidths[5],
                }),
              ],
            }),
          );
        }

        children.push(
          new Table({
            width: { size: PAGE_W, type: WidthType.DXA },
            columnWidths: colWidths,
            rows: tableRows,
          }),
        );

        children.push(
          new Paragraph({ spacing: { before: 200, after: 0 }, children: [] }),
        );
      }

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: { width: 11906, height: 16838 },
                margin: { top: 720, right: 720, bottom: 720, left: 720 },
              },
            },
            children,
          },
        ],
      });

      const buffer = await Packer.toBlob(doc);
      const url = URL.createObjectURL(buffer);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Word download failed:", err);
      alert("Word download failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-100">
      {!readOnly && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-white">
          <div className="flex items-center gap-2 text-[12px] text-text2">
            <span>Timetable</span>
            <span>/</span>
            <span className="text-text font-semibold">Internal Assessment</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={!!downloading}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-bold text-white transition
              ${downloading === "pdf" ? "bg-red-300 cursor-wait" : "bg-red-600 hover:bg-red-700"}`}
            >
              <Download size={14} />
              {downloading === "pdf" ? "Generating PDF…" : "Download PDF"}
            </button>
            {/* <button
              onClick={handleDownloadWord}
              disabled={!!downloading}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-bold text-white transition
              ${downloading === "word" ? "bg-blue-300 cursor-wait" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              <Download size={14} />
              {downloading === "word" ? "Generating Word…" : "Download Word"}
            </button> */}
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#9B2335] hover:underline ml-2"
            >
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        </div>
      )}

      {/* Paper body */}
      <div className="p-8">
        <div
          ref={paperRef}
          className="max-w-3xl mx-auto bg-white shadow-lg"
          style={{
            fontFamily: "Times New Roman, serif",
            border: "1px solid #aaa",
          }}
        >
          {/* ══ HEADER ══ */}
          <div
            style={{
              padding: "16px 28px 12px 28px",
              borderBottom: "1px solid #aaa",
            }}
          >
            {/* USN — top right */}
            {/* USN — top right */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  marginRight: "8px",
                }}
              >
                USN :
              </span>
              <div style={{ display: "flex", gap: "3px" }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "22px",
                      height: "26px",
                      border: "1px solid #555",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Logo + University name row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <img
                src={svyasaLogo}
                alt="S-VYASA Logo"
                style={{
                  width: "114px",
                  height: "114px",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <div
                style={{ flex: 1, textAlign: "center", paddingRight: "75px" }}
              >
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    margin: 0,
                    letterSpacing: "0.3px",
                  }}
                >
                  S-VYASA DEEMED TO BE UNIVERSITY
                </p>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    margin: "3px 0 0",
                  }}
                >
                  Bengaluru
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#444",
                    margin: "3px 0 0",
                    lineHeight: "1.4",
                  }}
                >
                  School of Advanced Studies, Sattva Global City, Mysore Road,
                  RV Vidyaniketan, Rajarajeshwari Nagar,
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    margin: "4px 0 0",
                  }}
                >
                  {course.degree}
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    margin: "3px 0 0",
                  }}
                >
                  IA-{assessment.assessmentNumber}
                </p>
              </div>
            </div>

            {/* Semester / Subject / Date / Time / Marks */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
                paddingTop: "10px",
                borderTop: "1px solid #ccc",
              }}
            >
              <div style={{ lineHeight: "1.9" }}>
                <p style={{ margin: 0 }}>Semester: 1-2025</p>
                <p style={{ margin: 0 }}>
                  Subject: {course.courseName} ({course.courseCode})
                </p>
              </div>
              <div style={{ textAlign: "right", lineHeight: "1.9" }}>
                <p style={{ margin: 0 }}>Date: {assessment.dateLabel}</p>
                <p style={{ margin: 0 }}>Time: {assessment.timeRange}</p>
                <p style={{ margin: 0 }}>Max Marks: {assessment.maxMarks}</p>
              </div>
            </div>
          </div>

          {/* ══ PARTS & QUESTIONS ══ */}
          <div style={{ padding: "16px 28px 28px" }}>
            {partOrder.length === 0 && (
              <p
                style={{
                  textAlign: "center",
                  color: "#999",
                  fontSize: "13px",
                  padding: "32px 0",
                }}
              >
                No questions added yet.
              </p>
            )}

            {partOrder.map((part, pIdx) => {
              const rows = partMap[part] || [];
              return (
                <div
                  key={part}
                  style={{
                    marginBottom: pIdx < partOrder.length - 1 ? "20px" : 0,
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      border: "1px solid #aaa",
                      fontSize: "12.5px",
                    }}
                  >
                    <thead>
                      {/* Part name row */}
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            border: "1px solid #aaa",
                            padding: "7px 4px 3px",
                            textAlign: "center",
                            background: "#fff",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontWeight: "bold",
                              color: "#1a56db",
                              fontSize: "13.5px",
                              textDecoration: "underline",
                              letterSpacing: "1px",
                            }}
                          >
                            PART {part}
                          </p>
                        </td>
                      </tr>

                      {/* Answer All Questions row */}
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            border: "1px solid #aaa",
                            padding: "2px 4px 7px",
                            textAlign: "center",
                            background: "#fff",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              color: "#1a56db",
                              fontStyle: "italic",
                              textDecoration: "underline",
                            }}
                          >
                            Answer All Questions
                          </p>
                        </td>
                      </tr>

                      {/* Column headers */}
                      <tr style={{ background: "#fff" }}>
                        {["Q.No", "", "Question", "Marks", "CO", "BT/CL"].map(
                          (h, i) => (
                            <th
                              key={i}
                              style={{
                                border: "1px solid #aaa",
                                padding: "6px 8px",
                                textAlign: i >= 3 ? "center" : "left",
                                fontWeight: "600",
                                fontSize: "12px",
                                whiteSpace: "nowrap",
                                width:
                                  i === 0
                                    ? "42px"
                                    : i === 1
                                      ? "24px"
                                      : i === 3
                                        ? "56px"
                                        : i === 4
                                          ? "56px"
                                          : i === 5
                                            ? "62px"
                                            : "auto",
                              }}
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {rows.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            style={{
                              border: "1px solid #aaa",
                              padding: "20px",
                              textAlign: "center",
                              color: "#aaa",
                              fontSize: "11px",
                              fontStyle: "italic",
                            }}
                          >
                            No questions added for this part
                          </td>
                        </tr>
                      )}

                      {rows.map((row, rowIdx) => (
                        <>
                          {row.isOr && (
                            <tr key={`${row.id}-or-${rowIdx}`}>
                              <td
                                colSpan={6}
                                style={{
                                  border: "1px solid #aaa",
                                  padding: "4px 0",
                                  textAlign: "center",
                                  background: "#fff",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    color: "#666",
                                    letterSpacing: "1px",
                                  }}
                                >
                                  OR
                                </span>
                              </td>
                            </tr>
                          )}

                          <tr key={`${row.id}-${rowIdx}`}>
                            <td
                              style={{
                                border: "1px solid #aaa",
                                padding: "7px 8px",
                                textAlign: "center",
                                fontWeight: "600",
                                verticalAlign: "top",
                              }}
                            >
                              {row.qNum}
                            </td>
                            <td
                              style={{
                                border: "1px solid #aaa",
                                padding: "7px 6px",
                                textAlign: "center",
                                fontWeight: "600",
                                verticalAlign: "top",
                              }}
                            >
                              {row.subLabel}
                            </td>
                            <td
                              style={{
                                border: "1px solid #aaa",
                                padding: "7px 10px",
                                verticalAlign: "top",
                                lineHeight: "1.5",
                              }}
                              dangerouslySetInnerHTML={{ __html: row.question }}
                            />
                            <td
                              style={{
                                border: "1px solid #aaa",
                                padding: "7px 8px",
                                textAlign: "center",
                                verticalAlign: "top",
                              }}
                            >
                              {row.totalMarks}
                            </td>
                            <td
                              style={{
                                border: "1px solid #aaa",
                                padding: "7px 8px",
                                textAlign: "center",
                                verticalAlign: "top",
                              }}
                            >
                              {row.co?.join(", ")}
                            </td>
                            <td
                              style={{
                                border: "1px solid #aaa",
                                padding: "7px 8px",
                                textAlign: "center",
                                verticalAlign: "top",
                                fontSize: "11.5px",
                              }}
                            >
                              {row.bloomsLevel
                                ? `L${BLOOMS.indexOf(row.bloomsLevel) + 1}`
                                : ""}
                            </td>
                          </tr>
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Add / Edit Question Page ─────────────────────────────────────────────────
function AddQuestionPage({
  assessment,
  questionPaper,
  onSave,
  onBack,
  editingQuestion,
  isSubQuestion,
  parentQuestion,
  subQuestionLabel,
}) {
  const course = assessment.course;
  const parts = questionPaper.parts || [];
  const isEditing = !!editingQuestion;

  const [module, setModule] = useState(editingQuestion?.module || "");
  const [unit, setUnit] = useState(editingQuestion?.unit || "");
  const [topics, setTopics] = useState(editingQuestion?.topics || []);
  const [question, setQuestion] = useState(editingQuestion?.question || "");
  const [co, setCo] = useState(editingQuestion?.co || []);
  const [po, setPo] = useState(editingQuestion?.po || []);
  const [bloomsLevel, setBloomsLevel] = useState(
    editingQuestion?.bloomsLevel || "",
  );
  const [uploadContent, setUploadContent] = useState(
    editingQuestion?.uploadContent || "No Content",
  );
  const [totalMarks, setTotalMarks] = useState(
    editingQuestion?.totalMarks || "",
  );
  const [answerType, setAnswerType] = useState(
    editingQuestion?.answerType || "",
  );
  const [part, setPart] = useState(
    editingQuestion?.part || parentQuestion?.part || "",
  );
  const [errors, setErrors] = useState({});

  const availableUnits = module ? DUMMY_UNITS[module] || [] : [];
  const availableTopics = unit ? DUMMY_TOPICS[unit] || [] : [];
  const partOptions =
    parts.length > 0
      ? parts.map((p) => ({ value: p.name, label: `Part ${p.name}` }))
      : [
          { value: "A", label: "Part A" },
          { value: "B", label: "Part B" },
        ];

  function validate() {
    const e = {};
    if (!module) e.module = "Required";
    if (!unit) e.unit = "Required";
    if (!question || question === "<p></p>" || question === "<p><br></p>")
      e.question = "Question is required";
    if (!totalMarks) e.totalMarks = "Required";
    if (!part) e.part = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleReset() {
    if (isEditing) return;
    setModule("");
    setUnit("");
    setTopics([]);
    setQuestion("");
    setCo([]);
    setPo([]);
    setBloomsLevel("");
    setUploadContent("No Content");
    setTotalMarks("");
    setAnswerType("");
    setPart(parentQuestion?.part || "");
    setErrors({});
  }

  function handleSave() {
    if (!validate()) return;
    onSave({
      id: editingQuestion?.id || `q-${Date.now()}`,
      module,
      unit,
      topics,
      question,
      co,
      po,
      bloomsLevel,
      uploadContent,
      totalMarks: Number(totalMarks),
      answerType,
      part,
      questionType: editingQuestion?.questionType || "regular",
      subQuestions: editingQuestion?.subQuestions || [],
    });
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-white">
        <div className="flex items-center gap-2 text-[12px] text-text2">
          <span>Timetable</span>
          <span>/</span>
          <span className="text-text font-semibold">INTERNAL</span>
          {isSubQuestion && (
            <>
              <span>/</span>
              <span className="text-[#9B2335] font-semibold">
                Sub Question {subQuestionLabel}
              </span>
            </>
          )}
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#9B2335] hover:underline"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>
      <InfoBar course={course} iaNumber={assessment.assessmentNumber} />
      <div className="p-5 space-y-5 max-w-4xl">
        {isSubQuestion && (
          <div className="bg-sky-50 border border-sky-200 text-sky-800 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold flex items-center gap-2">
            <Plus size={14} /> Adding Sub Question{" "}
            <span className="font-bold">{subQuestionLabel}</span> for Question
            above
          </div>
        )}
        {isEditing && !isSubQuestion && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold flex items-center gap-2">
            <Pencil size={14} /> Editing Question — make your changes and click
            Update
          </div>
        )}
        {isEditing && isSubQuestion && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold flex items-center gap-2">
            <Pencil size={14} /> Editing Sub Question{" "}
            <span className="font-bold">{subQuestionLabel}</span>
          </div>
        )}
        {/* Course Details */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <p className="text-[13px] font-bold text-text mb-4">Course Details</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <FieldLabel required>MODULE NAME</FieldLabel>
              <SelectDropdown
                value={module}
                onChange={(v) => {
                  setModule(v);
                  setUnit("");
                  setTopics([]);
                }}
                options={DUMMY_MODULES}
                placeholder="Select module"
                error={errors.module}
              />
            </div>
            <div>
              <FieldLabel required>UNIT</FieldLabel>
              <SelectDropdown
                value={unit}
                onChange={(v) => {
                  setUnit(v);
                  setTopics([]);
                }}
                options={availableUnits}
                placeholder="Select unit"
                error={errors.unit}
              />
            </div>
            <div>
              <FieldLabel>TOPIC</FieldLabel>
              <MultiSelectCheckbox
                label="Select topics"
                options={availableTopics}
                selected={topics}
                onChange={setTopics}
              />
            </div>
          </div>
        </div>
        {/* Question */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <FieldLabel required>Question</FieldLabel>
          <CKEditorComponent value={question} onChange={setQuestion} />
          {errors.question && (
            <p className="text-[11px] text-red-600 mt-1">{errors.question}</p>
          )}
        </div>
        {/* Question Details */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <p className="text-[13px] font-bold text-text mb-4">
            Question Details
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <FieldLabel required>CO</FieldLabel>
              <MultiSelectCheckbox
                label="Select CO"
                options={DUMMY_CO}
                selected={co}
                onChange={setCo}
              />
            </div>
            <div>
              <FieldLabel required>PO</FieldLabel>
              <MultiSelectCheckbox
                label="Select PO"
                options={DUMMY_PO}
                selected={po}
                onChange={setPo}
              />
            </div>
            <div>
              <FieldLabel required>BLOOM'S LEVEL</FieldLabel>
              <SelectDropdown
                value={bloomsLevel}
                onChange={setBloomsLevel}
                options={BLOOMS}
                placeholder="Select level"
              />
            </div>
          </div>
        </div>
        {/* Upload Content */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <FieldLabel>UPLOAD CONTENT</FieldLabel>
          <SelectDropdown
            value={uploadContent}
            onChange={setUploadContent}
            options={[
              "No Content",
              "Upload Image",
              "Upload PDF",
              "Upload Video",
            ]}
            placeholder="Select content type"
          />
        </div>
        {/* Bottom fields */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <FieldLabel required>TOTAL MARKS</FieldLabel>
              <InputUnderline
                type="number"
                min={0}
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                placeholder="0"
                error={errors.totalMarks}
              />
            </div>
            <div>
              <FieldLabel required>ANSWER TYPE</FieldLabel>
              <SelectDropdown
                value={answerType}
                onChange={setAnswerType}
                options={ANSWER_TYPES}
                placeholder="Select type"
              />
            </div>
            <div>
              <FieldLabel required>PART</FieldLabel>
              <SelectDropdown
                value={part}
                onChange={setPart}
                options={partOptions}
                placeholder="Select part"
                error={errors.part}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pb-6">
          {!isEditing && (
            <BtnSecondary
              onClick={handleReset}
              icon={<ArrowCounterClockwise size={14} />}
            >
              Reset
            </BtnSecondary>
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
  assessment,
  questionPaper,
  questions,
  onBack,
  onAddQuestion,
  onAddSubQuestion,
  onEditQuestion,
  onEditSubQuestion,
  onDeleteQuestion,
  onDeleteSubQuestion,
  onSave,
  onSubmit,
  onDeleteQP,
  onEditQPSettings,
  toast,
  setToast,
}) {
  const course = assessment.course;
  const [actionsOpen, setActionsOpen] = useState(false);
  const [schemeModal, setSchemeModal] = useState(false);
  const [schemeFile, setSchemeFile] = useState(null);
  const [schemeFileName, setSchemeFileName] = useState(
    questionPaper.schemeFileName || "",
  );
  const [questionTypeModal, setQuestionTypeModal] = useState(false);
  const [questionType, setQuestionType] = useState("regular");
  const [deleteQuestionId, setDeleteQuestionId] = useState(null);
  const [deleteSubQuestion, setDeleteSubQuestion] = useState(null);
  const [deleteQPConfirm, setDeleteQPConfirm] = useState(false);
  const [editQPSettingsModal, setEditQPSettingsModal] = useState(false);
  const [pendingSubParentId, setPendingSubParentId] = useState(null);
  const [previewModal, setPreviewModal] = useState(false);

  const actionsRef = useRef();

  useEffect(() => {
    function h(e) {
      if (actionsRef.current && !actionsRef.current.contains(e.target))
        setActionsOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function handleSubmit() {
    if (!schemeFile && !questionPaper.schemeFileName) {
      setToast({
        message: "Error: Scheme of Evaluation is mandatory",
        type: "error",
      });
      return;
    }
    onSubmit(schemeFileName || questionPaper.schemeFileName);
  }

  function handleSubQuestionClick(parentId) {
    setPendingSubParentId(parentId);
    setQuestionTypeModal(true);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-white">
        <div className="flex items-center gap-2 text-[12px] text-text2">
          <span>Timetable</span>
          <span>/</span>
          <span className="text-text font-semibold">Internal Assessment</span>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#9B2335] hover:underline"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>
      <InfoBar course={course} iaNumber={assessment.assessmentNumber} />
      <div className="p-5">
        {/* Meta */}
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <p className="text-[12.5px] text-text2">
              <span className="font-semibold text-text">Modified By :</span> Mr
              Hari Prasath
            </p>
            <p className="text-[12.5px] text-text2">
              <span className="font-semibold text-text">
                Question Paper Status :
              </span>{" "}
              <span className="text-green-600 font-bold">
                {questionPaper.status}
              </span>
            </p>
            <p className="text-[12.5px] text-text2">
              <span className="font-semibold text-text">
                Question Paper Type :
              </span>{" "}
              {questionPaper.paperType === "module-part-based"
                ? "Module And Part Based"
                : questionPaper.paperType}
            </p>
            <p className="text-[12.5px] text-text2">
              <span className="font-semibold text-text">
                # of Questions to Attempt :
              </span>{" "}
              {questionPaper.totalQuestions}
            </p>
          </div>
          <div className="flex items-center gap-2 relative">
            <BtnBlue
              onClick={() => setQuestionTypeModal(true)}
              icon={<Question size={14} />}
            >
              Question
            </BtnBlue>
            <div ref={actionsRef} className="relative">
              <BtnBlue
                onClick={() => setActionsOpen((v) => !v)}
                icon={<GearSix size={14} />}
              >
                Actions <CaretDown size={12} />
              </BtnBlue>
              {actionsOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-border rounded-xl shadow-lg w-52 py-1">
                  {[
                    {
                      label: "Edit Paper Settings",
                      icon: <Pencil size={14} />,
                      action: () => {
                        setEditQPSettingsModal(true);
                        setActionsOpen(false);
                      },
                    },
                    {
                      label: "Arrange Questions",
                      icon: <SortAscending size={14} />,
                    },
                    {
                      label: "Questions to Attempt",
                      icon: <ListBullets size={14} />,
                    },
                    {
                      label: "Scheme of Evaluation",
                      icon: <UploadSimple size={14} />,
                      action: () => {
                        setSchemeModal(true);
                        setActionsOpen(false);
                      },
                    },
                    {
                      label: "Download Question Paper",
                      icon: <Download size={14} />,
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action || (() => setActionsOpen(false))}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] text-text hover:bg-page-bg transition"
                    >
                      <span className="text-[#9B2335]">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Questions Table */}
        {questions.length === 0 ? (
          <div className="bg-white rounded-[14px] border border-border py-20 text-center">
            <p className="text-[13px] font-medium text-text2">
              No questions were added, click on Question button to add the
              questions
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-[14px] border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead className="bg-[#e8f4fc] border-b border-border">
                  <tr>
                    {[
                      "Sl. No",
                      "Module",
                      "Unit",
                      "Topic",
                      "Question",
                      "Part",
                      "Max Marks",
                      "Choice With",
                      "View",
                      "CO",
                      "PO",
                      "BT/CL",
                      "Edit Q Type",
                      "Edit",
                      "Delete",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-3 text-left text-[11px] font-semibold text-text2 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, idx) => {
                    const subs = q.subQuestions || [];
                    const hasSubQuestions = subs.length > 0;
                    const qNum = idx + 1;

                    const orSeparator = (key) => (
                      <tr key={key} className="border-t border-border">
                        <td
                          colSpan={15}
                          className="py-1.5 text-center bg-slate-50"
                        >
                          <span className="inline-block text-[11px] font-bold text-text2 bg-white px-5 py-0.5 rounded-full border border-border shadow-sm">
                            OR
                          </span>
                        </td>
                      </tr>
                    );

                    const renderDataRow = (
                      item,
                      label,
                      choiceWith,
                      isParent,
                    ) => (
                      <tr
                        key={item.id}
                        className="border-t border-border transition-colors bg-[#f0f8ff] hover:bg-[#e6f3fb]"
                      >
                        <td className="px-3 py-3 font-bold whitespace-nowrap text-[#9B2335] pl-8">
                          {label}
                        </td>
                        <td className="px-3 py-3 text-text2">{item.module}</td>
                        <td className="px-3 py-3 text-text2">{item.unit}</td>
                        <td className="px-3 py-3 text-text2 max-w-25">
                          <span className="line-clamp-2">
                            {item.topics?.join(", ")}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-text max-w-50">
                          <div
                            className="border border-border rounded-lg p-2 bg-white max-h-16 overflow-y-auto text-[11.5px]"
                            dangerouslySetInnerHTML={{ __html: item.question }}
                          />
                        </td>
                        <td className="px-3 py-3 font-semibold text-text">
                          {item.part}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {item.totalMarks}
                        </td>
                        <td className="px-3 py-3 text-center font-semibold text-[#9B2335]">
                          {choiceWith}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => setPreviewModal(true)}
                            className="w-8 h-5 rounded bg-sky-400 flex items-center justify-center"
                          >
                            <Eye
                              size={11}
                              className="text-white"
                              weight="fill"
                            />
                          </button>
                        </td>
                        <td className="px-3 py-3 text-text2">
                          {item.co?.join(", ")}
                        </td>
                        <td className="px-3 py-3 text-text2">
                          {item.po?.join(", ")}
                        </td>
                        <td className="px-3 py-3 text-text2 uppercase text-[11px]">
                          {item.bloomsLevel}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            className="text-text2 hover:text-[#9B2335] transition"
                            title="Edit Question Type"
                          >
                            <Pencil size={13} />
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() =>
                              isParent
                                ? onEditQuestion(q)
                                : onEditSubQuestion(q.id, item, label)
                            }
                            className="text-text2 hover:text-[#9B2335] transition"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() =>
                              isParent
                                ? setDeleteQuestionId(q.id)
                                : setDeleteSubQuestion({
                                    parentId: q.id,
                                    subId: item.id,
                                  })
                            }
                            className="text-text2 hover:text-red-600 transition"
                            title="Delete"
                          >
                            <Trash size={13} />
                          </button>
                        </td>
                      </tr>
                    );

                    return (
                      <>
                        {!hasSubQuestions && (
                          <tr
                            key={q.id}
                            className="border-t border-border hover:bg-page-bg transition-colors"
                          >
                            <td className="px-3 py-3 font-bold text-text whitespace-nowrap">
                              {qNum}
                            </td>
                            <td className="px-3 py-3 text-text2">{q.module}</td>
                            <td className="px-3 py-3 text-text2">{q.unit}</td>
                            <td className="px-3 py-3 text-text2 max-w-25">
                              <span className="line-clamp-2">
                                {q.topics?.join(", ")}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-text max-w-50">
                              <div
                                className="border border-border rounded-lg p-2 bg-white max-h-16 overflow-y-auto text-[11.5px]"
                                dangerouslySetInnerHTML={{ __html: q.question }}
                              />
                            </td>
                            <td className="px-3 py-3 font-semibold text-text">
                              {q.part}
                            </td>
                            <td className="px-3 py-3 text-center">
                              {q.totalMarks}
                            </td>
                            <td className="px-3 py-3 text-center font-semibold text-[#9B2335]">
                              -
                            </td>
                            <td className="px-3 py-3">
                              <button
                                onClick={() => setPreviewModal(true)}
                                className="w-8 h-5 rounded bg-sky-400 flex items-center justify-center"
                              >
                                <Eye
                                  size={11}
                                  className="text-white"
                                  weight="fill"
                                />
                              </button>
                            </td>
                            <td className="px-3 py-3 text-text2">
                              {q.co?.join(", ")}
                            </td>
                            <td className="px-3 py-3 text-text2">
                              {q.po?.join(", ")}
                            </td>
                            <td className="px-3 py-3 text-text2 uppercase text-[11px]">
                              {q.bloomsLevel}
                            </td>
                            <td className="px-3 py-3">
                              <button
                                className="text-text2 hover:text-[#9B2335] transition"
                                title="Edit Question Type"
                              >
                                <Pencil size={13} />
                              </button>
                            </td>
                            <td className="px-3 py-3">
                              <button
                                onClick={() => onEditQuestion(q)}
                                className="text-text2 hover:text-[#9B2335] transition"
                                title="Edit"
                              >
                                <Pencil size={13} />
                              </button>
                            </td>
                            <td className="px-3 py-3">
                              <button
                                onClick={() => setDeleteQuestionId(q.id)}
                                className="text-text2 hover:text-red-600 transition"
                                title="Delete"
                              >
                                <Trash size={13} />
                              </button>
                            </td>
                          </tr>
                        )}

                        {hasSubQuestions && (
                          <>
                            <tr
                              key={`${q.id}-header`}
                              className="border-t border-border bg-white"
                            >
                              <td className="px-3 py-2 font-bold text-text">
                                {qNum}
                              </td>
                              <td
                                colSpan={14}
                                className="px-3 py-2 text-[11px] text-text2 italic"
                              >
                                Choice based — attempt any one
                              </td>
                            </tr>

                            {renderDataRow(q, `${qNum}a`, "-", true)}

                            {subs.map((sq, sqIdx) => (
                              <>
                                {orSeparator(`${sq.id}-or`)}
                                {renderDataRow(
                                  sq,
                                  `${qNum}${String.fromCharCode(98 + sqIdx)}`,
                                  `${qNum}${String.fromCharCode(97 + sqIdx)}`,
                                  false,
                                )}
                              </>
                            ))}
                          </>
                        )}

                        <tr
                          key={`${q.id}-sub`}
                          className="border-t border-border bg-page-bg/30"
                        >
                          <td colSpan={15} className="px-3 py-2">
                            <button
                              onClick={() => handleSubQuestionClick(q.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-white text-[11px] font-semibold hover:bg-sky-600 transition"
                            >
                              <Plus size={11} /> Sub Question
                            </button>
                          </td>
                        </tr>
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Scheme attachment */}
        {(schemeFileName || questionPaper.schemeFileName) && (
          <div className="mt-4">
            <p className="text-[12px] font-semibold text-text2 mb-2">
              Attachment
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-xl text-[12.5px] text-[#9B2335] font-semibold">
              <FloppyDisk size={14} />{" "}
              {schemeFileName || questionPaper.schemeFileName}
            </div>
          </div>
        )}

        {/* Faculty + bottom actions */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="w-64">
            <SelectDropdown
              value=""
              onChange={() => {}}
              options={[
                "Dr Y Mohamadi Begam",
                "Dr Karthiyayini",
                "Mr Hari Prasath",
              ]}
              placeholder="Select reviewer faculty"
            />
          </div>
          <div className="flex items-center gap-2">
            <BtnSecondary onClick={onSave} icon={<FloppyDisk size={14} />}>
              Save
            </BtnSecondary>
            <BtnBlue onClick={() => setPreviewModal(true)} icon={<Eye size={14} />}>
              Preview
            </BtnBlue>
            <BtnBlue onClick={handleSubmit} icon={<CheckCircle size={14} />}>
              Submit
            </BtnBlue>
            <BtnDanger
              onClick={() => setDeleteQPConfirm(true)}
              icon={<Trash size={14} />}
            >
              Delete
            </BtnDanger>
          </div>
        </div>
      </div>

      {/* Main Question Type Modal */}
      <Modal
        open={questionTypeModal}
        onClose={() => setQuestionTypeModal(false)}
        title="Type of Question to Add"
        maxWidth="max-w-sm"
        headerColor="bg-[#9B2335]"
      >
        <div className="px-6 py-5 space-y-3">
          {["regular", "choice"].map((t) => (
            <label
              key={t}
              className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-border hover:bg-page-bg transition"
            >
              <input
                type="radio"
                name="qtype"
                value={t}
                checked={questionType === t}
                onChange={() => setQuestionType(t)}
                className="accent-[#9B2335]"
              />
              <span className="text-[13px] font-semibold text-text">
                {t === "regular" ? "Regular Question" : "Choice Based Question"}
              </span>
            </label>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 px-6 pb-5">
          <BtnSecondary
            onClick={() => {
              setQuestionTypeModal(false);
              setPendingSubParentId(null);
            }}
            icon={<X size={13} />}
          >
            Cancel
          </BtnSecondary>
          <BtnPrimary
            onClick={() => {
              setQuestionTypeModal(false);
              if (pendingSubParentId) {
                onAddSubQuestion(pendingSubParentId, questionType);
                setPendingSubParentId(null);
              } else {
                onAddQuestion(questionType);
              }
            }}
            icon={<CheckCircle size={13} />}
          >
            OK
          </BtnPrimary>
        </div>
      </Modal>

      <Modal
        open={previewModal}
        onClose={() => setPreviewModal(false)}
        title="Question Paper Preview"
        maxWidth="max-w-7xl"
      >
        <div className="max-h-[80vh] overflow-y-auto">
          <QuestionPaperPrintView
            assessment={assessment}
            questionPaper={questionPaper}
            questions={questions}
            readOnly
          />
        </div>
        <div className="flex items-center justify-end px-6 pb-5">
          <BtnSecondary onClick={() => setPreviewModal(false)} icon={<X size={13} />}>
            Close
          </BtnSecondary>
        </div>
      </Modal>

      {/* Scheme Modal */}
      <Modal
        open={schemeModal}
        onClose={() => setSchemeModal(false)}
        title="Scheme of Evaluation"
        maxWidth="max-w-sm"
        headerColor="bg-[#9B2335]"
      >
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={schemeFileName}
              placeholder="No file chosen"
              className="flex-1 border border-border rounded-xl px-3 py-2 text[12.5px] text-text2 bg-page-bg outline-none"
            />
            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500 text-white text-[12.5px] font-semibold cursor-pointer hover:bg-sky-600 transition">
              <UploadSimple size={14} /> Browse
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setSchemeFile(f);
                    setSchemeFileName(f.name);
                  }
                }}
              />
            </label>
          </div>
          <div className="flex items-center justify-end gap-2">
            <BtnSecondary
              onClick={() => setSchemeModal(false)}
              icon={<X size={13} />}
            >
              Cancel
            </BtnSecondary>
            <BtnPrimary
              onClick={() => {
                if (schemeFile) setSchemeModal(false);
              }}
              icon={<UploadSimple size={13} />}
            >
              Upload
            </BtnPrimary>
          </div>
        </div>
      </Modal>

      {/* Delete Main Question Confirm */}
      <ConfirmDialog
        open={!!deleteQuestionId}
        title="Delete Question"
        message="Are you sure you want to delete this question? All sub questions will also be deleted. This cannot be undone."
        onConfirm={() => {
          onDeleteQuestion(deleteQuestionId);
          setDeleteQuestionId(null);
        }}
        onCancel={() => setDeleteQuestionId(null)}
      />

      {/* Delete Sub Question Confirm */}
      <ConfirmDialog
        open={!!deleteSubQuestion}
        title="Delete Sub Question"
        message="Are you sure you want to delete this sub question? This cannot be undone."
        onConfirm={() => {
          onDeleteSubQuestion(
            deleteSubQuestion.parentId,
            deleteSubQuestion.subId,
          );
          setDeleteSubQuestion(null);
        }}
        onCancel={() => setDeleteSubQuestion(null)}
      />

      {/* Edit Paper Settings Modal */}
      <QuestionPaperTypeModal
        open={editQPSettingsModal}
        onClose={() => setEditQPSettingsModal(false)}
        onSave={(data) => {
          setEditQPSettingsModal(false);
          onEditQPSettings(data);
        }}
        initialData={questionPaper}
      />

      {/* Delete Entire Question Paper Confirm */}
      <ConfirmDialog
        open={deleteQPConfirm}
        title="Delete Question Paper"
        message="Are you sure you want to delete this entire question paper? All questions and sub-questions will be permanently deleted. This cannot be undone."
        onConfirm={() => {
          setDeleteQPConfirm(false);
          onDeleteQP();
        }}
        onCancel={() => setDeleteQPConfirm(false)}
      />
    </div>
  );
}

// ─── Question Paper Type Modal ────────────────────────────────────────────────
function QuestionPaperTypeModal({ open, onClose, onSave, initialData }) {
  const [paperType, setPaperType] = useState(
    initialData?.paperType || "regular",
  );
  const [numParts, setNumParts] = useState(initialData?.numParts || "");
  const [customPartName, setCustomPartName] = useState(
    initialData?.customPartName || "no",
  );
  const [parts, setParts] = useState(initialData?.parts || []);
  const [manualTotal, setManualTotal] = useState(
    initialData?.totalQuestions || "",
  );
  const [instructions, setInstructions] = useState(
    initialData?.instructions || "",
  );

  const autoTotal = parts.reduce(
    (sum, p) =>
      sum +
      (parseInt(p.choiceBasedQuestions) || 0) +
      (parseInt(p.regularQuestions) || 0),
    0,
  );
  const showPartConfig =
    paperType === "part-based" || paperType === "module-part-based";
  const totalQuestions =
    showPartConfig && parts.length > 0 ? autoTotal : Number(manualTotal) || 0;

  function handleNumPartsChange(val) {
    setNumParts(val);
    const n = parseInt(val);
    if (!isNaN(n) && n > 0) {
      setParts(
        Array.from({ length: n }, (_, i) => ({
          id: i,
          name: String.fromCharCode(65 + i),
          addSubParts: "no",
          choiceBasedQuestions: "",
          regularQuestions: "",
        })),
      );
    } else setParts([]);
  }

  function handlePartChange(id, field, value) {
    setParts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  }

  function handleReset() {
    setPaperType("regular");
    setNumParts("");
    setCustomPartName("no");
    setParts([]);
    setManualTotal("");
    setInstructions("");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Question Paper Type"
      maxWidth="max-w-2xl"
      headerColor="bg-[#9B2335]"
    >
      <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
        <div>
          <p className="text-[12.5px] font-semibold text-text mb-3">
            Select question paper type <span className="text-red-500">*</span>
          </p>
          <div className="flex flex-wrap gap-4">
            {[
              { value: "regular", label: "Regular" },
              { value: "part-based", label: "Part Based" },
              { value: "module-based", label: "Module Based" },
              { value: "module-part-based", label: "Module and Part based" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="paperType"
                  value={opt.value}
                  checked={paperType === opt.value}
                  onChange={() => setPaperType(opt.value)}
                  className="accent-[#9B2335]"
                />
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
                <InputUnderline
                  type="number"
                  min={1}
                  value={numParts}
                  onChange={(e) => handleNumPartsChange(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <p className="text-[12.5px] font-semibold text-text mb-2">
                  Would you like to give custom name for parts?
                </p>
                <div className="flex gap-4">
                  {["yes", "no"].map((v) => (
                    <label
                      key={v}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="customPart"
                        value={v}
                        checked={customPartName === v}
                        onChange={() => setCustomPartName(v)}
                        className="accent-[#9B2335]"
                      />
                      <span className="text-[13px] text-text capitalize">
                        {v}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {parts.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {parts.map((p) => (
                  <div
                    key={p.id}
                    className="border border-border rounded-[14px] p-4 space-y-3 bg-page-bg"
                  >
                    <p className="text-[12.5px] font-bold text-text">
                      Part - {p.name}
                    </p>
                    <div>
                      <p className="text-[12px] font-semibold text-text2 mb-2">
                        Would you like to add sub parts?
                      </p>
                      <div className="flex gap-4">
                        {["yes", "no"].map((v) => (
                          <label
                            key={v}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`subparts-${p.id}`}
                              value={v}
                              checked={p.addSubParts === v}
                              onChange={() =>
                                handlePartChange(p.id, "addSubParts", v)
                              }
                              className="accent-[#9B2335]"
                            />
                            <span className="text-[12.5px] text-text capitalize">
                              {v}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <FieldLabel required>
                        Enter # of choice based questions to attend in part{" "}
                        {p.name}
                      </FieldLabel>
                      <InputUnderline
                        type="number"
                        min={0}
                        value={p.choiceBasedQuestions}
                        onChange={(e) =>
                          handlePartChange(
                            p.id,
                            "choiceBasedQuestions",
                            e.target.value,
                          )
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <FieldLabel required>
                        Enter # of regular questions to attend in part {p.name}
                      </FieldLabel>
                      <InputUnderline
                        type="number"
                        min={0}
                        value={p.regularQuestions}
                        onChange={(e) =>
                          handlePartChange(
                            p.id,
                            "regularQuestions",
                            e.target.value,
                          )
                        }
                        placeholder="0"
                      />
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
              <input
                type="number"
                readOnly
                value={autoTotal}
                className="w-full border-b border-border bg-transparent px-0 py-2.5 text-[13px] font-semibold text-text outline-none cursor-not-allowed"
              />
              <span className="absolute right-0 top-2.5 text-[11px] text-text2 italic bg-white pl-1">
                auto-calculated
              </span>
            </div>
          ) : (
            <InputUnderline
              type="number"
              min={0}
              value={manualTotal}
              onChange={(e) => setManualTotal(e.target.value)}
              placeholder="0"
            />
          )}
        </div>
        <div>
          <FieldLabel>Instructions</FieldLabel>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={5}
            placeholder="Enter instructions for students..."
            className="w-full border border-border rounded-xl px-3 py-2.5 text-[13px] text-text outline-none resize-none focus:border-[#9B2335] transition"
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-page-bg">
        <BtnSecondary
          onClick={handleReset}
          icon={<ArrowCounterClockwise size={13} />}
        >
          Reset
        </BtnSecondary>
        <BtnPrimary
          onClick={() =>
            onSave({
              paperType,
              numParts,
              customPartName,
              parts,
              totalQuestions,
              instructions,
            })
          }
          icon={<FloppyDisk size={13} />}
        >
          Save
        </BtnPrimary>
      </div>
    </Modal>
  );
}

// ─── Add / Edit IA Modal ──────────────────────────────────────────────────────
function AddIAModal({ open, onClose, onSave, editingIA }) {
  const isEditing = !!editingIA;
  const emptyForm = {
    courseSections: "",
    assessmentNumber: "",
    date: "",
    startTime: "",
    endTime: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm({
        courseSections: editingIA?.course?.id || "",
        assessmentNumber: editingIA?.assessmentNumber || "",
        date: editingIA?.rawDate || "",
        startTime: editingIA?.startTime || "",
        endTime: editingIA?.endTime || "",
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
    if (!form.courseSections)
      e.courseSections = "Course and section are required.";
    if (!form.assessmentNumber.trim())
      e.assessmentNumber = "Assessment number is required.";
    if (!form.date) e.date = "Date is required.";
    if (!form.startTime.trim()) e.startTime = "Start time is required.";
    else if (!timePattern.test(form.startTime.trim()))
      e.startTime = "Start time required in HH:MM AM/PM format.";
    if (!form.endTime.trim()) e.endTime = "End time is required.";
    else if (!timePattern.test(form.endTime.trim()))
      e.endTime = "End time required in HH:MM AM/PM format.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    const course = DUMMY_COURSES.find((c) => c.id === form.courseSections);
    onSave({
      id: editingIA?.id || `ia-${Date.now()}`,
      assessmentNumber: form.assessmentNumber,
      rawDate: form.date,
      dateLabel: formatDate(form.date),
      startTime: form.startTime,
      endTime: form.endTime,
      timeRange: `${form.startTime} - ${form.endTime}`,
      course,
      maxMarks: editingIA?.maxMarks || 30,
      status: editingIA?.status || "Pending",
      createdBy: editingIA?.createdBy || "Mr Hari Prasath",
      questionPaperStatus: editingIA?.questionPaperStatus || "not-set",
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
              options={DUMMY_COURSES.map((c) => ({
                value: c.id,
                label: c.label,
              }))}
              placeholder="Select course-section"
              error={errors.courseSections}
            />
          </div>
          <div>
            <FieldLabel required>Internal Assessment Number</FieldLabel>
            <InputUnderline
              type="text"
              value={form.assessmentNumber}
              onChange={(e) => handleChange("assessmentNumber", e.target.value)}
              placeholder="e.g. 1"
              error={errors.assessmentNumber}
            />
          </div>
          <div>
            <FieldLabel required>Date</FieldLabel>
            <InputUnderline
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
              error={errors.date}
            />
          </div>
          <div>
            <FieldLabel required>Start Time</FieldLabel>
            <InputUnderline
              type="text"
              value={form.startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
              placeholder="HH:MM AM/PM"
              error={errors.startTime}
            />
          </div>
          <div>
            <FieldLabel required>End Time</FieldLabel>
            <InputUnderline
              type="text"
              value={form.endTime}
              onChange={(e) => handleChange("endTime", e.target.value)}
              placeholder="HH:MM AM/PM"
              error={errors.endTime}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <BtnSecondary
            type="button"
            onClick={() => setForm(emptyForm)}
            icon={<ArrowCounterClockwise size={13} />}
          >
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
  const [assessments, setAssessments] = useState(() =>
    lsGet(LS_ASSESSMENTS, []),
  );
  const [questionPapers, setQuestionPapers] = useState(() => lsGet(LS_QP, {}));
  const [questions, setQuestions] = useState(() => lsGet(LS_QUESTIONS, {}));

  const savedNav = lsGet(LS_APP_STATE, {});
  const [view, setView] = useState("list");
  const [activeAssessmentId, setActiveAssessmentId] = useState(
    savedNav.activeAssessmentId || null,
  );
  const [activeTab, setActiveTab] = useState(savedNav.activeTab || null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [subQuestionContext, setSubQuestionContext] = useState(null);
  const [addIAModal, setAddIAModal] = useState(false);
  const [editingIA, setEditingIA] = useState(null);
  const [existingPaperModal, setExistingPaperModal] = useState(false);
  const [qpTypeModal, setQpTypeModal] = useState(false);
  const [deleteIAId, setDeleteIAId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    lsSet(LS_ASSESSMENTS, assessments);
  }, [assessments]);
  useEffect(() => {
    lsSet(LS_QP, questionPapers);
  }, [questionPapers]);
  useEffect(() => {
    lsSet(LS_QUESTIONS, questions);
  }, [questions]);
  useEffect(() => {
    lsSet(LS_APP_STATE, { view: "list", activeAssessmentId, activeTab });
  }, [view, activeAssessmentId, activeTab]);

  const activeAssessment = assessments.find((a) => a.id === activeAssessmentId);
  const activeQP = activeAssessmentId
    ? questionPapers[activeAssessmentId]
    : null;
  const activeQuestions = activeAssessmentId
    ? questions[activeAssessmentId] || []
    : [];
  const editingQuestion = editingQuestionId
    ? activeQuestions.find((q) => q.id === editingQuestionId)
    : null;

  const editingSubQuestion =
    subQuestionContext?.subId && subQuestionContext?.parentId
      ? activeQuestions
          .find((q) => q.id === subQuestionContext.parentId)
          ?.subQuestions?.find((sq) => sq.id === subQuestionContext.subId)
      : null;

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  function navigate(newView, assessmentId) {
    setView(newView);
    if (assessmentId !== undefined) setActiveAssessmentId(assessmentId);
  }

  // ── IA CRUD ──
  function handleSaveIA(ia) {
    const isNew = !assessments.find((a) => a.id === ia.id);
    if (isNew) {
      const isDuplicate = assessments.find(
        (a) =>
          a.assessmentNumber === ia.assessmentNumber &&
          a.course?.id === ia.course?.id,
      );
      if (isDuplicate) {
        showToast(
          `Internal Assessment ${ia.assessmentNumber} already exists for this course!`,
          "error",
        );
        return;
      }
    }
    setAssessments((prev) =>
      isNew ? [ia, ...prev] : prev.map((a) => (a.id === ia.id ? ia : a)),
    );
    setActiveTab(ia.id);
    setAddIAModal(false);
    setEditingIA(null);
    showToast(
      isNew ? "Success! Internal added" : "Assessment updated successfully!",
    );
  }

  function handleEditIA(ia) {
    setEditingIA(ia);
    setAddIAModal(true);
  }

  function handleDeleteIA(id) {
    setAssessments((prev) => prev.filter((a) => a.id !== id));
    setQuestionPapers((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    setQuestions((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    if (activeTab === id) {
      const remaining = assessments.filter((a) => a.id !== id);
      setActiveTab(remaining.length > 0 ? remaining[0].id : null);
    }
    setDeleteIAId(null);
    showToast("Assessment deleted.");
  }

  // ── QP Flow ──
  function handleSetQP(assessmentId) {
    setActiveAssessmentId(assessmentId);
    setExistingPaperModal(true);
  }

  function handleCreateQP() {
    setExistingPaperModal(false);
    setQpTypeModal(true);
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
        createdAt:
          existing?.createdAt || new Date().toLocaleDateString("en-GB"),
      },
    }));
    setAssessments((prev) =>
      prev.map((a) =>
        a.id === activeAssessmentId
          ? { ...a, questionPaperStatus: "in-progress" }
          : a,
      ),
    );
    navigate("questionPaperDetail");
  }

  // ── Main Question CRUD ──
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
    const qWithType = {
      ...q,
      questionType: q.questionType || pendingQuestionType,
    };
    setQuestions((prev) => {
      const list = prev[activeAssessmentId] || [];
      const exists = list.find((x) => x.id === qWithType.id);
      return {
        ...prev,
        [activeAssessmentId]: exists
          ? list.map((x) => (x.id === qWithType.id ? qWithType : x))
          : [...list, qWithType],
      };
    });
    setEditingQuestionId(null);
    navigate("questionPaperDetail");
    showToast(
      editingQuestionId ? "Question updated!" : "Question saved successfully!",
    );
  }

  function handleDeleteQuestion(qid) {
    setQuestions((prev) => ({
      ...prev,
      [activeAssessmentId]: (prev[activeAssessmentId] || []).filter(
        (q) => q.id !== qid,
      ),
    }));
    showToast("Question deleted.");
  }

  // ── Sub Question CRUD ──
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
          return {
            ...q,
            subQuestions: exists
              ? subs.map((s) => (s.id === sq.id ? sq : s))
              : [...subs, sq],
          };
        }),
      };
    });
    setSubQuestionContext(null);
    navigate("questionPaperDetail");
    showToast(
      subQuestionContext.subId
        ? "Sub question updated!"
        : "Sub question saved successfully!",
    );
  }

  function handleDeleteSubQuestion(parentId, subId) {
    setQuestions((prev) => {
      const list = prev[activeAssessmentId] || [];
      return {
        ...prev,
        [activeAssessmentId]: list.map((q) => {
          if (q.id !== parentId) return q;
          return {
            ...q,
            subQuestions: (q.subQuestions || []).filter((s) => s.id !== subId),
          };
        }),
      };
    });
    showToast("Sub question deleted.");
  }

  function handleEditQPSettings(data) {
    setQuestionPapers((prev) => ({
      ...prev,
      [activeAssessmentId]: {
        ...prev[activeAssessmentId],
        ...data,
        status: "Saved",
      },
    }));
    showToast("Question paper settings updated successfully!");
  }

  function handleDeleteQP() {
    setQuestionPapers((prev) => {
      const n = { ...prev };
      delete n[activeAssessmentId];
      return n;
    });
    setQuestions((prev) => {
      const n = { ...prev };
      delete n[activeAssessmentId];
      return n;
    });
    setAssessments((prev) =>
      prev.map((a) =>
        a.id === activeAssessmentId
          ? { ...a, questionPaperStatus: "not-set", status: "Pending" }
          : a,
      ),
    );
    showToast("Question paper deleted successfully.");
    navigate("list");
  }

  function handleSubmitQP(schemeFileName) {
    setAssessments((prev) =>
      prev.map((a) =>
        a.id === activeAssessmentId
          ? { ...a, questionPaperStatus: "completed", status: "Completed" }
          : a,
      ),
    );
    setQuestionPapers((prev) => ({
      ...prev,
      [activeAssessmentId]: {
        ...prev[activeAssessmentId],
        status: "Submitted",
        schemeFileName,
      },
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
        onBack={() => navigate("list")}
      />
    );
  }

  if (view === "addQuestion" && activeAssessment) {
    const isSubQ = !!subQuestionContext;
    const parentQ = isSubQ
      ? activeQuestions.find((q) => q.id === subQuestionContext.parentId)
      : null;

    return (
      <AddQuestionPage
        assessment={activeAssessment}
        questionPaper={activeQP}
        onSave={isSubQ ? handleSaveSubQuestion : handleSaveQuestion}
        onBack={() => {
          setSubQuestionContext(null);
          navigate("questionPaperDetail");
        }}
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
        toast={toast}
        setToast={setToast}
      />
    );
  }

  // ── List view ──
  const hasAssessments = assessments.length > 0;

  return (
    <div className="flex-1 overflow-y-auto p-5 pb-12">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-[12px] text-text2">
          <span>Timetable</span>
          <span className="text-border">/</span>
          <span className="font-semibold text-text uppercase tracking-wide">
            INTERNAL
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-text2 hover:text-[#9B2335] transition">
            <Eye size={14} /> View Archive
          </button>
          <button
            onClick={() => {
              setEditingIA(null);
              setAddIAModal(true);
            }}
            className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center text-text2 hover:bg-[#9B2335] hover:text-white hover:border-[#9B2335] transition shadow-sm"
          >
            <Plus size={16} weight="bold" />
          </button>
        </div>
      </div>

      {!hasAssessments && (
        <div className="min-h-[55vh] flex items-center justify-center bg-white rounded-[14px] border border-border">
          <p className="text-[14px] font-medium text-text2">
            No internals scheduled
          </p>
        </div>
      )}

      {hasAssessments && (
        <div className="bg-white rounded-[14px] border border-border overflow-hidden">
          <div className="flex border-b border-border px-4 pt-2 gap-1 overflow-x-auto">
            {assessments.map((a) => (
              <button
                key={a.id}
                onClick={() => setActiveTab(a.id)}
                className={`px-4 py-2 text-[12.5px] font-semibold whitespace-nowrap border-b-2 transition
                  ${activeTab === a.id ? "border-[#9B2335] text-[#9B2335]" : "border-transparent text-text2 hover:text-text"}`}
              >
                Internal Assessment {a.assessmentNumber}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="bg-[#e8f4fc] border-b border-border">
                  {[
                    "Date",
                    "Course",
                    "Degree-Dept-Semester-Sec",
                    "Max Marks",
                    "Status",
                    "Created/Modified By",
                    "Question Paper",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11.5px] font-semibold text-text2 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assessments
                  .filter((a) => !activeTab || a.id === activeTab)
                  .map((a) => (
                    <tr
                      key={a.id}
                      className="border-t border-border hover:bg-page-bg transition-colors"
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold text-text">{a.dateLabel}</p>
                        <p className="text-text2 text-[11.5px] mt-0.5">
                          {a.timeRange}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p
                          className={`font-semibold ${a.questionPaperStatus === "completed" ? "text-green-600" : "text-text"}`}
                        >
                          {a.course?.courseName}
                        </p>
                        <p className="text-text2 text-[11.5px] mt-0.5">
                          {a.course?.courseCode}
                        </p>
                      </td>
                      <td className="px-4 py-4 max-w-55">
                        <p className="text-text2 text-[11.5px] line-clamp-3">
                          {a.course?.deptSemSec}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-text font-semibold">
                        {a.maxMarks}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold
                        ${a.status === "Completed" ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-text2">{a.createdBy}</td>
                      <td className="px-4 py-4">
                        {a.questionPaperStatus === "completed" ? (
                          <button
                            onClick={() => {
                              setActiveAssessmentId(a.id);
                              navigate("printView", a.id);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-white text-[11.5px] font-semibold hover:bg-sky-600 transition"
                          >
                            <Eye size={12} weight="fill" /> View
                          </button>
                        ) : a.questionPaperStatus === "in-progress" ? (
                          <button
                            onClick={() => {
                              setActiveAssessmentId(a.id);
                              navigate("questionPaperDetail", a.id);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[11.5px] font-semibold hover:bg-amber-600 transition"
                          >
                            Resume
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSetQP(a.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-white text-[11.5px] font-semibold hover:bg-sky-600 transition"
                          >
                            Set
                          </button>
                        )}
                      </td>

                      {/* ── ACTIONS COLUMN — only change in this file ── */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          {a.questionPaperStatus !== "completed" ? (
                            <button
                              onClick={() => handleEditIA(a)}
                              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text2 hover:text-[#9B2335] hover:border-[#9B2335] transition"
                              title="Edit"
                            >
                              <Pencil size={13} />
                            </button>
                          ) : (
                            <div
                              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text2 opacity-30 cursor-not-allowed"
                              title="Cannot edit after question paper is completed"
                            >
                              <Pencil size={13} />
                            </div>
                          )}
                          <button
                            onClick={() => setDeleteIAId(a.id)}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text2 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition"
                            title="Delete"
                          >
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

      <AddIAModal
        open={addIAModal}
        onClose={() => {
          setAddIAModal(false);
          setEditingIA(null);
        }}
        onSave={handleSaveIA}
        editingIA={editingIA}
      />

      <Modal
        open={existingPaperModal}
        onClose={() => setExistingPaperModal(false)}
        title="Existing Paper View Confirmation"
        headerColor="bg-white border-b border-border"
        headerText="text-text"
      >
        <div className="px-6 py-5">
          <p className="text-[13px] text-text2 leading-relaxed">
            Do you want to clone from existing question paper? Click on either{" "}
            <span className="font-bold text-text">Create</span> button to create
            the new question paper or{" "}
            <span className="font-bold text-text">Clone</span> button to clone
            the existing question paper.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 px-6 pb-5">
          <BtnBlue icon={<Copy size={13} />}>Clone</BtnBlue>
          <BtnPrimary onClick={handleCreateQP} icon={<Plus size={13} />}>
            Create
          </BtnPrimary>
          <BtnSecondary
            onClick={() => setExistingPaperModal(false)}
            icon={<X size={13} />}
          >
            Cancel
          </BtnSecondary>
        </div>
      </Modal>

      <QuestionPaperTypeModal
        open={qpTypeModal}
        onClose={() => setQpTypeModal(false)}
        onSave={handleSaveQPType}
        initialData={null}
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
