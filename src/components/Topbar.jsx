import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CaretDown, EnvelopeSimple, MagnifyingGlass, SignOut, UserCircle } from "@phosphor-icons/react";

const NAVIGATION_ITEMS = [
  { id: "dashboard", label: "My Dashboard", keywords: ["dashboard", "home"] },
  { id: "profile", label: "My Profile", keywords: ["profile", "faculty", "account"] },
  { id: "timetable", child: "Class Timetable", label: "Class Timetable", keywords: ["timetable", "class timetable", "schedule"] },
  { id: "timetable", child: "Internal Assessment", label: "Internal Assessment", keywords: ["internal assessment", "ia", "assessment"] },
  { id: "timetable", child: "Other Assessment", label: "Other Assessment", keywords: ["other assessment"] },
  { id: "timetable", child: "Class Transfer", label: "Class Transfer", keywords: ["class transfer"] },
  { id: "attendance", child: "Student Attendance", label: "Student Attendance", keywords: ["attendance", "mark attendance"] },
  { id: "attendance", child: "Attendance Report", label: "Attendance Report", keywords: ["attendance report"] },
  { id: "lessonplan", child: "Create Plan", label: "Create Plan", keywords: ["lesson plan", "create plan"] },
  { id: "lessonplan", child: "View Plans", label: "View Plans", keywords: ["view plans"] },
  { id: "lessonplan", child: "CO-PO Mapping", label: "CO-PO Mapping", keywords: ["co-po", "mapping"] },
  { id: "assessment", child: "Internal Assessment", label: "Internal Assessment", keywords: ["ia mean", "assessment mean", "internal assessment"] },
  { id: "assessment", child: "Marks Scored", label: "Marks Scored", keywords: ["marks scored", "marks"] },
  { id: "assessment", child: "Other Assessment", label: "Other Assessment", keywords: ["other assessment"] },
  { id: "mentoring", child: "My Mentees", label: "My Mentees", keywords: ["mentoring", "mentees"] },
  { id: "mentoring", child: "Mentoring Sessions", label: "Mentoring Sessions", keywords: ["mentoring sessions"] },
  { id: "events", child: "Document Event", label: "Document Event", keywords: ["events", "document event"] },
  { id: "events", child: "Add Event", label: "Add Event", keywords: ["add event", "new event"] },
];

const NOTIFICATIONS = [
  { id: "n1", text: "Lesson plan submission approved.", time: "2m ago", route: { id: "lessonplan", child: "View Plans" } },
  { id: "n2", text: "Attendance report generated.", time: "22m ago", route: { id: "attendance", child: "Attendance Report" } },
  { id: "n3", text: "Reminder: IA marks due tomorrow.", time: "1h ago", route: { id: "assessment", child: "Internal Assessment" } },
];

const MAILS = [
  { id: "m1", text: "Academic office shared updated circular.", time: "10m ago", route: { id: "events", child: "Document Event" } },
  { id: "m2", text: "Dept. meeting scheduled for 4 PM.", time: "34m ago", route: { id: "mentoring", child: "Mentoring Sessions" } },
];

