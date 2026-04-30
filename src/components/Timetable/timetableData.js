/**
 * Static timetable & related data (faculty dashboard — future: API / MongoDB).
 * Class entries may include `tags` for filter chips (Holiday, Event, etc.).
 */

export const FILTER_TAG_OPTIONS = [
  "Holiday",
  "Event",
  "Repeat Timetable",
  "Extra Curricular Course",
  "Co Curricular Course",
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** @typedef {{ subjectCode: string, subjectName: string, startTime: string, endTime: string, room: string, batch?: string, tags?: string[] }} TimetableClass */

/**
 * Build a week template for one MCA section (varies slightly by section letter).
 * @param {string} section
 * @returns {Record<string, TimetableClass[]>}
 */
function mcaWeekTemplate(section) {
  const batch = `2025-26 · Sem 2 · ${section}`;
  return {
    Monday: [
      {
        subjectCode: "MCAP231",
        subjectName: "Advanced Web Technologies",
        startTime: "09:50",
        endTime: "10:40",
        room: "15",
        batch,
        tags: ["Repeat Timetable"],
      },
      {
        subjectCode: "MCAP232",
        subjectName: "Machine Learning",
        startTime: "10:50",
        endTime: "11:40",
        room: "12",
        batch,
      },
      {
        subjectCode: "MCAP233",
        subjectName: "Cloud Computing",
        startTime: "11:50",
        endTime: "12:40",
        room: "18",
        batch,
        tags: ["Co Curricular Course"],
      },
      {
        subjectCode: "MCAP234",
        subjectName: "Research Methodology",
        startTime: "14:00",
        endTime: "14:50",
        room: "09",
        batch,
      },
    ],
    Tuesday: [
      {
        subjectCode: "MCAP235",
        subjectName: "Data Analytics Lab",
        startTime: "09:00",
        endTime: "11:30",
        room: "Lab-3",
        batch,
        tags: ["Extra Curricular Course"],
      },
      {
        subjectCode: "MCAP231",
        subjectName: "Advanced Web Technologies",
        startTime: "11:50",
        endTime: "12:40",
        room: "15",
        batch,
        tags: ["Repeat Timetable"],
      },
      {
        subjectCode: "MCAP236",
        subjectName: "Seminar — Industry Talk",
        startTime: "15:00",
        endTime: "16:30",
        room: "Auditorium",
        batch,
        tags: ["Event"],
      },
    ],
    Wednesday: [
      {
        subjectCode: "MCAP232",
        subjectName: "Machine Learning",
        startTime: "09:50",
        endTime: "10:40",
        room: "12",
        batch,
      },
      {
        subjectCode: "MCAP237",
        subjectName: "Open Elective — Yoga & Wellness",
        startTime: "10:50",
        endTime: "11:40",
        room: "07",
        batch,
        tags: ["Extra Curricular Course"],
      },
      {
        subjectCode: "MCAP234",
        subjectName: "Research Methodology",
        startTime: "14:00",
        endTime: "15:40",
        room: "09",
        batch,
      },
    ],
    Thursday: [
      {
        subjectCode: "MCAP233",
        subjectName: "Cloud Computing",
        startTime: "09:00",
        endTime: "09:50",
        room: "18",
        batch,
      },
      {
        subjectCode: "MCAP231",
        subjectName: "Advanced Web Technologies",
        startTime: "10:00",
        endTime: "10:50",
        room: "15",
        batch,
      },
      {
        subjectCode: "MCAP232",
        subjectName: "Machine Learning",
        startTime: "11:00",
        endTime: "11:50",
        room: "12",
        batch,
      },
      {
        subjectCode: "MCAP238",
        subjectName: "Department Forum",
        startTime: "16:00",
        endTime: "17:00",
        room: "Seminar Hall",
        batch,
        tags: ["Event"],
      },
    ],
    Friday: [
      {
        subjectCode: "MCAP231",
        subjectName: "Advanced Web Technologies",
        startTime: "09:50",
        endTime: "10:40",
        room: "15",
        batch,
        tags: ["Repeat Timetable"],
      },
      {
        subjectCode: "MCAP239",
        subjectName: "Mini Project Review",
        startTime: "11:00",
        endTime: "13:00",
        room: "Lab-2",
        batch,
        tags: ["Event"],
      },
      {
        subjectCode: "MCAP234",
        subjectName: "Research Methodology",
        startTime: "14:00",
        endTime: "14:50",
        room: "09",
        batch,
      },
    ],
    Saturday: [
      {
        subjectCode: "MCAP240",
        subjectName: "Remedial / Backup Slot",
        startTime: "09:00",
        endTime: "12:00",
        room: "TBD",
        batch,
        tags: ["Holiday", "Repeat Timetable"],
      },
    ],
    Sunday: [],
  };
}

/** Full static store: MCA sections A–D */
export const MCA_TIMETABLE_BY_SECTION = {
  A: mcaWeekTemplate("A"),
  B: (() => {
    const w = mcaWeekTemplate("B");
    return {
      ...w,
      Monday: w.Monday.map((c, i) =>
        i === 0 ? { ...c, room: "16", startTime: "09:00", endTime: "09:50" } : c
      ),
    };
  })(),
  C: mcaWeekTemplate("C"),
  D: (() => {
    const w = mcaWeekTemplate("D");
    return {
      ...w,
      Tuesday: w.Tuesday.map((c, i) => (i === 0 ? { ...c, room: "Lab-4" } : c)),
    };
  })(),
};

export const DEPARTMENTS = [
  { value: "MCA", label: "MCA" },
  { value: "B.Tech", label: "B.Tech (placeholder only)" },
];

export const MCA_SECTIONS = ["A", "B", "C", "D"];

export const DAY_ORDER = days;

/** @type {{ id: string, courseCode: string, courseName: string, ia: string, maxMarks: number, schedule: string, section: string, status: string }[]} */
export const INTERNAL_ASSESSMENT_ROWS = [
  {
    id: "ia-1",
    courseCode: "MCAP231",
    courseName: "Advanced Web Technologies",
    ia: "IA-1",
    maxMarks: 30,
    schedule: "Week 6 · Mon 10:00",
    section: "A",
    status: "Scheduled",
  },
  {
    id: "ia-2",
    courseCode: "MCAP232",
    courseName: "Machine Learning",
    ia: "IA-1",
    maxMarks: 30,
    schedule: "Week 7 · Wed 14:00",
    section: "A",
    status: "Scheduled",
  },
  {
    id: "ia-3",
    courseCode: "MCAP233",
    courseName: "Cloud Computing",
    ia: "IA-2",
    maxMarks: 30,
    schedule: "Week 8 · Fri 09:30",
    section: "B",
    status: "Completed",
  },
  {
    id: "ia-4",
    courseCode: "MCAP234",
    courseName: "Research Methodology",
    ia: "IA-1",
    maxMarks: 25,
    schedule: "Week 5 · Thu 11:00",
    section: "C",
    status: "Completed",
  },
];

/** @type {{ id: string, title: string, type: string, due: string, weight: string, section: string }[]} */
export const OTHER_ASSESSMENT_ROWS = [
  {
    id: "oa-1",
    title: "Assignment — AWT Mini Project",
    type: "Assignment",
    due: "Apr 12, 2026",
    weight: "10%",
    section: "A",
  },
  {
    id: "oa-2",
    title: "Quiz — ML Foundations",
    type: "Online Quiz",
    due: "Apr 18, 2026",
    weight: "5%",
    section: "A",
  },
  {
    id: "oa-3",
    title: "Viva — Cloud Lab",
    type: "Viva",
    due: "Apr 22, 2026",
    weight: "15%",
    section: "B",
  },
  {
    id: "oa-4",
    title: "Presentation — Research Proposal",
    type: "Presentation",
    due: "May 02, 2026",
    weight: "10%",
    section: "D",
  },
];

/**
 * Faculty list for "Transfer To" dropdowns (static).
 */
export const TRANSFER_TO_FACULTY = [
  "Ms Pankaja Benkal",
  "Dr. A. Kumar",
  "Dr. S. Mehta",
  "Dr. R. Iyer",
  "Dr. Priya Nair",
  "Dr. Vikram Singh",
];

/**
 * Timetable rows available for class transfer on a given date (static).
 * @type {Record<string, { id: string, day: string, startTime: string, endTime: string, courseName: string, courseCode: string, semester: string, section: string, scheme: string, batch?: string }[]>}
 */
export const CLASS_TRANSFER_SLOTS_BY_DATE = {
  "2026-04-06": [
    {
      id: "cts-1",
      day: "Monday",
      startTime: "11:40",
      endTime: "12:30",
      courseName: "Advanced Web Technologies",
      courseCode: "MCAP231",
      semester: "2",
      section: "B",
      scheme: "2025",
    },
    {
      id: "cts-2",
      day: "Monday",
      startTime: "14:00",
      endTime: "16:30",
      courseName: "Advanced Web Technologies",
      courseCode: "MCAP235",
      semester: "2",
      section: "A",
      batch: "B2",
      scheme: "2025",
    },
  ],
  "2026-04-10": [
    {
      id: "cts-3",
      day: "Thursday",
      startTime: "09:50",
      endTime: "10:40",
      courseName: "Machine Learning",
      courseCode: "MCAP232",
      semester: "2",
      section: "A",
      scheme: "2025",
    },
  ],
};

/** Filter options for “My Transfer Requests” tab */
export const MY_TRANSFER_REQUEST_FILTER_OPTIONS = ["All", "Pending", "Accepted", "Rejected"];

/**
 * Outgoing transfer requests (static — future: API).
 * @type {{ id: string, classDate: string, timeRange: string, semesterSectionScheme: string, to: string, status: string }[]}
 */
export const MY_TRANSFER_REQUESTS = [
  {
    id: "my-tr-1",
    classDate: "2026-01-28",
    timeRange: "14:15-15:05",
    semesterSectionScheme: "1 - B - 2025",
    to: "Ms Pankaja Benkal",
    status: "Accepted",
  },
  {
    id: "my-tr-2",
    classDate: "2026-01-21",
    timeRange: "11:40-12:30",
    semesterSectionScheme: "2 - C - 2025",
    to: "Dr. A. Kumar",
    status: "Pending",
  },
  {
    id: "my-tr-3",
    classDate: "2026-03-15",
    timeRange: "09:50-10:40",
    semesterSectionScheme: "2 - A - 2025",
    to: "Ms Pankaja Benkal",
    status: "Rejected",
  },
];

/** Filter options for “Transfer Request From Others” tab */
export const INCOMING_TRANSFER_FILTER_OPTIONS = ["All", "Submitted", "Accepted", "Rejected"];

/**
 * Incoming transfer requests (static — future: API).
 * @type {{ id: string, classDate: string, timeRange: string, semesterSectionScheme: string, from: string }[]}
 */
export const INCOMING_TRANSFER_REQUESTS = [
  {
    id: "in-tr-1",
    classDate: "2026-03-31",
    timeRange: "09:00-09:50",
    semesterSectionScheme: "2 - B - 2025",
    from: "Ms Pankaja Benkal",
  },
  {
    id: "in-tr-2",
    classDate: "2026-04-02",
    timeRange: "14:00-15:30",
    semesterSectionScheme: "1 - A - 2025",
    from: "Dr. R. Iyer",
  },
];
