/** Default theory + lab rows for Marks & Attendance */
export const defaultTheorySubjects = [
  // Static sample values; UI is structured to match "Internals / Attendance" tables.
  // `ia1` and `ia2` are out of 30, `ciaTotal` is out of 30, `total` is out of 50.
  {
    subject: "Mathematics",
    attendancePct: 85,
    ia1: 8.0,
    ia2: 9.0,
    ciaTotal: 17,
    total: 32,
  },
  {
    subject: "Data Structures",
    attendancePct: 82,
    ia1: 9.0,
    ia2: 8.0,
    ciaTotal: 18,
    total: 34,
  },
  {
    subject: "DBMS",
    attendancePct: 79,
    ia1: 7.0,
    ia2: 9.0,
    ciaTotal: 17,
    total: 33,
  },
  {
    subject: "OS",
    attendancePct: 76,
    ia1: 8.0,
    ia2: 8.0,
    ciaTotal: 16,
    total: 31,
  },
  {
    subject: "Computer Networks",
    attendancePct: 88,
    ia1: 9.0,
    ia2: 9.0,
    ciaTotal: 18,
    total: 35,
  },
];

export const defaultLabSubjects = [
  // `labInternal` is CIA out of 30, `labTotal` is out of 30.
  { subject: "Data Structures Lab", attendancePct: 90, labInternal: 18, labTotal: 18 },
  { subject: "DBMS Lab", attendancePct: 86, labInternal: 17, labTotal: 17 },
];

const baseStaticStudent = (overrides) => ({
  id: 1,
  usn: "",
  name: "",
  degree: "MCA-DET-CC",
  dept: "MCA",
  semester: 2,
  section: "B",
  balance: 0.0,
  pendingApprovals: 0,
  meetingTime: "2026-03-15 10:00 AM",
  remark: "",
  admissionStatus: "Active",
  registrationDate: "2025-08-15",

  photoUrl: "",
  photoInitials: "ST",
  dob: "2002-05-14",
  doj: "2025-08-01",
  religion: "NA",
  emailId: "",
  mobile: "+91 98765 43210",
  localAddress: "Hostel Block A, S-VYASA Campus",

  parentGuardianName: "Guardian Name",
  fatherEmail: "father@example.com",
  fatherMobile: "+91 91234 56780",
  motherName: "Mother Name",
  motherOccupation: "Homemaker",
  motherEmail: "mother@example.com",
  motherMobile: "+91 91234 56781",
  permanentAddress: "Permanent address, City, PIN",

  mentorName: "Dr Bharathi",
  mentorContact: "+91 80 2263 9666",

  admission: {
    rank: "120",
    currentSemester: 2,
    degreeProgram: "Master of Computer Applications (MCA)",
    applicationCourse: "A-DET-CC (MCA)",
    department: "Computer Applications",
    hostelResident: "Yes",
    hostel: "Block A",
    transportation: "No",
    admissionCategory: "General",
    basicCategory: "General Merit",
    specialCategory: "—",
  },

  education: {
    currentSemesterDisplay: 2,
    unitTestScores: "Unit test scores not available",
    attendanceSummary: "Attendance details not available",
    enrolledSubjects: "Enrolled subjects not available",
    finalExamResults: "Final exam data not available",
    backlogs: "No backlog",
    tenthPercentage: 86,
    twelfthPercentage: 84,
    technicalSkills: "NA",
    technicalSkillOptions: ["NA", "Java", "DSA", "DBMS", "OS", "Networking"],
  },

  meetingHistory: [
    { date: "2026-02-10 11:00 AM", note: "Discussed coursework progress." },
    { date: "2026-01-15 10:30 AM", note: "Semester planning." },
  ],

  theoryMarks: defaultTheorySubjects.map((r) => ({ ...r })),
  labMarks: defaultLabSubjects.map((r) => ({ ...r })),

  ...overrides,
});

export const staticAttendanceStudents = [
  baseStaticStudent({
    id: 1,
    usn: "2222509006",
    name: "Abhishek Sajjan",
    meetingTime: "2026-03-15 10:00 AM",
    photoInitials: "AS",
    emailId: "2222509006@svyasa.edu.in",
    photoUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=2222509006&backgroundColor=c0aede",
    education: {
      currentSemesterDisplay: 2,
      unitTestScores: "Unit test scores not available",
      attendanceSummary: "Attendance details not available",
      enrolledSubjects: "Enrolled subjects not available",
      finalExamResults: "Final exam data not available",
      backlogs: "No backlog",
      tenthPercentage: 86,
      twelfthPercentage: 84,
      technicalSkills: "NA",
      technicalSkillOptions: ["NA", "Java", "DSA", "DBMS", "OS", "Networking"],
    },
  }),
  baseStaticStudent({
    id: 2,
    usn: "2222509007",
    name: "Abhishek Shegunasi",
    meetingTime: "2026-03-16 11:30 AM",
    photoInitials: "AS",
    emailId: "2222509007@svyasa.edu.in",
    photoUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=2222509007&backgroundColor=b6e3f4",
    education: {
      currentSemesterDisplay: 2,
      unitTestScores: "Unit test scores not available",
      attendanceSummary: "Attendance details not available",
      enrolledSubjects: "Enrolled subjects not available",
      finalExamResults: "Final exam data not available",
      backlogs: "No backlog",
      tenthPercentage: 88,
      twelfthPercentage: 82,
      technicalSkills: "NA",
      technicalSkillOptions: ["NA", "Java", "DSA", "DBMS", "OS", "Networking"],
    },
  }),
  baseStaticStudent({
    id: 3,
    usn: "2222509009",
    name: "Abisheik S",
    meetingTime: "2026-03-18 02:00 PM",
    photoInitials: "AS",
    emailId: "2222509009@svyasa.edu.in",
    photoUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=2222509009&backgroundColor=ffd5dc",
    education: {
      currentSemesterDisplay: 2,
      unitTestScores: "Unit test scores not available",
      attendanceSummary: "Attendance details not available",
      enrolledSubjects: "Enrolled subjects not available",
      finalExamResults: "Final exam data not available",
      backlogs: "No backlog",
      tenthPercentage: 80,
      twelfthPercentage: 78,
      technicalSkills: "NA",
      technicalSkillOptions: ["NA", "Java", "DSA", "DBMS", "OS", "Networking"],
    },
  }),
  baseStaticStudent({
    id: 4,
    usn: "2222509010",
    name: "Adithya R",
    meetingTime: "2026-03-20 09:00 AM",
    photoInitials: "AR",
    emailId: "2222509010@svyasa.edu.in",
    photoUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=2222509010&backgroundColor=d1d4f9",
    education: {
      currentSemesterDisplay: 2,
      unitTestScores: "Unit test scores not available",
      attendanceSummary: "Attendance details not available",
      enrolledSubjects: "Enrolled subjects not available",
      finalExamResults: "Final exam data not available",
      backlogs: "No backlog",
      tenthPercentage: 90,
      twelfthPercentage: 86,
      technicalSkills: "NA",
      technicalSkillOptions: ["NA", "Java", "DSA", "DBMS", "OS", "Networking"],
    },
  }),
];

// Backward-compatible alias while older imports are migrated.
export const mockAttendanceStudents = staticAttendanceStudents;