export default function Topbar({ breadcrumb = "My Dashboard", onLogout, onNavigate }) {
  const [course, setCourse] = useState("MCA");
  const [openPanel, setOpenPanel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);
  const unreadCount = useMemo(() => NOTIFICATIONS.length, []);
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const items = !query
      ? NAVIGATION_ITEMS
      : NAVIGATION_ITEMS.filter((item) =>
          [item.label, item.id, item.child, ...(item.keywords || [])]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query),
        );

    return items.slice(0, 8);
  }, [searchQuery]);

  function togglePanel(panel) {
    setOpenPanel((prev) => (prev === panel ? "" : panel));
  }

  function handleNavigate(target) {
    if (!target?.id) return;
    onNavigate?.(target.id, target.child || "");
    setOpenPanel("");
    setSearchQuery("");
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (!searchRef.current?.contains(event.target)) {
        setOpenPanel((prev) => (prev === "search" ? "" : prev));
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="relative flex items-center gap-4 h-14.5 px-6 bg-white border-b border-border shrink-0">
      <div className="flex items-center gap-1.5 text-[12px] text-text2">
        <span>S-VYASA</span>
        <span className="opacity-40">›</span>
        <span className="text-text font-medium">{breadcrumb}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => togglePanel("course")}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-[12px] font-semibold text-text hover:bg-page-bg"
          >
            <span>{course}</span>
            <CaretDown size={12} />
          </button>
          {openPanel === "course" ? (
            <div className="absolute right-0 top-10 z-40 min-w-32 rounded-xl border border-border bg-white p-1 shadow-lg">
              {["MCA", "BCA"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`w-full rounded-lg px-3 py-2 text-left text-[12.5px] ${course === item ? "bg-[#F9ECED] text-[#9B2335] font-semibold" : "text-text hover:bg-page-bg"}`}
                  onClick={() => {
                    setCourse(item);
                    setOpenPanel("");
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="rounded-full border border-border bg-page-bg px-2 py-1 text-[12px] text-text2 hover:bg-white"
          onClick={() => onNavigate?.("profile")}
        >
          Dr Dr. Bharathi [ FACULTY ]
        </button>
      </div>

      <div ref={searchRef} className="relative">
        <div className="flex items-center gap-2 bg-page-bg border border-border rounded-full px-4 py-1.75 text-[12.5px] text-text2 w-50 hover:border-[#C8C9CE] transition-colors">
          <MagnifyingGlass size={13} className="opacity-50 shrink-0" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setOpenPanel("search");
            }}
            onFocus={() => setOpenPanel("search")}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchResults[0]) {
                handleNavigate(searchResults[0]);
              }
            }}
            placeholder="Search anything..."
            aria-label="Search modules"
            className="w-full bg-transparent text-text outline-none placeholder:text-text2"
          />
        </div>
        {openPanel === "search" ? (
          <div className="absolute right-0 top-11 z-40 w-72 rounded-xl border border-border bg-white p-1 shadow-lg">
            {searchResults.length ? (
              searchResults.map((item) => (
                <button
                  key={`${item.id}-${item.child || "root"}`}
                  type="button"
                  onClick={() => handleNavigate(item)}
                  className="w-full rounded-lg px-3 py-2 text-left hover:bg-page-bg"
                >
                  <p className="text-[12.5px] font-semibold text-text">{item.label}</p>
                  <p className="text-[11px] text-text2">{item.child ? `${item.id} / ${item.child}` : item.id}</p>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-[12px] text-text2">No matching modules found.</div>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2 ml-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => togglePanel("notifications")}
            className="relative w-8.5 h-8.5 rounded-full bg-page-bg border border-border flex items-center justify-center text-text2 hover:bg-maroon-pale hover:text-[#9B2335] hover:border-[#E0A0A8] transition-all"
          >
            <Bell size={15} />
            <span className="absolute -top-0.5 -right-0.5 w-3.75 h-3.75 bg-[#9B2335] text-white text-[8.5px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          </button>
          {openPanel === "notifications" ? (
            <div className="absolute right-0 top-10 z-40 w-72 rounded-xl border border-border bg-white shadow-lg">
              <div className="border-b border-border px-3 py-2 text-[12px] font-bold text-text">Notifications</div>
              {NOTIFICATIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.route)}
                  className="w-full border-b border-border px-3 py-2 text-left last:border-b-0 hover:bg-page-bg"
                >
                  <p className="text-[12px] text-text">{item.text}</p>
                  <p className="text-[11px] text-text2">{item.time}</p>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => togglePanel("mail")}
            className="w-8.5 h-8.5 rounded-full bg-[#F2F3F6] border border-[#E4E6EA] flex items-center justify-center text-[#6B7280] hover:bg-[#F9ECED] hover:text-[#9B2335] hover:border-[#E0A0A8] transition-all"
          >
            <EnvelopeSimple size={15} />
          </button>
          {openPanel === "mail" ? (
            <div className="absolute right-0 top-10 z-40 w-72 rounded-xl border border-border bg-white shadow-lg">
              <div className="border-b border-border px-3 py-2 text-[12px] font-bold text-text">Inbox</div>
              {MAILS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.route)}
                  className="w-full border-b border-border px-3 py-2 text-left last:border-b-0 hover:bg-page-bg"
                >
                  <p className="text-[12px] text-text">{item.text}</p>
                  <p className="text-[11px] text-text2">{item.time}</p>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => togglePanel("profile")}
            className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-[12px] font-bold text-white ml-1 cursor-pointer border-2 border-[#F9ECED]"
            style={{ background: "linear-gradient(135deg,#9B2335,#C0404F)" }}
          >
            DB
          </button>
          {openPanel === "profile" ? (
            <div className="absolute right-0 top-10 z-40 w-72 rounded-xl border border-border bg-white p-3 shadow-lg">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="h-12 w-12 rounded-full bg-[#F9ECED] text-[#9B2335] flex items-center justify-center">
                  <UserCircle size={28} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-text">Dr Dr. Bharathi</p>
                  <p className="text-[12px] text-text2">dr.bharathi</p>
                  <p className="text-[11px] text-text2">Data Science & Big Data Analytics</p>
                </div>
              </div>
              <button className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-left text-[12.5px] text-text hover:bg-page-bg">
                Change Password
              </button>
              <button
                onClick={onLogout}
                className="mt-2 inline-flex w-full items-center gap-2 rounded-lg bg-[#7B1D2E] px-3 py-2 text-left text-[12.5px] text-white hover:opacity-95"
              >
                <SignOut size={14} />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
