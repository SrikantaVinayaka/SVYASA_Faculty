import React, { useState } from "react";

const studentsData = [
  {
    usn: "2222509006",
    name: "Abhishek Sajjan",
    dept: "MCA",
    sem: 2,
    section: "B",

    internalMarks: [
      {
        code: "BCA2AECKA02",
        subject: "Ganaka Sowrabha-2",
        attendance: "88%",
        ia1: 24,
        ia2: 22,
        cia: 20,
      },
      {
        code: "BCA2DSC04",
        subject: "Computer Architecture",
        attendance: "72%",
        ia1: 18,
        ia2: 20,
        cia: 18,
      },
      {
        code: "BCA2DSC05",
        subject: "OOP using Java",
        attendance: "65%",
        ia1: 15,
        ia2: 18,
        cia: 16,
      },
    ],

    labMarks: [
      {
        code: "BCA2PRA05",
        subject: "Java Programming Lab",
        attendance: "80%",
        cia: 22,
        total: 27,
      },
      {
        code: "BCA2PRA06",
        subject: "DBMS Lab",
        attendance: "85%",
        cia: 20,
        total: 24,
      },
    ],

    semResults: [
      {
        code: "BCA2AECKA02",
        course: "Ganaka Sowrabha-2",
        scored: 64,
        min: 40,
        credits: 3,
      },
      {
        code: "BCA2DSC04",
        course: "Computer Architecture",
        scored: 28,
        min: 40,
        credits: 3,
      },
      {
        code: "BCA2DSC05",
        course: "OOP using Java",
        scored: 41,
        min: 40,
        credits: 3,
      },
    ],
  },

  {
    usn: "2222509007",
    name: "Abhishek Shegunasi",
    dept: "MCA",
    sem: 2,
    section: "B",

    internalMarks: [
      {
        code: "MCA201",
        subject: "Data Structures",
        attendance: "90%",
        ia1: 22,
        ia2: 23,
        cia: 21,
      },
    ],

    labMarks: [
      {
        code: "MCALAB01",
        subject: "Python Lab",
        attendance: "92%",
        cia: 24,
        total: 28,
      },
    ],

    semResults: [
      {
        code: "MCA201",
        course: "Data Structures",
        scored: 75,
        min: 40,
        credits: 4,
      },
    ],
  },
];

