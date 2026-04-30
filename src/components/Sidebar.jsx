import { useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  CaretDoubleLeft,
  CaretDoubleRight,
  House,
  Calendar,
  CalendarCheck,
  ClipboardText,
  Warning,
  ChartBar,
  BookOpen,
  FileText,
  Users,
  Megaphone,
  TrendUp,
  SignOut,
  UserCircle,
  Plus,
  DotsThreeVertical,
} from "@phosphor-icons/react";


const NAV = [
  {
    section: "Main",
    items: [
      { id: "dashboard", label: "My Dashboard", icon: House },
      { id: "profile",   label: "My Profile",   icon: UserCircle },
    ],
  },
  {
    section: "Academic",
    items: [
      {
        id: "timetable", label: "Timetable", icon: Calendar,
        children: ["Class Timetable", "Internal Assessment", "Other Assessment", "Class Transfer"],
      },
      {
        id: "attendance", label: "Attendance", icon: ClipboardText,
        children: ["Student Attendance", "Attendance Report"],
      },
      {
        id: "lessonplan", label: "Lesson Plan", icon: BookOpen,
        children: ["Create Plan", "View Plans", "CO-PO Mapping"],
      },
      {
        id: "assessment", label: "Assessment", icon: ChartBar,
        children: ["IA Mean %", "Marks Scored", "Question Paper Status", "MCQ"],
      },
      {
        id: "mentoring", label: "Mentoring", icon: Users,
        children: ["My Mentees", "Mentoring Sessions"],
      },
 
    ],
  },
  {
    section: "Administrative",
    items: [
      {
        id: "create", label: "Create", icon: Plus,
        children: ["New Assignment", "New Quiz", "New Announcement"],
      },
      { id: "events",    label: "Events",       icon: CalendarCheck },
      // { id: "notices",   label: "Notice Board", icon: Megaphone     },
      // { id: "grievance", label: "Grievance",    icon: Warning },
    ],
  },
  {
    section: "Insights",
    items: [
      {
        id: "reports", label: "Reports", icon: FileText,
        children: ["Attendance Report", "Performance Report"],
      },
      // { id: "performance", label: "Performance", icon: TrendUp },
    ],
  },
];

function SubItem({ label, activeChild, onSelect, isCollapsed }) {
  if (isCollapsed) return null;
  const isActive = activeChild === label;
  return (
    <button
      onClick={() => onSelect(label)}
     className={[
  "w-full flex items-center gap-2 pl-11 pr-3 py-1.75 rounded-lg text-left text-[12.5px] transition-all duration-150",
  isActive
    ? "text-rose-300 font-semibold"
    : "text-gray-50 hover:bg-white/5 hover:text-white",
].join(" ")}
    >
      <span
        className={[
          "w-1.25 h-1.25 rounded-full shrink-0 transition-colors",
          isActive ? "bg-rose-300" : "bg-current opacity-60",
        ].join(" ")}
      />
      {label}
    </button>
  );
}

