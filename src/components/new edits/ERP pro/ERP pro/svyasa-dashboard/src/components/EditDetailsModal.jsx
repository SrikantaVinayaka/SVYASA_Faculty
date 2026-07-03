import { useState } from "react";

export default function EditDetailsModal({ student, onClose, onSave }) {
  const [form, setForm] = useState({
    mobile: student?.mobile ?? "",
    email: student?.email ?? "",
    degree: student?.degree ?? "",
    department: student?.dept ?? "",
    balance: student?.balance ?? 0,
    pending: student?.pending ?? 0,
    remark: student?.remark ?? "",
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="bg-red-800 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Edit Student Details</div>
            <div className="text-sm text-white/80">{student.name} ({student.usn})</div>
          </div>
          <button onClick={onClose} className="text-white/90 hover:text-white">x</button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm text-gray-700">
              Mobile
              <input
                value={form.mobile}
                onChange={(e) => update("mobile", e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-gray-700">
              Email
              <input
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-gray-700">
              Degree
              <input
                value={form.degree}
                onChange={(e) => update("degree", e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-gray-700">
              Department
              <input
                value={form.department}
                onChange={(e) => update("department", e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-gray-700">
              Balance
              <input
                type="number"
                value={form.balance}
                onChange={(e) => update("balance", Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-gray-700">
              Pending Approvals
              <input
                type="number"
                value={form.pending}
                onChange={(e) => update("pending", Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="text-sm text-gray-700 block">
            Remark
            <textarea
              value={form.remark}
              onChange={(e) => update("remark", e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div className="bg-gray-50 border-t border-gray-200 px-5 py-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="rounded-md bg-red-800 px-4 py-2 text-sm font-medium text-white hover:bg-red-900"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
