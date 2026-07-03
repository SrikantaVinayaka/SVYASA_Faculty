/**
 * Real timetable data — MCA Sections A & B
 * W.E.F 16/03/2026 | II Semester | 2025–2026 (Even)
 * Future: replace with API / MongoDB calls.
 */

export const FILTER_TAG_OPTIONS = [
  "Holiday",
  "Event",
  "Repeat Timetable",
  "Extra Curricular Course",
  "Co Curricular Course",
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ─── Faculty Registry ─────────────────────────────────────────────────────────
export const FACULTY_REGISTRY = {
  "Dr. Bharathi S": {
    name: "Dr. Bharathi S",
    subjects: ["MCAP231", "MCAP235LAB"],
  },
  "Mr. Dhilip Raja P": {
    name: "Mr. Dhilip Raja P",
    subjects: ["MCAP232", "MCAP236"],
  },
  "Ms. Srujana B": {
    name: "Ms. Srujana B",
    subjects: ["MCAP233", "MCAP236"],
  },
  "Dr. Rajesh L": {
    name: "Dr. Rajesh L",
    subjects: ["MCAP252"],
  },
  "Ms. Pankaja Benkal": {
    name: "Ms. Pankaja Benkal",
    subjects: ["MCAP234", "MCAP236LAB"],
  },
};

// Currently logged-in faculty
export const CURRENT_FACULTY_NAME = "Dr. Bharathi S";

// ─── Section B Real Timetable ─────────────────────────────────────────────────
// Source: CLASS TIME TABLE image — MCA Section B, W.E.F 16/03/2026
const SECTION_B_TIMETABLE = {
  Monday: [
    { subjectCode: "MCAP233", subjectName: "Software Testing and Quality Assurance", startTime: "09:00", endTime: "09:50", room: "12B", batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP234", subjectName: "Machine Learning Techniques",             startTime: "09:50", endTime: "10:40", room: "12B", batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP232", subjectName: "Software Engineering Concepts and Methodologies", startTime: "10:50", endTime: "11:40", room: "15",  batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP231", subjectName: "Advanced Web Technologies",               startTime: "11:40", endTime: "12:30", room: "15",  batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MENTORING", subjectName: "Mentoring Session",                     startTime: "12:30", endTime: "13:20", room: "15",  batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP236LAB", subjectName: "Lab - Software Testing and Quality Assurance", startTime: "14:00", endTime: "15:35", room: "10",  batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP236LAB", subjectName: "Lab - Software Testing and Quality Assurance", startTime: "15:45", endTime: "16:30", room: "10",  batch: "2025-26 · Sem 2 · B" },
  ],
  Tuesday: [
    { subjectCode: "MCAP234", subjectName: "Machine Learning Techniques",             startTime: "09:00", endTime: "09:50", room: "15",  batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP233", subjectName: "Software Testing and Quality Assurance",  startTime: "09:50", endTime: "10:40", room: "15",  batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP232", subjectName: "Software Engineering Concepts and Methodologies", startTime: "10:50", endTime: "11:40", room: "12B", batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP252", subjectName: "Research Methodology and IPR",            startTime: "11:40", endTime: "12:30", room: "12B", batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP256", subjectName: "Power BI (Elective 2)",                   startTime: "12:30", endTime: "13:20", room: "4",   batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP257", subjectName: "Social Network Analysis (Elective 2)",    startTime: "12:30", endTime: "13:20", room: "12B", batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP235LAB", subjectName: "Lab - Advanced Web Technologies",      startTime: "14:00", endTime: "15:35", room: "15",  batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP235LAB", subjectName: "Lab - Advanced Web Technologies",      startTime: "15:45", endTime: "16:30", room: "15",  batch: "2025-26 · Sem 2 · B" },
  ],
  Wednesday: [
    { subjectCode: "MCAP252", subjectName: "Research Methodology and IPR",            startTime: "09:00", endTime: "09:50", room: "12B", batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP231", subjectName: "Advanced Web Technologies",               startTime: "09:50", endTime: "10:40", room: "15",  batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP233", subjectName: "Software Testing and Quality Assurance",  startTime: "10:50", endTime: "11:40", room: "15",  batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP233", subjectName: "Software Testing and Quality Assurance",  startTime: "11:40", endTime: "12:30", room: "15",  batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP256", subjectName: "Power BI (Elective 2)",                   startTime: "12:30", endTime: "13:20", room: "4",   batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP257", subjectName: "Social Network Analysis (Elective 2)",    startTime: "12:30", endTime: "13:20", room: "12B", batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP236LAB", subjectName: "Lab - Software Testing and Quality Assurance", startTime: "14:00", endTime: "14:50", room: "4",   batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "SPORTS",     subjectName: "Sports",                               startTime: "14:50", endTime: "15:35", room: "Ground", batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "LIBRARY",    subjectName: "Library",                              startTime: "15:45", endTime: "16:30", room: "Library", batch: "2025-26 · Sem 2 · B" },
  ],
  Thursday: [
    { subjectCode: "MCAP231", subjectName: "Advanced Web Technologies",               startTime: "09:00", endTime: "09:50", room: "15",  batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP252", subjectName: "Research Methodology and IPR",            startTime: "09:50", endTime: "10:40", room: "12B", batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP256", subjectName: "Power BI (Elective 2)",                   startTime: "10:50", endTime: "11:40", room: "4",   batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP257", subjectName: "Social Network Analysis (Elective 2)",    startTime: "10:50", endTime: "11:40", room: "12B", batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP233", subjectName: "Software Testing and Quality Assurance",  startTime: "11:40", endTime: "12:30", room: "12B", batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP232", subjectName: "Software Engineering Concepts and Methodologies", startTime: "12:30", endTime: "13:20", room: "12B", batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP235LAB", subjectName: "Lab - Advanced Web Technologies",      startTime: "14:00", endTime: "15:35", room: "12B", batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "LIBRARY",    subjectName: "Library",                              startTime: "15:35", endTime: "16:20", room: "Library", batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "SPORTS",     subjectName: "Sports",                               startTime: "15:45", endTime: "16:30", room: "Ground", batch: "2025-26 · Sem 2 · B" },
  ],
  Friday: [
    { subjectCode: "MCAP232", subjectName: "Software Engineering Concepts and Methodologies", startTime: "09:00", endTime: "09:50", room: "12B", batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP231", subjectName: "Advanced Web Technologies",               startTime: "09:50", endTime: "10:40", room: "12B", batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP256", subjectName: "Power BI (Elective 2)",                   startTime: "10:50", endTime: "11:40", room: "4",   batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP257", subjectName: "Social Network Analysis (Elective 2)",    startTime: "10:50", endTime: "11:40", room: "12B", batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP252", subjectName: "Research Methodology and IPR",            startTime: "11:40", endTime: "12:30", room: "15",  batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MCAP234", subjectName: "Machine Learning Techniques",             startTime: "12:30", endTime: "13:20", room: "15",  batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "MENTORING", subjectName: "Mentoring Session",                     startTime: "14:00", endTime: "14:50", room: "15",  batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "YOGA",      subjectName: "YOGA",                                  startTime: "14:50", endTime: "15:35", room: "Yoga Hall", batch: "2025-26 · Sem 2 · B" },
    { subjectCode: "YOGA",      subjectName: "YOGA",                                  startTime: "15:45", endTime: "16:30", room: "Yoga Hall", batch: "2025-26 · Sem 2 · B" },
  ],
  
  Sunday: [],
};

// ─── Section A Real Timetable ─────────────────────────────────────────────────
// Source: S-VYASA CLASS TIME TABLE image — MCA Section A, W.E.F 16/03/2026
const SECTION_A_TIMETABLE = {
  Monday: [
    { subjectCode: "MCAP232", subjectName: "Software Engineering Concepts and Methodologies", startTime: "09:00", endTime: "09:50", room: "12B", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP231", subjectName: "Advanced Web Technologies",               startTime: "09:50", endTime: "10:40", room: "15",  batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP234", subjectName: "Machine Learning Techniques",             startTime: "10:50", endTime: "11:40", room: "12B", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP233", subjectName: "Software Testing and Quality Assurance",  startTime: "11:40", endTime: "12:30", room: "12B", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MENTORING", subjectName: "Mentoring Session",                     startTime: "12:30", endTime: "13:20", room: "15",  batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP235LAB", subjectName: "Lab - Advanced Web Technologies",      startTime: "14:00", endTime: "15:35", room: "Lab", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP235LAB", subjectName: "Lab - Advanced Web Technologies",      startTime: "15:45", endTime: "16:30", room: "Lab", batch: "2025-26 · Sem 2 · A" },
  ],
  Tuesday: [
    { subjectCode: "MCAP231", subjectName: "Advanced Web Technologies",               startTime: "09:00", endTime: "09:50", room: "15",  batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP232", subjectName: "Software Engineering Concepts and Methodologies", startTime: "09:50", endTime: "10:40", room: "12B", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP234", subjectName: "Machine Learning Techniques",             startTime: "10:50", endTime: "11:40", room: "12B", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP252", subjectName: "Research Methodology and IPR",            startTime: "11:40", endTime: "12:30", room: "12B", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP256", subjectName: "Power BI (Elective 2)",                   startTime: "12:30", endTime: "13:20", room: "15",  batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP257", subjectName: "Social Network Analysis (Elective 2)",    startTime: "12:30", endTime: "13:20", room: "12B", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP236LAB", subjectName: "Lab - Software Testing and Quality Assurance", startTime: "14:00", endTime: "15:35", room: "Lab", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP236LAB", subjectName: "Lab - Software Testing and Quality Assurance", startTime: "15:45", endTime: "16:30", room: "Lab", batch: "2025-26 · Sem 2 · A" },
  ],
  Wednesday: [
    { subjectCode: "MCAP252", subjectName: "Research Methodology and IPR",            startTime: "09:00", endTime: "09:50", room: "12B", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP252", subjectName: "Research Methodology and IPR",            startTime: "09:00", endTime: "09:50", room: "12B", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP233", subjectName: "Software Testing and Quality Assurance",  startTime: "09:50", endTime: "10:40", room: "15",  batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP231", subjectName: "Advanced Web Technologies",               startTime: "10:50", endTime: "11:40", room: "15",  batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP232", subjectName: "Software Engineering Concepts and Methodologies", startTime: "11:40", endTime: "12:30", room: "12B", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP256", subjectName: "Power BI (Elective 2)",                   startTime: "12:30", endTime: "13:20", room: "15",  batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP257", subjectName: "Social Network Analysis (Elective 2)",    startTime: "12:30", endTime: "13:20", room: "12B", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP235LAB", subjectName: "Lab - Advanced Web Technologies",      startTime: "14:00", endTime: "14:50", room: "Lab", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "SPORTS",     subjectName: "Sports",                               startTime: "14:50", endTime: "15:35", room: "Ground", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "LIBRARY",    subjectName: "Library",                              startTime: "15:45", endTime: "16:30", room: "Library", batch: "2025-26 · Sem 2 · A" },
  ],
  Thursday: [
    { subjectCode: "MCAP233", subjectName: "Software Testing and Quality Assurance",  startTime: "09:00", endTime: "09:50", room: "15",  batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP252", subjectName: "Research Methodology and IPR",            startTime: "09:50", endTime: "10:40", room: "12B", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP252", subjectName: "Research Methodology and IPR",            startTime: "09:50", endTime: "10:40", room: "12B", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP256", subjectName: "Power BI (Elective 2)",                   startTime: "10:50", endTime: "11:40", room: "15",  batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP257", subjectName: "Social Network Analysis (Elective 2)",    startTime: "10:50", endTime: "11:40", room: "12B", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP234", subjectName: "Machine Learning Techniques",             startTime: "11:40", endTime: "12:30", room: "12B", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP231", subjectName: "Advanced Web Technologies",               startTime: "12:30", endTime: "13:20", room: "15",  batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP236LAB", subjectName: "Lab - Software Testing and Quality Assurance", startTime: "14:00", endTime: "15:35", room: "Lab", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "LIBRARY",    subjectName: "Library",                              startTime: "15:35", endTime: "16:20", room: "Library", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "SPORTS",     subjectName: "Sports",                               startTime: "15:45", endTime: "16:30", room: "Ground", batch: "2025-26 · Sem 2 · A" },
  ],
  Friday: [
    { subjectCode: "MCAP234", subjectName: "Machine Learning Techniques",             startTime: "09:00", endTime: "09:50", room: "12B", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP233", subjectName: "Software Testing and Quality Assurance",  startTime: "09:50", endTime: "10:40", room: "15",  batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP256", subjectName: "Power BI (Elective 2)",                   startTime: "10:50", endTime: "11:40", room: "15",  batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP257", subjectName: "Social Network Analysis (Elective 2)",    startTime: "10:50", endTime: "11:40", room: "12B", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP252", subjectName: "Research Methodology and IPR",            startTime: "11:40", endTime: "12:30", room: "12B", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MCAP232", subjectName: "Software Engineering Concepts and Methodologies", startTime: "12:30", endTime: "13:20", room: "12B", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "MENTORING", subjectName: "Mentoring Session",                     startTime: "14:00", endTime: "14:50", room: "15",  batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "YOGA",      subjectName: "YOGA / Library",                        startTime: "14:50", endTime: "15:35", room: "Yoga Hall", batch: "2025-26 · Sem 2 · A" },
    { subjectCode: "YOGA",      subjectName: "YOGA / Sports",                         startTime: "15:45", endTime: "16:30", room: "Yoga Hall", batch: "2025-26 · Sem 2 · A" },
  ],
  
  Sunday: [],
};

// ─── Exported timetable store ─────────────────────────────────────────────────
export const MCA_TIMETABLE_BY_SECTION = {
  A: SECTION_A_TIMETABLE,
  B: SECTION_B_TIMETABLE,
  C: {},   // placeholder — add real data when available
  D: {},   // placeholder — add real data when available
};

export const DEPARTMENTS = [
  { value: "MCA", label: "MCA" },
  { value: "B.Tech", label: "B.Tech (placeholder only)" },
];

export const MCA_SECTIONS = ["A", "B", "C", "D"];

export const DAY_ORDER = days;

// ─── getFullSectionBTimetable ─────────────────────────────────────────────────
// Returns the full timetable for Section B (or any section) with isOwnFaculty
// flag set per entry based on the logged-in faculty's subject list.
export function getFullSectionBTimetable(facultyName) {
  const faculty = FACULTY_REGISTRY[facultyName];
  const ownSubjects = faculty ? faculty.subjects : [];
  const week = MCA_TIMETABLE_BY_SECTION["B"];
  const result = {};
  for (const [day, classes] of Object.entries(week)) {
    result[day] = classes.map((c) => ({
      ...c,
      isOwnFaculty: ownSubjects.includes(c.subjectCode),
    }));
  }
  return result;
}

// ─── MCA_SUBJECTS ─────────────────────────────────────────────────────────────
export const MCA_SUBJECTS = (() => {
  const seen = new Map();
  Object.values(MCA_TIMETABLE_BY_SECTION).forEach((week) => {
    Object.values(week).forEach((classes) => {
      if (!Array.isArray(classes)) return;
      classes.forEach((c) => {
        if (!seen.has(c.subjectCode)) {
          seen.set(c.subjectCode, { subjectCode: c.subjectCode, subjectName: c.subjectName });
        }
      });
    });
  });
  return Array.from(seen.values()).sort((a, b) => a.subjectCode.localeCompare(b.subjectCode));
})();

export const INTERNAL_ASSESSMENT_ROWS = [
  { id: "ia-1", courseCode: "MCAP231", courseName: "Advanced Web Technologies",                    ia: "IA-1", maxMarks: 30, schedule: "Week 6 · Mon 10:00", section: "A", status: "Scheduled" },
  { id: "ia-2", courseCode: "MCAP232", courseName: "Software Engineering Concepts and Methodologies", ia: "IA-1", maxMarks: 30, schedule: "Week 7 · Wed 14:00", section: "A", status: "Scheduled" },
  { id: "ia-3", courseCode: "MCAP233", courseName: "Software Testing and Quality Assurance",       ia: "IA-2", maxMarks: 30, schedule: "Week 8 · Fri 09:30",  section: "B", status: "Completed" },
  { id: "ia-4", courseCode: "MCAP234", courseName: "Machine Learning Techniques",                  ia: "IA-1", maxMarks: 25, schedule: "Week 5 · Thu 11:00",  section: "B", status: "Completed" },
];

export const OTHER_ASSESSMENT_ROWS = [
  { id: "oa-1", title: "Assignment — AWT Mini Project",    type: "Assignment",  due: "Apr 12, 2026", weight: "10%", section: "A" },
  { id: "oa-2", title: "Quiz — ML Foundations",            type: "Online Quiz", due: "Apr 18, 2026", weight: "5%",  section: "A" },
  { id: "oa-3", title: "Viva — STQA Lab",                  type: "Viva",        due: "Apr 22, 2026", weight: "15%", section: "B" },
  { id: "oa-4", title: "Presentation — Research Proposal", type: "Presentation",due: "May 02, 2026", weight: "10%", section: "B" },
];

export const TRANSFER_TO_FACULTY = [
  "Ms. Pankaja Benkal",
  "Mr. Dhilip Raja P",
  "Ms. Srujana B",
  "Dr. Rajesh L",
  "Dr. Priya Nair",
  "Dr. Vikram Singh",
];

export const CLASS_TRANSFER_SLOTS_BY_DATE = {
  "2026-04-06": [
    { id: "cts-1", day: "Monday", startTime: "11:40", endTime: "12:30", courseName: "Advanced Web Technologies", courseCode: "MCAP231", semester: "2", section: "B", scheme: "2025" },
    { id: "cts-2", day: "Monday", startTime: "14:00", endTime: "15:35", courseName: "Lab - Advanced Web Technologies", courseCode: "MCAP235", semester: "2", section: "B", batch: "B2", scheme: "2025" },
  ],
  "2026-04-10": [
    { id: "cts-3", day: "Thursday", startTime: "09:50", endTime: "10:40", courseName: "Software Engineering Concepts and Methodologies", courseCode: "MCAP232", semester: "2", section: "A", scheme: "2025" },
  ],
};

export const MY_TRANSFER_REQUEST_FILTER_OPTIONS = ["All", "Pending", "Accepted", "Rejected"];

export const MY_TRANSFER_REQUESTS = [
  { id: "my-tr-1", classDate: "2026-01-28", timeRange: "14:15-15:05", semesterSectionScheme: "2 - B - 2025", to: "Ms. Pankaja Benkal", status: "Accepted" },
  { id: "my-tr-2", classDate: "2026-01-21", timeRange: "11:40-12:30", semesterSectionScheme: "2 - B - 2025", to: "Mr. Dhilip Raja P",  status: "Pending"  },
  { id: "my-tr-3", classDate: "2026-03-15", timeRange: "09:50-10:40", semesterSectionScheme: "2 - A - 2025", to: "Ms. Pankaja Benkal", status: "Rejected" },
];

export const INCOMING_TRANSFER_FILTER_OPTIONS = ["All", "Submitted", "Accepted", "Rejected"];

export const INCOMING_TRANSFER_REQUESTS = [
  { id: "in-tr-1", classDate: "2026-03-31", timeRange: "09:00-09:50", semesterSectionScheme: "2 - B - 2025", from: "Ms. Pankaja Benkal" },
  { id: "in-tr-2", classDate: "2026-04-02", timeRange: "14:00-15:35", semesterSectionScheme: "2 - A - 2025", from: "Ms. Srujana B" },
];