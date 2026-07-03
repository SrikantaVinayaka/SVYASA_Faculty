import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  MCA_TIMETABLE_BY_SECTION,
  MCA_SUBJECTS,
  DEPARTMENTS,
  MCA_SECTIONS,
  DAY_ORDER,
  FILTER_TAG_OPTIONS,
  getFullSectionBTimetable,
  CURRENT_FACULTY_NAME,
  FACULTY_REGISTRY,
} from "./timetableData.js";

const BRAND = "#7B1D2E";
const BRAND_SOFT = "rgba(123,29,46,0.08)";

const DAY_INDEX = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
};

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ─── Storage keys ─────────────────────────────────────────────────────────
function saturdayStorageKey(department, section) {
  return `saturday-extras:${department}:${section}`;
}

// ─── Helper: get Mon–Sat dates for the current week ──────────────────────────
function getWeekDates(base) {
  const now = base || new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return Object.fromEntries(
    DAYS.map((d, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return [d, date];
    })
  );
}

function currentWeekKey(now) {
  const dates = getWeekDates(now);
  return format(dates.Monday, "yyyy-MM-dd");
}

// ─── Dummy data per filter tag ────────────────────────────────────────────────
const FILTER_DUMMY_DATA = {
  Holiday: [
    { day: "Monday", date: "26 Jan 2026", description: "Republic Day — National Holiday. All classes suspended." },
    { day: "Friday", date: "14 Mar 2026", description: "Holi — Festival Holiday. Campus closed." },
    { day: "Wednesday", date: "02 Apr 2026", description: "Ugadi — Regional Holiday. No academic activities." },
  ],
  Event: [
    { eventName: "Innovate 2026 — Annual Tech Fest", date: "15 Feb 2026", time: "09:00 AM – 05:00 PM", venue: "Main Auditorium" },
    { eventName: "Smart India Hackathon — Internal Round", date: "22 Feb 2026", time: "10:00 AM – 10:00 PM", venue: "Lab Block C" },
    { eventName: "Alumni Meet 2026", date: "08 Mar 2026", time: "11:00 AM – 04:00 PM", venue: "Convention Hall" },
  ],
  "Repeat Timetable": [
    { subject: "MCAP234 — Data Structures & Algorithms", originalDate: "10 Jan 2026", repeatDate: "18 Jan 2026", room: "22" },
    { subject: "MCAP235 — Operating Systems", originalDate: "12 Jan 2026", repeatDate: "20 Jan 2026", room: "19" },
    { subject: "MCAP231 — Advanced Web Technologies", originalDate: "15 Jan 2026", repeatDate: "25 Jan 2026", room: "15" },
  ],
  "Extra Curricular Course": [
    { course: "Yoga & Wellness", instructor: "Dr. Meena Sharma", time: "07:00 AM – 08:00 AM", venue: "Open Ground" },
    { course: "Music Club — Carnatic Vocals", instructor: "Prof. Ramesh Iyer", time: "04:00 PM – 05:00 PM", venue: "Music Room" },
    { course: "Photography Workshop", instructor: "Mr. Arvind Nair", time: "03:00 PM – 04:30 PM", venue: "Media Lab" },
  ],
  "Co Curricular Course": [
    { course: "Communication Skills", credits: "2", time: "12:00 PM – 01:00 PM", room: "Seminar Hall" },
    { course: "Entrepreneurship Development", credits: "2", time: "01:00 PM – 02:00 PM", room: "Conf. Room A" },
    { course: "Environmental Science", credits: "1", time: "02:00 PM – 03:00 PM", room: "Room 11" },
  ],
};

const ALL_FILTER_OPTIONS = [
  "Timetable",
  ...(FILTER_TAG_OPTIONS || ["Holiday", "Event", "Repeat Timetable", "Extra Curricular Course", "Co Curricular Course"]),
];

const SATURDAY_ACTIONS = [
  { label: "Add Extra Class", kind: "extraClass" },
  { label: "Co-Curricular Course", kind: "coCurricular" },
  { label: "Extra-Curricular Course", kind: "extraCurricular" },
  { label: "Add Event", kind: "event" },
];

function parseMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function formatDisplayTime(t) {
  const [h, m] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return format(d, "hh:mm a");
}

// ─── FIXED: status now uses "ongoing" (was "live"), checks exact minute boundaries ──
function getSlotStatus(selectedDay, startTime, endTime, now) {
  const todayName = format(now, "EEEE", { locale: enUS });
  const todayIdx = DAY_INDEX[todayName] ?? 0;
  const selIdx = DAY_INDEX[selectedDay] ?? 0;

  let dayKind = "today";
  if (selIdx < todayIdx) dayKind = "past";
  else if (selIdx > todayIdx) dayKind = "future";

  if (dayKind === "past") return "completed";
  if (dayKind === "future") return "upcoming";

  const nowM = now.getHours() * 60 + now.getMinutes();
  const startM = parseMinutes(startTime);
  const endM = parseMinutes(endTime);

  // At exactly endTime (e.g. 9:50 when class was 9:00–9:50) → completed
  if (nowM >= endM) return "completed";
  // Between startTime and endTime → ongoing
  if (nowM >= startM) return "ongoing";
  // Before startTime → upcoming
  return "upcoming";
}

