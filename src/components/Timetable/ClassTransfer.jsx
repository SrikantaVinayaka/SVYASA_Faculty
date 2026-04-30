import { useState, useMemo, useCallback } from "react";
import DatePicker from "react-datepicker";
import { format, parseISO } from "date-fns";
import {
  CLASS_TRANSFER_SLOTS_BY_DATE,
  TRANSFER_TO_FACULTY,
  MY_TRANSFER_REQUESTS,
  MY_TRANSFER_REQUEST_FILTER_OPTIONS,
  INCOMING_TRANSFER_REQUESTS,
  INCOMING_TRANSFER_FILTER_OPTIONS,
} from "./timetableData.js";

const BRAND = "#7B1D2E";
const TAB_INACTIVE = "#7B1D2E";
const ACTION_BTN = "#3d5a5c";
const ACCEPT_BTN = "#0f172a";
const TEAL_ACTIVE = "#115e59";

const TABS = [
  { id: "transfer", label: "Class Transfer" },
  { id: "my-requests", label: "My Transfer Requests" },
  { id: "from-others", label: "Transfer Request From Others" },
];

const cellBorder = "border border-slate-400";

function formatTime12(isoHm) {
  const [h, m] = isoHm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return format(d, "h:mm a");
}

function formatDashTimeRange(range) {
  const m = range.match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/);
  if (!m) return range;
  return `${formatTime12(m[1])}-${formatTime12(m[2])}`;
}

function formatClassDate(isoDate) {
  try {
    return format(parseISO(isoDate), "d MMM yyyy");
  } catch {
    return isoDate;
  }
}

function TransferArrowsIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
      />
    </svg>
  );
}

function ThumbsUpIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.66H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"
      />
    </svg>
  );
}

function ThumbsDownIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.66H10zm7-13h3a2 2 0 012 2v7a2 2 0 01-2 2h-3"
      />
    </svg>
  );
}

function formatCourseDetail(row) {
  const core = `${row.courseName}(${row.courseCode}) - ${row.semester} - ${row.section}`;
  if (row.batch) return `${core} - ${row.batch} - ${row.scheme}`;
  return `${core} - ${row.scheme}`;
}

