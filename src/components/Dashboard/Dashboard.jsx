import { useEffect, useMemo, useState } from "react";
import {
  ArrowsDownUp,
  Calendar,
  CaretDown,
  CaretUp,
  ClipboardText,
  ChartBar,
  BookOpen,
  FileText,
  Users,
  MagnifyingGlass,
  PlayCircle,
  SlidersHorizontal,
  X,
} from "@phosphor-icons/react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { label: "Classes Today",   value: "3",   sub: "2 remaining",      bg: "#FDE8EC", color: "#C0273D", emoji: "🗓" },
  { label: "Avg. Attendance", value: "87%", sub: "This semester",    bg: "#EDF7EE", color: "#2E7D32", emoji: "✅" },
];

const QUICK = [
  { id: "class-timetable", label: "Class Timetable", desc: "View today's schedule & upcoming classes", icon: Calendar, ac: "#1A7FBF", bg: "#E8F4FD", route: { id: "timetable", child: "Class Timetable" } },
  { id: "full-timetable", label: "Full Time Table", desc: "Open complete timetable management", icon: Calendar, ac: "#2563EB", bg: "#E8EEFF", route: { id: "timetable", child: "Class Timetable" } },
  { id: "mark-attendance", label: "Mark Attendance", desc: "Record student attendance quickly", icon: ClipboardText, ac: "#2E7D32", bg: "#EDF7EE", route: { id: "attendance" } },
  { id: "ia-mean", label: "IA Mean %", desc: "Check internal assessment averages", icon: ChartBar, ac: "#C47A1E", bg: "#FEF3E2", route: { id: "timetable", child: "Internal Assessment" } },
  { id: "lesson-plan", label: "Lesson Plan", desc: "Create or review your weekly plans", icon: BookOpen, ac: "#7B3FAE", bg: "#F3EEFA", route: { id: "lessonplan", child: "Create Plan" } },
  { id: "question-paper", label: "Question Paper", desc: "Track question paper submission status", icon: MagnifyingGlass, ac: "#C0273D", bg: "#FDE8EC", route: { id: "events", child: "Events" } },
  { id: "mentoring", label: "Mentoring", desc: "View and manage your assigned mentees", icon: Users, ac: "#1A7F6A", bg: "#E8F8F5", route: { id: "mentoring", child: "My Mentees" } },
  { id: "reports", label: "Reports", desc: "Download attendance & performance reports", icon: FileText, ac: "#2953A8", bg: "#EAF0FB", route: { id: "attendance" } },
  { id: "customize", label: "Customise", desc: "Manage your dashboard quick access tiles", icon: SlidersHorizontal, ac: "#7B1D2E", bg: "#F9ECED", route: { id: "dashboard" } },
];

const SCHEDULE = [
  { time: "09:00 AM", course: "Advanced Web Technologies",   meta: "MCA Sem 2-B · Room 301", done: false },
  { time: "11:00 AM", course: "Data Structures & Algorithms",meta: "MCA Sem 1-A · Room 204", done: true  },
  { time: "02:00 PM", course: "Cloud Computing Elective",    meta: "MCA Sem 3 · Lab 2",      done: false },
];

const ALERTS = [
  { id: 1, type: "deadline", title: "Question Paper Due", note: "Submit by 05:00 PM today", time: "5 hours", icon: "📋" },
  { id: 2, type: "alert", title: "Class Cancelled", note: "Chemistry lab moved to tomorrow", time: "2 hours ago", icon: "🔔" },
  { id: 3, type: "reminder", title: "Grades Review Meeting", note: "Scheduled with dept head", time: "Tomorrow 2 PM", icon: "⏰" },
];

const ALERTS_DEADLINES = [
  { id: 1, title: "IA Submission", date: "2026-05-02", note: "Upload IA marks to portal", urgent: true },
  { id: 2, title: "Lesson Plan Approval", date: "2026-05-05", note: "Submit for HOD review", urgent: false },
  { id: 3, title: "Attendance Finalization", date: "2026-05-01", note: "Lock attendance records", urgent: true },
];
// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  if (h < 21) return "Good Evening";
  return "Good Night";
}