function statusBadge(status) {
  if (status === "ongoing")
    return (
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
        style={{ background: "rgba(22,163,74,0.15)", color: "#15803d" }}
      >
        ● Ongoing
      </span>
    );
  if (status === "upcoming")
    return (
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
        style={{ background: "rgba(234,179,8,0.18)", color: "#a16207" }}
      >
        ⏳ Upcoming
      </span>
    );
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap bg-slate-100 text-slate-600">
      ✓ Completed
    </span>
  );
}

// ─── Custom tables for each filter ───────────────────────────────────────────
function FilterTable({ activeFilter }) {
  const data = FILTER_DUMMY_DATA[activeFilter];
  if (!data) return null;

  const headerClass = "text-left px-4 py-3 font-semibold text-slate-700";
  const cellClass = "px-4 py-3 text-slate-700";
  const rowClass = "border-t border-slate-100 hover:bg-slate-50/80 transition-colors";

  if (activeFilter === "Holiday") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr style={{ background: "rgba(123,29,46,0.06)" }}>
            <th className={headerClass}>Day</th>
            <th className={headerClass}>Date</th>
            <th className={headerClass}>Description</th>
          </tr></thead>
          <tbody>{data.map((row, i) => (
            <tr key={i} className={rowClass}>
              <td className={`${cellClass} font-medium text-slate-800`}>{row.day}</td>
              <td className={cellClass}>{row.date}</td>
              <td className={cellClass}>{row.description}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    );
  }
  if (activeFilter === "Event") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr style={{ background: "rgba(123,29,46,0.06)" }}>
            <th className={headerClass}>Event Name</th>
            <th className={headerClass}>Date</th>
            <th className={headerClass}>Time</th>
            <th className={headerClass}>Venue</th>
          </tr></thead>
          <tbody>{data.map((row, i) => (
            <tr key={i} className={rowClass}>
              <td className={`${cellClass} font-medium text-slate-800`}>{row.eventName}</td>
              <td className={cellClass}>{row.date}</td>
              <td className={`${cellClass} whitespace-nowrap`}>{row.time}</td>
              <td className={cellClass}>{row.venue}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    );
  }
  if (activeFilter === "Repeat Timetable") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr style={{ background: "rgba(123,29,46,0.06)" }}>
            <th className={headerClass}>Subject</th>
            <th className={headerClass}>Original Date</th>
            <th className={headerClass}>Repeat Date</th>
            <th className={headerClass}>Room</th>
          </tr></thead>
          <tbody>{data.map((row, i) => (
            <tr key={i} className={rowClass}>
              <td className={`${cellClass} font-medium text-slate-800`}>{row.subject}</td>
              <td className={cellClass}>{row.originalDate}</td>
              <td className={cellClass}>{row.repeatDate}</td>
              <td className={`${cellClass} font-medium text-slate-800`}>{row.room}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    );
  }
  if (activeFilter === "Extra Curricular Course") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr style={{ background: "rgba(123,29,46,0.06)" }}>
            <th className={headerClass}>Course</th>
            <th className={headerClass}>Instructor</th>
            <th className={headerClass}>Time</th>
            <th className={headerClass}>Venue</th>
          </tr></thead>
          <tbody>{data.map((row, i) => (
            <tr key={i} className={rowClass}>
              <td className={`${cellClass} font-medium text-slate-800`}>{row.course}</td>
              <td className={cellClass}>{row.instructor}</td>
              <td className={`${cellClass} whitespace-nowrap`}>{row.time}</td>
              <td className={cellClass}>{row.venue}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    );
  }
  if (activeFilter === "Co Curricular Course") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr style={{ background: "rgba(123,29,46,0.06)" }}>
            <th className={headerClass}>Course</th>
            <th className={headerClass}>Credits</th>
            <th className={headerClass}>Time</th>
            <th className={headerClass}>Room</th>
          </tr></thead>
          <tbody>{data.map((row, i) => (
            <tr key={i} className={rowClass}>
              <td className={`${cellClass} font-medium text-slate-800`}>{row.course}</td>
              <td className={`${cellClass} text-center`}>{row.credits}</td>
              <td className={`${cellClass} whitespace-nowrap`}>{row.time}</td>
              <td className={cellClass}>{row.room}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    );
  }
  return null;
}

// ─── Modal shell ──────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.45)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="font-semibold text-slate-800">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Shared form bits ─────────────────────────────────────────────────────
const fieldLabelClass = "block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5";
const fieldInputClass = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-[rgba(123,29,46,0.25)] focus:border-transparent outline-none transition-shadow bg-white";

function FormActions({ onCancel, submitLabel }) {
  return (
    <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
      <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
      <button type="submit" className="px-4 py-2.5 rounded-xl text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90" style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #a53050 100%)` }}>{submitLabel}</button>
    </div>
  );
}

function ExtraClassForm({ section, onSubmit, onCancel }) {
  const [subjectCode, setSubjectCode] = useState(MCA_SUBJECTS[0]?.subjectCode || "");
  const [classSection, setClassSection] = useState(section);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [room, setRoom] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subjectCode) return setError("Choose a class/subject.");
    if (!room.trim()) return setError("Room is required.");
    if (parseMinutes(endTime) <= parseMinutes(startTime)) return setError("End time must be after start time.");
    const subject = MCA_SUBJECTS.find((s) => s.subjectCode === subjectCode);
    onSubmit({ kind: "extraClass", subjectCode: subject.subjectCode, subjectName: subject.subjectName, section: classSection, startTime, endTime, room: room.trim() });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className={fieldLabelClass}>Class / Subject</label>
          <select value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)} className={fieldInputClass}>
            {MCA_SUBJECTS.map((s) => <option key={s.subjectCode} value={s.subjectCode}>{s.subjectCode} — {s.subjectName}</option>)}
          </select>
        </div>
        <div>
          <label className={fieldLabelClass}>Section</label>
          <select value={classSection} onChange={(e) => setClassSection(e.target.value)} className={fieldInputClass}>
            {MCA_SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={fieldLabelClass}>Start time</label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={fieldInputClass} /></div>
          <div><label className={fieldLabelClass}>End time</label><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={fieldInputClass} /></div>
        </div>
        <div>
          <label className={fieldLabelClass}>Room</label>
          <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. 15 or Lab-3" className={fieldInputClass} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <FormActions onCancel={onCancel} submitLabel="Add class" />
    </form>
  );
}

function CoCurricularForm({ onSubmit, onCancel }) {
  const [course, setCourse] = useState("");
  const [credits, setCredits] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("13:00");
  const [room, setRoom] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!course.trim()) return setError("Course name is required.");
    if (!credits.trim()) return setError("Credits is required.");
    if (!room.trim()) return setError("Room is required.");
    if (parseMinutes(endTime) <= parseMinutes(startTime)) return setError("End time must be after start time.");
    onSubmit({ kind: "coCurricular", course: course.trim(), credits: credits.trim(), startTime, endTime, room: room.trim() });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div><label className={fieldLabelClass}>Course</label><input type="text" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. Communication Skills" className={fieldInputClass} /></div>
        <div><label className={fieldLabelClass}>Credits</label><input type="text" value={credits} onChange={(e) => setCredits(e.target.value)} placeholder="e.g. 2" className={fieldInputClass} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={fieldLabelClass}>Start time</label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={fieldInputClass} /></div>
          <div><label className={fieldLabelClass}>End time</label><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={fieldInputClass} /></div>
        </div>
        <div><label className={fieldLabelClass}>Room</label><input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. Seminar Hall" className={fieldInputClass} /></div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <FormActions onCancel={onCancel} submitLabel="Add course" />
    </form>
  );
}

