import { useMemo, useState } from "react";

function parseChecklist(text) {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function TaskModal({ open, onClose, onCreate, defaultIsCIA = false }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [dateAssigned, setDateAssigned] = useState(today);
  const [status, setStatus] = useState("Pending");
  const [checklistText, setChecklistText] = useState("- ");
  const [deadline, setDeadline] = useState("");
  const [isCIA, setIsCIA] = useState(defaultIsCIA);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-[14px] font-bold text-text">Create Task</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-white px-2 py-1 text-[12px] font-semibold text-text hover:bg-page-bg"
          >
            Close
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[12px] font-semibold text-text2">
              Date Assigned
              <input
                type="date"
                value={dateAssigned}
                onChange={(e) => setDateAssigned(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-[13px] text-text outline-none"
              />
            </label>
            <label className="text-[12px] font-semibold text-text2">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-[13px] text-text outline-none"
              >
                <option>Pending</option>
                <option>Completed</option>
              </select>
            </label>
          </div>

          <label className="text-[12px] font-semibold text-text2">
            Checklist (one item per line)
            <textarea
              value={checklistText}
              onChange={(e) => setChecklistText(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-[13px] text-text outline-none"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
            <label className="text-[12px] font-semibold text-text2">
              Deadline
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-[13px] text-text outline-none"
              />
            </label>

            <label className="flex items-center gap-2 text-[12px] font-semibold text-text2">
              <input type="checkbox" checked={isCIA} onChange={(e) => setIsCIA(e.target.checked)} />
              Mark as CIA task
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] font-semibold text-text hover:bg-page-bg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const checklist = parseChecklist(checklistText);
                onCreate?.({
                  id: `task-${Date.now()}`,
                  dateAssigned,
                  status,
                  checklist,
                  deadline,
                  isCIA,
                  createdBy: "Mentor",
                });
                onClose?.();
              }}
              className="rounded-lg bg-[#7B1D2E] px-3 py-2 text-[12.5px] font-semibold text-white hover:opacity-95"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