function fmtDate() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function fmtTime() {
  const t = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  return t + " IST";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, bg, emoji }) {
  return (
    <div className="bg-white rounded-[14px] p-4 border border-border flex items-center gap-3 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
      <div className="w-10.5 h-10.5 rounded-[11px] flex items-center justify-center text-xl shrink-0"
        style={{ background: bg }}>
        {emoji}
      </div>
      <div>
        <p className="text-[11px] text-text2 mb-0.5">{label}</p>
        <p className="text-[21px] font-bold text-text leading-none">{value}</p>
        <p className="text-[10.5px] text-text2 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function QuickCard({ label, desc, icon: Icon, ac, bg, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white rounded-[14px] p-[17px_15px_15px] border border-border flex flex-col gap-2 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all relative overflow-hidden group"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}
    >
      {/* Bottom accent bar on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.75 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-[14px]"
        style={{ background: ac }}
      />
      <div
        className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
        style={{ background: bg, color: ac }}
      >
        <Icon size={18} />
      </div>
      <p className="text-[12.5px] font-semibold text-text">{label}</p>
      <p className="text-[11px] text-text2 leading-snug">{desc}</p>
    </button>
  );
}

function ScheduleRow({ time, course, meta, done }) {
  return (
    <div className="flex items-start gap-3 px-4.5 py-2.5 border-b border-border last:border-0 hover:bg-page-bg cursor-pointer transition-colors">
      <div className="min-w-17.5 text-[11px] font-semibold text-[#9B2335] pt-0.5">{time}</div>
      <div className="flex-1">
        <p className="text-[12.5px] font-semibold text-text">{course}</p>
        <p className="text-[11px] text-text2 mt-0.5">{meta}</p>
      </div>
      <span
        className={`self-start mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
          done ? "bg-[#EDF7EE] text-[#2E7D32]" : "bg-maroon-pale text-[#9B2335]"
        }`}
      >
        {done ? "Done" : "Upcoming"}
      </span>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard({ onNavigate }) {
  const [time, setTime] = useState(fmtTime);
  const [quickItems, setQuickItems] = useState(() => {
    const fromStorage = typeof window !== "undefined" ? window.localStorage.getItem("svyasa.quickAccess.v1") : "";
    if (!fromStorage) return QUICK.map((item) => ({ ...item, visible: true }));
    try {
      const parsed = JSON.parse(fromStorage);
      const visibilityById = new Map(
        Array.isArray(parsed) ? parsed.map((item, index) => [item?.id, { visible: item?.visible !== false, index }]) : [],
      );
      return [...QUICK]
        .sort((a, b) => (visibilityById.get(a.id)?.index ?? 999) - (visibilityById.get(b.id)?.index ?? 999))
        .map((item) => ({
          ...item,
          visible: visibilityById.get(item.id)?.visible ?? true,
        }));
    } catch {
      return QUICK.map((item) => ({ ...item, visible: true }));
    }
  });
  const [customizeOpen, setCustomizeOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(fmtTime()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("svyasa.quickAccess.v1", JSON.stringify(quickItems));
  }, [quickItems]);

  const visibleQuick = useMemo(() => quickItems.filter((item) => item.visible), [quickItems]);

  function moveItem(index, direction) {
    setQuickItems((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleQuickAction(item) {
    if (item.id === "customize") {
      setCustomizeOpen(true);
      return;
    }
    if (item?.route?.id) onNavigate?.(item.route.id, item.route.child || "");
  }

  return (
    <main
      className="flex-1 overflow-y-auto p-6 pb-12"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#D1D5DB transparent" }}
    >
      {/* ── Welcome Banner ── */}
      <div
        className="relative overflow-hidden rounded-[14px] p-[26px_30px] mb-5 flex items-center justify-between"
        style={{
          background:  "linear-gradient(118deg,#8B1E2F 0%,#B03445 50%,#C95060 100%)",
          boxShadow:   "0 4px 24px rgba(139,30,47,0.3)",
        }}
      >
        {/* Decorative radial blobs */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 90% 20%,rgba(255,255,255,.09),transparent 50%)," +
              "radial-gradient(circle at 80% 80%,rgba(255,255,255,.05),transparent 40%)",
          }}
        />

        {/* Left */}
        <div className="relative">
          <h1
            className="text-[22px] font-bold text-white mb-1"
            style={{ fontFamily: "'Playfair Display',serif" }}
          >
            {getGreeting()}, Dr. Bharathi 👋
          </h1>
          <p className="text-[13px] text-white/75">
            Here's a snapshot of your academic activity today.
          </p>
          <div
            className="inline-flex items-center gap-2 mt-3 px-3 py-1.25 rounded-full text-[11.5px] text-white border border-white/25"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
          >
            <PlayCircle size={11} weight="fill" />
            Next: AWT · MCA Sem 2-B · 09:00 – 09:50 AM
          </div>
        </div>

        {/* Right */}
        <div className="relative text-right">
          <p className="text-[12.5px] text-white/80">{fmtDate()}</p>
          <p className="text-[11px] text-white/50 mt-1">{time}</p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid gap-3 mb-5 md:grid-cols-2 xl:grid-cols-3">
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Quick Access ── */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-bold text-text">Quick Access</h2>
        <button className="text-[12px] text-[#9B2335] font-medium hover:underline" onClick={() => setCustomizeOpen(true)}>
          Customise →
        </button>
      </div>
      <div className="grid gap-3 mb-5 sm:grid-cols-2 xl:grid-cols-4">
        {visibleQuick.map((q) => <QuickCard key={q.id} {...q} onClick={() => handleQuickAction(q)} />)}
      </div>

      {/* ── Today at a Glance ── */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-bold text-text">Today at a Glance</h2>
      </div>
      <div className="grid grid-cols-1 gap-3">

        {/* Schedule panel */}
        <div
          className="bg-white rounded-[14px] border border-border overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}
        >
          <div className="flex items-center justify-between px-4.5 py-3.5 border-b border-border">
            <h3 className="text-[13px] font-bold text-text">🕘 Today's Schedule</h3>
            <button className="text-[12px] text-[#9B2335] font-medium hover:underline" onClick={() => onNavigate?.("timetable", "Class Timetable")}>
              Full Timetable →
            </button>
          </div>
          {SCHEDULE.map((s) => <ScheduleRow key={s.time} {...s} />)}
        </div>
        
        {/* Alerts & Deadlines */}
<div
  className="bg-white rounded-[14px] border border-border overflow-hidden mt-3"
  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}