function ExtraCurricularForm({ onSubmit, onCancel }) {
  const [course, setCourse] = useState("");
  const [instructor, setInstructor] = useState("");
  const [startTime, setStartTime] = useState("16:00");
  const [endTime, setEndTime] = useState("17:00");
  const [venue, setVenue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!course.trim()) return setError("Course name is required.");
    if (!instructor.trim()) return setError("Instructor is required.");
    if (!venue.trim()) return setError("Venue is required.");
    if (parseMinutes(endTime) <= parseMinutes(startTime)) return setError("End time must be after start time.");
    onSubmit({ kind: "extraCurricular", course: course.trim(), instructor: instructor.trim(), startTime, endTime, venue: venue.trim() });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div><label className={fieldLabelClass}>Course</label><input type="text" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. Photography Workshop" className={fieldInputClass} /></div>
        <div><label className={fieldLabelClass}>Instructor</label><input type="text" value={instructor} onChange={(e) => setInstructor(e.target.value)} placeholder="e.g. Mr. Arvind Nair" className={fieldInputClass} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={fieldLabelClass}>Start time</label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={fieldInputClass} /></div>
          <div><label className={fieldLabelClass}>End time</label><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={fieldInputClass} /></div>
        </div>
        <div><label className={fieldLabelClass}>Venue</label><input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Media Lab" className={fieldInputClass} /></div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <FormActions onCancel={onCancel} submitLabel="Add course" />
    </form>
  );
}

