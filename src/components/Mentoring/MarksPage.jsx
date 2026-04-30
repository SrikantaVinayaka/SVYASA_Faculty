import { useMemo, useState } from "react";

const tabs = [
  { id: "internal", label: "Internal Marks" },
  { id: "lab", label: "Lab" },
  { id: "sem", label: "Sem Result" },
];

const defaultTheory = [
  { code: "BCA2AECKA02", subject: "Ganaka Sowrabha-2", att: 88, ia1: 24, ia2: 22, cia: 20, total: 39 },
  { code: "BCA2DSC04", subject: "Computer Architecture", att: 72, ia1: 18, ia2: 20, cia: 18, total: 38 },
  { code: "BCA2DSC05", subject: "OOP using Java", att: 65, ia1: 15, ia2: 18, cia: 16, total: 33 },
];

const defaultLab = [
  { code: "BCA2PRA05", subject: "Java Programming Lab", att: 80, cia: 22, total: 27 },
  { code: "BCA2PRA06", subject: "DBMS Lab", att: 85, cia: 20, total: 24 },
];

const semResult = [
  { code: "BCA2AECKA02", name: "Ganaka Sowrabha-2", scored: 64, min: 40, credits: 3, status: "Pass" },
  { code: "BCA2DSC04", name: "Computer Architecture", scored: 28, min: 40, credits: 3, status: "Fail" },
  { code: "BCA2DSC05", name: "OOP using Java", scored: 41, min: 40, credits: 3, status: "Pass" },
];

export default function MarksPage({ students }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("internal");
  const [selectedUsn, setSelectedUsn] = useState("");

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.usn.toLowerCase().includes(query)
    );
  }, [search, students]);

  const selectedStudent = students.find((student) => student.usn === selectedUsn) ?? null;

  return (
    <div>
      <div className="flex items-center gap-1 text-sm my-4">
        <span className="text-red-800 font-medium">Marks Score</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-500">Assessment</span>
      </div>

      <div className="mb-3 flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 bg-white w-full lg:max-w-md">
          <input
            type="text"
            className="text-sm outline-none w-full text-gray-700 placeholder-gray-400"
            placeholder="Search by USN or name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <span className="text-xs text-gray-500">
          Select a student to view Internal, Lab and Sem Result tabs
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm min-w-190">
          <thead>
            <tr className="bg-red-800 text-white">
              <th className="px-3 py-3 text-left font-semibold">USN</th>
              <th className="px-3 py-3 text-left font-semibold">Name</th>
              <th className="px-3 py-3 text-left font-semibold">Dept</th>
              <th className="px-3 py-3 text-left font-semibold">Sem</th>
              <th className="px-3 py-3 text-left font-semibold">Section</th>
              <th className="px-3 py-3 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.usn} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-3 text-gray-700">{student.usn}</td>
                <td className="px-3 py-3 text-gray-800 font-medium">{student.name}</td>
                <td className="px-3 py-3 text-gray-600">{student.dept}</td>
                <td className="px-3 py-3 text-gray-600">{student.semester}</td>
                <td className="px-3 py-3 text-gray-600">{student.section}</td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    className="text-xs font-semibold text-red-800 hover:text-red-900 underline underline-offset-2"
                    onClick={() => setSelectedUsn(student.usn)}
                  >
                    Open marks
                  </button>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-gray-400">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedStudent && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="font-semibold text-gray-900">{selectedStudent.name}</div>
            <div className="text-xs text-gray-500">
              {selectedStudent.usn} - {selectedStudent.dept} - Sem {selectedStudent.semester}
            </div>
          </div>
          <div className="px-4 pt-3 border-b border-gray-100 flex gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 px-1 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? "border-red-800 text-red-800"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-4">
            {activeTab === "internal" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-162.5">
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
                    {defaultTheory.map((row, index) => (
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
            )}
            {activeTab === "lab" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-125">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="px-3 py-2 text-left">SL</th>
                      <th className="px-3 py-2 text-left">Code</th>
                      <th className="px-3 py-2 text-left">Subject</th>
                      <th className="px-3 py-2 text-center">Att %</th>
                      <th className="px-3 py-2 text-center">CIA</th>
                      <th className="px-3 py-2 text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defaultLab.map((row, index) => (
                      <tr key={row.code} className="border-t border-gray-100">
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2 text-gray-600">{row.code}</td>
                        <td className="px-3 py-2">{row.subject}</td>
                        <td className="px-3 py-2 text-center">{row.att}%</td>
                        <td className="px-3 py-2 text-center">{row.cia}</td>
                        <td className="px-3 py-2 text-center font-medium">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === "sem" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm    ">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="px-3 py-2 text-left">SL</th>
                      <th className="px-3 py-2 text-left">Code</th>
                      <th className="px-3 py-2 text-left">Course Name</th>
                      <th className="px-3 py-2 text-center">Scored</th>
                      <th className="px-3 py-2 text-center">Min</th>
                      <th className="px-3 py-2 text-center">Credits</th>
                      <th className="px-3 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {semResult.map((row, index) => (
                      <tr key={`${row.code}-${index}`} className="border-t border-gray-100">
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2 text-gray-600">{row.code}</td>
                        <td className="px-3 py-2">{row.name}</td>
                        <td className="px-3 py-2 text-center">{row.scored}</td>
                        <td className="px-3 py-2 text-center">{row.min}</td>
                        <td className="px-3 py-2 text-center">{row.credits}</td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${
                              row.status === "Pass"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
