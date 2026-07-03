import { useState, useEffect, useRef } from "react";
import {
  Plus,
  X,
  Pencil,
  Trash,
  Eye,
  ArrowCounterClockwise,
  FloppyDisk,
  CheckCircle,
  WarningCircle,
  CaretDown,
  ArrowRight,
} from "@phosphor-icons/react";

// ─── Storage Keys & Helpers ───────────────────────────────────────────────────
const LS_OA = "svyasa_oa_assessments";

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

// ─── Constants ────────────────────────────────────────────────────────────────
const ASSESSMENT_TYPES = ["Class Participation", "CIA Practical", "CIA"];

const MAX_MARKS = {
  "Class Participation": 5,
  CIA: 5,
  "CIA Practical": 10,
};

const DUMMY_COURSES = [
  { id: "c1", label: "MCA-DET-CC-MCA-PBI(MCAP256)-2" },
  { id: "c2", label: "B.Tech-DET-CC-CSAIML,CSE(CY),CSIT" },
  { id: "c3", label: "MCA-DET-CC-MCA-Cloud(MCCD441)" },
];

const LOGGED_IN_USER = "Dr. Bharathi S";

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function formatDateRange(start, end) {
  if (!start) return "";
  const fmt = (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  if (end) return `${fmt(start)} - ${fmt(end)}`;
  return fmt(start);
}

function getStatus(startDate, endDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate || startDate);
  end.setHours(0, 0, 0, 0);
  return end < today ? "Completed" : "Scheduled";
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
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-[14px] font-bold text-gray-800">{title}</h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-[13px] text-gray-500">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-[12.5px] font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-bold text-white bg-red-600 hover:bg-red-700 transition"
          >
            <Trash size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
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
        className={`w-full border-b bg-transparent px-0 py-2.5 text-[13px] text-gray-800 outline-none transition ${
          error ? "border-red-500" : "border-gray-200"
        } focus:border-[#9B2335]`}
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
          className={`w-full border-b bg-transparent px-0 py-2.5 text-[13px] text-gray-800 outline-none appearance-none transition ${
            error ? "border-red-500" : "border-gray-200"
          } focus:border-[#9B2335]`}
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
          className="pointer-events-none absolute right-0 top-3 text-gray-400"
        />
      </div>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
function AddOAModal({ open, onClose, onSave, assessmentType, editingItem, existingAssessments }) {
  const isEditing = !!editingItem;
  const isClassParticipation = assessmentType === "Class Participation";
  const isCIA = assessmentType === "CIA";
  const isCIAPractical = assessmentType === "CIA Practical";

  const emptyForm = {
    courseSection: "",
    number: "",
    date: "",
    startDate: "",
    endDate: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (editingItem) {
        setForm({
          courseSection: editingItem.courseSection || "",
          number: editingItem.number || "",
          date: editingItem.rawDate || "",
          startDate: editingItem.rawStartDate || "",
          endDate: editingItem.rawEndDate || "",
        });
      } else {
        setForm(emptyForm);
      }
      setErrors({});
    }
  }, [open, editingItem]);

  function handleChange(key, val) {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  }

  function getNumberLabel() {
    if (isClassParticipation) return "Class Participation Number";
    if (isCIAPractical) return "CIA Practical Number";
    return "CIA Number";
  }

  // ── Sequence check ────────────────────────────────────────────────────────
  // For a given assessment type + course-section, number N (2 or 3) can only
  // be created if N-1 already exists for that same type + course-section.
  // When editing, the item being edited is excluded from the check against
  // itself, so changing other fields on e.g. an existing "2" doesn't fail.
  function getMissingPrerequisite(numVal, courseSection) {
    if (!courseSection || !numVal || numVal <= 1) return null;

    const siblings = (existingAssessments || []).filter(
      (a) =>
        a.assessmentType === assessmentType &&
        a.courseSection === courseSection &&
        a.id !== editingItem?.id
    );

    for (let n = 1; n < numVal; n++) {
      const exists = siblings.some((a) => a.number === n);
      if (!exists) return n;
    }
    return null;
  }

  function validate() {
    const e = {};
    if (!form.courseSection) e.courseSection = "Course-Section is required.";

    const numVal = parseInt(form.number);
    if (!form.number) e.number = "Required.";
    else if (isNaN(numVal) || numVal < 1 || numVal > 3)
      e.number = "Only 1, 2, or 3 allowed.";
    else if (form.courseSection) {
      const missing = getMissingPrerequisite(numVal, form.courseSection);
      if (missing) {
        e.number = `${getNumberLabel().replace(" Number", "")} ${missing} must be created before ${getNumberLabel().replace(
          " Number",
          ""
        )} ${numVal}.`;
      }
    }

    if (isClassParticipation) {
      if (!form.startDate) e.startDate = "Start date is required.";
      if (!form.endDate) e.endDate = "End date is required.";
      else if (form.startDate && form.endDate < form.startDate)
        e.endDate = "End date must be after start date.";
    } else {
      if (!form.date) e.date = "Date is required.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleReset() {
    setForm(emptyForm);
    setErrors({});
  }

  function handleSave() {
    if (!validate()) return;

    const course = DUMMY_COURSES.find((c) => c.id === form.courseSection);
    const today = getTodayStr();

    let rawStart, rawEnd, displayDate;

    if (isClassParticipation) {
      rawStart = form.startDate;
      rawEnd = form.endDate;
      displayDate = formatDateRange(form.startDate, form.endDate);
    } else {
      rawStart = form.date;
      rawEnd = form.date;
      displayDate = formatDateRange(form.date);
    }

    const status = getStatus(rawStart, rawEnd);

    onSave({
      id: editingItem?.id || `oa-${Date.now()}`,
      assessmentType,
      courseSection: form.courseSection,
      courseName: course?.label || form.courseSection,
      number: parseInt(form.number),
      rawDate: form.date,
      rawStartDate: rawStart,
      rawEndDate: rawEnd,
      displayDate,
      maxMarks: MAX_MARKS[assessmentType],
      status,
      createdBy: LOGGED_IN_USER,
    });
  }

  if (!open) return null;

  const typeLabel = assessmentType;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[14px] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4">
          <h3 className="text-[14px] font-bold text-gray-800">
            {isEditing ? `Edit ${typeLabel}` : `Add Other Assessment`}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
            {/* Course Section */}
            <div>
              <FieldLabel required>Courses-Sections</FieldLabel>
              <SelectDropdown
                value={form.courseSection}
                onChange={(v) => {
                  handleChange("courseSection", v);
                }}
                options={DUMMY_COURSES.map((c) => ({
                  value: c.id,
                  label: c.label,
                }))}
                placeholder="Select course"
                error={errors.courseSection}
              />
            </div>

            {/* Number */}
            <div>
              <FieldLabel required>{getNumberLabel()}</FieldLabel>
              <InputUnderline
                type="number"
                min={1}
                max={3}
                value={form.number}
                onChange={(e) => handleChange("number", e.target.value)}
                placeholder="1, 2, or 3"
                error={errors.number}
              />
            </div>

            {/* Date fields */}
            {isClassParticipation ? (
              <>
                <div>
                  <FieldLabel required>Start Date</FieldLabel>
                  <InputUnderline
                    type="date"
                    min={getTodayStr()}
                    value={form.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    error={errors.startDate}
                  />
                </div>
                <div>
                  <FieldLabel required>End Date</FieldLabel>
                  <InputUnderline
                    type="date"
                    min={form.startDate || getTodayStr()}
                    value={form.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    error={errors.endDate}
                  />
                </div>
              </>
            ) : (
              <div className="col-span-2">
                <FieldLabel required>Date</FieldLabel>
                <InputUnderline
                  type="date"
                  min={getTodayStr()}
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  error={errors.date}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-[12.5px] font-bold text-gray-500 hover:bg-gray-50 transition"
          >
            <ArrowCounterClockwise size={13} /> Reset
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-bold text-white bg-[#9B2335] hover:bg-[#7A1A28] transition"
          >
            <FloppyDisk size={13} /> {isEditing ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Archive Modal ────────────────────────────────────────────────────────────
function ArchiveModal({ open, onClose, allAssessments }) {
  const completed = allAssessments.filter((a) => a.status === "Completed");

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-[14px] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4">
          <h3 className="text-[14px] font-bold text-gray-800">
            Archived Other Assessments
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {completed.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[13px] text-gray-400 font-medium">
                No completed assessments yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="bg-[#e8f4fc] border-b border-gray-200">
                    {[
                      "Type",
                      "Date",
                      "Course",
                      "Degree-Dept-Semester-Sec",
                      "Max Marks",
                      "Created/Modified By",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-[11.5px] font-semibold text-gray-400 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {completed.map((a) => (
                    <tr key={a.id} className="border-t border-gray-100">
                      <td className="px-3 py-2.5 text-[#9B2335] font-semibold text-[11.5px]">
                        {a.assessmentType} {a.number}
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-gray-800">
                        {a.displayDate}
                      </td>
                      <td className="px-3 py-2.5 text-gray-500 text-[11.5px]">
                        {a.courseName}
                      </td>
                      <td className="px-3 py-2.5 text-gray-500 text-[11.5px] max-w-[180px]">
                        <span className="line-clamp-2">{a.courseName}</span>
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-gray-800">
                        {a.maxMarks}
                      </td>
                      <td className="px-3 py-2.5 text-gray-500">
                        {a.createdBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function OtherAssessment() {
  const [assessments, setAssessments] = useState(() => lsGet(LS_OA, []));
  const [selectedType, setSelectedType] = useState("");
  const [activeTab, setActiveTab] = useState({});
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Persist to localStorage whenever assessments change
  useEffect(() => {
    lsSet(LS_OA, assessments);
  }, [assessments]);

  // Auto-refresh status based on date
  useEffect(() => {
    const refreshed = assessments.map((a) => ({
      ...a,
      status: getStatus(a.rawStartDate, a.rawEndDate),
    }));
    // Only update if something changed
    const changed = refreshed.some((r, i) => r.status !== assessments[i]?.status);
    if (changed) setAssessments(refreshed);
  }, []);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleTypeChange(type) {
    setSelectedType(type);
  }

  function handleOpenAdd() {
    if (!selectedType) return;
    setEditingItem(null);
    setAddModalOpen(true);
  }

  function handleEdit(item) {
    if (item.status === "Completed") return;
    setSelectedType(item.assessmentType);
    setEditingItem(item);
    setAddModalOpen(true);
  }

  function handleViewMarks(item) {
    const params = new URLSearchParams({
      assessmentId: item.id,
      assessmentType: item.assessmentType,
      number: item.number,
      courseSection: item.courseSection,
      courseName: item.courseName,
      maxMarks: item.maxMarks,
    });
    window.location.href = `/components/Assessment/Marks_scored?${params.toString()}`;
  }

  function handleSave(item) {
    const isNew = !assessments.find((a) => a.id === item.id);

    if (isNew) {
      // Check duplicate: same type + same number + same course
      const duplicate = assessments.find(
        (a) =>
          a.assessmentType === item.assessmentType &&
          a.number === item.number &&
          a.courseSection === item.courseSection
      );
      if (duplicate) {
        showToast(
          `${item.assessmentType} ${item.number} already exists for this course!`,
          "error"
        );
        return;
      }
    }

    setAssessments((prev) =>
      isNew ? [item, ...prev] : prev.map((a) => (a.id === item.id ? item : a))
    );

    // Set active tab for this type to the saved number
    setActiveTab((prev) => ({
      ...prev,
      [item.assessmentType]: item.number,
    }));

    setAddModalOpen(false);
    setEditingItem(null);
    showToast(isNew ? "Assessment added successfully!" : "Assessment updated!");
  }

  function handleDeleteConfirm() {
    setAssessments((prev) => prev.filter((a) => a.id !== deleteId));
    setDeleteId(null);
    showToast("Assessment deleted.");
  }

  // Get all unique numbers for a given type
  function getTabsForType(type) {
    const nums = [
      ...new Set(
        assessments
          .filter((a) => a.assessmentType === type)
          .map((a) => a.number)
      ),
    ].sort((a, b) => a - b);
    return nums;
  }

  // Get the active tab number for a type
  function getActiveTab(type) {
    const tabs = getTabsForType(type);
    if (!tabs.length) return null;
    const current = activeTab[type];
    return tabs.includes(current) ? current : tabs[0];
  }

  // Get rows for the current active tab
  function getRowsForTab(type, tabNum) {
    return assessments.filter(
      (a) => a.assessmentType === type && a.number === tabNum
    );
  }

  const hasAnyAssessments = assessments.length > 0;
  const selectedTypeAssessments = selectedType
    ? assessments.filter((a) => a.assessmentType === selectedType)
    : [];
  const selectedTypeTabs = selectedType ? getTabsForType(selectedType) : [];
  const currentTab = selectedType ? getActiveTab(selectedType) : null;
  const currentRows = selectedType && currentTab
    ? getRowsForTab(selectedType, currentTab)
    : [];

  const tabLabel = {
    "Class Participation": "Class Participation",
    CIA: "CIA",
    "CIA Practical": "CIA Practical",
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 pb-12">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Top breadcrumb + actions ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-[12px] text-gray-400">
          <span>Timetable</span>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-700 uppercase tracking-wide">
            Other Assessment
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setArchiveOpen(true)}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-gray-400 hover:text-[#9B2335] transition"
          >
            <Eye size={14} /> View Archive
          </button>
          <button
            onClick={handleOpenAdd}
            disabled={!selectedType}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition shadow-sm
              ${
                selectedType
                  ? "border-gray-200 bg-white text-gray-400 hover:bg-[#9B2335] hover:text-white hover:border-[#9B2335]"
                  : "border-gray-100 bg-gray-50 text-gray-200 cursor-not-allowed"
              }`}
          >
            <Plus size={16} weight="bold" />
          </button>
        </div>
      </div>

      {/* ── Assessment Type Selector ── */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex flex-col gap-0.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Other Assessment
            <span className="text-[#9B2335] ml-0.5">*</span>
          </label>
          <div className="relative w-56">
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full border-b border-gray-300 bg-transparent px-0 py-2 text-[13px] text-gray-800 outline-none appearance-none focus:border-[#9B2335] transition"
            >
              <option value="">Select</option>
              {ASSESSMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <CaretDown
              size={13}
              className="pointer-events-none absolute right-0 top-2.5 text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* ── Empty state ── */}
      {!selectedType && (
        <div className="min-h-[55vh] flex items-center justify-center bg-white rounded-[14px] border border-gray-200">
          <p className="text-[14px] font-medium text-gray-400">
            Please select an assessment type to continue.
          </p>
        </div>
      )}

      {/* ── Assessment list (when type selected) ── */}
      {selectedType && (
        <>
          {selectedTypeTabs.length === 0 ? (
            <div className="min-h-[50vh] flex items-center justify-center bg-white rounded-[14px] border border-gray-200">
              <p className="text-[14px] font-medium text-gray-400">
                No assessments scheduled
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-[14px] border border-gray-200 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 px-4 pt-2 gap-1 overflow-x-auto">
                {selectedTypeTabs.map((num) => (
                  <button
                    key={num}
                    onClick={() =>
                      setActiveTab((prev) => ({
                        ...prev,
                        [selectedType]: num,
                      }))
                    }
                    className={`px-4 py-2 text-[12.5px] font-semibold whitespace-nowrap border-b-2 transition
                      ${
                        currentTab === num
                          ? "border-[#9B2335] text-[#9B2335]"
                          : "border-transparent text-gray-400 hover:text-gray-700"
                      }`}
                  >
                    {tabLabel[selectedType]} {num}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="bg-[#e8f4fc] border-b border-gray-200">
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
                          className="px-4 py-3 text-left text-[11.5px] font-semibold text-gray-400 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-10 text-center text-[12.5px] text-gray-400"
                        >
                          No assessments in this tab.
                        </td>
                      </tr>
                    ) : (
                      currentRows.map((a) => {
                        const isCompleted = a.status === "Completed";
                        return (
                          <tr
                            key={a.id}
                            className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-4">
                              <p className="font-semibold text-gray-800">
                                {a.displayDate}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-semibold text-gray-800 text-[12px]">
                                {a.courseName}
                              </p>
                            </td>
                            <td className="px-4 py-4 max-w-[220px]">
                              <p className="text-gray-400 text-[11.5px] line-clamp-3">
                                {a.courseName}
                              </p>
                            </td>
                            <td className="px-4 py-4 font-semibold text-gray-800">
                              {a.maxMarks}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold
                                  ${
                                    isCompleted
                                      ? "bg-green-50 text-green-700 border border-green-200"
                                      : "bg-amber-50 text-amber-700 border border-amber-200"
                                  }`}
                              >
                                {a.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-gray-500">
                              {a.createdBy}
                            </td>
                            <td className="px-4 py-4 text-gray-400 font-semibold text-[11.5px]">
                              <span className="text-gray-300">NA</span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleEdit(a)}
                                  disabled={isCompleted}
                                  title={
                                    isCompleted
                                      ? "Cannot edit a completed assessment"
                                      : "Edit"
                                  }
                                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition
                                    ${
                                      isCompleted
                                        ? "border-gray-100 text-gray-200 cursor-not-allowed"
                                        : "border-gray-200 text-gray-400 hover:text-[#9B2335] hover:border-[#9B2335]"
                                    }`}
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => setDeleteId(a.id)}
                                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition"
                                  title="Delete"
                                >
                                  <Trash size={13} />
                                </button>
                                {isCompleted && (
                                  <button
                                    onClick={() => handleViewMarks(a)}
                                    title="Go to Marks Scored"
                                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#9B2335] hover:border-[#9B2335] transition"
                                  >
                                    <ArrowRight size={13} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Modals ── */}
      <AddOAModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        assessmentType={selectedType}
        editingItem={editingItem}
        existingAssessments={assessments}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Assessment"
        message="Are you sure you want to delete this assessment? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      <ArchiveModal
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        allAssessments={assessments}
      />
    </div>
  );
}