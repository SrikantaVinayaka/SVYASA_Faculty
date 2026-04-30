import { useEffect, useMemo, useState } from "react";
import {
  ArrowsClockwise,
  CalendarBlank,
  CaretLeft,
  CaretDown,
  CheckCircle,
  ClipboardText,
  Copy,
  FloppyDisk,
  Eye,
  FilePdf,
  Files,
  PencilSimple,
  Plus,
  Trash,
  X,
} from "@phosphor-icons/react";
import { LESSON_MODULES } from "./lessonModules";
import { downloadLessonPlanDocx } from "./exportLessonPlanDocx";
import * as XLSX from "xlsx";

const BRAND = "#9B2335";
const PAGE_OPTIONS = {
  home: "home",
  tracking: "tracking",
  archive: "archive",
  mapping: "mapping",
};
const BLOOM_LEVELS = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
const VALIDATION_METHODS = ["Quiz", "Assignment", "Presentation", "Observation", "Lab", "Viva"];
const CLASS_TYPES = ["Regular", "Special", "Tutorial"];
const EXECUTION_METHODS = ["Lecture", "Discussion", "Hands-on", "Case Study", "Presentation"];
const MATERIAL_TYPES = ["Text Book", "Reference Book", "Journal", "Website", "Video", "PPT"];

function safeUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `lesson_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function toMinutes(hours, minutes) {
  return (Number(hours) || 0) * 60 + (Number(minutes) || 0);
}

function minutesToLabel(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} hr : ${minutes} min`;
}