function NavItem({ item, activeId, activeChild, onSelect, onChildSelect, isCollapsed }) {
  const [open, setOpen] = useState(false);
  const isActive    = activeId === item.id;
  const hasChildren = !!item.children;
  const Icon        = item.icon;

  const handleClick = () => {
    if (hasChildren && !isCollapsed) setOpen((p) => !p);
    else onSelect(item.id);
  };

  return (
    <div className="px-2">
      <button
        onClick={handleClick}
        className={[
          `w-full flex items-center ${isCollapsed ? "justify-center" : "gap-2.75"} px-3 py-2.25 rounded-lg text-left text-[13.5px] transition-all duration-150 group`,
          isActive && !hasChildren
            ? "bg-[#9B2335] text-white font-medium shadow-lg shadow-rose-900/20"
            : "text-gray-50 hover:bg-white/8 hover:text-white",
        ].join(" ")}
      >
        <Icon
          size={17}
          weight={isActive && !hasChildren ? "fill" : "regular"}
          className={[
            "shrink-0 transition-colors",
            isActive && !hasChildren
              ? "text-white"
              : "text-slate-400 group-hover:text-white",
          ].join(" ")}
        />
        {!isCollapsed ? <span className="flex-1 leading-none">{item.label}</span> : null}
        {hasChildren && !isCollapsed && (
          <ChevronRight
            size={12}
            className={[
              "text-slate-400 transition-transform duration-200",
              open ? "rotate-90" : "",
            ].join(" ")}
          />
        )}
      </button>

      {hasChildren && !isCollapsed && (
        <div
          className={[
            "overflow-hidden transition-all duration-200 ease-in-out",
            open ? "max-h-60 opacity-100 mt-0.5 mb-1" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          {item.children.map((child) => (
            <SubItem
              key={child}
              label={child}
              activeChild={activeChild}
              isCollapsed={isCollapsed}
              onSelect={(childLabel) => onChildSelect(childLabel, item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  activeId: controlledActiveId,
  activeChild: controlledActiveChild,
  onActiveIdChange,
  onActiveChildChange,
} = {}) {
  const [internalActiveId, setInternalActiveId] = useState("dashboard");
  const [internalActiveChild, setInternalActiveChild] = useState("Class Timetable");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeId = controlledActiveId ?? internalActiveId;
  const activeChild = controlledActiveChild ?? internalActiveChild;

  const setActiveId = onActiveIdChange ?? setInternalActiveId;
  const setActiveChild = onActiveChildChange ?? setInternalActiveChild;

  return (
    <aside
      className={`flex flex-col h-screen overflow-y-auto overflow-x-hidden shrink-0 transition-all duration-200 ${isCollapsed ? "w-20 min-w-20" : "w-63 min-w-63"}`}
      style={{
        background:     "#1C0A0D",
        scrollbarWidth: "thin",
        scrollbarColor: "#3a1520 transparent",
      }}
    >
      {/* Logo */}
      <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-4 py-5 border-b border-white/6 shrink-0`}>
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white font-bold text-lg shrink-0"
          style={{
            background: "linear-gradient(135deg,#9B2335 0%,#C0404F 100%)",
            boxShadow:  "0 2px 10px rgba(155,35,53,0.5)",
            fontFamily: "'Playfair Display',serif",
          }}
        >
          S
        </div>
        {!isCollapsed ? (
          <div>
            <p className="text-[13px] font-bold text-white tracking-[0.4px]">S-VYASA</p>
            <p className="text-[10px] text-slate-400 tracking-[0.3px] mt-px">Deemed University</p>
          </div>
        ) : null}
      </div>

      <div className={`px-2 py-2 border-b border-white/6 ${isCollapsed ? "flex justify-center" : "flex justify-end"}`}>
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <CaretDoubleRight size={16} /> : <CaretDoubleLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2">
        {NAV.map((group) => (
          <div key={group.section} className="mb-1">
            {!isCollapsed ? (
              <p className="px-5 pt-4 pb-1 text-[9.5px] font-semibold tracking-[1.3px] uppercase text-slate-400">
                {group.section}
              </p>
            ) : null}
            {group.items.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                activeId={activeId}
                activeChild={activeChild}
                onSelect={setActiveId}
                onChildSelect={(childLabel, parentId) => {
                  setActiveId(parentId);
                  setActiveChild(childLabel);
                }}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Profile footer */}
      <div className="shrink-0 px-3 py-3 border-t border-white/6">
        <div className={`flex items-center rounded-lg cursor-pointer hover:bg-white/5 transition-colors group ${isCollapsed ? "justify-center px-2 py-2" : "gap-2.5 px-3 py-2.5"}`}>
          <div
            className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0"
            style={{ background: "linear-gradient(135deg,#9B2335,#C0404F)" }}
          >
            DB
          </div>
          {!isCollapsed ? (
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-semibold text-white truncate">Dr. Bharathi</p>
              <p className="text-[11px] text-slate-400 truncate">Faculty · MCA Dept.</p>
            </div>
          ) : null}
          <div className={`flex items-center gap-1 transition-opacity ${isCollapsed ? "opacity-100 mt-2" : "opacity-0 group-hover:opacity-100"}`}>
            <button className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-rose-300 hover:bg-white/10 transition-colors" title="Log out">
              <SignOut size={13} />
            </button>
            <button className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors" title="Options">
              <DotsThreeVertical size={13} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
