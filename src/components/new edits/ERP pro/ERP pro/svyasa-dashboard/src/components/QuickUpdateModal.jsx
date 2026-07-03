import { useState } from "react";

export default function QuickUpdateModal({ student, onClose, onSave }) {
  const [form, setForm] = useState({
    balance: String(student?.balance ?? 0),
    pending: String(student?.pending ?? 0),
    remark: student?.remark ?? "",
  });

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Quick Update</h3>
        <p className="text-xs text-gray-500 mt-1">
          {student.name} ({student.usn})
        </p>

        <div className="mt-4 space-y-3">
          <label className="block text-xs text-gray-600">
            Balance
            <input
              type="number"
              value={form.balance}
              onChange={(e) => setForm((prev) => ({ ...prev, balance: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-gray-600">
            Pending approvals
            <input
              type="number"
              value={form.pending}
              onChange={(e) => setForm((prev) => ({ ...prev, pending: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-gray-600">
            Remark
            <textarea
              rows={3}
              value={form.remark}
              onChange={(e) => setForm((prev) => ({ ...prev, remark: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Add remark"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave({
                balance: Number(form.balance) || 0,
                pending: Number(form.pending) || 0,
                remark: form.remark,
              });
              onClose();
            }}
            className="rounded-md bg-red-800 px-4 py-2 text-sm font-medium text-white hover:bg-red-900"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
