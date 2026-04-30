import { useMemo, useState } from "react";
import ChatWindow from "./ChatWindow.jsx";
import TaskModal from "./TaskModal.jsx";

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-2 text-[12px] font-bold border-b-2",
        active ? "border-[#7B1D2E] text-[#7B1D2E]" : "border-transparent text-text2 hover:text-text",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function BotWidget({ students, onAssignTask }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState("chat"); // chat | expert | task
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students?.[0]?.id ?? "");
  const [expertMessage, setExpertMessage] = useState("");
  const [expertFiles, setExpertFiles] = useState([]);

  const sizeClass = expanded ? "w-[92vw] max-w-4xl h-[78vh]" : "w-[360px] h-[520px]";
  const studentOptions = useMemo(() => students ?? [], [students]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="fixed bottom-6 right-6 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-[#7B1D2E] text-white shadow-xl hover:opacity-95"
        aria-label="Open mentoring assistant"
        title="Mentoring Assistant"
      >
        🤖
      </button>

      {open ? (
        <div className={`fixed bottom-24 right-6 z-[70] overflow-hidden rounded-2xl border border-border bg-white shadow-2xl ${sizeClass}`}>
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <div className="text-[13px] font-bold text-text">Mentoring Assistant</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExpanded((p) => !p)}
                className="rounded-lg border border-border bg-white px-2 py-1 text-[12px] font-semibold text-text hover:bg-page-bg"
              >
                {expanded ? "Minimize" : "Expand"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-border bg-white px-2 py-1 text-[12px] font-semibold text-text hover:bg-page-bg"
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex gap-2 border-b border-border px-2">
            <TabButton active={tab === "chat"} onClick={() => setTab("chat")}>
              Chat
            </TabButton>
            <TabButton active={tab === "expert"} onClick={() => setTab("expert")}>
              Expert Connect
            </TabButton>
            <TabButton active={tab === "task"} onClick={() => setTab("task")}>
              Assign Task
            </TabButton>
          </div>

          <div className="h-[calc(100%-88px)] overflow-y-auto p-3">
            {tab === "chat" ? (
              <ChatWindow title="Chat" heightClass={expanded ? "h-[55vh]" : "h-[360px]"} />
            ) : null}

            {tab === "expert" ? (
              <div className="space-y-3">
                <div className="text-[12px] text-text2">
                  Send a message and upload a video (mock; file stays in memory).
                </div>
                <textarea
                  value={expertMessage}
                  onChange={(e) => setExpertMessage(e.target.value)}
                  rows={4}
                  placeholder="Type message to expert..."
                  className="w-full rounded-xl border border-border px-3 py-2 text-[13px] outline-none"
                />
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => setExpertFiles(Array.from(e.target.files ?? []))}
                />
                {expertFiles.length ? (
                  <div className="rounded-xl border border-border bg-page-bg p-3 text-[12px] text-text2">
                    <div className="font-semibold text-text">Selected files</div>
                    <ul className="mt-1 list-disc pl-5">
                      {expertFiles.map((f) => (
                        <li key={f.name}>{f.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setExpertMessage("");
                    setExpertFiles([]);
                    alert("Message sent (mock).");
                  }}
                  className="rounded-lg bg-[#7B1D2E] px-3 py-2 text-[12.5px] font-semibold text-white hover:opacity-95"
                >
                  Send
                </button>
              </div>
            ) : null}

            {tab === "task" ? (
              <div className="space-y-3">
                <div className="text-[12px] text-text2">Assign a task to a student via the bot.</div>
                <label className="block text-[12px] font-semibold text-text2">
                  Select student
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-[13px] text-text outline-none"
                  >
                    {studentOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.registerNo})
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(true)}
                  className="rounded-lg bg-[#0B4B5A] px-3 py-2 text-[12.5px] font-semibold text-white hover:opacity-95"
                >
                  Create Task (Bot)
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        defaultIsCIA={true}
        onCreate={(task) => {
          const payload = { ...task, createdBy: "Bot" };
          onAssignTask?.(selectedStudentId, payload);
        }}
      />
    </>
  );
}