>
  <div className="flex items-center justify-between px-4.5 py-3.5 border-b border-border">
    <h3 className="text-[13px] font-bold text-text">⚠️ Alerts & Deadlines</h3>
  </div>

  {ALERTS_DEADLINES.map((item) => (
    <div
      key={item.id}
      className="flex items-start gap-3 px-4.5 py-2.5 border-b border-border last:border-0 hover:bg-page-bg transition-colors"
    >
      {/* Alert Badge */}
      <span
        className={`mt-1 inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
          item.urgent ? "bg-[#FDE8EC] text-[#C0273D]" : "bg-[#EDF7EE] text-[#2E7D32]"
        }`}
      >
        !
      </span>

      <div  className="flex-1">
        <p className="text-[12.5px] font-semibold text-text">{item.title}</p>
        <p className="text-[11px] text-text2 mt-0.5">{item.note}</p>
      </div>

      <div className="text-[11px] font-semibold text-text2 whitespace-nowrap">
        {item.date}
      </div>
    </div>
  ))}
</div>
      </div>

      {customizeOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-[14px] font-bold text-text">Customize Quick Access</h3>
              <button className="rounded-lg p-1 hover:bg-page-bg" onClick={() => setCustomizeOpen(false)}><X size={16} /></button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-4 space-y-2">
              {quickItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={(e) =>
                      setQuickItems((prev) => prev.map((q, i) => (i === index ? { ...q, visible: e.target.checked } : q)))
                    }
                  />
                  <div className="flex-1">
                    <p className="text-[12.5px] font-semibold text-text">{item.label}</p>
                    <p className="text-[11px] text-text2">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="rounded-lg border border-border p-1 hover:bg-page-bg disabled:opacity-40" onClick={() => moveItem(index, "up")} disabled={index === 0}>
                      <CaretUp size={14} />
                    </button>
                    <button className="rounded-lg border border-border p-1 hover:bg-page-bg disabled:opacity-40" onClick={() => moveItem(index, "down")} disabled={index === quickItems.length - 1}>
                      <CaretDown size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
              <button
                className="rounded-xl border border-border px-4 py-2 text-[12.5px] font-semibold text-text hover:bg-page-bg"
                onClick={() => setQuickItems(QUICK.map((item) => ({ ...item, visible: true })))}
              >
                <ArrowsDownUp size={14} className="inline mr-1" />
                Reset
              </button>
              <button className="rounded-xl bg-[#0B4B5A] px-4 py-2 text-[12.5px] font-semibold text-white" onClick={() => setCustomizeOpen(false)}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
