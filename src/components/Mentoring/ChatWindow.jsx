import { useMemo, useState } from "react";

export default function ChatWindow({ title = "Mentoring Bot", heightClass = "h-[360px]" }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [
    { id: "m1", from: "bot", text: "Hi! Ask me anything about mentoring (mock bot)." },
  ]);

  const suggestions = useMemo(
    () => ["How to generate hall ticket?", "Show low attendance students", "How to assign a task?"],
    []
  );

  function send() {
    const text = input.trim();
    if (!text) return;
    const userMsg = { id: `u-${Date.now()}`, from: "user", text };
    const botMsg = {
      id: `b-${Date.now() + 1}`,
      from: "bot",
      text: "This is a mock assistant. For now, use the profile modal → Hall Ticket / Tasks sections.",
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  }

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      <div className="border-b border-border px-3 py-2 text-[12.5px] font-bold text-text">{title}</div>
      <div className={`flex flex-col ${heightClass}`}>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-page-bg">
          {messages.map((m) => (
            <div
              key={m.id}
              className={[
                "max-w-[85%] rounded-xl px-3 py-2 text-[12.5px] leading-snug",
                m.from === "user"
                  ? "ml-auto bg-[#7B1D2E] text-white rounded-br-sm"
                  : "bg-white border border-border text-text rounded-bl-sm",
              ].join(" ")}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className="border-t border-border p-2">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setInput(s)}
                className="rounded-full border border-border bg-white px-2.5 py-1 text-[11px] font-semibold text-text2 hover:bg-page-bg"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-[13px] text-text outline-none"
            />
            <button
              type="button"
              onClick={send}
              className="rounded-lg bg-[#7B1D2E] px-3 py-2 text-[12.5px] font-semibold text-white hover:opacity-95"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

