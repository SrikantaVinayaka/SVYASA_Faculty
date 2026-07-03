import { useMemo, useState } from "react";
import { mockInternalMarks, mockStudentsWithDetails } from "../data/mentoringData";
import QuickUpdateModalNew from "../components/QuickUpdateModalNew";
import EditDetailsModal from "../components/EditDetailsModal";
import StudentSmrModal from "../components/StudentSmrModal";
import MeetingModalNew from "../components/MeetingModalNew";
import CertificateUploadModal from "../components/CertificateUploadModal";

const DEPT_OPTIONS = ["All", "BCA", "BCM", "BBA", "BSC", "BTECH", "MCA", "MSC", "MBA"];
const SEM_OPTIONS = ["All", "1", "2", "3", "4", "5", "6", "7", "8"];
const SEC_OPTIONS = ["All", "A", "B", "C", "D"];

const mockStudents = mockStudentsWithDetails;

const CLEARANCE_SECTIONS = [
  { key: "mentor", label: "Mentor" },
  { key: "library", label: "Library" },
  { key: "faculty", label: "Faculty" },
  { key: "accounts", label: "Accounts" },
];

function ClearanceChecklistModal({ student, value, onToggle, onClose }) {
  if (!student) return null;

  const allClear = CLEARANCE_SECTIONS.every((section) => value?.[section.key]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Fees Clearance Checklist</h3>
          <p className="text-xs text-gray-500 mt-1">
            {student.name} ({student.usn})
          </p>
        </div>
        <div className="space-y-2">
          {CLEARANCE_SECTIONS.map((section) => (
            <label
              key={section.key}
              className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2"
            >
              <span className="text-sm text-gray-700">{section.label}</span>
              <input
                type="checkbox"
                checked={Boolean(value?.[section.key])}
                onChange={() => onToggle(section.key)}
                className="h-4 w-4 accent-red-800"
              />
            </label>
          ))}
        </div>
        <div className="mt-4 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
          Status:{" "}
          <span className={allClear ? "font-semibold text-green-700" : "font-semibold text-amber-700"}>
            {allClear ? "Fully Cleared" : "Pending Clearance"}
          </span>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-red-800 px-4 py-2 text-sm font-medium text-white hover:bg-red-900"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function MeetingModal({ onClose, onPush }) {
  const [form, setForm] = useState({ day: "", date: "", time: "", section: "A" });
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Meeting</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-xs text-gray-600">
            Day
            <select
              value={form.day}
              onChange={(e) => update("day", e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select Day</option>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-gray-600">
            Date
            <input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-gray-600">
            Time
            <input
              type="time"
              value={form.time}
              onChange={(e) => update("time", e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-gray-600">
            Section
            <select
              value={form.section}
              onChange={(e) => update("section", e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {["A", "B", "C", "D"].map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onPush(form);
              onClose();
            }}
            className="rounded-md bg-red-800 px-4 py-2 text-sm font-medium text-white hover:bg-red-900"
          >
            Push Notification
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatModal({ student, onClose }) {
  const [messages, setMessages] = useState([
    { id: 1, from: "student", text: "Sir, I need help in DBMS unit test." },
    { id: 2, from: "mentor", text: "Sure, we will review it in today's meeting." },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), from: "mentor", text: input.trim() }]);
    setInput("");
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md h-[70vh] rounded-xl border border-gray-200 bg-white flex flex-col overflow-hidden">
        <div className="bg-red-800 text-white px-4 py-3 flex items-center justify-between">
          <div className="font-medium">{student.name} - Chat</div>
          <button type="button" onClick={onClose} className="text-white/90 hover:text-white">
            x
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50 p-3 space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                msg.from === "mentor"
                  ? "ml-auto bg-red-800 text-white rounded-br-sm"
                  : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-gray-200 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-gray-300 px-3 py-2 text-sm outline-none"
          />
          <button
            type="button"
            onClick={send}
            className="rounded-full bg-red-800 px-4 py-2 text-sm font-medium text-white hover:bg-red-900"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function InternalMarksModal({ student, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="bg-red-800 text-white px-5 py-3 flex items-center justify-between">
          <div>
            <div className="font-semibold">{student.name} - Internal Marks</div>
            <div className="text-xs text-white/80">{student.usn}</div>
          </div>
          <button type="button" onClick={onClose} className="text-white/90 hover:text-white">
            x
          </button>
        </div>
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-3 py-2 text-left">SL</th>
                <th className="px-3 py-2 text-left">Code</th>
                <th className="px-3 py-2 text-left">Subject</th>
                <th className="px-3 py-2 text-center">Att %</th>
                <th className="px-3 py-2 text-center">IA-1</th>
                <th className="px-3 py-2 text-center">IA-2</th>
                <th className="px-3 py-2 text-center">CIA</th>
                <th className="px-3 py-2 text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {mockInternalMarks.map((row, index) => (
                <tr key={row.code} className="border-t border-gray-100">
                  <td className="px-3 py-2">{index + 1}</td>
                  <td className="px-3 py-2 text-gray-600">{row.code}</td>
                  <td className="px-3 py-2">{row.subject}</td>
                  <td className="px-3 py-2 text-center">{row.att}%</td>
                  <td className="px-3 py-2 text-center">{row.ia1}</td>
                  <td className="px-3 py-2 text-center">{row.ia2}</td>
                  <td className="px-3 py-2 text-center">{row.cia}</td>
                  <td className="px-3 py-2 text-center font-medium">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StudentSmrModalOld({ student, onClose, onMeeting, onMessage }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="bg-red-800 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">{student.name}</div>
            <div className="text-sm text-white/80">
              {student.usn} - {student.dept} - Sem {student.sem}
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-white/90 hover:text-white">
            x
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="font-semibold text-gray-900 mb-2">Student Details</div>
              <p className="text-gray-700">Name: {student.name}</p>
              <p className="text-gray-700">USN: {student.usn}</p>
              <p className="text-gray-700">Department: {student.dept}</p>
              <p className="text-gray-700">Semester: {student.sem}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="font-semibold text-gray-900 mb-2">Mentoring Summary</div>
              <p className="text-gray-700">Balance: Rs.{student.balance}</p>
              <p className="text-gray-700">Pending approvals: {student.pending}</p>
              <p className="text-gray-700">Section: {student.sec}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onMeeting}
              className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
            >
              Meeting
            </button>
            <button
              type="button"
              onClick={onMessage}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MentoringPage() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [sem, setSem] = useState("All");
  const [sec, setSec] = useState("All");
  const [remarks, setRemarks] = useState({});
  const [selectedUsn, setSelectedUsn] = useState(null);
  const [selectedSmr, setSelectedSmr] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChecklistStudent, setSelectedChecklistStudent] = useState(null);
  const [selectedEditStudent, setSelectedEditStudent] = useState(null);
  const [selectedQuickUpdateStudent, setSelectedQuickUpdateStudent] = useState(null);
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [viewMode, setViewMode] = useState("student");
  const [clearanceByUsn, setClearanceByUsn] = useState({});
  const [studentUpdates, setStudentUpdates] = useState({});
  const [uploadedCertificates, setUploadedCertificates] = useState({});
  const [selectedCertificateStudent, setSelectedCertificateStudent] = useState(null);

  const filtered = useMemo(
    () =>
      mockStudents.filter((student) => {
        const query = search.toLowerCase();
        const queryMatch =
          !query ||
          student.name.toLowerCase().includes(query) ||
          student.usn.toLowerCase().includes(query);
        return (
          queryMatch &&
          (dept === "All" || student.dept === dept) &&
          (sem === "All" || student.sem === sem) &&
          (sec === "All" || student.sec === sec)
        );
      }),
    [search, dept, sem, sec]
  );

  const selectedUsnStudent = mockStudents.find((student) => student.usn === selectedUsn) ?? null;
  const mergedSelectedUsnStudent = selectedUsnStudent
    ? { ...selectedUsnStudent, ...studentUpdates[selectedUsnStudent.usn] }
    : null;

  return (
    <div>
      {mergedSelectedUsnStudent && (
        <InternalMarksModal student={mergedSelectedUsnStudent} onClose={() => setSelectedUsn(null)} />
      )}
      {selectedSmr && (
        <StudentSmrModal
          student={selectedSmr}
          onClose={() => setSelectedSmr(null)}
        />
      )}
      {selectedChat && <ChatModal student={selectedChat} onClose={() => setSelectedChat(null)} />}
      {showNewMeeting && (
        <MeetingModalNew
          onClose={() => setShowNewMeeting(false)}
          onSubmit={(form) => console.log("Meeting submitted:", form)}
        />
      )}
      {selectedChecklistStudent && (
        <ClearanceChecklistModal
          student={selectedChecklistStudent}
          value={clearanceByUsn[selectedChecklistStudent.usn]}
          onToggle={(key) =>
            setClearanceByUsn((prev) => ({
              ...prev,
              [selectedChecklistStudent.usn]: {
                ...prev[selectedChecklistStudent.usn],
                [key]: !prev[selectedChecklistStudent.usn]?.[key],
              },
            }))
          }
          onClose={() => setSelectedChecklistStudent(null)}
        />
      )}
      {selectedCertificateStudent && (
        <CertificateUploadModal
          student={selectedCertificateStudent}
          certificates={uploadedCertificates[selectedCertificateStudent.usn] || {}}
          onUpload={(certificate) => {
            setUploadedCertificates((prev) => ({
              ...prev,
              [selectedCertificateStudent.usn]: [
                ...(prev[selectedCertificateStudent.usn] || []),
                certificate,
              ],
            }));
          }}
          onClose={() => setSelectedCertificateStudent(null)}
        />
      )}
      {selectedEditStudent && (
        <EditDetailsModal
          student={{
            ...selectedEditStudent,
            ...studentUpdates[selectedEditStudent.usn],
          }}
          onClose={() => setSelectedEditStudent(null)}
          onSave={(payload) => {
            setStudentUpdates((prev) => ({
              ...prev,
              [selectedEditStudent.usn]: {
                ...prev[selectedEditStudent.usn],
                ...payload,
              },
            }));
          }}
        />
      )}
      {selectedQuickUpdateStudent && (
        <QuickUpdateModalNew
          student={{
            ...selectedQuickUpdateStudent,
            ...studentUpdates[selectedQuickUpdateStudent.usn],
            remark:
              remarks[selectedQuickUpdateStudent.usn] ??
              studentUpdates[selectedQuickUpdateStudent.usn]?.remark ??
              selectedQuickUpdateStudent.remark,
          }}
          onClose={() => setSelectedQuickUpdateStudent(null)}
          onSave={(payload) => {
            setStudentUpdates((prev) => ({
              ...prev,
              [selectedQuickUpdateStudent.usn]: {
                ...prev[selectedQuickUpdateStudent.usn],
                ...payload,
              },
            }));
            setRemarks((prev) => ({
              ...prev,
              [selectedQuickUpdateStudent.usn]: payload.remarks,
            }));
          }}
        />
      )}

      <div className="flex items-center gap-1 text-sm my-4">
        <span className="text-red-800 font-medium">Mentoring</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-500">Mentee Management</span>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode("student")}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                viewMode === "student"
                  ? "border-red-800 bg-red-800 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Student View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("meeting")}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                viewMode === "meeting"
                  ? "border-red-800 bg-red-800 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Meeting View
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowNewMeeting(true)}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Meet Me
            </button>
            <button
              type="button"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Download Attendance Report
            </button>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-[1.8fr_1fr_1fr_1fr] xl:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="relative min-w-0">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by USN or name"
              className="w-full rounded-full border border-gray-300 bg-white px-10 py-2 text-sm text-gray-700 focus:border-red-800 focus:outline-none"
            />
          </div>
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:outline-none"
          >
            {DEPT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All Depts" : option}
              </option>
            ))}
          </select>
          <select
            value={sem}
            onChange={(e) => setSem(e.target.value)}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:outline-none"
          >
            {SEM_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All Sem" : `Sem ${option}`}
              </option>
            ))}
          </select>
          <select
            value={sec}
            onChange={(e) => setSec(e.target.value)}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:outline-none"
          >
            {SEC_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All Sec" : option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-red-800 text-white">
              {[
                "SL",
                "USN",
                "Mentee Name",
                "Degree",
                "Dept",
                "Semester",
                "Section",
                "Balance (₹)",
                "Pending Approvals",
                "Meeting Time & Date",
                "Admission Status",
                "Registration Date",
                "View SMR",
                "Meeting Info",
                "Edit Details",
                "Quick Update",
                "Meeting History",
                "Download Progress Report",
                "Download Attendance Report",
                "View/Edit Offer Letter",
                "Upload Certificate",
              ].map((heading) => (
                <th key={heading} className="px-2 py-3 text-left font-semibold whitespace-nowrap text-xs">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((student, index) => (
              <tr key={student.usn} className="border-b border-gray-100 hover:bg-gray-50">
                {(() => {
                  const mergedStudent = { ...student, ...studentUpdates[student.usn] };
                  return (
                    <>
                      <td className="px-2 py-2">{index + 1}</td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedUsn(student.usn)}
                          className="font-medium text-blue-700 hover:underline text-xs"
                        >
                          {mergedStudent.usn}
                        </button>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedSmr(mergedStudent)}
                          className="font-medium text-red-800 hover:underline text-xs"
                        >
                          {mergedStudent.name}
                        </button>
                      </td>
                      <td className="px-2 py-2 text-xs">{mergedStudent.degree || "MCA-DET-CC"}</td>
                      <td className="px-2 py-2 text-xs">{mergedStudent.dept}</td>
                      <td className="px-2 py-2 text-xs">{mergedStudent.sem}</td>
                      <td className="px-2 py-2 text-xs">{mergedStudent.sec}</td>
                      <td className="px-2 py-2 text-xs">{mergedStudent.balance || "0.0"}</td>
                      <td className="px-2 py-2 text-xs">{mergedStudent.pending}</td>
                      <td className="px-2 py-2 text-xs whitespace-nowrap">
                        {mergedStudent.meetingTime || "-"}
                      </td>
                      <td className="px-2 py-2 text-xs whitespace-nowrap">
                        {mergedStudent.admissionStatus || "Full payment"}
                      </td>
                      <td className="px-2 py-2 text-xs whitespace-nowrap">
                        {mergedStudent.registrationDate || "-"}
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => setSelectedSmr(mergedStudent)}
                          className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-slate-800 hover:border-slate-900 hover:text-slate-900"
                        >
                          View SMR
                        </button>
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => setSelectedChat(mergedStudent)}
                          className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-slate-800 hover:border-blue-500 hover:text-blue-600"
                        >
                          Meeting Info
                        </button>
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => setSelectedEditStudent(mergedStudent)}
                          className="rounded-full border border-blue-600 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                        >
                          Edit Details
                        </button>
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => setSelectedQuickUpdateStudent(mergedStudent)}
                          className="rounded-full border border-emerald-600 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                        >
                          Quick Update
                        </button>
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-slate-800 hover:border-slate-900 hover:text-slate-900"
                        >
                          Meeting History
                        </button>
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-slate-800 hover:border-slate-900 hover:text-slate-900"
                        >
                          Download Progress
                        </button>
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-slate-800 hover:border-slate-900 hover:text-slate-900"
                        >
                          Download Attendance
                        </button>
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-slate-800 hover:border-slate-900 hover:text-slate-900"
                        >
                          Offer Letter
                        </button>
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCertificateStudent(mergedStudent)}
                          className="rounded-full border border-purple-600 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100 flex items-center gap-1"
                        >
                          <span>📤</span>
                          {uploadedCertificates[mergedStudent.usn]?.length > 0
                            ? `✓ ${uploadedCertificates[mergedStudent.usn].length}`
                            : "Upload"}
                        </button>
                      </td>
                    </>
                  );
                })()}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={20} className="px-3 py-8 text-center text-gray-400">
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