export default function ClassTransfer() {
  const [activeTab, setActiveTab] = useState("transfer");
  const [selectedDate, setSelectedDate] = useState(() => new Date(2026, 3, 6));
  const [transferToBySlot, setTransferToBySlot] = useState({});
  const [myRequestFilter, setMyRequestFilter] = useState("All");
  const [incomingFilter, setIncomingFilter] = useState("Submitted");
  const [cancelledMyIds, setCancelledMyIds] = useState(() => new Set());
  const [incomingResponse, setIncomingResponse] = useState(() => ({}));

  const dateKey = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);
  const slots = CLASS_TRANSFER_SLOTS_BY_DATE[dateKey] ?? [];

  const visibleMyRequests = useMemo(() => {
    return MY_TRANSFER_REQUESTS.filter((r) => !cancelledMyIds.has(r.id)).filter((r) => {
      if (myRequestFilter === "All") return true;
      return r.status === myRequestFilter;
    });
  }, [cancelledMyIds, myRequestFilter]);

  const visibleIncoming = useMemo(() => {
    return INCOMING_TRANSFER_REQUESTS.filter((r) => {
      const resp = incomingResponse[r.id];
      if (incomingFilter === "All") return true;
      if (incomingFilter === "Submitted") return resp == null;
      if (incomingFilter === "Accepted") return resp === "accepted";
      if (incomingFilter === "Rejected") return resp === "rejected";
      return true;
    });
  }, [incomingFilter, incomingResponse]);

  const setTransferTo = useCallback((slotId, value) => {
    setTransferToBySlot((prev) => ({ ...prev, [slotId]: value }));
  }, []);

  const handleTransferClick = useCallback(
    (slotId) => {
      const faculty = transferToBySlot[slotId];
      if (!faculty) return;
      console.info("Class transfer request", { slotId, faculty, date: dateKey });
    },
    [transferToBySlot, dateKey]
  );

  const handleCancelMy = useCallback((id) => {
    setCancelledMyIds((prev) => new Set([...prev, id]));
  }, []);

  const handleIncomingAccept = useCallback((id) => {
    setIncomingResponse((prev) => ({ ...prev, [id]: "accepted" }));
  }, []);

  const handleIncomingReject = useCallback((id) => {
    setIncomingResponse((prev) => ({ ...prev, [id]: "rejected" }));
  }, []);

  const tabActiveTextClass = (tabId, active) => {
    if (!active) return "text-white";
    if (tabId === "my-requests") return "";
    if (tabId === "from-others") return "";
    return "text-slate-800";
  };

  const tabActiveStyle = (tabId, active) => {
    if (!active) return { color: "#fff" };
    if (tabId === "my-requests") return { color: BRAND };
    if (tabId === "from-others") return { color: TEAL_ACTIVE };
    return { color: "#1e293b" };
  };

  const selectClass =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-[rgba(123,29,46,0.2)] focus:border-slate-400 outline-none min-w-[140px]";

  return (
    <div className="fade-in max-w-6xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
        <span>Timetable</span>
        <span className="text-slate-300">/</span>
        <span>Class Transfer</span>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <span className="text-slate-600" aria-hidden>
          <TransferArrowsIcon className="w-6 h-6" />
        </span>
        <h1 className="text-2xl font-bold text-slate-800">Class Transfer</h1>
      </div>

      <div
        className="flex flex-wrap gap-1 p-1 rounded-t-xl rounded-b-xl mb-5"
        style={{ background: TAB_INACTIVE }}
        role="tablist"
        aria-label="Class transfer sections"
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-35 px-3 py-2.5 text-sm font-semibold transition-all ${
                active ? "shadow-md rounded-t-lg" : "text-white hover:bg-white/10 rounded-lg"
              } ${tabActiveTextClass(tab.id, active)}`}
              style={active ? { background: "#fff", ...tabActiveStyle(tab.id, active) } : {}}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "transfer" && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Date</label>
          <div className="relative max-w-md">
            <DatePicker
              selected={selectedDate}
              onChange={(d) => d && setSelectedDate(d)}
              dateFormat="d MMM yyyy"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-11 text-slate-800 text-sm focus:ring-2 focus:ring-[rgba(123,29,46,0.25)] focus:border-slate-400 outline-none transition-shadow"
              wrapperClassName="w-full"
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-lg"
              aria-hidden
            >
              📅
            </span>
          </div>
        </div>
      )}

      {activeTab === "my-requests" && (
        <div className="mb-5">
          <select
            value={myRequestFilter}
            onChange={(e) => setMyRequestFilter(e.target.value)}
            className={selectClass}
            aria-label="Filter transfer requests"
          >
            {MY_TRANSFER_REQUEST_FILTER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      {activeTab === "from-others" && (
        <div className="mb-5">
          <select
            value={incomingFilter}
            onChange={(e) => setIncomingFilter(e.target.value)}
            className={selectClass}
            aria-label="Filter incoming requests"
          >
            {INCOMING_TRANSFER_FILTER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      {activeTab === "transfer" && (
        <>
          {slots.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-16 text-center text-slate-500">
              No timetable scheduled for selected date
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full text-sm min-w-180 border-collapse border border-slate-400`}>
                <thead>
                  <tr className="bg-slate-100">
                    <th className={`${cellBorder} px-3 py-2.5 text-left font-bold text-slate-800`}>
                      Day &amp; Time
                    </th>
                    <th className={`${cellBorder} px-3 py-2.5 text-left font-bold text-slate-800`}>
                      Course - Semester - Section - Scheme
                    </th>
                    <th className={`${cellBorder} px-3 py-2.5 text-center font-bold text-slate-800 w-52`}>
                      Transfer To
                    </th>
                    <th className={`${cellBorder} px-3 py-2.5 text-center font-bold text-slate-800 w-28`}>
                      Transfer
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((row) => (
                    <tr key={row.id} className="bg-white hover:bg-slate-50/90">
                      <td className={`${cellBorder} px-3 py-3 text-slate-800 align-top`}>
                        <div className="font-medium">{row.day}</div>
                        <div className="text-slate-700">
                          {formatTime12(row.startTime)}-{formatTime12(row.endTime)}
                        </div>
                      </td>
                      <td className={`${cellBorder} px-3 py-3 text-slate-800`}>{formatCourseDetail(row)}</td>
                      <td className={`${cellBorder} px-3 py-3 text-center align-middle`}>
                        <select
                          value={transferToBySlot[row.id] ?? ""}
                          onChange={(e) => setTransferTo(row.id, e.target.value)}
                          className="mx-auto w-full max-w-50 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-[rgba(123,29,46,0.2)] outline-none"
                        >
                          <option value="">Select</option>
                          {TRANSFER_TO_FACULTY.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className={`${cellBorder} px-3 py-3 text-center align-middle`}>
                        <button
                          type="button"
                          onClick={() => handleTransferClick(row.id)}
                          disabled={!transferToBySlot[row.id]}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-md text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed mx-auto"
                          style={{ background: ACTION_BTN }}
                          aria-label="Transfer class"
                        >
                          <TransferArrowsIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === "my-requests" && (
        <div className="space-y-4 pb-8">
          {visibleMyRequests.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-16 text-center text-slate-500">
              No transfer requests match this filter.
            </div>
          ) : (
            visibleMyRequests.map((r) => (
              <table key={r.id} className={`w-full text-sm border-collapse border border-slate-400`}>
                <thead>
                  <tr className="bg-slate-100">
                    {["Date", "Time", "Semester - Section - Scheme", "To", "Status", "Cancel"].map((h) => (
                      <th
                        key={h}
                        className={`${cellBorder} px-3 py-2.5 text-left font-bold text-slate-800 last:text-center`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className={`${cellBorder} px-3 py-3 text-slate-800`}>{formatClassDate(r.classDate)}</td>
                    <td className={`${cellBorder} px-3 py-3 text-slate-800 whitespace-nowrap`}>
                      {formatDashTimeRange(r.timeRange)}
                    </td>
                    <td className={`${cellBorder} px-3 py-3 text-slate-800`}>{r.semesterSectionScheme}</td>
                    <td className={`${cellBorder} px-3 py-3 text-slate-800 font-medium`}>{r.to}</td>
                    <td className={`${cellBorder} px-3 py-3 text-slate-800`}>{r.status}</td>
                    <td className={`${cellBorder} px-3 py-3 text-center`}>
                      {r.status !== "Rejected" && (
                        <button
                          type="button"
                          onClick={() => handleCancelMy(r.id)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                          style={{ background: BRAND }}
                        >
                          <span className="text-sm leading-none" aria-hidden>
                            ✕
                          </span>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            ))
          )}
        </div>
      )}

      {activeTab === "from-others" && (
        <div className="overflow-x-auto pb-8">
          {visibleIncoming.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-16 text-center text-slate-500">
              No incoming requests match this filter.
            </div>
          ) : (
            <table className={`w-full text-sm min-w-200 border-collapse border border-slate-400`}>
              <thead>
                <tr className="bg-slate-100">
                  {["Date", "Time", "Semester - Section - Scheme", "From", "Edit Status"].map((h) => (
                    <th
                      key={h}
                      className={`${cellBorder} px-3 py-2.5 text-left font-bold ${
                        h === "Edit Status" ? "text-center" : ""
                      }`}
                      style={{ color: TEAL_ACTIVE }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleIncoming.map((r) => {
                  const resp = incomingResponse[r.id];
                  return (
                    <tr key={r.id} className="bg-white hover:bg-slate-50/90">
                      <td className={`${cellBorder} px-3 py-3 text-slate-800`}>{formatClassDate(r.classDate)}</td>
                      <td className={`${cellBorder} px-3 py-3 text-slate-800 whitespace-nowrap`}>
                        {formatDashTimeRange(r.timeRange)}
                      </td>
                      <td className={`${cellBorder} px-3 py-3 text-slate-800`}>{r.semesterSectionScheme}</td>
                      <td className={`${cellBorder} px-3 py-3 text-slate-800 font-medium`}>{r.from}</td>
                      <td className={`${cellBorder} px-3 py-3 text-center`}>
                        {resp == null ? (
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleIncomingAccept(r.id)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                              style={{ background: ACCEPT_BTN }}
                            >
                              <ThumbsUpIcon />
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => handleIncomingReject(r.id)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                              style={{ background: BRAND }}
                            >
                              <ThumbsDownIcon />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded-md inline-block"
                            style={{
                              background:
                                resp === "accepted" ? "rgba(15,118,110,0.15)" : "rgba(123,29,46,0.12)",
                              color: resp === "accepted" ? TEAL_ACTIVE : BRAND,
                            }}
                          >
                            {resp === "accepted" ? "Accepted" : "Rejected"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