function EventForm({ weekDates, onSubmit, onCancel }) {
  const defaultDate = weekDates?.Saturday ? format(weekDates.Saturday, "yyyy-MM-dd") : "";
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("11:00");
  const [endTime, setEndTime] = useState("13:00");
  const [venue, setVenue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!eventName.trim()) return setError("Event name is required.");
    if (!date) return setError("Date is required.");
    if (!venue.trim()) return setError("Venue is required.");
    if (parseMinutes(endTime) <= parseMinutes(startTime)) return setError("End time must be after start time.");
    onSubmit({ kind: "event", eventName: eventName.trim(), date, startTime, endTime, venue: venue.trim() });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div><label className={fieldLabelClass}>Event Name</label><input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g. Alumni Meet 2026" className={fieldInputClass} /></div>
        <div><label className={fieldLabelClass}>Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldInputClass} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={fieldLabelClass}>Start time</label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={fieldInputClass} /></div>
          <div><label className={fieldLabelClass}>End time</label><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={fieldInputClass} /></div>
        </div>
        <div><label className={fieldLabelClass}>Venue</label><input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Convention Hall" className={fieldInputClass} /></div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <FormActions onCancel={onCancel} submitLabel="Add event" />
    </form>
  );
}

const SATURDAY_MODAL_CONFIG = {
  extraClass: { title: "Add Extra Class" },
  coCurricular: { title: "Co-Curricular Course" },
  extraCurricular: { title: "Extra-Curricular Course" },
  event: { title: "Add Event" },
};