export default function MarksScore() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("internal");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = studentsData.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.usn.includes(searchTerm)
  );

  return (
    <main
      className="flex-1 overflow-y-auto p-6 pb-20"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#D1D5DB transparent",
      }}
    >
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-[18px] font-bold text-text">Marks Score</h1>
        <p className="text-[13px] text-text2 mt-1">
          View internal, lab and semester results
        </p>
      </div>

      {/* TOP CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* SEARCH */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="Search by USN or name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-105 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-400 text-[13px]"
          />
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="bg-[#991b1b] text-white">
                <th className="text-left px-5 py-4 rounded-l-xl text-[12px] font-semibold">USN</th>
                <th className="text-left px-5 py-4 text-[12px] font-semibold">Name</th>
                <th className="text-left px-5 py-4 text-[12px] font-semibold">Dept</th>
                <th className="text-left px-5 py-4 text-[12px] font-semibold">Sem</th>
                <th className="text-left px-5 py-4 text-[12px] font-semibold">Section</th>
                <th className="text-left px-5 py-4 rounded-r-xl text-[12px] font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 bg-white hover:bg-gray-50 transition"
                >
                  <td className="px-5 py-5 text-[12px]">{student.usn}</td>
                  <td className="px-5 py-5 font-medium text-[12px]">{student.name}</td>
                  <td className="px-5 py-5 text-[12px]">{student.dept}</td>
                  <td className="px-5 py-5 text-[12px]">{student.sem}</td>
                  <td className="px-5 py-5 text-[12px]">{student.section}</td>

                  <td className="px-5 py-5">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="text-red-700 font-medium hover:underline text-[12px]"
                    >
                      Open Marks
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT DETAILS */}
      {selectedStudent && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
          {/* STUDENT INFO */}
          <div className="mb-6">
            <h2 className="text-[16px] font-bold text-text">
              {selectedStudent.name}
            </h2>

            <p className="text-[12px] text-text2 mt-1">
              {selectedStudent.usn} • {selectedStudent.dept} • Sem{" "}
              {selectedStudent.sem}
            </p>
          </div>

          {/* TABS */}
          <div className="overflow-x-auto">
            <div className="flex gap-8 border-b border-gray-200 mb-6 min-w-max">
            <button
              onClick={() => setActiveTab("internal")}
              className={`pb-3 text-[14px] font-medium transition ${
                activeTab === "internal"
                  ? "text-red-700 border-b-2 border-red-700"
                  : "text-gray-500"
              }`}
            >
              Internal Marks
            </button>

            <button
              onClick={() => setActiveTab("lab")}
              className={`pb-3 text-[14px] font-medium transition ${
                activeTab === "lab"
                  ? "text-red-700 border-b-2 border-red-700"
                  : "text-gray-500"
              }`}
            >
              Lab
            </button>

            <button
              onClick={() => setActiveTab("sem")}
              className={`pb-3 text-[14px] font-medium transition ${
                activeTab === "sem"
                  ? "text-red-700 border-b-2 border-red-700"
                  : "text-gray-500"
              }`}
            >
              Sem Result
            </button>
            </div>
          </div>

          {/* INTERNAL MARKS */}
          {activeTab === "internal" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px]">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">SL</th>
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">Code</th>
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">Subject</th>
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">Att %</th>
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">IA-1</th>
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">IA-2</th>
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">CIA</th>
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedStudent.internalMarks.map((item, index) => {
                    const total = item.ia1 + item.ia2 + item.cia;

                    return (
                      <tr
                        key={index}
                        className="border-b border-gray-100"
                      >
                        <td className="px-4 py-4 text-[12px]">{index + 1}</td>
                        <td className="px-4 py-4 text-[12px]">{item.code}</td>
                        <td className="px-4 py-4 text-[12px]">{item.subject}</td>
                        <td className="px-4 py-4 text-[12px]">{item.attendance}</td>
                        <td className="px-4 py-4 text-[12px]">{item.ia1}</td>
                        <td className="px-4 py-4 text-[12px]">{item.ia2}</td>
                        <td className="px-4 py-4 text-[12px]">{item.cia}</td>
                        <td className="px-4 py-4 font-semibold text-[12px]">
                          {total}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* LAB MARKS */}
          {activeTab === "lab" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">SL</th>
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">Code</th>
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">Subject</th>
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">Att %</th>
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">CIA</th>
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedStudent.labMarks.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-4 py-4 text-[12px]">{index + 1}</td>
                      <td className="px-4 py-4 text-[12px]">{item.code}</td>
                      <td className="px-4 py-4 text-[12px]">{item.subject}</td>
                      <td className="px-4 py-4 text-[12px]">{item.attendance}</td>
                      <td className="px-4 py-4 text-[12px]">{item.cia}</td>
                      <td className="px-4 py-4 font-semibold text-[12px]">
                        {item.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SEM RESULT */}
          {activeTab === "sem" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px]">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">SL</th>
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">Code</th>
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">Course Name</th>
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">Scored</th>
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">Min</th>
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">Credits</th>
                    <th className="text-left px-4 py-4 text-[12px] font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedStudent.semResults.map((item, index) => {
                    const passed = item.scored >= item.min;

                    return (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="px-4 py-4 text-[12px]">{index + 1}</td>
                        <td className="px-4 py-4 text-[12px]">{item.code}</td>
                        <td className="px-4 py-4 text-[12px]">{item.course}</td>
                        <td className="px-4 py-4 text-[12px]">{item.scored}</td>
                        <td className="px-4 py-4 text-[12px]">{item.min}</td>
                        <td className="px-4 py-4 text-[12px]">{item.credits}</td>

                        <td className="px-4 py-4">
                          <span
                            className={`px-4 py-1 rounded-lg text-sm font-medium ${
                              passed
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {passed ? "Pass" : "Fail"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}