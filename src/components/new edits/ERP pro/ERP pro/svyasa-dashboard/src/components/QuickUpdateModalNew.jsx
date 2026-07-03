import { useState } from "react";

export default function QuickUpdateModalNew({ student, onClose, onSave }) {
  const [form, setForm] = useState({
    name: student?.name ?? "",
    mobile: student?.mobile ?? "",
    personalEmail: student?.email ?? "",
    officialEmail: "",
    remarks: student?.remark ?? "",
    degree: student?.degree ?? "",
    department: student?.dept ?? "",
    academicYear: "2025-26",
    joiningYear: "2025-26",
    degreeYear: student?.sem ?? "1",
    semesterNumber: student?.sem ?? "1",
    usn: student?.usn ?? "",
    section: student?.sec ?? "A",
    status: "Regular",
    referral: "",
    degreeBatch: "REGULAR",
    scheme: "2025",
  });

  if (!student) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave({
      mobile: form.mobile,
      personalEmail: form.personalEmail,
      officialEmail: form.officialEmail,
      remarks: form.remarks,
      degree: form.degree,
      department: form.department,
      section: form.section,
      status: form.status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-lg border border-gray-300 bg-white overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-red-700 text-white px-6 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Quick Update</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Student Name and Photo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {/* Student Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name (As per 10th Standard Marks Card)
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    disabled
                    className="w-full px-3 py-2 border-b border-gray-300 bg-white text-gray-700 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    className="w-full px-3 py-2 border-b border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Emails */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Personal Email Id
                  </label>
                  <input
                    type="email"
                    value={form.personalEmail}
                    onChange={(e) => handleChange("personalEmail", e.target.value)}
                    className="w-full px-3 py-2 border-b border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Official Email Id
                  </label>
                  <input
                    type="email"
                    value={form.officialEmail}
                    onChange={(e) => handleChange("officialEmail", e.target.value)}
                    className="w-full px-3 py-2 border-b border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <input
                  type="text"
                  value={form.remarks}
                  onChange={(e) => handleChange("remarks", e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Photo */}
            <div className="flex justify-center md:justify-start">
              <div className="w-32 h-40 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
                <div className="text-4xl text-gray-400">📷</div>
              </div>
            </div>
          </div>

          {/* Admission Details Section */}
          <div className="space-y-4">
            <div className="bg-red-700 text-white px-4 py-2 font-semibold">
              Admission Details
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Degree <span className="text-red-600">*</span>
                </label>
                <select
                  value={form.degree}
                  onChange={(e) => handleChange("degree", e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Degree</option>
                  <option value="Bachelor of Computer Applications">Bachelor of Computer Applications</option>
                  <option value="Master of Computer Applications">Master of Computer Applications</option>
                  <option value="Bachelor of Business Administration">Bachelor of Business Administration</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-600">*</span>
                </label>
                <select
                  value={form.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Department</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="BBA">BBA</option>
                </select>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year <span className="text-red-600">*</span>
                </label>
                <select
                  value={form.academicYear}
                  onChange={(e) => handleChange("academicYear", e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="2025-26">2025-26</option>
                  <option value="2024-25">2024-25</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Joining Academic Year <span className="text-red-600">*</span>
                </label>
                <select
                  value={form.joiningYear}
                  onChange={(e) => handleChange("joiningYear", e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="2025-26">2025-26</option>
                  <option value="2024-25">2024-25</option>
                </select>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Degree Year <span className="text-red-600">*</span>
                </label>
                <select
                  value={form.degreeYear}
                  onChange={(e) => handleChange("degreeYear", e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester Number <span className="text-red-600">*</span>
                </label>
                <select
                  value={form.semesterNumber}
                  onChange={(e) => handleChange("semesterNumber", e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  USN
                </label>
                <input
                  type="text"
                  value={form.usn}
                  disabled
                  className="w-full px-3 py-2 border-b border-gray-300 bg-gray-50 text-gray-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section
                </label>
                <select
                  value={form.section}
                  onChange={(e) => handleChange("section", e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-600">*</span>
                </label>
                <select
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Regular">Regular</option>
                  <option value="Lateral Entry">Lateral Entry</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referral
                </label>
                <input
                  type="text"
                  value={form.referral}
                  onChange={(e) => handleChange("referral", e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Row 6 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Degree Batch <span className="text-red-600">*</span>
                </label>
                <select
                  value={form.degreeBatch}
                  onChange={(e) => handleChange("degreeBatch", e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="REGULAR">REGULAR</option>
                  <option value="LATERAL">LATERAL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheme <span className="text-red-600">*</span>
                </label>
                <select
                  value={form.scheme}
                  onChange={(e) => handleChange("scheme", e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mandatory Fields Note */}
          <div className="text-xs text-gray-600">
            <span className="text-red-600">*</span> Mandatory Fields
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-300 px-6 py-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="border border-red-700 text-red-700 hover:bg-red-50 px-4 py-2 rounded text-sm font-medium"
          >
            × Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-1"
          >
            <span>✓</span> Update
          </button>
        </div>
      </div>
    </div>
  );
}
