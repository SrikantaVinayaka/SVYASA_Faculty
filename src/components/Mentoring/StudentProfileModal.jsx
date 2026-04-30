import { useEffect, useMemo, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import TaskModal from "./TaskModal.jsx";

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
  const [mode, setMode] = useState(readOnly ? "smr" : initialMode); // smr | edit | assignTask
  const [taskModalOpen, setTaskModalOpen] = useState(false);

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
                    <span className="font-semibold">{student.profile?.phone}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-text2">Email</span>
                    <span className="font-semibold">{student.profile?.email}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-text2">DOB</span>
                    <span className="font-semibold">{student.profile?.dob}</span>
                  </div>
                  <div className="pt-2 text-[12px] text-text2">
                    Address: <span className="text-text">{student.profile?.address}</span>
                  </div>
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
        </div>
      </div>

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

