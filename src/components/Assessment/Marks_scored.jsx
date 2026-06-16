import React, { useState } from "react";

const studentsData = [
  {
    usn: "2222509006",
    name: "Abhishek Sajjan",
    dept: "MCA",
    sem: 2,
    section: "B",
    internalMarks: [
      { code: "BCA2AECKA02", subject: "Ganaka Sowrabha-2", attendance: "88%", ia1: 24, ia2: 22, cia: 20 },
      { code: "BCA2DSC04", subject: "Computer Architecture", attendance: "72%", ia1: 18, ia2: 20, cia: 18 },
      { code: "BCA2DSC05", subject: "OOP using Java", attendance: "65%", ia1: 15, ia2: 18, cia: 16 },
    ],
    semResults: [
      { code: "BCA2AECKA02", course: "Ganaka Sowrabha-2", scored: 64, min: 40, credits: 3 },
      { code: "BCA2DSC04", course: "Computer Architecture", scored: 28, min: 40, credits: 3 },
      { code: "BCA2DSC05", course: "OOP using Java", scored: 41, min: 40, credits: 3 },
    ],
  },
  {
    usn: "2222509007",
    name: "Abhishek Shegunasi",
    dept: "MCA",
    sem: 2,
    section: "B",
    internalMarks: [{ code: "MCA201", subject: "Data Structures", attendance: "90%", ia1: 22, ia2: 23, cia: 21 }],
    semResults: [{ code: "MCA201", course: "Data Structures", scored: 75, min: 40, credits: 4 }],
  },
];

function summarizeStudent(student) {
  const marks = student.internalMarks || [];
  const ia1 = marks.reduce((s, m) => s + m.ia1, 0);
  const ia2 = marks.reduce((s, m) => s + m.ia2, 0);
  const cia = marks.reduce((s, m) => s + m.cia, 0);
  const semMarks = (student.semResults || []).reduce((s, r) => s + r.scored, 0);
  const allPass = (student.semResults || []).every((r) => r.scored >= r.min);
  return { ia1, ia2, cia, semMarks, status: allPass ? "Pass" : "Fail" };
}

export default function MarksScore() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = studentsData.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.usn.includes(searchTerm),
  );

  return (
    <main className="flex-1 overflow-y-auto p-6 pb-20" style={{ scrollbarWidth: "thin", scrollbarColor: "#D1D5DB transparent" }}>
      <div className="mb-6">
        <h1 className="text-[18px] font-bold text-text">Marks Score</h1>
        <p className="text-[13px] text-text2 mt-1">View internal and semester marks by student</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-5">
          <input
            type="text"
            placeholder="Search by USN or name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-105 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-400 text-[13px]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-190">
            <thead>
              <tr className="bg-[#991b1b] text-white">
                <th className="text-left px-5 py-4 rounded-l-xl text-[12px] font-semibold">USN</th>
                <th className="text-left px-5 py-4 text-[12px] font-semibold">Name</th>
                <th className="text-left px-5 py-4 text-[12px] font-semibold">Dept</th>
                <th className="text-left px-5 py-4 text-[12px] font-semibold">Sem</th>
                <th className="text-left px-5 py-4 text-[12px] font-semibold">Section</th>
                <th className="text-left px-5 py-4 text-[12px] font-semibold">IA-1</th>
                <th className="text-left px-5 py-4 text-[12px] font-semibold">IA-2</th>
                <th className="text-left px-5 py-4 text-[12px] font-semibold">CIA</th>
                <th className="text-left px-5 py-4 text-[12px] font-semibold">Semester Marks</th>
                <th className="text-left px-5 py-4 rounded-r-xl text-[12px] font-semibold">Pass/Fail Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => {
                const s = summarizeStudent(student);
                return (
                  <tr key={index} className="border-b border-gray-100 bg-white hover:bg-gray-50 transition">
                    <td className="px-5 py-5 text-[12px]">{student.usn}</td>
                    <td className="px-5 py-5 font-medium text-[12px]">{student.name}</td>
                    <td className="px-5 py-5 text-[12px]">{student.dept}</td>
                    <td className="px-5 py-5 text-[12px]">{student.sem}</td>
                    <td className="px-5 py-5 text-[12px]">{student.section}</td>
                    <td className="px-5 py-5 text-[12px]">{s.ia1}</td>
                    <td className="px-5 py-5 text-[12px]">{s.ia2}</td>
                    <td className="px-5 py-5 text-[12px]">{s.cia}</td>
                    <td className="px-5 py-5 text-[12px] font-semibold">{s.semMarks}</td>
                    <td className="px-5 py-5">
                      <span
                        className={`px-3 py-1 rounded-lg text-[12px] font-medium ${
                          s.status === "Pass" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
