import { useMemo, useState } from "react";

function ViewSmrButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-semibold text-red-800 hover:text-red-900 underline underline-offset-2"
    >
      View SMR
    </button>
  );
}

export default function MenteeSmrTable({
  students,
  onOpenStudent,
  onOpenMarks,
  onOpenQuickUpdate,
  onUpdateStudent,
  breadcrumbTitle = "View SMR",
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.usn.toLowerCase().includes(q)
    );
  }, [searchQuery, students]);

  const patch = (usn, field, value) => {
    onUpdateStudent?.(usn, { [field]: value });
  };

  return (
    <div>
      <div className="flex items-center gap-1 text-sm my-4">
        <span className="text-red-800 font-medium">{breadcrumbTitle}</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-500">Mentee</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 bg-white w-full lg:max-w-md lg:flex-initial">
          <svg
            className="w-4 h-4 text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by USN or name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm outline-none w-full min-w-0 text-gray-700 placeholder-gray-400"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
          <button
            type="button"
            className="bg-red-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-900 transition-colors"
          >
            Meet Me
          </button>
          <button
            type="button"
            className="flex items-center gap-2 border border-gray-300 bg-white text-gray-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[1100px]">
          <thead>
            <tr className="bg-red-800 text-white">
              <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">Sl</th>
              <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">USN</th>
              <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">
                Mentee name
              </th>
              <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">Degree</th>
              <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">Dept</th>
              <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">Sem</th>
              <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">Sec</th>
              <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">Balance (₹)</th>
              <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">
                Pending approvals
              </th>
              <th className="px-3 py-3 text-left font-semibold whitespace-nowrap min-w-[160px]">
                Meeting time &amp; date
              </th>
              <th className="px-3 py-3 text-left font-semibold whitespace-nowrap min-w-[140px]">
                Remark
              </th>
              <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">
                Admission status
              </th>
              <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">
                Registration date
              </th>
              <th className="px-3 py-3 text-center font-semibold whitespace-nowrap">View SMR</th>
              <th className="px-3 py-3 text-center font-semibold whitespace-nowrap">Meeting Info</th>
              <th className="px-3 py-3 text-center font-semibold whitespace-nowrap">Edit</th>
              <th className="px-3 py-3 text-center font-semibold whitespace-nowrap">Quick Update</th>
              <th className="px-3 py-3 text-center font-semibold whitespace-nowrap">History</th>
              <th className="px-3 py-3 text-center font-semibold whitespace-nowrap">Progress</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, idx) => (
              <tr
                key={s.usn}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                <td className="px-3 py-2 text-gray-700 align-top">{s.id}</td>
                <td className="px-3 py-2 text-red-800 font-medium align-top whitespace-nowrap">
                  <button
                    type="button"
                    className="hover:underline"
                    onClick={() => onOpenMarks?.(s.usn)}
                    title="Open IA and Attendance"
                  >
                    {s.usn}
                  </button>
                </td>
                <td className="px-3 py-2 text-gray-800 align-top">{s.name}</td>
                <td className="px-3 py-2 text-gray-600 align-top whitespace-nowrap">{s.degree}</td>
                <td className="px-3 py-2 text-gray-600 align-top">{s.dept}</td>
                <td className="px-3 py-2 text-gray-600 align-top">{s.semester}</td>
                <td className="px-3 py-2 text-gray-600 align-top">{s.section}</td>
                <td className="px-3 py-2 text-gray-600 align-top">{Number(s.balance).toFixed(1)}</td>
                <td className="px-3 py-2 text-gray-600 align-top">{s.pendingApprovals}</td>
                <td className="px-3 py-2 align-top">
                  <input
                    type="datetime-local"
                    className="w-full min-w-[165px] border border-gray-200 rounded px-1 py-1 text-xs text-gray-800"
                    value={toDatetimeLocal(s.meetingTime)}
                    onChange={(e) => patch(s.usn, "meetingTime", fromDatetimeLocal(e.target.value))}
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <textarea
                    rows={2}
                    className="w-full min-w-[120px] border border-gray-200 rounded px-2 py-1 text-xs text-gray-800 resize-y min-h-[44px]"
                    placeholder="Remark"
                    value={s.remark ?? ""}
                    onChange={(e) => patch(s.usn, "remark", e.target.value)}
                  />
                </td>
                <td className="px-3 py-2 text-gray-600 align-top whitespace-nowrap">
                  {s.admissionStatus ?? "—"}
                </td>
                <td className="px-3 py-2 text-gray-600 align-top whitespace-nowrap">
                  {s.registrationDate ?? "—"}
                </td>
                <td className="px-3 py-2 text-center align-top">
                  <ViewSmrButton onClick={() => onOpenStudent?.(s.usn)} />
                </td>
                <td className="px-3 py-2 text-center align-top whitespace-nowrap">
                  <IconButton
                    label="Meeting Info"
                    onClick={() => onOpenStudent?.(s.usn)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </IconButton>
                </td>
                <td className="px-3 py-2 text-center align-top whitespace-nowrap">
                  <IconButton label="Edit Details" onClick={() => onOpenStudent?.(s.usn)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4h2m-1 0v1m-2 7l8-8m0 0l3 3m-3-3l-8 8m-4 4l1-3 3-1" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </IconButton>
                </td>
                <td className="px-3 py-2 text-center align-top whitespace-nowrap">
                  <IconButton
                    label="Quick Update"
                    onClick={() => onOpenQuickUpdate?.(s.usn)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-3-6.7M21 3v6h-6" />
                    </svg>
                  </IconButton>
                </td>
                <td className="px-3 py-2 text-center align-top whitespace-nowrap">
                  <IconButton label="Meeting History" onClick={() => onOpenStudent?.(s.usn)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" />
                    </svg>
                  </IconButton>
                </td>
                <td className="px-3 py-2 text-center align-top whitespace-nowrap">
                  <IconButton
                    label="Progress"
                    onClick={() => {
                      // Placeholder: hook to download/progress export later.
                      onOpenStudent?.(s.usn);
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                    </svg>
                  </IconButton>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={19} className="px-4 py-10 text-center text-sm text-gray-400">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function toDatetimeLocal(display) {
  if (!display || typeof display !== "string") return "";
  const m = display.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const t = display.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    let h = 10,
      min = 0;
    if (t) {
      h = parseInt(t[1], 10);
      min = parseInt(t[2], 10);
      if (t[3].toUpperCase() === "PM" && h < 12) h += 12;
      if (t[3].toUpperCase() === "AM" && h === 12) h = 0;
    }
    return `${m[1]}-${m[2]}-${m[3]}T${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  }
  return "";
}

function fromDatetimeLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${y}-${mo}-${day} ${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

function IconButton({ label, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-50 border border-gray-200"
    >
      {children}
    </button>
  );
}
