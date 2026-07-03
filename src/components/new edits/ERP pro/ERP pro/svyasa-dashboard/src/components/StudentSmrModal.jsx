import { useState } from "react";

export default function StudentSmrModal({ student, onClose }) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-lg border border-gray-300 bg-white overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold">Student Record</h2>
              <p className="text-xs text-blue-100">SMR</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded text-sm font-medium flex items-center gap-2">
              <span>⬇</span> Download
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-xl font-bold"
            >
              ←
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Student Header */}
          <div className="flex items-start gap-6 pb-4 border-b border-gray-200">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{student.name.toUpperCase()}</h3>
              <p className="text-sm text-gray-600">USN : {student.usn}</p>
              <p className="text-sm text-gray-600">{student.degree}, Semester {student.sem}, Section {student.sec}</p>
            </div>
            <div className="w-24 h-28 bg-gray-200 rounded flex items-center justify-center">
              <div className="text-2xl">📷</div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Student Basic Information */}
              <div className="border border-gray-300 rounded overflow-hidden">
                <div className="bg-red-700 text-white px-4 py-2 flex items-center gap-2">
                  <span>👤</span>
                  <span className="font-semibold">Student Basic Information</span>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Date of Birth</span>
                    <span className="text-gray-600">: {student.dob || "NA"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Date of Joining</span>
                    <span className="text-gray-600">: {student.registrationDate || "NA"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email Id</span>
                    <p className="text-gray-600 text-xs break-words">{student.email || "NA"}</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Mobile Number</span>
                    <span className="text-gray-600">: {student.mobile || "NA"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Local Address</span>
                    <span className="text-gray-600">: {student.address || "NA"}</span>
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div className="border border-gray-300 rounded overflow-hidden">
                <div className="bg-red-700 text-white px-4 py-2 flex items-center gap-2">
                  <span>👨‍👩‍👧</span>
                  <span className="font-semibold">Parent / Guardian Information</span>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Father's / Guardian's Name</span>
                    <span className="text-gray-600">: {student.fatherName || "NA"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Father's / Guardian's Occupation</span>
                    <span className="text-gray-600">: NA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Father's Email Id</span>
                    <span className="text-gray-600">: NA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Father's Mobile Number</span>
                    <span className="text-gray-600">: NA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Mother's Name</span>
                    <span className="text-gray-600">: {student.motherName || "NA"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Mother's Occupation</span>
                    <span className="text-gray-600">: NA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Mother's Email Id</span>
                    <span className="text-gray-600">: NA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Mother's Mobile Number</span>
                    <span className="text-gray-600">: NA</span>
                  </div>
                </div>
              </div>

              {/* Mentor Information */}
              <div className="border border-gray-300 rounded overflow-hidden">
                <div className="bg-red-700 text-white px-4 py-2 flex items-center gap-2">
                  <span>👨‍🏫</span>
                  <span className="font-semibold">Mentor Information</span>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Mentor Name</span>
                    <span className="text-gray-600">: {student.mentorName || "NA"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Mentor's Contact Number</span>
                    <span className="text-gray-600">: 9902084476</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-4">
              {/* Admission Details */}
              <div className="border border-gray-300 rounded overflow-hidden">
                <div className="bg-red-700 text-white px-4 py-2 flex items-center gap-2">
                  <span>📋</span>
                  <span className="font-semibold">Admission Details</span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Rank</span>
                    <p className="text-gray-600">: {student.rank || "NA"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Current Semester</span>
                    <p className="text-gray-600">: {student.sem}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Basic Category</span>
                    <p className="text-gray-600">: {student.category || "NA"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Hostel Resident</span>
                    <p className="text-gray-600">: {student.hostelResident || "NO"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Admission Category</span>
                    <p className="text-gray-600">: NA</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Department</span>
                    <p className="text-gray-600">: {student.dept}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Degree</span>
                    <p className="text-gray-600">: {student.degree || "NA"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Transportation</span>
                    <p className="text-gray-600">: NO</p>
                  </div>
                </div>
              </div>

              {/* Education Details */}
              <div className="border border-gray-300 rounded overflow-hidden">
                <div className="bg-red-700 text-white px-4 py-2 flex items-center gap-2">
                  <span>🎓</span>
                  <span className="font-semibold">Education Details</span>
                </div>
                <div className="p-4 text-sm text-gray-600">
                  <p>Continuing from previous education records...</p>
                </div>
              </div>

              {/* Unit Test Scores & Attendance */}
              <div className="border border-gray-300 rounded overflow-hidden">
                <div className="bg-red-700 text-white px-4 py-2">
                  <span className="font-semibold">Current Semester (Semester {student.sem}) Unit test Scores And Attendance Details</span>
                </div>
                <div className="p-4 text-center text-gray-600 text-sm">
                  <p>Enrolled Subjects not available</p>
                </div>
              </div>

              {/* University Exam Results */}
              <div className="border border-gray-300 rounded overflow-hidden">
                <div className="bg-red-700 text-white px-4 py-2">
                  <span className="font-semibold">University Exam Results</span>
                </div>
                <div className="p-4 text-center text-gray-600 text-sm">
                  <p>Final exam data not available</p>
                </div>
              </div>

              {/* Backlogs */}
              <div className="border border-gray-300 rounded overflow-hidden">
                <div className="bg-red-700 text-white px-4 py-2">
                  <span className="font-semibold">Backlogs</span>
                </div>
                <div className="p-4 text-center text-gray-600 text-sm">
                  <p>No Backlogs</p>
                </div>
              </div>

              {/* 10th And 12th Percentage */}
              <div className="border border-gray-300 rounded overflow-hidden">
                <div className="bg-red-700 text-white px-4 py-2">
                  <span className="font-semibold">10th And 12th Percentage</span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">10th Percentage</p>
                    <p className="text-gray-600">{student.tenthPercentage || "NA"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">12th Percentage</p>
                    <p className="text-gray-600">{student.twelfthPercentage || "NA"}</p>
                  </div>
                </div>
              </div>

              {/* Technical Skills */}
              <div className="border border-gray-300 rounded overflow-hidden">
                <div className="bg-red-700 text-white px-4 py-2">
                  <span className="font-semibold">Technical Skills</span>
                </div>
                <div className="p-4 text-sm">
                  <p className="text-gray-600">{student.skills || "NA"}</p>
                </div>
              </div>

              {/* NEW: Assigned Work & Certificates */}
              <div className="border border-gray-300 rounded overflow-hidden">
                <div className="bg-red-700 text-white px-4 py-2">
                  <span className="font-semibold">Assigned Work & Certificates</span>
                </div>
                <div className="p-4 space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Assigned Work</p>
                    <p className="text-gray-600">{student.assignedWork || "NA"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Certificates</p>
                    <p className="text-gray-600">{student.certificates || "NA"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
