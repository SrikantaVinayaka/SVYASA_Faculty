function IconButton({ children, onClick, title, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={[
        "rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-semibold text-text hover:bg-page-bg",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function StudentCard({
  student,
  onViewSmr,
  onAssignTask,
}) {
  const attendanceOk = Number(student.academics?.attendancePct ?? 0) >= 75;
  const feePaid = (student.fees?.status ?? "Pending") === "Paid";
  const iaDone = !!student.academics?.assessmentsCompleted;

  function statusBadge(ok, okText, badText) {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
          ok ? "bg-[#EDF7EE] text-[#2E7D32]" : "bg-[#FFF4F5] text-[#9B2335]"
        }`}
      >
        {ok ? `✓ ${okText}` : `⚠ ${badText}`}
      </span>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[14px] font-bold text-text">{student.name}</div>
          <div className="mt-0.5 text-[12px] text-text2">{student.registerNo}</div>
        </div>
        <div className="rounded-lg bg-page-bg px-2 py-1 text-[11px] font-semibold text-text2">
          {student.degree} · Sec {student.section}
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-border bg-page-bg p-3 space-y-2 text-[12.5px]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-text2 font-semibold">Fees</span>
          {statusBadge(feePaid, "Paid", "Pending")}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-text2 font-semibold">Attendance</span>
          {statusBadge(attendanceOk, "Tick", "Warning")}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-text2 font-semibold">IA</span>
          {statusBadge(iaDone, "Tick", "Pending")}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <IconButton onClick={onViewSmr} title="View student profile (SMR)">
          View Profile
        </IconButton>
        <IconButton onClick={onAssignTask} title="Open profile and assign task">
          Assign Task
        </IconButton>
      </div>
    </div>
  );
}

