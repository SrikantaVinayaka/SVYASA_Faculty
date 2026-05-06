import React, { useMemo, useState } from "react";

export default function IA_Mean() {
  const [semester, setSemester] = useState("Semester 2");
  const [section, setSection] = useState("A");
  const [activeTab, setActiveTab] = useState("IA 1");

  const subjects = [
    {
      code: "MCA201",
      subject: "Machine Learning",
      students: 58,
      average: 42,
      highest: 49,
      lowest: 24,
      maxMarks: 50,
      passedStudents: 52,
    },
    {
      code: "MCA202",
      subject: "Computer Architecture",
      students: 60,
      average: 31,
      highest: 46,
      lowest: 18,
      maxMarks: 50,
      passedStudents: 40,
    },
    {
      code: "MCA203",
      subject: "DBMS",
      students: 57,
      average: 22,
      highest: 39,
      lowest: 12,
      maxMarks: 50,
      passedStudents: 28,
    },
    {
      code: "MCA204",
      subject: "Research Methodology",
      students: 61,
      average: 44,
      highest: 50,
      lowest: 29,
      maxMarks: 50,
      passedStudents: 58,
    },
    {
      code: "MCA205",
      subject: "Java Programming Lab",
      students: 59,
      average: 39,
      highest: 48,
      lowest: 21,
      maxMarks: 50,
      passedStudents: 50,
    },
  ];

  const processedSubjects = subjects.map((item) => {
    const meanPercentage = Math.round(
      (item.average / item.maxMarks) * 100
    );

    const passPercentage = Math.round(
      (item.passedStudents / item.students) * 100
    );

    let grade = "C";

    if (meanPercentage >= 85) {
      grade = "O";
    } else if (meanPercentage >= 75) {
      grade = "A";
    } else if (meanPercentage >= 60) {
      grade = "B";
    }

    return {
      ...item,
      meanPercentage,
      passPercentage,
      grade,
    };
  });

  const overallMean = Math.round(
    processedSubjects.reduce(
      (acc, item) => acc + item.meanPercentage,
      0
    ) / processedSubjects.length
  );

  const highestMean = Math.max(
    ...processedSubjects.map((item) => item.meanPercentage)
  );

  const lowestMean = Math.min(
    ...processedSubjects.map((item) => item.meanPercentage)
  );

  const below50Count = processedSubjects.filter(
    (item) => item.meanPercentage < 50
  ).length;

  const highestSubject = useMemo(() => {
    return processedSubjects.reduce((prev, current) =>
      prev.meanPercentage > current.meanPercentage
        ? prev
        : current
    );
  }, []);

  const lowestSubject = useMemo(() => {
    return processedSubjects.reduce((prev, current) =>
      prev.meanPercentage < current.meanPercentage
        ? prev
        : current
    );
  }, []);

  const getProgressColor = (value) => {
    if (value >= 75) return "bg-green-500";
    if (value >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getGradeStyle = (grade) => {
    switch (grade) {
      case "O":
        return "bg-green-100 text-green-700";
      case "A":
        return "bg-blue-100 text-blue-700";
      case "B":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-6">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          IA Mean Percentage
        </h1>

        <p className="text-gray-500 mt-2">
          View average internal assessment performance across all
          subjects
        </p>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
          {/* Semester */}
          <div>
            <label className="block text-sm text-gray-500 mb-2">
              Semester
            </label>

            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 w-52 outline-none focus:ring-2 focus:ring-red-400"
            >
              <option>Semester 1</option>
              <option>Semester 2</option>
              <option>Semester 3</option>
              <option>Semester 4</option>
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="block text-sm text-gray-500 mb-2">
              Section
            </label>

            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 w-52 outline-none focus:ring-2 focus:ring-red-400"
            >
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>
          </div>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-3 mt-6">
          {[
            "IA 1",
            "IA 2",
            "IA 3",
            "Assignment",
            "Lab Internal",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "bg-[#991b1b] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Overall IA Mean %
          </p>

          <h2 className="text-3xl font-bold text-[#991b1b] mt-2">
            {overallMean}%
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Highest IA Mean %
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {highestMean}%
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Lowest IA Mean %
          </p>

          <h2 className="text-3xl font-bold text-red-500 mt-2">
            {lowestMean}%
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Subjects Below 50%
          </p>

          <h2 className="text-3xl font-bold text-yellow-600 mt-2">
            {below50Count}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Total Subjects
          </p>

          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            {processedSubjects.length}
          </h2>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-68.75">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-gray-700">
                  Subject Code
                </th>

                <th className="text-left px-6 py-4 text-gray-700">
                  Subject Name
                </th>

                <th className="text-left px-6 py-4 text-gray-700">
                  Students Appeared
                </th>

                <th className="text-left px-6 py-4 text-gray-700">
                  Average Score
                </th>

                <th className="text-left px-6 py-4 text-gray-700">
                  Highest Score
                </th>

                <th className="text-left px-6 py-4 text-gray-700">
                  Lowest Score
                </th>

                <th className="text-left px-6 py-4 text-gray-700">
                  Pass %
                </th>

                <th className="text-left px-6 py-4 text-gray-700">
                  IA Mean %
                </th>

                <th className="text-left px-6 py-4 text-gray-700">
                  Grade
                </th>
              </tr>
            </thead>

            <tbody>
              {processedSubjects.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-5 font-medium text-gray-700">
                    {item.code}
                  </td>

                  <td className="px-6 py-5">
                    {item.subject}
                  </td>

                  <td className="px-6 py-5">
                    {item.students}
                  </td>

                  <td className="px-6 py-5">
                    {item.average}/{item.maxMarks}
                  </td>

                  <td className="px-6 py-5 text-green-600 font-semibold">
                    {item.highest}
                  </td>

                  <td className="px-6 py-5 text-red-500 font-semibold">
                    {item.lowest}
                  </td>

                  <td className="px-6 py-5">
                    {item.passPercentage}%
                  </td>

                  {/* PROGRESS */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getProgressColor(
                            item.meanPercentage
                          )}`}
                          style={{
                            width: `${item.meanPercentage}%`,
                          }}
                        ></div>
                      </div>

                      <span className="font-medium text-sm">
                        {item.meanPercentage}%
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeStyle(
                        item.grade
                      )}`}
                    >
                      {item.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Faculty Insight
          </h3>

          <p className="text-gray-600">
            <span className="font-semibold text-green-600">
              {highestSubject.subject}
            </span>{" "}
            has the highest IA mean with{" "}
            <span className="font-bold">
              {highestSubject.meanPercentage}%
            </span>
            .
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Improvement Needed
          </h3>

          <p className="text-gray-600">
            <span className="font-semibold text-red-500">
              {lowestSubject.subject}
            </span>{" "}
            has the lowest IA performance and may require additional
            mentoring support.
          </p>
        </div>
      </div>
    </div>
  );
}