import { useState } from "react";

export default function MeetingModalNew({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    meetingType: "Individual",
    subject: "",
    student: "",
    meetingDate: "",
    location: "",
    online: "No",
    startTime: "",
    endTime: "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.subject || !form.student || !form.meetingDate || !form.startTime || !form.endTime) {
      alert("Please fill all required fields");
      return;
    }
    onSubmit(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-lg border border-gray-300 bg-white overflow-hidden">
        {/* Header */}
        <div className="bg-blue-100 border-b border-gray-300 px-6 py-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Meeting Mentor</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-light"
          >
            ×
          </button>
        </div>

        {/* Content - Compact Grid */}
        <div className="p-4 space-y-3">
          {/* Meeting Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Meeting Type <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="meetingType"
                  value="Individual"
                  checked={form.meetingType === "Individual"}
                  onChange={(e) => handleChange("meetingType", e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-xs text-gray-700">Individual</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="meetingType"
                  value="Group"
                  checked={form.meetingType === "Group"}
                  onChange={(e) => handleChange("meetingType", e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-xs text-gray-700">Group</span>
              </label>
            </div>
          </div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Subject */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Subject <span className="text-red-600">*</span>
              </label>
              <select
                value={form.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option value="Academic Discussion">Academic Discussion</option>
                <option value="Career Guidance">Career Guidance</option>
                <option value="Personal Issues">Personal Issues</option>
                <option value="Project Review">Project Review</option>
              </select>
            </div>

            {/* Select Student */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Select student <span className="text-red-600">*</span>
              </label>
              <select
                value={form.student}
                onChange={(e) => handleChange("student", e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Choose a student</option>
                <option value="B Deepthi">B Deepthi (U18BP22S0046)</option>
                <option value="Arun Kumar">Arun Kumar (U18BP22S0047)</option>
                <option value="Priya Sharma">Priya Sharma (U18BP22S0048)</option>
              </select>
            </div>

            {/* Meeting Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Meeting Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={form.meetingDate}
                onChange={(e) => handleChange("meetingDate", e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Meeting Start Time <span className="text-red-600">*</span>
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Meeting End Time <span className="text-red-600">*</span>
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Location - Full width */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Meeting location <span className="text-red-600">*</span>
              </label>
              <textarea
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
                rows={2}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter meeting location details"
              />
            </div>
          </div>

          {/* Schedule Online Meeting */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Schedule Online Meeting
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="online"
                  value="Yes"
                  checked={form.online === "Yes"}
                  onChange={(e) => handleChange("online", e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-xs text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="online"
                  value="No"
                  checked={form.online === "No"}
                  onChange={(e) => handleChange("online", e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-xs text-gray-700">No</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-300 px-6 py-3 flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded text-sm font-medium flex items-center gap-2"
          >
            <span>✓</span> Submit
          </button>
        </div>
      </div>
    </div>
  );
}