function SaturdayPanel({ onAction }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center mb-4">
      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: BRAND_SOFT }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" /><line x1="10" y1="14" x2="14" y2="14" />
        </svg>
      </div>
      <p className="font-semibold text-slate-800 mb-1">Saturday</p>
      <p className="text-sm text-slate-500 mb-6">Add optional activities for this day</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
        {SATURDAY_ACTIONS.map(({ label, kind }) => (
          <button key={label} type="button" onClick={() => onAction(kind)} className="flex items-center gap-2 px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 text-sm text-slate-700 font-medium transition-all">
            <span className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(123,29,46,0.10)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function extraSortKey(item) {
  return parseMinutes(item.startTime);
}

function extraKindLabel(kind) {
  if (kind === "extraClass") return "Extra Class";
  if (kind === "coCurricular") return "Co-Curricular";
  if (kind === "extraCurricular") return "Extra-Curricular";
  if (kind === "event") return "Event";
  return kind;
}

function SaturdayExtrasTable({ items, onDelete }) {
  if (items.length === 0) return null;
  const sorted = [...items].sort((a, b) => extraSortKey(a) - extraSortKey(b));

  const renderTitle = (item) => {
    if (item.kind === "extraClass") return `${item.subjectCode} — ${item.subjectName}`;
    if (item.kind === "event") return item.eventName;
    return item.course;
  };
  const renderDetail = (item) => {
    if (item.kind === "extraClass") return `Section ${item.section} · Room ${item.room}`;
    if (item.kind === "coCurricular") return `Credits ${item.credits} · Room ${item.room}`;
    if (item.kind === "extraCurricular") return `${item.instructor} · ${item.venue}`;
    if (item.kind === "event") return item.venue;
    return "";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto mb-4">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "rgba(123,29,46,0.06)" }}>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Type</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Details</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Time</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Info</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((item) => (
            <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: BRAND_SOFT, color: BRAND }}>{extraKindLabel(item.kind)}</span>
              </td>
              <td className="px-4 py-3 font-medium text-slate-800">{renderTitle(item)}</td>
              <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{formatDisplayTime(item.startTime)} – {formatDisplayTime(item.endTime)}</td>
              <td className="px-4 py-3 text-slate-600">{renderDetail(item)}</td>
              <td className="px-4 py-3 text-right">
                <button type="button" onClick={() => onDelete(item.id)} aria-label={`Remove ${renderTitle(item)}`} className="text-xs font-medium text-slate-400 hover:text-red-600 transition-colors">Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Faculty lookup: subjectCode → instructor name ────────────────────────────
function facultyForSubject(subjectCode) {
  for (const [name, info] of Object.entries(FACULTY_REGISTRY)) {
    if (info.subjects.includes(subjectCode)) return name;
  }
  return null;
}

// ─── Week Grid Table ──────────────────────────────────────────────────────────
// Layout: rows = days (Mon–Sat), columns = deduplicated time slots across all days.
// Each cell shows subject code + room on line 1, instructor on line 2.
// Below the grid: a legend table of Course Code → Course Name → Faculty.
function WeekGridTable({ weekData, weekDates, saturdayExtras, facultyOwnSubjects, now, onAddSaturday, onCellClick }) {
  // 1. Collect all unique time slots across all days, sorted by start time
  const slotSet = new Map(); // key = "HH:MM–HH:MM" → { startTime, endTime }
  weekData.forEach(({ classes }) => {
    classes.forEach((c) => {
      const key = `${c.startTime}–${c.endTime}`;
      if (!slotSet.has(key)) slotSet.set(key, { startTime: c.startTime, endTime: c.endTime });
    });
  });
  const timeSlots = Array.from(slotSet.values()).sort(
    (a, b) => parseMinutes(a.startTime) - parseMinutes(b.startTime)
  );

  // 2. Build a lookup: day → Map<slotKey, class[]>
  const daySlotMap = {};
  weekData.forEach(({ day, classes }) => {
    const m = new Map();
    classes.forEach((c) => {
      const key = `${c.startTime}–${c.endTime}`;
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(c);
    });
    daySlotMap[day] = m;
  });

  // 3. Collect all unique subjects for the legend table
  const legendMap = new Map(); // subjectCode → { subjectCode, subjectName, faculty }
  weekData.forEach(({ classes }) => {
    classes.forEach((c) => {
      if (!legendMap.has(c.subjectCode)) {
        legendMap.set(c.subjectCode, {
          subjectCode: c.subjectCode,
          subjectName: c.subjectName,
          faculty: facultyForSubject(c.subjectCode) || "—",
        });
      }
    });
  });
  const legendRows = Array.from(legendMap.values()).sort((a, b) =>
    a.subjectCode.localeCompare(b.subjectCode)
  );

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <>
      {/* ── Grid Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto mb-6">
        <table className="w-full text-xs border-collapse" style={{ minWidth: `${220 + timeSlots.length * 110}px` }}>
          <thead>
            <tr style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #a53050 100%)` }}>
              {/* DAYS column header */}
              <th className="text-left px-3 py-3 font-semibold text-white whitespace-nowrap" style={{ minWidth: 110 }}>
                DAYS
              </th>
              {timeSlots.map((slot) => (
                <th
                  key={`${slot.startTime}–${slot.endTime}`}
                  className="text-center px-2 py-3 font-semibold text-white whitespace-nowrap"
                  style={{ minWidth: 100, borderLeft: "1px solid rgba(255,255,255,0.15)" }}
                >
                  <div>{formatDisplayTime(slot.startTime)}</div>
                  <div className="font-normal opacity-80 text-[10px]">{formatDisplayTime(slot.endTime)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, dayIdx) => {
              const slotMap = daySlotMap[day] || new Map();
              const isSat = day === "Saturday";
              const isEven = dayIdx % 2 === 0;
              const rowBg = isEven ? "#ffffff" : "rgba(123,29,46,0.03)";

              return (
                <tr key={day} style={{ background: rowBg }}>
                  {/* Day label cell */}
                  <td
                    className="px-3 py-3 font-bold whitespace-nowrap align-top"
                    style={{ color: BRAND, borderBottom: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9" }}
                  >
                    <div>{day.slice(0, 3).toUpperCase()}</div>
                    {weekDates[day] && (
                      <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                        {format(weekDates[day], "d MMM")}
                      </div>
                    )}
                  </td>

                  {/* Time slot cells */}
                  {timeSlots.map((slot) => {
                    const key = `${slot.startTime}–${slot.endTime}`;
                    const entries = slotMap.get(key) || [];

                    return (
                      <td
                        key={key}
                        className="px-2 py-2 align-top"
                        style={{ borderLeft: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9", minWidth: 100, verticalAlign: "top" }}
                      >
                        {entries.length === 0 ? (
                          isSat ? (
                            <button
                              type="button"
                              onClick={onAddSaturday}
                              className="text-[10px] text-slate-300 hover:text-slate-500 transition-colors w-full text-center py-1"
                            >
                              + Add
                            </button>
                          ) : (
                            <span className="text-slate-200 text-[10px]">—</span>
                          )
                        ) : (
                          entries.map((c, i) => {
                            const isOwn = facultyOwnSubjects.has(c.subjectCode);
                            const st = isOwn ? getSlotStatus(day, c.startTime, c.endTime, now) : null;
                            const instructor = facultyForSubject(c.subjectCode);
                            return (
                              <div
                                key={i}
                                role={isOwn ? "button" : undefined}
                                tabIndex={isOwn ? 0 : undefined}
                                onClick={isOwn ? () => onCellClick(day, c) : undefined}
                                onKeyDown={
                                  isOwn
                                    ? (e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                          onCellClick(day, c);
                                        }
                                      }
                                    : undefined
                                }
                                aria-label={isOwn ? `Open ${c.subjectCode} in day view for ${day}` : undefined}
                                className={`rounded-lg px-2 py-1.5 mb-1 last:mb-0 ${isOwn ? "cursor-pointer hover:shadow-sm hover:brightness-95 active:scale-[0.97] transition-all" : ""}`}
                                style={{
                                  background: isOwn ? `rgba(123,29,46,0.09)` : "rgba(241,245,249,0.8)",
                                  border: isOwn ? `1px solid rgba(123,29,46,0.18)` : "1px solid #e2e8f0",
                                }}
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <span
                                    className="font-bold leading-tight"
                                    style={{ color: isOwn ? BRAND : "#334155", fontSize: 11 }}
                                  >
                                    {c.subjectCode}
                                  </span>
                                  {st && (
                                    <span
                                      className="rounded-full px-1 py-0 text-[9px] font-semibold whitespace-nowrap"
                                      style={
                                        st === "ongoing"
                                          ? { background: "rgba(22,163,74,0.15)", color: "#15803d" }
                                          : st === "upcoming"
                                          ? { background: "rgba(234,179,8,0.18)", color: "#a16207" }
                                          : { background: "#f1f5f9", color: "#64748b" }
                                      }
                                    >
                                      {st === "ongoing" ? "●" : st === "upcoming" ? "⏳" : "✓"}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                                  Rm {c.room}
                                </div>
                                {instructor && (
                                  <div
                                    className="text-[10px] mt-0.5 leading-tight font-medium"
                                    style={{ color: isOwn ? "#9b2335" : "#64748b" }}
                                  >
                                    {instructor}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Instructor Legend Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        <div
          className="px-4 py-3 text-sm font-semibold text-white"
          style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #a53050 100%)` }}
        >
          Course — Faculty Reference
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "rgba(123,29,46,0.06)" }}>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Course Code</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Course Name</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Handling Faculty</th>
            </tr>
          </thead>
          <tbody>
            {legendRows.map((row) => {
              const isOwn = facultyOwnSubjects.has(row.subjectCode);
              return (
                <tr key={row.subjectCode} className="border-t border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold" style={{ color: isOwn ? BRAND : "#334155" }}>
                    {row.subjectCode}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{row.subjectName}</td>
                  <td className="px-4 py-3">
                    {row.faculty === "—" ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <span
                        className="font-medium"
                        style={{ color: isOwn ? BRAND : "#334155" }}
                      >
                        {row.faculty}
                        {isOwn && (
                          <span
                            className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ background: "rgba(123,29,46,0.1)", color: BRAND }}
                          >
                            You
                          </span>
                        )}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function ClassTimetable() {
  const [view, setView] = useState("day");
  const [department, setDepartment] = useState("MCA");
  const [section, setSection] = useState("A");
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = format(new Date(), "EEEE", { locale: enUS });
    return today === "Sunday" ? "Monday" : today;
  });
  const [activeFilter, setActiveFilter] = useState(null);
  const [now, setNow] = useState(() => new Date());
  const [weekKey, setWeekKey] = useState(() => currentWeekKey(new Date()));
  const [activeModal, setActiveModal] = useState(null);
  const [saturdayExtras, setSaturdayExtras] = useState([]);
  const [extrasError, setExtrasError] = useState("");

  // ── Highlight target set when a Week View cell is clicked ──────────────────
  // Identifies a specific row in Day View so it can be flashed/highlighted.
  const [highlightTarget, setHighlightTarget] = useState(null); // { subjectCode, startTime } | null
  const highlightTimeoutRef = useRef(null);

  // ── Resolve logged-in faculty's own subject codes ──────────────────────────
  const facultyOwnSubjects = useMemo(() => {
    const faculty = FACULTY_REGISTRY[CURRENT_FACULTY_NAME];
    return faculty ? new Set(faculty.subjects) : new Set();
  }, []);

  const weekDates = useMemo(() => getWeekDates(now), [weekKey]);

  useEffect(() => {
    const id = setInterval(() => {
      const fresh = new Date();
      setNow(fresh);
      const freshKey = currentWeekKey(fresh);
      setWeekKey((prev) => (prev === freshKey ? prev : freshKey));
    }, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const key = saturdayStorageKey(department, section);
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      setSaturdayExtras(Array.isArray(parsed) ? parsed : []);
      setExtrasError("");
    } catch {
      setSaturdayExtras([]);
    }
  }, [department, section]);

  // ── Clear any pending highlight timeout on unmount ──────────────────────────
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    };
  }, []);

  const persistExtras = useCallback(
    (next) => {
      const key = saturdayStorageKey(department, section);
      try {
        localStorage.setItem(key, JSON.stringify(next));
        setExtrasError("");
      } catch {
        setExtrasError("Couldn't save to this browser — your change is shown but may not persist on reload.");
      }
    },
    [department, section]
  );

  const addSaturdayExtra = useCallback(
    (item) => {
      const withId = { ...item, id: `${item.kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
      setSaturdayExtras((prev) => {
        const next = [...prev, withId];
        persistExtras(next);
        return next;
      });
      setActiveModal(null);
    },
    [persistExtras]
  );

  const removeSaturdayExtra = useCallback(
    (id) => {
      setSaturdayExtras((prev) => {
        const next = prev.filter((item) => item.id !== id);
        persistExtras(next);
        return next;
      });
    },
    [persistExtras]
  );

  const toggleFilter = useCallback((tag) => {
    setActiveFilter((prev) => (prev === tag ? null : tag));
  }, []);

  // ── Full week data (all classes for the selected section) ─────────────────
  const weekData = useMemo(() => {
    if (department !== "MCA") return null;
    const byDay =
      section === "B"
        ? getFullSectionBTimetable(CURRENT_FACULTY_NAME)
        : MCA_TIMETABLE_BY_SECTION[section] || {};
    return WEEKDAYS.map((day) => ({
      day,
      classes: [...(byDay[day] || [])].sort(
        (a, b) => parseMinutes(a.startTime) - parseMinutes(b.startTime)
      ),
    }));
  }, [department, section]);

  // ── CHANGE 1: Day view shows ONLY the logged-in faculty's own classes ──────
  // We take the full day's classes and filter to those matching the faculty's
  // subject list. Non-matching periods (other faculty's classes) are hidden.
  const dayClassesRaw = useMemo(() => {
    if (!weekData) return [];
    const row = weekData.find((d) => d.day === selectedDay);
    const all = row?.classes || [];
    // Filter: keep only classes whose subjectCode is in this faculty's list
    return all.filter((c) => facultyOwnSubjects.has(c.subjectCode));
  }, [weekData, selectedDay, facultyOwnSubjects]);

  const courseLabel = (c) => {
    const batch = c.batch || `2025-26 · Sem 2 · ${section}`;
    return `${c.subjectCode} — ${c.subjectName} · MCA-DET · MCA · ${batch}`;
  };

  const emptyDepartment = department === "B.Tech";
  const showCustomFilter = activeFilter !== null && activeFilter !== "Timetable";

  const isSaturday =
    !emptyDepartment &&
    department === "MCA" &&
    selectedDay === "Saturday" &&
    view === "day" &&
    !showCustomFilter;

  const noClassesOnDay =
    !emptyDepartment &&
    department === "MCA" &&
    dayClassesRaw.length === 0 &&
    view === "day" &&
    !showCustomFilter &&
    selectedDay !== "Saturday";

  const handleModalSubmit = (item) => { addSaturdayExtra(item); };

  // ── Week-grid cell click → jump to Day View on that day, flash-highlight the row ──
  const handleWeekCellClick = useCallback((day, classObj) => {
    // Make sure nothing else hides the day-view table (filters, Saturday panel)
    setActiveFilter(null);
    setView("day");
    setSelectedDay(day);

    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    setHighlightTarget({ subjectCode: classObj.subjectCode, startTime: classObj.startTime });
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightTarget(null);
    }, 2600);
  }, []);

  // Clear an active highlight if the user manually navigates elsewhere
  const clearHighlight = useCallback(() => {
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    setHighlightTarget(null);
  }, []);

  return (
    <div className="fade-in max-w-6xl mx-auto">
      <style>{`
        @keyframes rowHighlightFlash {
          0% { background-color: rgba(123,29,46,0.22); }
          70% { background-color: rgba(123,29,46,0.22); }
          100% { background-color: transparent; }
        }
        .row-highlight-flash {
          animation: rowHighlightFlash 2.5s ease-out forwards;
        }
      `}</style>

      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
        <span>Timetable</span>
        <span className="text-slate-300">/</span>
        <span>Class Timetable</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">TimeTable</h1>
          <p className="text-slate-500 text-sm mt-1">Class Timetable</p>
        </div>
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm w-fit">
          {[{ id: "day", label: "Day View" }, { id: "week", label: "Week View" }].map((v) => (
            <button key={v.id} type="button" onClick={() => { clearHighlight(); setView(v.id); }} aria-pressed={view === v.id}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === v.id ? "text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
              style={view === v.id ? { background: `linear-gradient(135deg, ${BRAND} 0%, #a53050 100%)` } : undefined}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 mb-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Filters</p>
        <div className="flex flex-wrap gap-2">
          {ALL_FILTER_OPTIONS.map((tag) => {
            const on = activeFilter === tag;
            return (
              <button key={tag} type="button" onClick={() => { clearHighlight(); toggleFilter(tag); }} aria-pressed={on}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${on ? "text-white border-transparent shadow-sm" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"}`}
                style={on ? { background: `linear-gradient(90deg, ${BRAND}, #a53050)` } : undefined}>
                {tag}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Department</label>
            <select value={department} onChange={(e) => { clearHighlight(); setDepartment(e.target.value); }} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 text-sm focus:ring-2 focus:ring-[rgba(123,29,46,0.25)] focus:border-transparent outline-none transition-shadow bg-white">
              {DEPARTMENTS.map((d) => <option key={d.value} value={d.value}>{d.label.replace(/\s*\(placeholder[^)]*\)/i, "")}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Section</label>
            <select value={section} onChange={(e) => { clearHighlight(); setSection(e.target.value); }} disabled={department !== "MCA"} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 text-sm focus:ring-2 focus:ring-[rgba(123,29,46,0.25)] focus:border-transparent outline-none transition-shadow bg-white disabled:opacity-50 disabled:cursor-not-allowed">
              {MCA_SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Day Tabs ── */}
      {view === "day" && (
        <div className="mb-4 overflow-x-auto pb-1" style={showCustomFilter ? { visibility: "hidden", pointerEvents: "none" } : undefined}>
          <div className="flex gap-1 min-w-max border-b border-slate-200" role="tablist">
            {WEEKDAYS.map((d) => (
              <button key={d} type="button" role="tab" aria-selected={selectedDay === d} onClick={() => { clearHighlight(); setSelectedDay(d); }}
                className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg ${selectedDay === d ? "text-white" : "text-slate-600 hover:bg-slate-50"}`}
                style={selectedDay === d ? { background: `linear-gradient(135deg, ${BRAND} 0%, #a53050 100%)` } : undefined}>
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}

      {showCustomFilter && <FilterTable activeFilter={activeFilter} />}

      {!showCustomFilter && emptyDepartment && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center text-slate-500">
          No timetable data available for the selected department.
        </div>
      )}

      {extrasError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm px-4 py-2.5 mb-4">{extrasError}</div>
      )}

      {isSaturday && (
        <>
          <SaturdayPanel onAction={setActiveModal} hasItems={saturdayExtras.length > 0} />
          {saturdayExtras.length > 0 && <SaturdayExtrasTable items={saturdayExtras} onDelete={removeSaturdayExtra} />}
          {saturdayExtras.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-12 text-center mt-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(123,29,46,0.07)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Nothing added yet</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">Click any option above to add an extra class, event, or curricular activity for this Saturday.</p>
            </div>
          )}
        </>
      )}

      {noClassesOnDay && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center text-slate-500">
          No classes scheduled for you today
        </div>
      )}

      {/* ── CHANGE 1: Day View — only this faculty's classes, all with status ── */}
      {!showCustomFilter && !emptyDepartment && view === "day" && !noClassesOnDay && !isSaturday && dayClassesRaw.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr style={{ background: "rgba(123,29,46,0.06)" }}>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Period</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Time</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Course-Degree-Department—Section-Batch</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Room</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {dayClassesRaw.map((c, idx) => {
                const status = getSlotStatus(selectedDay, c.startTime, c.endTime, now);
                const isHighlighted =
                  highlightTarget &&
                  highlightTarget.subjectCode === c.subjectCode &&
                  highlightTarget.startTime === c.startTime;
                return (
                  <tr
                    key={`${c.subjectCode}-${c.startTime}-${idx}`}
                    ref={isHighlighted ? (el) => el?.scrollIntoView({ behavior: "smooth", block: "center" }) : undefined}
                    className={`border-t border-slate-100 hover:bg-slate-50/80 transition-colors ${isHighlighted ? "row-highlight-flash" : ""}`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">{idx + 1}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{formatDisplayTime(c.startTime)} – {formatDisplayTime(c.endTime)}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-md">{courseLabel(c)}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{c.room}</td>
                    <td className="px-4 py-3">{statusBadge(status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Week View — grid table: rows=days, columns=time slots ── */}
      {!showCustomFilter && !emptyDepartment && view === "week" && weekData && (
        <WeekGridTable
          weekData={weekData}
          weekDates={weekDates}
          saturdayExtras={saturdayExtras}
          facultyOwnSubjects={facultyOwnSubjects}
          now={now}
          onAddSaturday={() => { clearHighlight(); setView("day"); setSelectedDay("Saturday"); }}
          onCellClick={handleWeekCellClick}
        />
      )}

      {/* ── Saturday action modals ── */}
      {activeModal && (
        <Modal title={SATURDAY_MODAL_CONFIG[activeModal].title} onClose={() => setActiveModal(null)}>
          {activeModal === "extraClass" && <ExtraClassForm section={section} onSubmit={handleModalSubmit} onCancel={() => setActiveModal(null)} />}
          {activeModal === "coCurricular" && <CoCurricularForm onSubmit={handleModalSubmit} onCancel={() => setActiveModal(null)} />}
          {activeModal === "extraCurricular" && <ExtraCurricularForm onSubmit={handleModalSubmit} onCancel={() => setActiveModal(null)} />}
          {activeModal === "event" && <EventForm weekDates={weekDates} onSubmit={handleModalSubmit} onCancel={() => setActiveModal(null)} />}
        </Modal>
      )}
    </div>
  );
}