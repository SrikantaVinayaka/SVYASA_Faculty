import { useMemo, useState } from "react";
import StudentCard from "./StudentCard.jsx";
import StudentProfileModal from "./StudentProfileModal.jsx";
import BotWidget from "./BotWidget.jsx";

const MOCK_MENTORS = ["Dr. Bharathi", "Dr. Ramesh", "Dr. Anita", "Dr. Kumar"];

const MOCK_STUDENTS = [
  {
    id: "stu-1",
    registerNo: "U18BP22S0046",
    name: "B Deepthi",
    degree: "BCA",
    section: "A",
    semester: 2,
    mentor: "Dr. Bharathi",
    profile: {
      dob: "15-Mar-2004",
      phone: "+91 9876543210",
      email: "deepthi@svyasa.edu",
      address: "123, MG Road, Bengaluru - 560001",
      parentName: "B Ramesh",
      parentPhone: "+91 9876543211",
      bloodGroup: "B+",
      category: "General",
    },
    academics: { attendancePct: 78, iaMarks: 24, sefCompleted: true, assessmentsCompleted: true },
    fees: { status: "Pending", concession: "No", semestersCleared: 1 },
    remarks: [{ id: "r1", date: "2026-03-02", text: "Needs to improve attendance." }],
    activities: ["NSS volunteering"],
    tasks: [
      {
        id: "t1",
        dateAssigned: "2026-04-10",
        status: "Pending",
        checklist: ["Submit certificate", "Meet mentor"],
        deadline: "2026-04-25",
        isCIA: false,
        createdBy: "Mentor",
      },
    ],
    uploads: [],
  },
  {
    id: "stu-2",
    registerNo: "U18BP22S0047",
    name: "Arun Kumar",
    degree: "BCA",
    section: "A",
    semester: 2,
    mentor: "Dr. Bharathi",
    profile: {
      dob: "10-Jan-2004",
      phone: "+91 9876543220",
      email: "arun@svyasa.edu",
      address: "Mysuru, Karnataka",
      parentName: "S Kumar",
      parentPhone: "+91 9876543221",
      bloodGroup: "O+",
      category: "OBC",
    },
    academics: { attendancePct: 86, iaMarks: 20, sefCompleted: true, assessmentsCompleted: true },
    fees: { status: "Paid", concession: "Yes", semestersCleared: 2 },
    remarks: [],
    activities: ["Hackathon - College level"],
    tasks: [],
    uploads: [],
  },
  {
    id: "stu-3",
    registerNo: "U18BP22S0048",
    name: "Priya Sharma",
    degree: "MCA",
    section: "B",
    semester: 4,
    mentor: "Dr. Ramesh",
    profile: {
      dob: "21-Aug-2003",
      phone: "+91 9876543230",
      email: "priya@svyasa.edu",
      address: "Bengaluru, Karnataka",
      parentName: "R Sharma",
      parentPhone: "+91 9876543231",
      bloodGroup: "A+",
      category: "General",
    },
    academics: { attendancePct: 68, iaMarks: 17, sefCompleted: false, assessmentsCompleted: false },
    fees: { status: "Pending", concession: "No", semestersCleared: 3 },
    remarks: [{ id: "r2", date: "2026-02-18", text: "Low attendance, counsel student." }],
    activities: ["Sports - Badminton"],
    tasks: [],
    uploads: [],
  },
];

function downloadTextFile(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCsv(rows) {
  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  return rows.map((r) => r.map(esc).join(",")).join("\n");
}

export default function Mentoring() {
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [query, setQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileMode, setProfileMode] = useState("smr"); // "smr" | "assignTask" | "edit"
  const [profileReadOnly, setProfileReadOnly] = useState(false);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) ?? null,
    [students, selectedStudentId]
  );

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      return s.registerNo.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
    });
  }, [query, students]);

  function openStudent(studentId, mode, readOnly = false) {
    setSelectedStudentId(studentId);
    setProfileMode(mode);
    setProfileReadOnly(readOnly);
    setProfileOpen(true);
  }

  function updateStudent(studentId, updater) {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? (typeof updater === "function" ? updater(s) : updater) : s))
    );
  }

  function handleDownloadAttendanceCsv() {
    const rows = [
      ["Register No", "Name", "Degree", "Section", "Semester", "Attendance %", "Mentor"],
      ...students.map((s) => [
        s.registerNo,
        s.name,
        s.degree,
        s.section,
        s.semester,
        s.academics.attendancePct,
        s.mentor,
      ]),
    ];
    downloadTextFile("attendance-report.csv", toCsv(rows), "text/csv");
  }

  function handleDownloadCoCurricularMock() {
    const rows = [
      ["Register No", "Name", "Activities"],
      ...students.map((s) => [s.registerNo, s.name, (s.activities ?? []).join("; ")]),
    ];
    downloadTextFile("co-curricular-activities.csv", toCsv(rows), "text/csv");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[16px] font-bold text-text">Mentoring</div>
            <div className="text-[12px] text-text2">Search students, view SMR, assign tasks and generate hall ticket.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownloadAttendanceCsv}
              className="rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] font-semibold text-text hover:bg-page-bg"
            >
              Download Attendance Report
            </button>
            <button
              type="button"
              onClick={handleDownloadCoCurricularMock}
              className="rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] font-semibold text-text hover:bg-page-bg"
            >
              Download Co-curricular Report
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Register Number or Name"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] text-text outline-none focus:border-[#D3A1A7]"
          />
          <div className="text-[12px] text-text2">Showing {filteredStudents.length} student(s)</div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filteredStudents.map((s) => (
          <StudentCard
            key={s.id}
            student={s}
            onViewSmr={() => openStudent(s.id, "smr", true)}
            onAssignTask={() => openStudent(s.id, "assignTask")}
          />
        ))}
      </div>

      {profileOpen && selectedStudent ? (
        <StudentProfileModal
          student={selectedStudent}
          mentors={MOCK_MENTORS}
          initialMode={profileMode}
          readOnly={profileReadOnly}
          onClose={() => setProfileOpen(false)}
          onUpdateStudent={(updater) => updateStudent(selectedStudent.id, updater)}
        />
      ) : null}

      <BotWidget students={students} onAssignTask={(studentId, task) => updateStudent(studentId, (s) => ({ ...s, tasks: [...(s.tasks ?? []), task] }))} />
    </div>
  );
}