function formatShortDate(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function clampCoverage(value) {
  return Math.max(0, Math.min(100, Math.round(value || 0)));
}

function createModule(moduleNumber, title, startDate, endDate, periodsPlanned, periodsApproved, lessonTitles, overrides = {}) {
  return {
    id: safeUUID(),
    code: `M${moduleNumber}`,
    title: `Module ${moduleNumber}`,
    subtitle: title,
    startDate,
    endDate,
    periodsPlanned,
    periodsApproved,
    periodDurationMinutes: 50,
    restricted: false,
    ...overrides,
    lessons: lessonTitles.map((lesson, idx) => ({
      id: safeUUID(),
      label: `${idx + 1}-${lesson}`,
      value: lesson,
    })),
  };
}

function deriveModule(module, entries) {
  const moduleEntries = entries.filter((entry) => entry.moduleId === module.id);
  const takenEntries = moduleEntries.filter((entry) => entry.status === "Done");
  const periodsTaken = takenEntries.length;
  const coverage = clampCoverage((periodsTaken / Math.max(1, module.periodsApproved)) * 100);
  const completed = coverage >= 100;
  return {
    ...module,
    periodsTaken,
    coverage,
    completed,
  };
}

function derivePlan(plan) {
  const modules = plan.modules.map((module) => deriveModule(module, plan.planEntries));
  const plannedClasses = modules.reduce((sum, module) => sum + Number(module.periodsPlanned || 0), 0);
  const actualClasses = modules.reduce((sum, module) => sum + Number(module.periodsTaken || 0), 0);
  const plannedMinutes = modules.reduce(
    (sum, module) => sum + (Number(module.periodsPlanned || 0) * Number(module.periodDurationMinutes || 0)),
    0,
  );
  const actualMinutes = plan.planEntries
    .filter((entry) => entry.status === "Done")
    .reduce((sum, entry) => sum + toMinutes(entry.actualEffortHours, entry.actualEffortMinutes), 0);
  const portionsCoverage = clampCoverage(
    modules.reduce((sum, module) => sum + module.coverage, 0) / Math.max(1, modules.length),
  );
  return {
    ...plan,
    modules,
    summary: {
      plannedClasses,
      actualClasses,
      plannedMinutes,
      actualMinutes,
      portionsCoverage,
    },
  };
}

function createSeedPlans() {
  const module1 = createModule(
    1,
    "Introduction HTML & CSS",
    "2026-03-16",
    "2026-04-08",
    11,
    11,
    ["Introduction to HTML5", "Hyperlinks", "Tables and Forms", "Layouts", "Selectors", "Box Model"],
    { restricted: true },
  );
  const module2 = createModule(
    2,
    "Introduction to Javascript",
    "2026-04-08",
    "2026-04-27",
    11,
    11,
    ["Javascript Basics", "Variables and Data Types", "Functions", "DOM", "Events", "Async JS"],
  );
  const module3 = createModule(
    3,
    "Introduction to React",
    "2026-04-27",
    "2026-05-18",
    11,
    11,
    ["JSX", "Components", "Props", "State", "Hooks", "Routing"],
  );
  const module4 = createModule(
    4,
    "React Advanced Concepts",
    "2026-05-18",
    "2026-06-05",
    11,
    11,
    ["Context API", "Reducers", "Performance", "Forms", "Testing", "Deployment"],
  );
  const module5 = createModule(
    5,
    "Node, Express and MongoDB",
    "2026-06-05",
    "2026-06-25",
    11,
    11,
    ["Node Runtime", "Express Routing", "Middleware", "MongoDB Models", "REST APIs", "Authentication"],
  );

  const entries = [
    {
      id: safeUUID(),
      period: 1,
      plannedDate: "2026-03-16",
      actualDate: "2026-03-16",
      moduleId: module1.id,
      lessonId: module1.lessons[0].id,
      lessonLabel: module1.lessons[0].label,
      topics: ["Introduction to HTML5 tags", "Basic syntax and structure", "Images"],
      materialItems: [{ id: safeUUID(), type: "Text Book", title: "Full Stack Development with React by Maximilian Schwarzmuller, 2nd Edition, 2020." }],
      classType: "Regular",
      executionMethod: "Lecture",
      courseOutcomeId: "co1",
      bloomLevel: "Remember",
      learningValidationMethod: "Observation",
      plannedEffortHours: 0,
      plannedEffortMinutes: 50,
      actualEffortHours: 0,
      actualEffortMinutes: 50,
      meetingLink: "",
      status: "Done",
    },
    {
      id: safeUUID(),
      period: 2,
      plannedDate: "2026-03-18",
      actualDate: "2026-03-18",
      moduleId: module1.id,
      lessonId: module1.lessons[1].id,
      lessonLabel: module1.lessons[1].label,
      topics: ["Hyperlinks", "Lists"],
      materialItems: [{ id: safeUUID(), type: "Reference Book", title: "Headfirst Web Development, 2nd Edition, 2020." }],
      classType: "Regular",
      executionMethod: "Lecture",
      courseOutcomeId: "co1",
      bloomLevel: "Understand",
      learningValidationMethod: "Observation",
      plannedEffortHours: 0,
      plannedEffortMinutes: 50,
      actualEffortHours: 0,
      actualEffortMinutes: 50,
      meetingLink: "",
      status: "Done",
    },
    {
      id: safeUUID(),
      period: 3,
      plannedDate: "2026-03-20",
      actualDate: "2026-03-20",
      moduleId: module1.id,
      lessonId: module1.lessons[2].id,
      lessonLabel: module1.lessons[2].label,
      topics: ["Tables", "Forms", "HTML5 elements"],
      materialItems: [],
      classType: "Regular",
      executionMethod: "Lecture",
      courseOutcomeId: "co1",
      bloomLevel: "Apply",
      learningValidationMethod: "Quiz",
      plannedEffortHours: 0,
      plannedEffortMinutes: 50,
      actualEffortHours: 0,
      actualEffortMinutes: 50,
      meetingLink: "",
      status: "Done",
    },
    {
      id: safeUUID(),
      period: 12,
      plannedDate: "2026-04-08",
      actualDate: "2026-04-08",
      moduleId: module2.id,
      lessonId: module2.lessons[0].id,
      lessonLabel: module2.lessons[0].label,
      topics: ["Introduction to Javascript", "Screen output", "Variables"],
      materialItems: [],
      classType: "Regular",
      executionMethod: "Lecture",
      courseOutcomeId: "co2",
      bloomLevel: "Understand",
      learningValidationMethod: "Observation",
      plannedEffortHours: 0,
      plannedEffortMinutes: 50,
      actualEffortHours: 0,
      actualEffortMinutes: 50,
      meetingLink: "",
      status: "Pending",
    },
  ];

  const plan = {
    id: safeUUID(),
    courseId: "MCA-DET-CC-MCA-AWT(MCAP231)-2-B-2025",
    courseName: "Advanced Web Technologies-MCAP231",
    sectionName: "MCA-2-B",
    semesterWindow: { startDate: "2026-03-16", endDate: "2026-07-24" },
    weeklyLectureHours: 3,
    totalLectureHours: 45,
    examMarks: 50,
    iaMarks: 50,
    credits: 3,
    examHours: 3,
    schedule: [
      { day: "MON", time: "11:40 AM-12:30 PM" },
      { day: "WED", time: "09:50 AM-10:40 AM" },
      { day: "THU", time: "09:00 AM-09:50 AM" },
      { day: "FRI", time: "09:50 AM-10:40 AM" },
    ],
    statusLabel: "Approved By Dr Sachin Sharma",
    isSubmitted: true,
    isCurricularCourse: false,
    isExtraCurricularCourse: false,
    modules: [module1, module2, module3, module4, module5],
    courseOutcomes: [
      {
        id: "co1",
        number: "1",
        title: "Describe the basic constructs of the web concepts.",
        subtitles: ["Explain the structure of web pages and semantic HTML."],
        status: "Approved",
      },
      {
        id: "co2",
        number: "2",
        title: "Design single page applications using JavaScript frameworks.",
        subtitles: ["Select suitable client-side patterns for interactive UIs."],
        status: "Approved",
      },
      {
        id: "co3",
        number: "3",
        title: "Demonstrate basic concepts of react, node, express and mongodb technologies.",
        subtitles: ["Integrate frontend and backend modules into a working application."],
        status: "Approved",
      },
    ],
    sourceMaterials: [
      {
        id: safeUUID(),
        type: "Text Book",
        title: "Full Stack Development with React by Maximilian Schwarzmuller, 2nd Edition, 2020.",
        status: "Approved",
      },
      {
        id: safeUUID(),
        type: "Text Book",
        title: "Headfirst Web Development: A Learning Web Design from Scratch by Elisabeth Robson and Eric Freeman, 2nd Edition, 2020.",
        status: "Approved",
      },
      {
        id: safeUUID(),
        type: "Reference Book",
        title: "RESTful API Design: How to Create Web Services that are Consistent and Usable by Leonard Richardson and Mike Amundsen, 1st Edition, 2013.",
        status: "Approved",
      },
    ],
    planEntries: entries,
  };

  return [derivePlan(plan)];
}

function updatePlanById(plans, planId, updater) {
  return plans.map((plan) => (plan.id === planId ? derivePlan(updater(plan)) : derivePlan(plan)));
}

function Button({ children, variant = "primary", disabled = false, className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-[12.5px] font-semibold transition-all";
  const variants = {
    primary: disabled
      ? "bg-slate-300 text-white cursor-not-allowed"
      : "bg-[#0B4B5A] text-white hover:opacity-95 shadow-sm",
    secondary: disabled
      ? "bg-white text-slate-300 border border-border cursor-not-allowed"
      : "bg-white text-text border border-border hover:bg-page-bg",
    danger: disabled
      ? "bg-slate-300 text-white cursor-not-allowed"
      : "bg-[#7B1D2E] text-white hover:opacity-95",
    ghost: disabled
      ? "text-slate-300 cursor-not-allowed"
      : "text-text2 hover:text-text hover:bg-page-bg",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`.trim()} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-text2 mb-1.5">{label}</label>
      {children}
      {hint ? <p className="mt-1 text-[11px] text-text2">{hint}</p> : null}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-border bg-white px-3 py-2 text-[12.5px] text-text outline-none focus:border-[#D3A1A7] disabled:bg-slate-100 disabled:text-slate-400 ${props.className || ""}`}
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-border bg-white px-3 py-2 text-[12.5px] text-text outline-none focus:border-[#D3A1A7] disabled:bg-slate-100 disabled:text-slate-400 ${props.className || ""}`}
    />
  );
}

function Modal({ open, title, onClose, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div
        className={`w-full ${wide ? "max-w-5xl" : "max-w-2xl"} rounded-[18px] border border-border bg-white shadow-2xl`}
        style={{ boxShadow: "0 24px 80px rgba(15, 23, 42, 0.28)" }}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-[15px] font-bold text-text">{title}</h3>
          <button
            className="rounded-lg p-1 text-text2 transition-colors hover:bg-page-bg hover:text-text"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[85vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function SectionCard({ title, actions, children }) {
  return (
    <section className="rounded-[18px] border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 rounded-t-[18px] bg-[#F4ECEC] px-4 py-3">
        <h2 className="text-[14px] font-bold text-text">{title}</h2>
        {actions}
      </div>
      <div className="overflow-visible p-4">{children}</div>
    </section>
  );
}

function SummaryStat({ label, value, extra }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <p className="text-[12px] text-text2">{label}</p>
      <p className="mt-1 text-[14px] font-bold text-text">{value}</p>
      {extra ? <p className="mt-1 text-[11.5px] text-text2">{extra}</p> : null}
    </div>
  );
}

function ModuleCard({ module, isEditing, onEditToggle, onFieldChange, onSave, onCancel, allowArchiveView = false }) {
  const progressClass = module.completed ? "bg-emerald-500" : module.coverage > 0 ? "bg-amber-600" : "bg-slate-200";
  const readOnly = !isEditing;
  const editDisabled = module.restricted || module.completed || allowArchiveView;
  return (
    <div className="rounded-[18px] border border-border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[14px] font-bold text-white inline-flex rounded-tl-xl rounded-br-xl bg-[#B06975] px-3 py-1">{module.title}</p>
          <p className="mt-2 text-[13px] font-semibold text-text">{module.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button className="rounded-full p-1.5 text-emerald-700 hover:bg-emerald-50" onClick={onSave} aria-label="Save module">
                <FloppyDisk size={16} weight="fill" />
              </button>
              <button className="rounded-full p-1.5 text-text2 hover:bg-page-bg" onClick={onCancel} aria-label="Cancel module editing">
                <X size={16} />
              </button>
            </>
          ) : (
            <button
              className={`rounded-full p-1.5 ${editDisabled ? "cursor-not-allowed text-slate-300" : "text-[#0B4B5A] hover:bg-slate-100"}`}
              onClick={() => !editDisabled && onEditToggle()}
              disabled={editDisabled}
              aria-label="Edit module"
              title={editDisabled ? "Editing is disabled for completed or restricted modules." : "Edit module"}
            >
              <PencilSimple size={16} weight="fill" />
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 h-3 rounded-full bg-slate-200">
        <div className={`h-3 rounded-full ${progressClass}`} style={{ width: `${module.coverage}%` }} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Start Date">
          <Input type="date" value={module.startDate} onChange={(e) => onFieldChange("startDate", e.target.value)} disabled={readOnly} />
        </Field>
        <Field label="End Date">
          <Input type="date" value={module.endDate} onChange={(e) => onFieldChange("endDate", e.target.value)} disabled={readOnly} />
        </Field>
        <Field label={`# of Periods ${allowArchiveView ? "Taken" : "Planned"}`}>
          <Input
            type="number"
            min={1}
            value={module.periodsPlanned}
            onChange={(e) => onFieldChange("periodsPlanned", Number(e.target.value))}
            disabled={readOnly}
          />
        </Field>
        <Field label="# of Periods Approved">
          <Input value={module.periodsApproved} disabled className="bg-slate-100" />
        </Field>
        <Field label="# of Periods Taken">
          <Input value={module.periodsTaken} disabled className="bg-slate-100" />
        </Field>
        <Field label="Period Duration">
          <Input value={minutesToLabel(module.periodDurationMinutes)} disabled className="bg-slate-100" />
        </Field>
        <Field label="% Coverage">
          <Input value={module.coverage} disabled className="bg-slate-100" />
        </Field>
      </div>

      {(module.completed || module.restricted) && (
        <p className="mt-3 text-[11.5px] font-semibold text-text2">
          {module.completed ? "Completed modules are shown as read-only." : "Restricted modules remain read-only until reopened."}
        </p>
      )}
    </div>
  );
}

function TableShell({ columns, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className={`grid ${columns} bg-page-bg px-4 py-3 text-[11.5px] font-semibold text-text2`}>{children[0]}</div>
      <div className="divide-y divide-border bg-white">{children.slice(1)}</div>
    </div>
  );
}

function clonePlan(plan) {
  return derivePlan({
    ...plan,
    id: safeUUID(),
    courseId: `${plan.courseId}-COPY`,
    statusLabel: "Draft Copy",
    isSubmitted: false,
    modules: plan.modules.map((module) => ({
      ...module,
      id: safeUUID(),
      lessons: module.lessons.map((lesson) => ({ ...lesson, id: safeUUID() })),
    })),
    courseOutcomes: plan.courseOutcomes.map((item) => ({ ...item, id: safeUUID() })),
    sourceMaterials: plan.sourceMaterials.map((item) => ({ ...item, id: safeUUID() })),
    planEntries: plan.planEntries.map((entry) => ({
      ...entry,
      id: safeUUID(),
      materialItems: entry.materialItems.map((material) => ({ ...material, id: safeUUID() })),
      status: "Pending",
      actualDate: "",
      actualEffortHours: entry.plannedEffortHours,
      actualEffortMinutes: entry.plannedEffortMinutes,
    })),
  });
}

function buildGeneratedPlan({ selectedModuleIds, startDate, endDate, periods }) {
  const selected = selectedModuleIds
    .map((id, index) => LESSON_MODULES.find((module) => module.id === id) || LESSON_MODULES[index])
    .filter(Boolean);
  const modules = selected.map((module, index) =>
    createModule(
      index + 1,
      module.name,
      startDate,
      endDate,
      Number(periods || 1),
      Number(periods || 1),
      module.coreTopics.map((topic) => `${topic} Foundations`),
    ),
  );
  const nextPlan = {
    ...createSeedPlans()[0],
    id: safeUUID(),
    courseId: `COURSE-${Date.now()}`,
    courseName: selected[0]?.name || "Generated Lesson Plan",
    statusLabel: "Generated",
    isSubmitted: false,
    modules,
    planEntries: [],
  };
  return derivePlan(nextPlan);
}

function isDeletablePlan(plan) {
  if (!plan) return false;
  if (plan.statusLabel === "Draft Copy") return true;
  if (typeof plan.courseId === "string" && plan.courseId.endsWith("-COPY")) return true;
  return false;
}

function CoursePicker({ label, plans, selectedPlanId, onSelect, onDelete }) {
  const [open, setOpen] = useState(false);
  const selected = (plans || []).find((p) => p.id === selectedPlanId) || (plans || [])[0];
  return (
    <div className="relative z-30">
      <label className="block text-[12px] font-semibold text-text2 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full rounded-xl border border-border bg-white px-3 py-2 text-left text-[12.5px] text-text outline-none focus:border-[#D3A1A7] flex items-center justify-between gap-3"
      >
        <span className="truncate">{selected?.courseId || "Select"}</span>
        <CaretDown size={16} className="text-text2" />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close course picker"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[320px] overflow-hidden rounded-2xl border border-border bg-white shadow-lg">
            <div className="max-h-80 overflow-y-auto">
              {(plans || []).map((plan) => {
                const active = plan.id === selectedPlanId;
                const deletable = isDeletablePlan(plan);
                return (
                  <div
                    key={plan.id}
                    className={`flex items-center justify-between gap-2 px-3 py-2 text-[12.5px] ${
                      active ? "bg-[#F9ECED]" : "hover:bg-page-bg"
                    }`}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => {
                        onSelect(plan.id);
                        setOpen(false);
                      }}
                      title={plan.courseId}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate font-semibold text-text">{plan.courseId}</span>
                        {plan.statusLabel ? (
                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-text2">
                            {plan.statusLabel}
                          </span>
                        ) : null}
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`rounded-lg p-1.5 ${deletable ? "text-[#BE3B45] hover:bg-rose-50" : "text-slate-300 cursor-not-allowed"}`}
                      disabled={!deletable}
                      onClick={() => {
                        if (!deletable) return;
                        setOpen(false);
                        onDelete(plan);
                      }}
                      aria-label={`Delete ${plan.courseId}`}
                      title={deletable ? "Delete this cloned lesson plan" : "Only cloned lesson plans can be deleted"}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function LessonPlan({ lessonPlans, onLessonPlansChange, tab, onTabChange }) {
  const [page, setPage] = useState(PAGE_OPTIONS.home);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState("");
  const [moduleDraft, setModuleDraft] = useState(null);
  const [trackingTab, setTrackingTab] = useState("plan");
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [defaultDatesOpen, setDefaultDatesOpen] = useState(false);
  const [courseOutcomeModal, setCourseOutcomeModal] = useState({ open: false, mode: "add", item: null });
  const [sourceMaterialModal, setSourceMaterialModal] = useState({ open: false, mode: "add", item: null });
  const [toast, setToast] = useState("");
  const [planFilters, setPlanFilters] = useState({ module: "all", status: "all", clone: false });
  const [deletePlanConfirm, setDeletePlanConfirm] = useState({ open: false, plan: null });
  const [uploadInfo, setUploadInfo] = useState({ open: false, message: "Only .xls/.xlsx files allowed." });
  const [mappingRows, setMappingRows] = useState([
    { id: "co1", description: "Describe the basic constructs of web concepts." },
    { id: "co2", description: "Design single page web applications using JavaScript frameworks." },
    { id: "co3", description: "Demonstrate concepts of react, node, express and mongodb technologies." },
  ]);

  const [selectedModuleIds, setSelectedModuleIds] = useState([]);
  const [generationType, setGenerationType] = useState("combined");
  const [startDate, setStartDate] = useState("2026-04-08");
  const [endDate, setEndDate] = useState("2026-04-08");
  const [periods, setPeriods] = useState(11);
  const [formError, setFormError] = useState("");

  const [planForm, setPlanForm] = useState({
    id: "",
    period: "",
    plannedDate: "",
    moduleId: "",
    lessonId: "",
    topicsInput: "",
    topics: [],
    materialType: "",
    materialTitle: "",
    materialItems: [],
    classType: "Regular",
    courseOutcomeId: "",
    bloomLevel: "",
    executionMethod: "Lecture",
    learningValidationMethod: "",
    plannedEffortHours: 0,
    plannedEffortMinutes: 50,
    actualDate: "",
    actualEffortHours: 0,
    actualEffortMinutes: 50,
    status: "Pending",
    meetingLink: "",
  });
  const [defaultDatesForm, setDefaultDatesForm] = useState({ mode: "all", moduleId: "", startDate: "", endDate: "" });
  const [courseOutcomeForm, setCourseOutcomeForm] = useState({ number: "", title: "", subtitlesText: "" });
  const [sourceMaterialForm, setSourceMaterialForm] = useState({ type: "Text Book", title: "", status: "Approved" });

  useEffect(() => {
    if (!lessonPlans?.length) {
      const seed = createSeedPlans();
      onLessonPlansChange?.(seed);
      setSelectedPlanId(seed[0].id);
      return;
    }
    if (!selectedPlanId) setSelectedPlanId(lessonPlans[0].id);
  }, [lessonPlans, onLessonPlansChange, selectedPlanId]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (tab === "Planning & Tracking" || tab === "View Plans") {
      setPage(PAGE_OPTIONS.tracking);
    } else if (tab === "Create Plan") {
      setPage(PAGE_OPTIONS.home);
    } else if (tab === "CO-PO Mapping") {
      setPage(PAGE_OPTIONS.mapping);
    }
  }, [tab]);

  function goToPage(next) {
    setPage(next);
    if (!onTabChange) return;
    if (next === PAGE_OPTIONS.home) onTabChange("Create Plan");
    if (next === PAGE_OPTIONS.tracking) onTabChange("Planning & Tracking");
    if (next === PAGE_OPTIONS.mapping) onTabChange("CO-PO Mapping");
  }

  const selectedPlan = useMemo(
    () => derivePlan((lessonPlans || []).find((item) => item.id === selectedPlanId) || (lessonPlans || [])[0] || createSeedPlans()[0]),
    [lessonPlans, selectedPlanId],
  );

  const archiveModules = useMemo(() => selectedPlan.modules.filter((module) => module.completed), [selectedPlan.modules]);
  const executionEnabled = Boolean(selectedPlan.isSubmitted);

  const filteredExecutionEntries = useMemo(() => {
    return selectedPlan.planEntries.filter((entry) => {
      const moduleMatch = planFilters.module === "all" || entry.moduleId === planFilters.module;
      const statusMatch = planFilters.status === "all" || entry.status === planFilters.status;
      const cloneMatch = !planFilters.clone || entry.status === "Done";
      return moduleMatch && statusMatch && cloneMatch;
    });
  }, [planFilters, selectedPlan.planEntries]);

  const availableLessons = useMemo(() => {
    const module = selectedPlan.modules.find((item) => item.id === planForm.moduleId);
    return module?.lessons || [];
  }, [selectedPlan.modules, planForm.moduleId]);

  function persistPlanChanges(updater) {
    onLessonPlansChange?.((prev) => updatePlanById(prev, selectedPlan.id, updater));
  }

  function showMessage(message) {
    setToast(message);
  }

  function handleModuleEdit(module) {
    setEditingModuleId(module.id);
    setModuleDraft({
      id: module.id,
      startDate: module.startDate,
      endDate: module.endDate,
      periodsPlanned: module.periodsPlanned,
    });
  }

  function handleSaveModule() {
    if (!moduleDraft?.startDate || !moduleDraft?.endDate || moduleDraft.startDate > moduleDraft.endDate) {
      showMessage("Please enter a valid module date range.");
      return;
    }
    persistPlanChanges((plan) => ({
      ...plan,
      modules: plan.modules.map((module) =>
        module.id === moduleDraft.id
          ? {
              ...module,
              startDate: moduleDraft.startDate,
              endDate: moduleDraft.endDate,
              periodsPlanned: Number(moduleDraft.periodsPlanned || module.periodsPlanned),
            }
          : module,
      ),
    }));
    setEditingModuleId("");
    setModuleDraft(null);
    showMessage("Module details updated.");
  }

  function resetPlanForm(overrides = {}) {
    setPlanForm({
      id: "",
      period: selectedPlan.planEntries.length + 1,
      plannedDate: selectedPlan.semesterWindow.startDate,
      moduleId: selectedPlan.modules[0]?.id || "",
      lessonId: selectedPlan.modules[0]?.lessons[0]?.id || "",
      topicsInput: "",
      topics: [],
      materialType: "",
      materialTitle: "",
      materialItems: [],
      classType: "Regular",
      courseOutcomeId: selectedPlan.courseOutcomes[0]?.id || "",
      bloomLevel: "",
      executionMethod: "Lecture",
      learningValidationMethod: "",
      plannedEffortHours: 0,
      plannedEffortMinutes: 50,
      actualDate: "",
      actualEffortHours: 0,
      actualEffortMinutes: 50,
      status: "Pending",
      meetingLink: "",
      ...overrides,
    });
  }

  function handleOpenAddPlan() {
    resetPlanForm();
    setPlanModalOpen(true);
  }

  function handleEditPlan(entry) {
    resetPlanForm({
      id: entry.id,
      period: entry.period,
      plannedDate: entry.plannedDate,
      moduleId: entry.moduleId,
      lessonId: entry.lessonId,
      topics: entry.topics,
      materialItems: entry.materialItems,
      classType: entry.classType,
      courseOutcomeId: entry.courseOutcomeId,
      bloomLevel: entry.bloomLevel,
      executionMethod: entry.executionMethod,
      learningValidationMethod: entry.learningValidationMethod,
      plannedEffortHours: entry.plannedEffortHours,
      plannedEffortMinutes: entry.plannedEffortMinutes,
      actualDate: entry.actualDate,
      actualEffortHours: entry.actualEffortHours,
      actualEffortMinutes: entry.actualEffortMinutes,
      status: entry.status,
      meetingLink: entry.meetingLink,
    });
    setPlanModalOpen(true);
  }

  function validatePlanForm() {
    if (!planForm.period || !planForm.plannedDate || !planForm.moduleId || !planForm.lessonId) {
      return "Period, date, module and lesson are required.";
    }
    if (!planForm.topics.length) return "Add at least one topic.";
    if (!planForm.courseOutcomeId || !planForm.executionMethod || !planForm.classType) {
      return "Course outcome, class type and execution method are required.";
    }
    return "";
  }

  function handleSavePlanEntry() {
    const error = validatePlanForm();
    if (error) {
      showMessage(error);
      return;
    }
    const module = selectedPlan.modules.find((item) => item.id === planForm.moduleId);
    const lesson = module?.lessons.find((item) => item.id === planForm.lessonId);
    const payload = {
      id: planForm.id || safeUUID(),
      period: Number(planForm.period),
      plannedDate: planForm.plannedDate,
      actualDate: planForm.actualDate,
      moduleId: planForm.moduleId,
      lessonId: planForm.lessonId,
      lessonLabel: lesson?.label || "",
      topics: planForm.topics,
      materialItems: planForm.materialItems,
      classType: planForm.classType,
      executionMethod: planForm.executionMethod,
      courseOutcomeId: planForm.courseOutcomeId,
      bloomLevel: planForm.bloomLevel,
      learningValidationMethod: planForm.learningValidationMethod,
      plannedEffortHours: Number(planForm.plannedEffortHours),
      plannedEffortMinutes: Number(planForm.plannedEffortMinutes),
      actualEffortHours: Number(planForm.actualEffortHours),
      actualEffortMinutes: Number(planForm.actualEffortMinutes),
      meetingLink: planForm.meetingLink,
      status: planForm.status,
    };
    persistPlanChanges((plan) => {
      const nextEntries = plan.planEntries.some((entry) => entry.id === payload.id)
        ? plan.planEntries.map((entry) => (entry.id === payload.id ? payload : entry))
        : [...plan.planEntries, payload].sort((a, b) => a.period - b.period);
      return { ...plan, planEntries: nextEntries };
    });
    setPlanModalOpen(false);
    showMessage(planForm.id ? "Plan entry updated." : "Plan entry added.");
  }

  function handleDeletePlanEntry(entryId) {
    persistPlanChanges((plan) => ({
      ...plan,
      planEntries: plan.planEntries.filter((entry) => entry.id !== entryId),
    }));
    showMessage("Plan entry deleted.");
  }

  function handleCopyPlanEntry(entry) {
    persistPlanChanges((plan) => ({
      ...plan,
      planEntries: [
        ...plan.planEntries,
        { ...entry, id: safeUUID(), period: Math.max(...plan.planEntries.map((item) => item.period), 0) + 1 },
      ].sort((a, b) => a.period - b.period),
    }));
    showMessage("Plan entry duplicated.");
  }

  function handleAddTopic() {
    const value = planForm.topicsInput.trim();
    if (!value) return;
    setPlanForm((prev) => ({
      ...prev,
      topics: [...prev.topics, value],
      topicsInput: "",
    }));
  }

  function handleAddMaterial() {
    if (!planForm.materialType || !planForm.materialTitle.trim()) return;
    setPlanForm((prev) => ({
      ...prev,
      materialItems: [
        ...prev.materialItems,
        { id: safeUUID(), type: prev.materialType, title: prev.materialTitle.trim() },
      ],
      materialType: "",
      materialTitle: "",
    }));
  }

  function openCourseOutcomeModal(mode, item = null) {
    setCourseOutcomeModal({ open: true, mode, item });
    setCourseOutcomeForm({
      number: item?.number || "",
      title: item?.title || "",
      subtitlesText: item?.subtitles?.join("\n") || "",
    });
  }

  function saveCourseOutcome() {
    if (!courseOutcomeForm.number || !courseOutcomeForm.title.trim()) {
      showMessage("Course outcome number and title are required.");
      return;
    }
    const payload = {
      id: courseOutcomeModal.item?.id || safeUUID(),
      number: courseOutcomeForm.number,
      title: courseOutcomeForm.title.trim(),
      subtitles: courseOutcomeForm.subtitlesText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      status: "Approved",
    };
    persistPlanChanges((plan) => ({
      ...plan,
      courseOutcomes: courseOutcomeModal.mode === "edit"
        ? plan.courseOutcomes.map((item) => (item.id === payload.id ? payload : item))
        : [...plan.courseOutcomes, payload],
    }));
    setCourseOutcomeModal({ open: false, mode: "add", item: null });
    showMessage(courseOutcomeModal.mode === "edit" ? "Course outcome updated." : "Course outcome added.");
  }

  function deleteCourseOutcome(id) {
    persistPlanChanges((plan) => ({
      ...plan,
      courseOutcomes: plan.courseOutcomes.filter((item) => item.id !== id),
    }));
    showMessage("Course outcome deleted.");
  }

  function openSourceMaterialModal(mode, item = null) {
    setSourceMaterialModal({ open: true, mode, item });
    setSourceMaterialForm({
      type: item?.type || "Text Book",
      title: item?.title || "",
      status: item?.status || "Approved",
    });
  }

  function saveSourceMaterial() {
    if (!sourceMaterialForm.title.trim()) {
      showMessage("Source material title is required.");
      return;
    }
    const payload = {
      id: sourceMaterialModal.item?.id || safeUUID(),
      type: sourceMaterialForm.type,
      title: sourceMaterialForm.title.trim(),
      status: sourceMaterialForm.status,
    };
    persistPlanChanges((plan) => ({
      ...plan,
      sourceMaterials: sourceMaterialModal.mode === "edit"
        ? plan.sourceMaterials.map((item) => (item.id === payload.id ? payload : item))
        : [...plan.sourceMaterials, payload],
    }));
    setSourceMaterialModal({ open: false, mode: "add", item: null });
    showMessage(sourceMaterialModal.mode === "edit" ? "Source material updated." : "Source material added.");
  }

  function deleteSourceMaterial(id) {
    persistPlanChanges((plan) => ({
      ...plan,
      sourceMaterials: plan.sourceMaterials.filter((item) => item.id !== id),
    }));
    showMessage("Source material deleted.");
  }

  function applyDefaultDates() {
    if (!defaultDatesForm.startDate || !defaultDatesForm.endDate || defaultDatesForm.startDate > defaultDatesForm.endDate) {
      showMessage("Please enter a valid default date range.");
      return;
    }
    persistPlanChanges((plan) => ({
      ...plan,
      modules: plan.modules.map((module) => {
        if (module.restricted || module.completed) return module;
        if (defaultDatesForm.mode === "single" && module.id !== defaultDatesForm.moduleId) return module;
        return {
          ...module,
          startDate: defaultDatesForm.startDate,
          endDate: defaultDatesForm.endDate,
        };
      }),
    }));
    setDefaultDatesOpen(false);
    showMessage("Default dates applied.");
  }

  function handleCloneSelectedPlan() {
    const cloned = clonePlan(selectedPlan);
    onLessonPlansChange?.([cloned, ...(lessonPlans || []).map((plan) => derivePlan(plan))]);
    setSelectedPlanId(cloned.id);
    goToPage(PAGE_OPTIONS.home);
    showMessage("Lesson plan cloned.");
  }

  function handleRequestDeletePlan(plan) {
    setDeletePlanConfirm({ open: true, plan });
  }

  function handleConfirmDeletePlan() {
    const plan = deletePlanConfirm.plan;
    if (!plan) {
      setDeletePlanConfirm({ open: false, plan: null });
      return;
    }
    onLessonPlansChange?.((prev) => {
      const next = (prev || []).filter((item) => item.id !== plan.id);
      if (!next.length) return createSeedPlans();
      return next.map((p) => derivePlan(p));
    });
    setDeletePlanConfirm({ open: false, plan: null });
    if (selectedPlanId === plan.id) {
      const remaining = (lessonPlans || []).filter((item) => item.id !== plan.id);
      setSelectedPlanId(remaining[0]?.id || "");
    }
    showMessage("Lesson plan deleted.");
  }

  function handleGenerateNewPlan() {
    if (!selectedModuleIds.length || !startDate || !endDate || startDate > endDate || !periods) {
      setFormError("Please complete module, date and period inputs before generating.");
      return;
    }
    const next = buildGeneratedPlan({ selectedModuleIds, startDate, endDate, periods, generationType });
    onLessonPlansChange?.([next, ...(lessonPlans || []).map((plan) => derivePlan(plan))]);
    setSelectedPlanId(next.id);
    setShowCreatePanel(false);
    setSelectedModuleIds([]);
    setFormError("");
    showMessage("New lesson plan generated.");
  }

  async function handleMappingUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".xlsx") && !lower.endsWith(".xls")) {
      setUploadInfo({ open: true, message: "Only .xls/.xlsx files allowed." });
      event.target.value = "";
      return;
    }
    try {
      const workbook = XLSX.read(await file.arrayBuffer());
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet);
      if (rows.length) {
        const mapped = rows.map((row, index) => ({
          id: String(row.CO || row.co || `co${index + 1}`).toLowerCase(),
          description: String(row.Description || row.description || row.CO_Details || row.co_details || "Uploaded mapping"),
        }));
        setMappingRows(mapped);
        showMessage("CO-PO mapping uploaded.");
      }
    } catch {
      setUploadInfo({ open: true, message: "Invalid file. Only .xls/.xlsx files are supported." });
    }
    event.target.value = "";
  }

  function renderCOPOMapping() {
    return (
      <SectionCard title="CO-PO Mapping">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[12px] text-text2">Slight: 1 &nbsp; Moderate: 2 &nbsp; High: 3</div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-[12px] text-text hover:bg-page-bg">
                Upload CO-PO
                <input type="file" accept=".xls,.xlsx" className="hidden" onChange={handleMappingUpload} />
              </label>
              <Button variant="secondary">Upload CO PSO</Button>
              <Button variant="secondary" onClick={() => goToPage(PAGE_OPTIONS.archive)}>View Archive</Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border bg-[#F4ECEC] px-4 py-3">
              <h3 className="text-[13px] font-bold text-text">CO-PO</h3>
            </div>
            <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <div className="overflow-x-auto rounded-xl border border-border">
                <div className="min-w-115 grid grid-cols-[80px_minmax(0,1fr)] bg-page-bg px-3 py-2 text-[11.5px] font-semibold text-text2">
                  <div>CO</div>
                  <div>Description</div>
                </div>
                <div className="divide-y divide-border">
                  {mappingRows.map((row) => (
                    <div key={row.id} className="min-w-115 grid grid-cols-[80px_minmax(0,1fr)] px-3 py-2 text-[12px]">
                      <div className="font-semibold uppercase text-text">{row.id}</div>
                      <div className="text-text2">{row.description}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="mb-2 text-[12px] font-semibold text-text2">MCA Department PO Details</p>
                <p className="text-[14px] text-text2">Program Outcomes not available.</p>
              </div>
            </div>
            <div className="border-t border-border px-4 py-3">
              <p className="mb-3 text-[12px] font-semibold text-text2">Status : TODO</p>
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <Select defaultValue="">
                  <option value="" disabled>Dr Sachin Sharma - MCA-DET-CC - Artificial Intelligence, Machine learning and data science</option>
                </Select>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="primary">Submit</Button>
                  <Button variant="secondary">Save</Button>
                  <Button variant="danger">Reset</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    );
  }

  function renderHomePage() {
    return (
      <div className="space-y-4">
        <SectionCard
          title="Lesson Plan"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={handleCloneSelectedPlan}>
                <Files size={16} />
                Clone Lesson Plan
              </Button>
              <Button variant="primary" onClick={() => goToPage(PAGE_OPTIONS.tracking)}>
                <Eye size={16} />
                View Lesson Plan
              </Button>
              <Button variant="secondary" onClick={() => goToPage(PAGE_OPTIONS.archive)}>
                View Archive
              </Button>
            </div>
          }
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <CoursePicker
                label="Course"
                plans={lessonPlans || []}
                selectedPlanId={selectedPlan.id}
                onSelect={setSelectedPlanId}
                onDelete={handleRequestDeletePlan}
              />
              <label className="mt-6 flex items-center gap-2 text-[12px] text-text2">
                <input type="checkbox" checked={selectedPlan.isCurricularCourse} disabled />
                Co Curricular Course
              </label>
              <label className="mt-6 flex items-center gap-2 text-[12px] text-text2">
                <input type="checkbox" checked={selectedPlan.isExtraCurricularCourse} disabled />
                Extra Curricular Course
              </label>
            </div>
            <div className="text-[12px] font-semibold text-text2">
              <span>Term Start Date : </span>
              <span className="text-text">{formatShortDate(selectedPlan.semesterWindow.startDate)}</span>
              <span> &amp; Term End Date : </span>
              <span className="text-text">{formatShortDate(selectedPlan.semesterWindow.endDate)}</span>
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-4 lg:grid-cols-3">
          <SummaryStat
            label="Planned Effort (Till Date)"
            value={`${selectedPlan.summary.plannedClasses} classes (${minutesToLabel(selectedPlan.summary.plannedMinutes)})`}
          />
          <SummaryStat
            label="Actual Effort (Till Date)"
            value={`${selectedPlan.summary.actualClasses} classes (${minutesToLabel(selectedPlan.summary.actualMinutes)})`}
          />
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[12px] text-text2">Portions Coverage</p>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                {selectedPlan.summary.portionsCoverage}% Complete
              </span>
            </div>
            <div className="h-3 rounded-full bg-slate-200">
              <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${selectedPlan.summary.portionsCoverage}%` }} />
            </div>
          </div>
        </div>

        <p className="text-[13px] font-semibold text-emerald-700">Status : {selectedPlan.statusLabel}</p>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {selectedPlan.modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={editingModuleId === module.id && moduleDraft ? { ...module, ...moduleDraft } : module}
              isEditing={editingModuleId === module.id}
              onEditToggle={() => handleModuleEdit(module)}
              onFieldChange={(field, value) => setModuleDraft((prev) => ({ ...prev, [field]: value }))}
              onSave={handleSaveModule}
              onCancel={() => {
                setEditingModuleId("");
                setModuleDraft(null);
              }}
            />
          ))}
        </div>

        <SectionCard
          title="Create Lesson Plan"
          actions={
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-text shadow-sm"
              onClick={() => setShowCreatePanel((prev) => !prev)}
              aria-label="Toggle Add Lesson Plan"
            >
              {showCreatePanel ? <X size={16} /> : <Plus size={16} />}
            </button>
          }
        >
          {!showCreatePanel ? (
            <p className="text-[13px] text-text2">Click the toggle to show or hide the existing lesson plan creation UI.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <Field label="Module">
                  <div className="rounded-xl border border-border bg-white px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      {LESSON_MODULES.map((module) => {
                        const checked = selectedModuleIds.includes(module.id);
                        return (
                          <label
                            key={module.id}
                            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] ${
                              checked ? "border-[#C98F98] bg-[#F9ECED] text-text" : "border-border bg-page-bg text-text2"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                setSelectedModuleIds((prev) =>
                                  e.target.checked ? [...prev, module.id] : prev.filter((item) => item !== module.id),
                                );
                              }}
                            />
                            {module.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </Field>
                <div className="lg:col-span-2 flex flex-wrap items-end gap-3">
                  <Button variant="primary" className="min-w-45">
                    <CalendarBlank size={16} />
                    Set Dates &amp; Periods
                  </Button>
                  <p className="text-[13px] font-semibold text-text">Period Duration&nbsp; 0 hr : 50 min</p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-border bg-white p-4 lg:col-span-1">
                  <p className="mb-3 text-[12px] font-semibold text-text2">Select Lesson Plan Generation type</p>
                  <label className="mb-2 flex items-center gap-2 text-[13px] text-text">
                    <input checked={generationType === "combined"} onChange={() => setGenerationType("combined")} type="radio" name="generation-type" />
                    All Modules at a Time
                  </label>
                  <label className="flex items-center gap-2 text-[13px] text-text">
                    <input checked={generationType === "individual"} onChange={() => setGenerationType("individual")} type="radio" name="generation-type" />
                    Individual Module-wise
                  </label>
                </div>
                <Field label="Start Date">
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </Field>
                <Field label="End Date">
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </Field>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                <Field label="# of Lecture Hours">
                  <Input type="number" min={1} value={periods} onChange={(e) => setPeriods(Number(e.target.value))} />
                </Field>
                <Button variant="danger" className="self-end" onClick={() => {
                  setSelectedModuleIds([]);
                  setGenerationType("combined");
                  setStartDate(selectedPlan.semesterWindow.startDate);
                  setEndDate(selectedPlan.semesterWindow.startDate);
                  setPeriods(11);
                }}>
                  <ArrowsClockwise size={16} />
                  Reset
                </Button>
              </div>

              {formError ? <div className="rounded-xl border border-[#E5B3B9] bg-[#FFF4F5] px-4 py-3 text-[12.5px] font-semibold text-[#9B2335]">{formError}</div> : null}

              <div className="flex justify-end">
                <Button variant="primary" onClick={handleGenerateNewPlan}>
                  Generate
                </Button>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    );
  }

  function renderCourseDetails() {
    return (
      <SectionCard title="Course Details">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border">
            {[
              ["Duration of Semester", `${formatShortDate(selectedPlan.semesterWindow.startDate)} To ${formatShortDate(selectedPlan.semesterWindow.endDate)}`],
              ["Dept-Sem-Sec", selectedPlan.sectionName],
              ["Course", selectedPlan.courseName],
              ["Exam Marks", selectedPlan.examMarks],
              ["Exam Hours", selectedPlan.examHours],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-2 border-b border-border px-4 py-2 text-[12.5px] last:border-b-0">
                <span className="font-semibold text-text">{label}</span>
                <span className="text-text2">{value}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-border">
            {[
              ["# of Lecture Hours/Week", selectedPlan.weeklyLectureHours],
              ["# of Lecture Hours", selectedPlan.totalLectureHours],
              ["IA Marks", selectedPlan.iaMarks],
              ["Credits", selectedPlan.credits],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-2 border-b border-border px-4 py-2 text-[12.5px] last:border-b-0">
                <span className="font-semibold text-text">{label}</span>
                <span className="text-text2">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          <div className="grid grid-cols-8 bg-page-bg px-4 py-3 text-[11.5px] font-semibold text-text2">
            {["Days", "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-8 px-4 py-3 text-[12px] text-text">
            <div className="font-semibold text-text2">Timings</div>
            <div>{selectedPlan.schedule.find((item) => item.day === "MON")?.time || "--"}</div>
            <div>{selectedPlan.schedule.find((item) => item.day === "TUE")?.time || "--"}</div>
            <div>{selectedPlan.schedule.find((item) => item.day === "WED")?.time || "--"}</div>
            <div>{selectedPlan.schedule.find((item) => item.day === "THU")?.time || "--"}</div>
            <div>{selectedPlan.schedule.find((item) => item.day === "FRI")?.time || "--"}</div>
            <div>{selectedPlan.schedule.find((item) => item.day === "SAT")?.time || "--"}</div>
            <div>{selectedPlan.schedule.find((item) => item.day === "SUN")?.time || "--"}</div>
          </div>
        </div>
      </SectionCard>
    );
  }

  function renderCourseOutcomeSection() {
    return (
      <SectionCard
        title="Course Outcome Details"
        actions={<Button variant="primary" onClick={() => openCourseOutcomeModal("add")}><Plus size={16} />Course Outcome</Button>}
      >
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="grid grid-cols-[100px_minmax(0,1fr)_140px_80px_80px] bg-page-bg px-4 py-3 text-[11.5px] font-semibold text-text2">
            <div>CO Number</div>
            <div>CO Details</div>
            <div>Status</div>
            <div>Edit</div>
            <div>Delete</div>
          </div>
          <div className="divide-y divide-border">
            {selectedPlan.courseOutcomes.map((item) => (
              <div key={item.id} className="grid grid-cols-[100px_minmax(0,1fr)_140px_80px_80px] items-center px-4 py-3 text-[12.5px]">
                <div>{item.number}</div>
                <div className="font-medium text-text">{item.title}</div>
                <div className="text-emerald-700">{item.status}</div>
                <button className="text-[#0B4B5A]" onClick={() => openCourseOutcomeModal("edit", item)} aria-label="Edit course outcome">
                  <PencilSimple size={16} weight="fill" />
                </button>
                <button className="text-[#BE3B45]" onClick={() => deleteCourseOutcome(item.id)} aria-label="Delete course outcome">
                  <Trash size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    );
  }

  function renderSourceMaterials() {
    return (
      <SectionCard
        title="Source Material List"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => openSourceMaterialModal("add")}>
              <Plus size={16} />
              Source Material
            </Button>
            <Button variant="secondary" disabled>
              Map Learning Material(s)
            </Button>
          </div>
        }
      >
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="grid grid-cols-[60px_140px_minmax(0,1fr)_120px_80px_80px] bg-page-bg px-4 py-3 text-[11.5px] font-semibold text-text2">
            <div>Sl #</div>
            <div>Type</div>
            <div>Title</div>
            <div>Status</div>
            <div>Edit</div>
            <div>Delete</div>
          </div>
          <div className="divide-y divide-border">
            {selectedPlan.sourceMaterials.map((item, index) => (
              <div key={item.id} className="grid grid-cols-[60px_140px_minmax(0,1fr)_120px_80px_80px] items-center px-4 py-3 text-[12.5px]">
                <div>{index + 1}</div>
                <div>{item.type}</div>
                <div className="text-text">{item.title}</div>
                <div className="text-emerald-700">{item.status}</div>
                <button className="text-[#0B4B5A]" onClick={() => openSourceMaterialModal("edit", item)} aria-label="Edit source material">
                  <PencilSimple size={16} weight="fill" />
                </button>
                <button className="text-[#BE3B45]" onClick={() => deleteSourceMaterial(item.id)} aria-label="Delete source material">
                  <Trash size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    );
  }

  function renderPlanExecution() {
    return (
      <SectionCard title={selectedPlan.statusLabel ? `Status : ${selectedPlan.statusLabel}` : "Plan & Execution"}>
        <div className="flex items-center gap-2 pb-4">
          {["plan", "execution"].map((tab) => {
            const active = trackingTab === tab;
            const disabled = tab === "execution" && !executionEnabled;
            return (
              <button
                key={tab}
                className={`rounded-t-[22px] px-5 py-2 text-[13px] font-semibold transition-all ${
                  active ? "bg-[#B06975] text-white" : "bg-[#F5F6F8] text-text"
                } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                disabled={disabled}
                onClick={() => !disabled && setTrackingTab(tab)}
              >
                {tab === "plan" ? "Plan" : "Execution"}
              </button>
            );
          })}
        </div>

        {trackingTab === "plan" ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {selectedPlan.modules.map((module) => (
                <div key={module.id} className="rounded-2xl border border-border bg-page-bg p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-bold text-text">{module.title}</p>
                      <p className="text-[12px] text-text2">{module.subtitle}</p>
                    </div>
                    {module.completed ? <CheckCircle size={18} className="text-emerald-600" weight="fill" /> : null}
                  </div>
                  <div className="space-y-1 text-[12px] text-text2">
                    <p>Start Date : <span className="font-semibold text-text">{formatShortDate(module.startDate)}</span></p>
                    <p>End Date : <span className="font-semibold text-text">{formatShortDate(module.endDate)}</span></p>
                    <p># of Periods Planned : <span className="font-semibold text-text">{module.periodsPlanned}</span></p>
                    <p># of Periods Approved : <span className="font-semibold text-text">{module.periodsApproved}</span></p>
                    <p>% Coverage : <span className="font-semibold text-text">{module.coverage}</span></p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="primary" onClick={() => {
                setDefaultDatesForm({
                  mode: "all",
                  moduleId: selectedPlan.modules[0]?.id || "",
                  startDate: selectedPlan.semesterWindow.startDate,
                  endDate: selectedPlan.semesterWindow.endDate,
                });
                setDefaultDatesOpen(true);
              }}>
                <CalendarBlank size={16} />
                Set Default Dates
              </Button>
              <Button variant="primary" onClick={handleOpenAddPlan}>
                <Plus size={16} />
                Add Plan
              </Button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border">
              <div className="min-w-295 grid grid-cols-[70px_110px_120px_140px_220px_minmax(240px,1fr)_130px_100px_90px_70px_70px] bg-page-bg px-4 py-3 text-[11.5px] font-semibold text-text2">
                <div>Period</div>
                <div>Date</div>
                <div>Class Type</div>
                <div>Execution Method</div>
                <div>Module</div>
                <div>Topic</div>
                <div>Planned Effort</div>
                <div>References</div>
                <div>Status</div>
                <div>Edit</div>
                <div>Delete</div>
              </div>
              <div className="divide-y divide-border">
                {selectedPlan.planEntries.map((entry) => {
                  const module = selectedPlan.modules.find((item) => item.id === entry.moduleId);
                  return (
                    <div key={entry.id} className="min-w-295 grid grid-cols-[70px_110px_120px_140px_220px_minmax(240px,1fr)_130px_100px_90px_70px_70px] items-start gap-2 px-4 py-3 text-[12px]">
                      <div>{entry.period}</div>
                      <div>{formatShortDate(entry.plannedDate)}</div>
                      <div>{entry.classType}</div>
                      <div>{entry.executionMethod}</div>
                      <div className="wrap-break-word">{module?.title}<div className="text-text2">{module?.subtitle}</div></div>
                      <div className="wrap-break-word">{entry.topics.join(", ")}</div>
                      <div>{minutesToLabel(toMinutes(entry.plannedEffortHours, entry.plannedEffortMinutes))}</div>
                      <div>{entry.materialItems.length || 0}</div>
                      <div className="text-emerald-700">Approved</div>
                      <button className="text-[#0B4B5A]" onClick={() => handleEditPlan(entry)} aria-label="Edit plan row">
                        <PencilSimple size={16} weight="fill" />
                      </button>
                      <button className="text-[#BE3B45]" onClick={() => handleDeletePlanEntry(entry.id)} aria-label="Delete plan row">
                        <Trash size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button
                variant="primary"
                disabled={selectedPlan.isSubmitted || selectedPlan.planEntries.length === 0}
                onClick={() => {
                  if (selectedPlan.planEntries.length === 0) {
                    showMessage("Please add at least one plan entry before submitting.");
                    return;
                  }
                  persistPlanChanges((plan) => ({ ...plan, isSubmitted: true, statusLabel: plan.statusLabel || "Submitted" }));
                  setTrackingTab("execution");
                  showMessage("Plan submitted. Execution is now enabled.");
                }}
              >
                {selectedPlan.isSubmitted ? "Submitted" : "Submit"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {selectedPlan.modules.map((module) => (
                <div key={module.id} className="rounded-2xl border border-border bg-page-bg p-4">
                  <p className="text-[13px] font-bold text-text">{module.title}</p>
                  <p className="mt-1 text-[12px] text-text2">{module.subtitle}</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${module.coverage}%` }} />
                  </div>
                  <p className="mt-2 text-[12px] text-text2">Status : <span className="font-semibold text-text">{module.completed ? "Completed" : module.coverage > 0 ? "In Progress" : "Pending"}</span></p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-[12px] text-text">
                <input
                  type="checkbox"
                  checked={planFilters.clone}
                  onChange={(e) => setPlanFilters((prev) => ({ ...prev, clone: e.target.checked }))}
                />
                Clone
              </label>
              <div className="flex flex-wrap gap-2">
                <Select value={planFilters.module} onChange={(e) => setPlanFilters((prev) => ({ ...prev, module: e.target.value }))}>
                  <option value="all">Modules</option>
                  {selectedPlan.modules.map((module) => (
                    <option key={module.id} value={module.id}>{module.title}</option>
                  ))}
                </Select>
                <Select value={planFilters.status} onChange={(e) => setPlanFilters((prev) => ({ ...prev, status: e.target.value }))}>
                  <option value="all">Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Done">Done</option>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border">
              <div className="min-w-415 grid grid-cols-[70px_120px_120px_100px_140px_220px_minmax(260px,1fr)_130px_130px_100px_100px_70px_70px_70px_120px] bg-page-bg px-4 py-3 text-[11.5px] font-semibold text-text2">
                <div>Period</div>
                <div>Planned Date</div>
                <div>Actual Date</div>
                <div>Class Type</div>
                <div>Execution Method</div>
                <div>Module</div>
                <div>Topic</div>
                <div>Planned Effort</div>
                <div>Actual Effort</div>
                <div>References</div>
                <div>Status</div>
                <div>Clone</div>
                <div>Edit</div>
                <div>Delete</div>
                <div>Meeting Link</div>
              </div>
              <div className="divide-y divide-border">
                {filteredExecutionEntries.map((entry) => {
                  const module = selectedPlan.modules.find((item) => item.id === entry.moduleId);
                  return (
                    <div key={entry.id} className="min-w-415 grid grid-cols-[70px_120px_120px_100px_140px_220px_minmax(260px,1fr)_130px_130px_100px_100px_70px_70px_70px_120px] items-start gap-2 px-4 py-3 text-[12px]">
                      <div>{entry.period}</div>
                      <div>{formatShortDate(entry.plannedDate)}</div>
                      <div>{entry.actualDate ? formatShortDate(entry.actualDate) : "--"}</div>
                      <div>{entry.classType}</div>
                      <div>{entry.executionMethod}</div>
                      <div className="wrap-break-word">{module?.title}<div className="text-text2">{module?.subtitle}</div></div>
                      <div className="wrap-break-word">{entry.topics.join(", ")}</div>
                      <div>{minutesToLabel(toMinutes(entry.plannedEffortHours, entry.plannedEffortMinutes))}</div>
                      <div>{minutesToLabel(toMinutes(entry.actualEffortHours, entry.actualEffortMinutes))}</div>
                      <div>{entry.materialItems.length || 0}</div>
                      <div>
                        <select
                          className="rounded-lg border border-border bg-white px-2 py-1 text-[12px]"
                          value={entry.status}
                          onChange={(e) => {
                            const nextStatus = e.target.value;
                            persistPlanChanges((plan) => ({
                              ...plan,
                              planEntries: plan.planEntries.map((item) =>
                                item.id === entry.id
                                  ? {
                                      ...item,
                                      status: nextStatus,
                                      actualDate: nextStatus === "Done" && !item.actualDate ? item.plannedDate : item.actualDate,
                                    }
                                  : item,
                              ),
                            }));
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Done">Done</option>
                        </select>
                      </div>
                      <button className="text-[#0B4B5A]" onClick={() => handleCopyPlanEntry(entry)} aria-label="Copy execution row">
                        <Copy size={16} />
                      </button>
                      <button className="text-[#0B4B5A]" onClick={() => handleEditPlan(entry)} aria-label="Edit execution row">
                        <PencilSimple size={16} weight="fill" />
                      </button>
                      <button className="text-[#BE3B45]" onClick={() => handleDeletePlanEntry(entry.id)} aria-label="Delete execution row">
                        <Trash size={16} />
                      </button>
                      <div>{entry.meetingLink ? <a className="text-[#0B4B5A] underline" href={entry.meetingLink}>Open</a> : "--"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </SectionCard>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 pb-12" style={{ scrollbarWidth: "thin", scrollbarColor: "#D1D5DB transparent" }}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-bold text-text">
            {page === PAGE_OPTIONS.tracking ? "Lesson Plan / Planning & Tracking" : "Lesson Plan"}
          </h1>
          <p className="mt-1 text-[12.5px] text-text2">
            Modern lesson plan management with creation, continuation editing, planning and execution states.
          </p>
        </div>
        {page === PAGE_OPTIONS.tracking ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => goToPage(PAGE_OPTIONS.home)}>
              <CaretLeft size={16} />
              Back
            </Button>
            <div className="min-w-[320px]">
              <CoursePicker
                label="Course"
                plans={lessonPlans || []}
                selectedPlanId={selectedPlan.id}
                onSelect={setSelectedPlanId}
                onDelete={handleRequestDeletePlan}
              />
            </div>
            <Button variant="primary" onClick={() => window.print()}>
              <FilePdf size={16} />
              Generate PDF
            </Button>
            <Button variant="primary" onClick={handleCloneSelectedPlan}>
              <Files size={16} />
              Clone Lesson Plan
            </Button>
          </div>
        ) : null}
      </div>

      {page === PAGE_OPTIONS.home ? renderHomePage() : null}

      {page === PAGE_OPTIONS.archive ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-text">Archived Completed Modules</p>
            <Button variant="secondary" onClick={() => goToPage(PAGE_OPTIONS.home)}>
              <CaretLeft size={16} />
              Back to Lesson Plan
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {archiveModules.length ? (
              archiveModules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  isEditing={false}
                  onEditToggle={() => {}}
                  onFieldChange={() => {}}
                  onSave={() => {}}
                  onCancel={() => {}}
                  allowArchiveView
                />
              ))
            ) : (
              <div className="rounded-2xl border border-border bg-white p-5 text-[13px] text-text2 shadow-sm">
                No completed modules are available in the archive yet.
              </div>
            )}
          </div>
        </div>
      ) : null}

      {page === PAGE_OPTIONS.tracking ? (
        <div className="space-y-4">
          {renderCourseDetails()}
          {renderCourseOutcomeSection()}
          {renderSourceMaterials()}
          {renderPlanExecution()}
        </div>
      ) : null}

      {page === PAGE_OPTIONS.mapping ? (
        <div className="space-y-4">
          {renderCOPOMapping()}
        </div>
      ) : null}

      <Modal open={planModalOpen} onClose={() => setPlanModalOpen(false)} title={planForm.id ? "Update Lesson Plan" : "Add Lesson Plan"} wide>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Period *">
              <Input type="number" value={planForm.period} onChange={(e) => setPlanForm((prev) => ({ ...prev, period: e.target.value }))} />
            </Field>
            <Field label="Date *">
              <Input type="date" value={planForm.plannedDate} onChange={(e) => setPlanForm((prev) => ({ ...prev, plannedDate: e.target.value }))} />
            </Field>
            <Field label="Module *">
              <Select
                value={planForm.moduleId}
                onChange={(e) => {
                  const module = selectedPlan.modules.find((item) => item.id === e.target.value);
                  setPlanForm((prev) => ({
                    ...prev,
                    moduleId: e.target.value,
                    lessonId: module?.lessons[0]?.id || "",
                  }));
                }}
              >
                {selectedPlan.modules.map((module) => (
                  <option key={module.id} value={module.id}>{module.title}</option>
                ))}
              </Select>
            </Field>
            <Field label="Lesson *">
              <Select value={planForm.lessonId} onChange={(e) => setPlanForm((prev) => ({ ...prev, lessonId: e.target.value }))}>
                {availableLessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>{lesson.label}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Topics *" hint="Note: Write topic and press Enter key to add new topics">
            <div className="rounded-2xl border border-border p-3">
              <div className="mb-2 flex flex-wrap gap-2">
                {planForm.topics.map((topic) => (
                  <span key={topic} className="inline-flex items-center gap-1 rounded-full bg-[#E9F1F3] px-2.5 py-1 text-[12px] text-text">
                    {topic}
                    <button onClick={() => setPlanForm((prev) => ({ ...prev, topics: prev.topics.filter((item) => item !== topic) }))}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <Input
                placeholder="Write topic and press enter key to add new topics"
                value={planForm.topicsInput}
                onChange={(e) => setPlanForm((prev) => ({ ...prev, topicsInput: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTopic();
                  }
                }}
              />
            </div>
          </Field>

          <div className="rounded-2xl border border-border p-4">
            <p className="mb-3 inline-flex rounded-md bg-green-700 px-3 py-1 text-[12px] font-semibold text-white">Material</p>
            <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)_auto]">
              <Field label="Material Type">
                <Select value={planForm.materialType} onChange={(e) => setPlanForm((prev) => ({ ...prev, materialType: e.target.value }))}>
                  <option value="">Select</option>
                  {MATERIAL_TYPES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Title">
                <Input value={planForm.materialTitle} onChange={(e) => setPlanForm((prev) => ({ ...prev, materialTitle: e.target.value }))} />
              </Field>
              <div className="self-end">
                <Button variant="secondary" onClick={handleAddMaterial}>
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            {planForm.materialItems.length ? (
              <div className="mt-3 space-y-2">
                {planForm.materialItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-page-bg px-3 py-2 text-[12px]">
                    <span>{item.type} - {item.title}</span>
                    <button className="text-[#BE3B45]" onClick={() => setPlanForm((prev) => ({ ...prev, materialItems: prev.materialItems.filter((material) => material.id !== item.id) }))}>
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Class Type *">
              <Select value={planForm.classType} onChange={(e) => setPlanForm((prev) => ({ ...prev, classType: e.target.value }))}>
                {CLASS_TYPES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
            </Field>
            <Field label="Course Outcome *">
              <Select value={planForm.courseOutcomeId} onChange={(e) => setPlanForm((prev) => ({ ...prev, courseOutcomeId: e.target.value }))}>
                {selectedPlan.courseOutcomes.map((item) => (
                  <option key={item.id} value={item.id}>{item.number} - {item.title}</option>
                ))}
              </Select>
            </Field>
            <Field label="Bloom's Level/Learning Outcome">
              <Select value={planForm.bloomLevel} onChange={(e) => setPlanForm((prev) => ({ ...prev, bloomLevel: e.target.value }))}>
                <option value="">Select</option>
                {BLOOM_LEVELS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
            </Field>
            <Field label="Execution Methods *">
              <Select value={planForm.executionMethod} onChange={(e) => setPlanForm((prev) => ({ ...prev, executionMethod: e.target.value }))}>
                {EXECUTION_METHODS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
            </Field>
            <Field label="Learning Validation Method">
              <Select value={planForm.learningValidationMethod} onChange={(e) => setPlanForm((prev) => ({ ...prev, learningValidationMethod: e.target.value }))}>
                <option value="">Select</option>
                {VALIDATION_METHODS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
            </Field>
            <Field label="Meeting Link">
              <Input value={planForm.meetingLink} onChange={(e) => setPlanForm((prev) => ({ ...prev, meetingLink: e.target.value }))} />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-text2">Planned Effort *</label>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" value={planForm.plannedEffortHours} onChange={(e) => setPlanForm((prev) => ({ ...prev, plannedEffortHours: e.target.value }))} />
                <Input type="number" value={planForm.plannedEffortMinutes} onChange={(e) => setPlanForm((prev) => ({ ...prev, plannedEffortMinutes: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-text2">Actual Effort</label>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" value={planForm.actualEffortHours} onChange={(e) => setPlanForm((prev) => ({ ...prev, actualEffortHours: e.target.value }))} />
                <Input type="number" value={planForm.actualEffortMinutes} onChange={(e) => setPlanForm((prev) => ({ ...prev, actualEffortMinutes: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Actual Date">
              <Input type="date" value={planForm.actualDate} onChange={(e) => setPlanForm((prev) => ({ ...prev, actualDate: e.target.value }))} />
            </Field>
            <Field label="Status">
              <Select value={planForm.status} onChange={(e) => setPlanForm((prev) => ({ ...prev, status: e.target.value }))}>
                <option value="Pending">Pending</option>
                <option value="Done">Done</option>
              </Select>
            </Field>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => resetPlanForm(planForm.id ? {
              id: planForm.id,
              period: planForm.period,
              plannedDate: selectedPlan.semesterWindow.startDate,
              moduleId: selectedPlan.modules[0]?.id || "",
              lessonId: selectedPlan.modules[0]?.lessons[0]?.id || "",
            } : {})}>
              Reset
            </Button>
            <Button variant="primary" onClick={handleSavePlanEntry}>
              {planForm.id ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={defaultDatesOpen} onClose={() => setDefaultDatesOpen(false)} title="Set Default Dates">
        <div className="space-y-4">
          <Field label="Apply To">
            <Select value={defaultDatesForm.mode} onChange={(e) => setDefaultDatesForm((prev) => ({ ...prev, mode: e.target.value }))}>
              <option value="all">All editable modules</option>
              <option value="single">Individual module</option>
            </Select>
          </Field>
          {defaultDatesForm.mode === "single" ? (
            <Field label="Module">
              <Select value={defaultDatesForm.moduleId} onChange={(e) => setDefaultDatesForm((prev) => ({ ...prev, moduleId: e.target.value }))}>
                {selectedPlan.modules.map((module) => (
                  <option key={module.id} value={module.id}>{module.title}</option>
                ))}
              </Select>
            </Field>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Start Date">
              <Input type="date" value={defaultDatesForm.startDate} onChange={(e) => setDefaultDatesForm((prev) => ({ ...prev, startDate: e.target.value }))} />
            </Field>
            <Field label="End Date">
              <Input type="date" value={defaultDatesForm.endDate} onChange={(e) => setDefaultDatesForm((prev) => ({ ...prev, endDate: e.target.value }))} />
            </Field>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDefaultDatesOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={applyDefaultDates}>Apply</Button>
          </div>
        </div>
      </Modal>

      <Modal open={courseOutcomeModal.open} onClose={() => setCourseOutcomeModal({ open: false, mode: "add", item: null })} title={courseOutcomeModal.mode === "edit" ? "Update Course Outcome" : "Add Course Outcome"}>
        <div className="space-y-4">
          <Field label="Course Outcome Number *">
            <Input value={courseOutcomeForm.number} onChange={(e) => setCourseOutcomeForm((prev) => ({ ...prev, number: e.target.value }))} />
          </Field>
          <Field label="Course Outcome Title *">
            <Input value={courseOutcomeForm.title} onChange={(e) => setCourseOutcomeForm((prev) => ({ ...prev, title: e.target.value }))} />
          </Field>
          <Field label="Course Outcome Subtitles">
            <textarea
              className="min-h-35 w-full rounded-xl border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#D3A1A7]"
              placeholder="Write course outcome subtitle here..."
              value={courseOutcomeForm.subtitlesText}
              onChange={(e) => setCourseOutcomeForm((prev) => ({ ...prev, subtitlesText: e.target.value }))}
            />
          </Field>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setCourseOutcomeForm({ number: "", title: "", subtitlesText: "" })}>Reset</Button>
            <Button variant="primary" onClick={saveCourseOutcome}>{courseOutcomeModal.mode === "edit" ? "Update" : "Save"}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={sourceMaterialModal.open} onClose={() => setSourceMaterialModal({ open: false, mode: "add", item: null })} title={sourceMaterialModal.mode === "edit" ? "Update Source Material" : "Add Source Material"}>
        <div className="space-y-4">
          <Field label="Type">
            <Select value={sourceMaterialForm.type} onChange={(e) => setSourceMaterialForm((prev) => ({ ...prev, type: e.target.value }))}>
              {MATERIAL_TYPES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
          </Field>
          <Field label="Title">
            <Input value={sourceMaterialForm.title} onChange={(e) => setSourceMaterialForm((prev) => ({ ...prev, title: e.target.value }))} />
          </Field>
          <Field label="Status">
            <Select value={sourceMaterialForm.status} onChange={(e) => setSourceMaterialForm((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
            </Select>
          </Field>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setSourceMaterialForm({ type: "Text Book", title: "", status: "Approved" })}>Reset</Button>
            <Button variant="primary" onClick={saveSourceMaterial}>{sourceMaterialModal.mode === "edit" ? "Update" : "Save"}</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={deletePlanConfirm.open}
        onClose={() => setDeletePlanConfirm({ open: false, plan: null })}
        title="Delete cloned lesson plan?"
      >
        <p className="text-[13px] text-text2">
          This will remove <span className="font-semibold text-text">{deletePlanConfirm.plan?.courseId}</span> from the course dropdown.
          This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeletePlanConfirm({ open: false, plan: null })}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmDeletePlan}>
            <Trash size={16} />
            Delete
          </Button>
        </div>
      </Modal>

      {toast ? (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl bg-[#0F172A] px-4 py-3 text-[12.5px] font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <Modal open={uploadInfo.open} onClose={() => setUploadInfo({ open: false, message: uploadInfo.message })} title="Upload validation">
        <p className="text-[13px] text-text2">{uploadInfo.message}</p>
        <div className="mt-4 flex justify-end">
          <Button variant="primary" onClick={() => setUploadInfo({ open: false, message: uploadInfo.message })}>
            OK
          </Button>
        </div>
      </Modal>
    </main>
  );
}
