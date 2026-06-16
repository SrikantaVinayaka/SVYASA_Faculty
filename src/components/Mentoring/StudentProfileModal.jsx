import { useEffect, useMemo, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import TaskModal from "./TaskModal.jsx";

const OD_REQUEST_TYPES = ["Medical", "Event / Competition", "Other"];
const ACHIEVEMENT_CATEGORIES = ["Sports", "Events", "Participation", "Personal Achievements", "Other"];

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Pill({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-page-bg text-text2 border-border",
    red: "bg-[#FFF4F5] text-[#9B2335] border-[#E5B3B9]",
    green: "bg-[#EDF7EE] text-[#2E7D32] border-[#B7E0BA]",
    amber: "bg-[#FEF3E2] text-[#854f0b] border-[#F4D7A8]",
    blue: "bg-[#E6F1FB] text-[#185fa5] border-[#BBD7F2]",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-border bg-white">
      <div className="border-b border-border px-4 py-2 text-[12.5px] font-bold text-text">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function StudentProfileModal({
  student,
  mentors,
  initialMode = "smr",
  readOnly = false,
  onClose,
  onUpdateStudent,
}) {
  const [mode, setMode] = useState(readOnly ? "smr" : initialMode); // smr | edit | assignTask | achievements
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [achievementModalOpen, setAchievementModalOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingReasonId, setEditingReasonId] = useState(null);
  const [reasonForm, setReasonForm] = useState({ type: "Medical", comment: "", date: "" });
  const [achievementForm, setAchievementForm] = useState({ title: "", category: "Sports", date: "", details: "", fileName: "" });
  const [certForm, setCertForm] = useState({ title: "", provider: "LinkedIn", date: "", details: "", fileName: "" });

  const [phone, setPhone] = useState(student.profile?.phone ?? "");
  const [email, setEmail] = useState(student.profile?.email ?? "");
  const [dob, setDob] = useState(student.profile?.dob ?? "");
  const [address, setAddress] = useState(student.profile?.address ?? "");
  const [parentName, setParentName] = useState(student.profile?.parentName ?? "");
  const [parentPhone, setParentPhone] = useState(student.profile?.parentPhone ?? "");
  const [bloodGroup, setBloodGroup] = useState(student.profile?.bloodGroup ?? "");
  const [category, setCategory] = useState(student.profile?.category ?? "");

  useEffect(() => {
    setPhone(student.profile?.phone ?? "");
    setEmail(student.profile?.email ?? "");
    setDob(student.profile?.dob ?? "");
    setAddress(student.profile?.address ?? "");
    setParentName(student.profile?.parentName ?? "");
    setParentPhone(student.profile?.parentPhone ?? "");
    setBloodGroup(student.profile?.bloodGroup ?? "");
    setCategory(student.profile?.category ?? "");
  }, [student]);

  useEffect(() => {
    setMode(readOnly ? "smr" : initialMode);
  }, [initialMode, readOnly]);

  // Editable fields (simple beginner-friendly approach)
  const [attendancePct, setAttendancePct] = useState(student.academics?.attendancePct ?? 0);
  const [iaMarks, setIaMarks] = useState(student.academics?.iaMarks ?? 0);
  const [sefCompleted, setSefCompleted] = useState(!!student.academics?.sefCompleted);
  const [assessmentsCompleted, setAssessmentsCompleted] = useState(!!student.academics?.assessmentsCompleted);

  const [activitiesText, setActivitiesText] = useState((student.activities ?? []).join("\n"));
  const [remarkText, setRemarkText] = useState("");

  const [feeStatus, setFeeStatus] = useState(student.fees?.status ?? "Pending");
  const [feeConcession, setFeeConcession] = useState(student.fees?.concession ?? "No");
  const [semCleared, setSemCleared] = useState(student.fees?.semestersCleared ?? 0);

  const [uploadFile, setUploadFile] = useState(null);

  const hallTicketRef = useRef(null);
  const remarksRef = useRef(null);
  const achievementsReportRef = useRef(null);
  const semesterReportRef = useRef(null);

  const lowAttendance = attendancePct < 75;

  const hallTicketEligible = useMemo(() => {
    const attendanceOk = attendancePct >= 75;
    const feeOk = feeStatus === "Paid";
    const assessOk = assessmentsCompleted && sefCompleted;
    return attendanceOk && feeOk && assessOk;
  }, [attendancePct, assessmentsCompleted, feeStatus, sefCompleted]);

  function saveEdits() {
    onUpdateStudent?.((prev) => ({
      ...prev,
      academics: {
        ...(prev.academics ?? {}),
        attendancePct: Number(attendancePct) || 0,
        iaMarks: Number(iaMarks) || 0,
        sefCompleted: !!sefCompleted,
        assessmentsCompleted: !!assessmentsCompleted,
      },
      fees: {
        ...(prev.fees ?? {}),
        status: feeStatus,
        concession: feeConcession,
        semestersCleared: Number(semCleared) || 0,
      },
      activities: activitiesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    }));
    alert("Saved (mock).");
  }

  async function downloadPdfFromRef(ref, filename) {
    if (!ref.current) return;
    const opt = {
      margin: 10,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    await html2pdf().from(ref.current).set(opt).save();
  }

  function saveProfileDetails() {
    onUpdateStudent?.((prev) => ({
      ...prev,
      profile: {
        ...(prev.profile ?? {}),
        phone,
        email,
        dob,
        address,
        parentName,
        parentPhone,
        bloodGroup,
        category,
      },
    }));
    alert("Profile details saved (mock).");
  }

  function saveReason() {
    const comment = reasonForm.comment.trim();
    if (!comment) return;
    onUpdateStudent?.((prev) => {
      const list = [...(prev.absenceReasons ?? [])];
      if (editingReasonId) {
        const idx = list.findIndex((r) => r.id === editingReasonId);
        if (idx >= 0) list[idx] = { ...list[idx], ...reasonForm, comment };
      } else {
        list.push({
          id: `ar-${Date.now()}`,
          ...reasonForm,
          comment,
          status: "Pending",
          source: "Mentor",
        });
      }
      return { ...prev, absenceReasons: list };
    });
    setReasonForm({ type: "Medical", comment: "", date: new Date().toISOString().slice(0, 10) });
    setEditingReasonId(null);
  }

  function updateReasonStatus(reasonId, status) {
    onUpdateStudent?.((prev) => ({
      ...prev,
      absenceReasons: (prev.absenceReasons ?? []).map((r) => (r.id === reasonId ? { ...r, status } : r)),
    }));
  }

  function addAchievement() {
    if (!achievementForm.title.trim()) return;
    onUpdateStudent?.((prev) => ({
      ...prev,
      achievements: [...(prev.achievements ?? []), { id: `ach-${Date.now()}`, ...achievementForm, source: "Mentor" }],
    }));
    setAchievementForm({ title: "", category: "Sports", date: "", details: "", fileName: "" });
    setAchievementModalOpen(false);
  }

  function addCertification() {
    if (!certForm.title.trim()) return;
    onUpdateStudent?.((prev) => ({
      ...prev,
      certifications: [...(prev.certifications ?? []), { id: `cert-${Date.now()}`, ...certForm, source: "Mentor" }],
    }));
    setCertForm({ title: "", provider: "LinkedIn", date: "", details: "", fileName: "" });
    setCertModalOpen(false);
  }

  function handleAchievementFile(file) {
    if (!file) return;
    const base = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
    setAchievementForm((prev) => ({
      ...prev,
      title: prev.title || base,
      date: prev.date || new Date().toISOString().slice(0, 10),
      details: prev.details || `Certificate uploaded: ${file.name}`,
      fileName: file.name,
    }));
  }

  function handleCertFile(file) {
    if (!file) return;
    const base = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
    setCertForm((prev) => ({
      ...prev,
      title: prev.title || base,
      date: prev.date || new Date().toISOString().slice(0, 10),
      details: prev.details || `LinkedIn certificate: ${file.name}`,
      fileName: file.name,
    }));
  }

  async function downloadRemarksPdf() {
    if (!remarksRef.current) return;
    const opt = {
      margin: 10,
      filename: `${student.registerNo}-remarks.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    await html2pdf().from(remarksRef.current).set(opt).save();
  }

  async function downloadHallTicketPdf() {
    if (!hallTicketRef.current) return;
    const opt = {
      margin: 10,
      filename: `${student.registerNo}-hall-ticket.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    await html2pdf().from(hallTicketRef.current).set(opt).save();
  }

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-6xl overflow-hidden rounded-2xl border border-border bg-page-bg shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border bg-white px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7B1D2E] text-white font-bold">
              {initials(student.name)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-bold text-text">
                {student.name} <span className="text-text2 font-semibold">({student.registerNo})</span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <Pill tone="blue">{student.degree}</Pill>
                <Pill>Sem {student.semester}</Pill>
                <Pill>Sec {student.section}</Pill>
                <Pill tone={lowAttendance ? "red" : "green"}>Attendance {attendancePct}%</Pill>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMode("smr")}
              className={`rounded-lg px-3 py-2 text-[12.5px] font-semibold ${
                mode === "smr" ? "bg-[#7B1D2E] text-white" : "border border-border bg-white text-text hover:bg-page-bg"
              }`}
            >
              Profile
            </button>
            {!readOnly && (
              <>
                <button
                  type="button"
                  onClick={() => setMode("edit")}
                  className={`rounded-lg px-3 py-2 text-[12.5px] font-semibold ${
                    mode === "edit" ? "bg-[#7B1D2E] text-white" : "border border-border bg-white text-text hover:bg-page-bg"
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setMode("assignTask")}
                  className={`rounded-lg px-3 py-2 text-[12.5px] font-semibold ${
                    mode === "assignTask" ? "bg-[#7B1D2E] text-white" : "border border-border bg-white text-text hover:bg-page-bg"
                  }`}
                >
                  Assign Task
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setMode("achievements")}
              className={`rounded-lg px-3 py-2 text-[12.5px] font-semibold ${
                mode === "achievements" ? "bg-[#7B1D2E] text-white" : "border border-border bg-white text-text hover:bg-page-bg"
              }`}
            >
              Achievements
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] font-semibold text-text hover:bg-page-bg"
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[78vh] overflow-y-auto p-4 space-y-3">
          {mode === "smr" ? (
            <div className="grid gap-3 lg:grid-cols-3">
              <Section title="Student Details">
                <div className="space-y-2 text-[13px] text-text">
                  <div className="flex justify-between gap-3">
                    <span className="text-text2">Mentor</span>
                    <span className="font-semibold">{student.mentor}</span>
                  </div>
                  <div className="pt-1">
                    <label className="text-[12px] font-semibold text-text2">
                      Transfer
                      <select
                        value={student.mentor}
                        onChange={(e) => onUpdateStudent?.((prev) => ({ ...prev, mentor: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-[13px] text-text outline-none"
                      >
                        {mentors.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-text2">Phone</span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-lg border border-border px-2 py-1 text-[13px] font-semibold text-text outline-none w-44" />
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-text2">Email</span>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg border border-border px-2 py-1 text-[13px] font-semibold text-text outline-none w-44" />
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-text2">DOB</span>
                    <input value={dob} onChange={(e) => setDob(e.target.value)} className="rounded-lg border border-border px-2 py-1 text-[13px] font-semibold text-text outline-none w-44" />
                  </div>
                  <div className="pt-2">
                    <label className="text-[12px] font-semibold text-text2">Address</label>
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-[13px] text-text outline-none" />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 pt-2">
                    <label className="text-[12px] font-semibold text-text2">
                      Parent name
                      <input value={parentName} onChange={(e) => setParentName(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-[13px] outline-none" />
                    </label>
                    <label className="text-[12px] font-semibold text-text2">
                      Parent phone
                      <input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-[13px] outline-none" />
                    </label>
                    <label className="text-[12px] font-semibold text-text2">
                      Blood group
                      <input value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-[13px] outline-none" />
                    </label>
                    <label className="text-[12px] font-semibold text-text2">
                      Category
                      <input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-[13px] outline-none" />
                    </label>
                  </div>
                  <button type="button" onClick={saveProfileDetails} className="mt-2 rounded-lg bg-[#7B1D2E] px-3 py-2 text-[12px] font-semibold text-white">
                    Save Profile Details
                  </button>
                </div>
              </Section>

              <Section title="Attendance Status">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="text-text2">Percentage</span>
                    <span className="font-bold text-text">{attendancePct}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-page-bg">
                    <div
                      className={`h-full ${lowAttendance ? "bg-[#9B2335]" : "bg-[#2E7D32]"}`}
                      style={{ width: `${Math.min(100, Math.max(0, attendancePct))}%` }}
                    />
                  </div>
                  {lowAttendance ? (
                    <div className="rounded-lg border border-[#E5B3B9] bg-[#FFF4F5] px-3 py-2 text-[12px] font-semibold text-[#9B2335]">
                      ⚠ Low attendance. Student may be ineligible for hall ticket.
                    </div>
                  ) : (
                    <div className="text-[12px] text-text2">Attendance is good.</div>
                  )}
                </div>
              </Section>

              <Section title="Fee Details">
                <div className="space-y-2 text-[13px]">
                  <div className="flex justify-between gap-3">
                    <span className="text-text2">Fee status</span>
                    <Pill tone={feeStatus === "Paid" ? "green" : "red"}>{feeStatus}</Pill>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-text2">Concession</span>
                    <span className="font-semibold text-text">{feeConcession}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-text2">Semesters cleared</span>
                    <span className="font-semibold text-text">{semCleared}</span>
                  </div>
                </div>
              </Section>
            </div>
          ) : null}

          {mode === "smr" ? (
            <Section title="Leave / OD Reasons">
              <div className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <select value={reasonForm.type} onChange={(e) => setReasonForm((p) => ({ ...p, type: e.target.value }))} className="rounded-lg border border-border px-3 py-2 text-[13px]">
                    {OD_REQUEST_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <input type="date" value={reasonForm.date} onChange={(e) => setReasonForm((p) => ({ ...p, date: e.target.value }))} className="rounded-lg border border-border px-3 py-2 text-[13px]" />
                  <button type="button" onClick={saveReason} className="rounded-lg bg-[#7B1D2E] px-3 py-2 text-[12.5px] font-semibold text-white">
                    {editingReasonId ? "Update Reason" : "Add Reason"}
                  </button>
                </div>
                <textarea value={reasonForm.comment} onChange={(e) => setReasonForm((p) => ({ ...p, comment: e.target.value }))} rows={2} placeholder="Reason details..." className="w-full rounded-lg border border-border px-3 py-2 text-[13px] outline-none" />
                <div className="space-y-2">
                  {(student.absenceReasons ?? []).length === 0 ? (
                    <div className="text-[12.5px] text-text2">No leave/OD reasons recorded.</div>
                  ) : (
                    student.absenceReasons.map((r) => (
                      <div key={r.id} className="rounded-lg border border-border bg-page-bg p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-[12.5px] font-bold text-text">{r.type} · {r.date}</div>
                          <Pill tone={r.status === "Approved" ? "green" : r.status === "Rejected" ? "red" : "amber"}>{r.status}</Pill>
                        </div>
                        <div className="mt-1 text-[12.5px] text-text">{r.comment}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button type="button" onClick={() => updateReasonStatus(r.id, "Approved")} className="rounded-md border border-[#B7E0BA] bg-[#EDF7EE] px-2 py-1 text-[11px] font-semibold text-[#2E7D32]">Approve</button>
                          <button type="button" onClick={() => updateReasonStatus(r.id, "Rejected")} className="rounded-md border border-[#E5B3B9] bg-[#FFF4F5] px-2 py-1 text-[11px] font-semibold text-[#9B2335]">Reject</button>
                          <button type="button" onClick={() => { setEditingReasonId(r.id); setReasonForm({ type: r.type, comment: r.comment, date: r.date }); }} className="rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-text">Edit</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Section>
          ) : null}

          {mode === "edit" ? (
            <div className="grid gap-3 lg:grid-cols-2">
              <Section title="Edit Academics">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-[12px] font-semibold text-text2">
                    Attendance %
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={attendancePct}
                      readOnly
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-[13px] text-text outline-none"
                    />
                  </label>
                  <label className="text-[12px] font-semibold text-text2">
                    IA Marks (mock)
                    <input
                      type="number"
                      value={iaMarks}
                      readOnly
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-[13px] text-text outline-none"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-[12px] font-semibold text-text2">
                    <input type="checkbox" checked={sefCompleted} disabled />
                    SEF completed
                  </label>
                  <label className="flex items-center gap-2 text-[12px] font-semibold text-text2">
                    <input
                      type="checkbox"
                      checked={assessmentsCompleted}
                      disabled
                    />
                    Assessments completed
                  </label>
                </div>
              </Section>

              <Section title="Edit Fee & Activities">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-[12px] font-semibold text-text2">
                    Fee status
                    <select
                      value={feeStatus}
                      disabled
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-[13px] text-text outline-none"
                    >
                      <option>Paid</option>
                      <option>Pending</option>
                    </select>
                  </label>
                  <label className="text-[12px] font-semibold text-text2">
                    Fee concession
                    <select
                      value={feeConcession}
                      disabled
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-[13px] text-text outline-none"
                    >
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </label>
                  <label className="text-[12px] font-semibold text-text2">
                    Semesters cleared
                    <input
                      type="number"
                      min={0}
                      value={semCleared}
                      readOnly
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-[13px] text-text outline-none"
                    />
                  </label>
                </div>

                <div className="mt-3">
                  <label className="text-[12px] font-semibold text-text2">
                    Activities (one per line)
                    <textarea
                      rows={4}
                      value={activitiesText}
                      readOnly
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-[13px] text-text outline-none"
                    />
                  </label>
                </div>
              </Section>
            </div>
          ) : null}

          {mode === "assignTask" ? (
            <div className="grid gap-3 lg:grid-cols-2">
              <Section title="Assign Task">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[12.5px] text-text2">Create tasks and track status.</div>
                  <button
                    type="button"
                    onClick={() => setTaskModalOpen(true)}
                    className="rounded-lg bg-[#0B4B5A] px-3 py-2 text-[12.5px] font-semibold text-white hover:opacity-95"
                  >
                    Create Task
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {(student.tasks ?? []).length === 0 ? (
                    <div className="text-[12.5px] text-text2">No tasks yet.</div>
                  ) : (
                    student.tasks.map((t) => (
                      <div key={t.id} className="rounded-xl border border-border bg-page-bg p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-[12.5px] font-bold text-text">
                            Task · <span className="text-text2 font-semibold">{t.dateAssigned}</span>
                          </div>
                          <Pill tone={t.status === "Completed" ? "green" : "amber"}>{t.status}</Pill>
                        </div>
                        <div className="mt-2 text-[12px] text-text2">
                          Deadline: <span className="text-text font-semibold">{t.deadline || "—"}</span> · Created by{" "}
                          <span className="text-text font-semibold">{t.createdBy}</span>{" "}
                          {t.isCIA ? <Pill tone="blue">CIA</Pill> : null}
                        </div>
                        <ul className="mt-2 list-disc pl-5 text-[12.5px] text-text">
                          {(t.checklist ?? []).map((c) => (
                            <li key={c}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </div>
              </Section>

              <div className="space-y-3">
                <Section title="File Upload (PDF certificate)">
                  <div className="space-y-2">
                    <input type="file" accept="application/pdf" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} />
                    <button
                      type="button"
                      disabled={!uploadFile}
                      onClick={() => {
                        if (!uploadFile) return;
                        const url = URL.createObjectURL(uploadFile);
                        const item = { id: `up-${Date.now()}`, name: uploadFile.name, url };
                        onUpdateStudent?.((prev) => ({ ...prev, uploads: [...(prev.uploads ?? []), item] }));
                        setUploadFile(null);
                      }}
                      className={`rounded-lg px-3 py-2 text-[12.5px] font-semibold ${
                        uploadFile ? "bg-[#7B1D2E] text-white hover:opacity-95" : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Upload
                    </button>

                    {(student.uploads ?? []).length ? (
                      <div className="space-y-2">
                        {student.uploads.map((u) => (
                          <div key={u.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-page-bg px-3 py-2">
                            <div className="truncate text-[12.5px] font-semibold text-text">{u.name}</div>
                            <button
                              type="button"
                              onClick={async () => {
                                const res = await fetch(u.url);
                                const blob = await res.blob();
                                downloadBlob(u.name, blob);
                              }}
                              className="rounded-md border border-border bg-white px-2 py-1 text-[12px] font-semibold text-text hover:bg-white/70"
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[12.5px] text-text2">No uploads yet.</div>
                    )}
                  </div>
                </Section>

                <Section title="Remarks">
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={remarkText}
                      onChange={(e) => setRemarkText(e.target.value)}
                      placeholder="Add a remark (disciplinary / malpractice)..."
                      className="w-full rounded-lg border border-border px-3 py-2 text-[13px] outline-none"
                    />
                    <div className="flex flex-wrap justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const text = remarkText.trim();
                          if (!text) return;
                          onUpdateStudent?.((prev) => ({
                            ...prev,
                            remarks: [...(prev.remarks ?? []), { id: `rm-${Date.now()}`, date: new Date().toISOString().slice(0, 10), text }],
                          }));
                          setRemarkText("");
                        }}
                        className="rounded-lg bg-[#7B1D2E] px-3 py-2 text-[12.5px] font-semibold text-white hover:opacity-95"
                      >
                        Add Remark
                      </button>
                      <button
                        type="button"
                        onClick={downloadRemarksPdf}
                        className="rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] font-semibold text-text hover:bg-page-bg"
                      >
                        Download remarks as PDF
                      </button>
                    </div>

                    <div className="mt-2 space-y-2">
                      {(student.remarks ?? []).length === 0 ? (
                        <div className="text-[12.5px] text-text2">No remarks yet.</div>
                      ) : (
                        student.remarks
                          .slice()
                          .reverse()
                          .map((r) => (
                            <div key={r.id} className="rounded-lg border border-border bg-page-bg px-3 py-2">
                              <div className="text-[11px] font-semibold text-text2">{r.date}</div>
                              <div className="text-[12.5px] text-text">{r.text}</div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  {/* Hidden-ish printable area for remarks */}
                  <div className="mt-4 rounded-lg border border-border bg-white p-3" ref={remarksRef}>
                    <div className="text-[14px] font-bold text-text">Remarks Report</div>
                    <div className="text-[12px] text-text2">
                      {student.name} · {student.registerNo} · {student.degree} Sec {student.section}
                    </div>
                    <div className="mt-3 space-y-2">
                      {(student.remarks ?? []).length === 0 ? (
                        <div className="text-[12.5px] text-text2">No remarks recorded.</div>
                      ) : (
                        student.remarks.map((r) => (
                          <div key={r.id} className="border-b border-border pb-2">
                            <div className="text-[11px] font-semibold text-text2">{r.date}</div>
                            <div className="text-[12.5px] text-text">{r.text}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </Section>

                <Section title="Hall Ticket Generation">
                  <div className="space-y-2">
                    <div className="text-[12.5px] text-text2">
                      Conditions: Attendance ≥ 75%, Fee Paid, Assessments completed (includes SEF).
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Pill tone={attendancePct >= 75 ? "green" : "red"}>Attendance</Pill>
                      <Pill tone={feeStatus === "Paid" ? "green" : "red"}>Fee</Pill>
                      <Pill tone={assessmentsCompleted && sefCompleted ? "green" : "red"}>Assessments</Pill>
                    </div>

                    <button
                      type="button"
                      disabled={!hallTicketEligible}
                      onClick={downloadHallTicketPdf}
                      className={`rounded-lg px-3 py-2 text-[12.5px] font-semibold ${
                        hallTicketEligible ? "bg-[#0B4B5A] text-white hover:opacity-95" : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Generate Hall Ticket
                    </button>

                    {/* Default simple hall ticket format (no photo required) */}
                    <div ref={hallTicketRef} className="mt-4 rounded-xl border border-border bg-white p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[16px] font-bold text-text">S‑VYASA Deemed University</div>
                          <div className="text-[12px] text-text2">Hall Ticket (Default Format)</div>
                          <div className="mt-2 text-[12px] text-text2">
                            Generated on:{" "}
                            <span className="font-semibold text-text">
                              {new Date().toLocaleDateString("en-IN")}
                            </span>
                          </div>
                        </div>
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-page-bg text-[20px] font-bold text-[#7B1D2E]">
                          {initials(student.name)}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 text-[13px]">
                        <div className="rounded-lg border border-border p-3">
                          <div className="text-[11px] font-semibold text-text2">Student Name</div>
                          <div className="font-bold text-text">{student.name}</div>
                        </div>
                        <div className="rounded-lg border border-border p-3">
                          <div className="text-[11px] font-semibold text-text2">Register Number</div>
                          <div className="font-bold text-text">{student.registerNo}</div>
                        </div>
                        <div className="rounded-lg border border-border p-3">
                          <div className="text-[11px] font-semibold text-text2">Programme</div>
                          <div className="font-bold text-text">{student.degree}</div>
                        </div>
                        <div className="rounded-lg border border-border p-3">
                          <div className="text-[11px] font-semibold text-text2">Semester / Section</div>
                          <div className="font-bold text-text">
                            Sem {student.semester} · Sec {student.section}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-lg border border-border p-3 text-[12.5px]">
                        <div className="font-bold text-text">Exam Details (Mock)</div>
                        <div className="mt-1 text-text2">Exam: End Semester Examination</div>
                        <div className="text-text2">Session: 2025-26 Even Semester</div>
                        <div className="text-text2">Center: S‑VYASA Main Campus</div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-[12px] text-text2">
                        <div>
                          <div className="font-semibold text-text">Student Signature</div>
                          <div className="mt-6 w-40 border-t border-border" />
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-text">Controller of Examinations</div>
                          <div className="mt-6 w-44 border-t border-border ml-auto" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Section>
              </div>
            </div>
          ) : null}

          {mode === "achievements" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setAchievementModalOpen(true)} className="rounded-lg bg-[#7B1D2E] px-3 py-2 text-[12.5px] font-semibold text-white">+ Add New Achievement</button>
                <button type="button" onClick={() => setCertModalOpen(true)} className="rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] font-semibold text-text">+ Add Certification</button>
                <button type="button" onClick={() => downloadPdfFromRef(achievementsReportRef, `${student.registerNo}-achievements.pdf`)} className="rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] font-semibold text-text">Download Achievements PDF</button>
                <button type="button" onClick={() => downloadPdfFromRef(semesterReportRef, `${student.registerNo}-semester-report.pdf`)} className="rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] font-semibold text-text">Download Semester Report PDF</button>
              </div>

              <Section title="Achievements">
                <div className="space-y-2">
                  {(student.achievements ?? []).length === 0 ? (
                    <div className="text-[12.5px] text-text2">No achievements yet.</div>
                  ) : (
                    student.achievements.map((a) => (
                      <div key={a.id} className="rounded-lg border border-border bg-page-bg p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-[12.5px] font-bold text-text">{a.title}</div>
                          <Pill tone="blue">{a.category}</Pill>
                        </div>
                        <div className="text-[12px] text-text2 mt-1">{a.date} · {a.source}</div>
                        <div className="text-[12.5px] text-text mt-1">{a.details}</div>
                        {a.fileName ? <div className="text-[11px] text-text2 mt-1">Certificate: {a.fileName}</div> : null}
                      </div>
                    ))
                  )}
                </div>
              </Section>

              <Section title="Certifications">
                <div className="space-y-2">
                  {(student.certifications ?? []).length === 0 ? (
                    <div className="text-[12.5px] text-text2">No certifications yet.</div>
                  ) : (
                    student.certifications.map((c) => (
                      <div key={c.id} className="rounded-lg border border-border bg-page-bg p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-[12.5px] font-bold text-text">{c.title}</div>
                          <Pill>{c.provider}</Pill>
                        </div>
                        <div className="text-[12px] text-text2 mt-1">{c.date} · {c.source}</div>
                        <div className="text-[12.5px] text-text mt-1">{c.details}</div>
                        {c.fileName ? <div className="text-[11px] text-text2 mt-1">File: {c.fileName}</div> : null}
                      </div>
                    ))
                  )}
                </div>
              </Section>

              <div ref={achievementsReportRef} className="rounded-xl border border-border bg-white p-4">
                <div className="text-[14px] font-bold text-text">Student Achievements Report</div>
                <div className="text-[12px] text-text2">{student.name} · {student.registerNo}</div>
                <div className="mt-3 space-y-2 text-[12.5px]">
                  <div className="font-semibold text-text">Achievements</div>
                  {(student.achievements ?? []).map((a) => (
                    <div key={a.id} className="border-b border-border pb-2">
                      <div className="font-semibold">{a.title} ({a.category})</div>
                      <div className="text-text2">{a.date} — {a.details}</div>
                    </div>
                  ))}
                  <div className="font-semibold text-text pt-2">Events Participated</div>
                  {(student.activities ?? []).map((act) => (
                    <div key={act} className="text-text2">{act}</div>
                  ))}
                  <div className="font-semibold text-text pt-2">Certifications</div>
                  {(student.certifications ?? []).map((c) => (
                    <div key={c.id} className="border-b border-border pb-2">
                      <div className="font-semibold">{c.title} ({c.provider})</div>
                      <div className="text-text2">{c.date} — {c.details}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div ref={semesterReportRef} className="rounded-xl border border-border bg-white p-4">
                <div className="text-[14px] font-bold text-text">Semester Report — Sem {student.semester}</div>
                <div className="text-[12px] text-text2">{student.name} · {student.registerNo} · {student.degree}</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 text-[12.5px]">
                  <div className="rounded-lg border border-border p-2"><span className="text-text2">IA-1:</span> <span className="font-semibold">{student.academics?.iaMarks ?? "—"}</span></div>
                  <div className="rounded-lg border border-border p-2"><span className="text-text2">IA-2:</span> <span className="font-semibold">{Math.max(0, (student.academics?.iaMarks ?? 0) - 2)}</span></div>
                  <div className="rounded-lg border border-border p-2"><span className="text-text2">Attendance:</span> <span className="font-semibold">{attendancePct}%</span></div>
                  <div className="rounded-lg border border-border p-2"><span className="text-text2">Fee:</span> <span className="font-semibold">{feeStatus}</span></div>
                </div>
                <div className="mt-3 text-[12.5px]">
                  <div className="font-semibold text-text">Certifications & Achievements</div>
                  {(student.achievements ?? []).map((a) => <div key={a.id} className="text-text2">{a.title} — {a.date}</div>)}
                  {(student.certifications ?? []).map((c) => <div key={c.id} className="text-text2">{c.title} — {c.date}</div>)}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {achievementModalOpen ? (
        <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-4 shadow-2xl">
            <div className="text-[14px] font-bold text-text mb-3">Add Achievement</div>
            <div className="space-y-2">
              <input value={achievementForm.title} onChange={(e) => setAchievementForm((p) => ({ ...p, title: e.target.value }))} placeholder="Achievement title" className="w-full rounded-lg border border-border px-3 py-2 text-[13px]" />
              <select value={achievementForm.category} onChange={(e) => setAchievementForm((p) => ({ ...p, category: e.target.value }))} className="w-full rounded-lg border border-border px-3 py-2 text-[13px]">
                {ACHIEVEMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="date" value={achievementForm.date} onChange={(e) => setAchievementForm((p) => ({ ...p, date: e.target.value }))} className="w-full rounded-lg border border-border px-3 py-2 text-[13px]" />
              <textarea value={achievementForm.details} onChange={(e) => setAchievementForm((p) => ({ ...p, details: e.target.value }))} rows={3} placeholder="Date / details" className="w-full rounded-lg border border-border px-3 py-2 text-[13px]" />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#9B2335] px-3 py-2 text-[12.5px] font-semibold text-white">
                Upload certificate
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleAchievementFile(e.target.files?.[0])} />
              </label>
              {achievementForm.fileName ? <div className="text-[12px] text-text2">{achievementForm.fileName}</div> : null}
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setAchievementModalOpen(false)} className="rounded-lg border border-border px-3 py-2 text-[12.5px] font-semibold">Cancel</button>
              <button type="button" onClick={addAchievement} className="rounded-lg bg-[#7B1D2E] px-3 py-2 text-[12.5px] font-semibold text-white">Save</button>
            </div>
          </div>
        </div>
      ) : null}

      {certModalOpen ? (
        <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-4 shadow-2xl">
            <div className="text-[14px] font-bold text-text mb-3">Add Certification</div>
            <div className="space-y-2">
              <input value={certForm.title} onChange={(e) => setCertForm((p) => ({ ...p, title: e.target.value }))} placeholder="Certification title" className="w-full rounded-lg border border-border px-3 py-2 text-[13px]" />
              <input value={certForm.provider} onChange={(e) => setCertForm((p) => ({ ...p, provider: e.target.value }))} placeholder="Provider (e.g. LinkedIn)" className="w-full rounded-lg border border-border px-3 py-2 text-[13px]" />
              <input type="date" value={certForm.date} onChange={(e) => setCertForm((p) => ({ ...p, date: e.target.value }))} className="w-full rounded-lg border border-border px-3 py-2 text-[13px]" />
              <textarea value={certForm.details} onChange={(e) => setCertForm((p) => ({ ...p, details: e.target.value }))} rows={3} placeholder="Details" className="w-full rounded-lg border border-border px-3 py-2 text-[13px]" />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#0B4B5A] px-3 py-2 text-[12.5px] font-semibold text-white">
                Upload certificate
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleCertFile(e.target.files?.[0])} />
              </label>
              {certForm.fileName ? <div className="text-[12px] text-text2">{certForm.fileName}</div> : null}
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setCertModalOpen(false)} className="rounded-lg border border-border px-3 py-2 text-[12.5px] font-semibold">Cancel</button>
              <button type="button" onClick={addCertification} className="rounded-lg bg-[#0B4B5A] px-3 py-2 text-[12.5px] font-semibold text-white">Save</button>
            </div>
          </div>
        </div>
      ) : null}

      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onCreate={(task) => {
          onUpdateStudent?.((prev) => ({ ...prev, tasks: [...(prev.tasks ?? []), task] }));
        }}
      />
    </div>
  );
}

