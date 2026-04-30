import { useMemo, useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  MCA_TIMETABLE_BY_SECTION,
  DEPARTMENTS,
  MCA_SECTIONS,
  DAY_ORDER,
  FILTER_TAG_OPTIONS,
} from "./timetableData.js";

const BRAND = "#7B1D2E";

const DAY_INDEX = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

function parseMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function formatDisplayTime(t) {
  const [h, m] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return format(d, "hh:mm a");
}

/** @typedef {'live' | 'upcoming' | 'completed'} SlotStatus */

/**
 * @param {string} selectedDay
 * @param {string} startTime
 * @param {string} endTime
 * @param {Date} now
 * @returns {SlotStatus}
 */
function getSlotStatus(selectedDay, startTime, endTime, now) {
  const todayName = format(now, "EEEE", { locale: enUS });
  const todayIdx = DAY_INDEX[todayName] ?? 0;
  const selIdx = DAY_INDEX[selectedDay] ?? 0;

  let dayKind = "today";
  if (selIdx < todayIdx) dayKind = "past";
  else if (selIdx > todayIdx) dayKind = "future";

  if (dayKind === "past") return "completed";
  if (dayKind === "future") return "upcoming";

  const nowM = now.getHours() * 60 + now.getMinutes();
  const startM = parseMinutes(startTime);
  const endM = parseMinutes(endTime);
  if (nowM >= startM && nowM < endM) return "live";
  if (nowM < startM) return "upcoming";
  return "completed";
}

function statusBadge(status) {
  if (status === "live")
    return (
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
        style={{ background: "rgba(22,163,74,0.15)", color: "#15803d" }}
      >
        ● LIVE
      </span>
    );
  if (status === "upcoming")
    return (
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
        style={{ background: "rgba(234,179,8,0.18)", color: "#a16207" }}
      >
        ⏳ Upcoming
      </span>
    );
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap bg-slate-100 text-slate-600">
      ✓ Completed
    </span>
  );
}

export default function ClassTimetable() {
  const [view, setView] = useState("day");
  const [department, setDepartment] = useState("MCA");
  const [section, setSection] = useState("A");
  const [selectedDay, setSelectedDay] = useState(() => format(new Date(), "EEEE", { locale: enUS }));
  const [activeFilters, setActiveFilters] = useState(() => new Set());
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const toggleFilter = useCallback((tag) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const weekData = useMemo(() => {
    if (department !== "MCA") return null;
    const byDay = MCA_TIMETABLE_BY_SECTION[section] || {};
    return DAY_ORDER.map((day) => ({
      day,
      classes: [...(byDay[day] || [])].sort((a, b) => parseMinutes(a.startTime) - parseMinutes(b.startTime)),
    }));
  }, [department, section]);

  const dayClassesRaw = useMemo(() => {
    if (!weekData) return [];
    const row = weekData.find((d) => d.day === selectedDay);
    return row?.classes || [];
  }, [weekData, selectedDay]);

  const filteredDayClasses = useMemo(() => {
    if (activeFilters.size === 0) return dayClassesRaw;
    return dayClassesRaw.filter((c) => {
      const tags = c.tags || [];
      return tags.some((t) => activeFilters.has(t));
    });
  }, [dayClassesRaw, activeFilters]);

  const courseLabel = (c) => {
    const batch = c.batch || `2025-26 · Sem 2 · ${section}`;
    return `${c.subjectCode} — ${c.subjectName} · MCA-DET · MCA · ${batch}`;
  };

  const emptyDepartment = department === "B.Tech";
  const noClassesOnDay =
    !emptyDepartment && department === "MCA" && dayClassesRaw.length === 0 && view === "day";
  const filterExcludesAll =
    !emptyDepartment &&
    department === "MCA" &&
    dayClassesRaw.length > 0 &&
    filteredDayClasses.length === 0 &&
    view === "day";

  return (
    <div className="fade-in max-w-6xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
        <span>Timetable</span>
        <span className="text-slate-300">/</span>
        <span>Class Timetable</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">TimeTable</h1>
          <p className="text-slate-500 text-sm mt-1">Class Timetable</p>
        </div>
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm w-fit">
          {[
            { id: "day", label: "Day View" },
            { id: "week", label: "Week View" },
          ].map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === v.id ? "text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
              }`}
              style={
                view === v.id
                  ? { background: `linear-gradient(135deg, ${BRAND} 0%, #a53050 100%)` }
                  : undefined
              }
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 mb-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Filters</p>
        <div className="flex flex-wrap gap-2">
          {FILTER_TAG_OPTIONS.map((tag) => {
            const on = activeFilters.has(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleFilter(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  on ? "text-white border-transparent shadow-sm" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
                style={on ? { background: `linear-gradient(90deg, ${BRAND}, #a53050)` } : undefined}
              >
                {tag}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 text-sm focus:ring-2 focus:ring-[rgba(123,29,46,0.25)] focus:border-transparent outline-none transition-shadow bg-white"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
              Section
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              disabled={department !== "MCA"}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 text-sm focus:ring-2 focus:ring-[rgba(123,29,46,0.25)] focus:border-transparent outline-none transition-shadow bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {MCA_SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {view === "day" && (
        <div className="mb-4 overflow-x-auto pb-1">
          <div className="flex gap-1 min-w-max border-b border-slate-200">
            {DAY_ORDER.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDay(d)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg ${
                  selectedDay === d ? "text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
                style={
                  selectedDay === d
                    ? { background: `linear-gradient(135deg, ${BRAND} 0%, #a53050 100%)` }
                    : undefined
                }
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}

      {emptyDepartment && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center text-slate-500">
          No timetable data for the selected department (placeholder).
        </div>
      )}

      {!emptyDepartment && view === "day" && noClassesOnDay && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center text-slate-500">
          No classes scheduled for today
        </div>
      )}

      {!emptyDepartment && view === "day" && filterExcludesAll && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center text-slate-500">
          No classes match the selected filters.
        </div>
      )}

      {!emptyDepartment && view === "day" && !noClassesOnDay && !filterExcludesAll && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-180">
            <thead>
              <tr style={{ background: "rgba(123,29,46,0.06)" }}>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Period</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Time</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">
                  Course-Degree-Department—Section-Batch
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Room</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Mark Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filteredDayClasses.map((c, idx) => {
                const status = getSlotStatus(selectedDay, c.startTime, c.endTime, now);
                return (
                  <tr
                    key={`${c.subjectCode}-${c.startTime}-${idx}`}
                    className="border-t border-slate-100 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">{idx + 1}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {formatDisplayTime(c.startTime)} – {formatDisplayTime(c.endTime)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-md">{courseLabel(c)}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{c.room}</td>
                    <td className="px-4 py-3">{statusBadge(status)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:shadow-md whitespace-nowrap"
                        style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #a53050 100%)` }}
                      >
                        Mark Attendance
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!emptyDepartment && view === "week" && weekData && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {weekData.map(({ day, classes }) => {
            const list =
              activeFilters.size === 0
                ? classes
                : classes.filter((c) => (c.tags || []).some((t) => activeFilters.has(t)));
            return (
              <div
                key={day}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col"
              >
                <div
                  className="px-4 py-3 text-white font-semibold text-sm"
                  style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #a53050 100%)` }}
                >
                  {day}
                </div>
                <div className="p-3 flex-1 space-y-2 min-h-25">
                  {list.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No classes</p>
                  ) : (
                    list.map((c, i) => {
                      const st = getSlotStatus(day, c.startTime, c.endTime, now);
                      return (
                        <div
                          key={`${day}-${i}`}
                          className="rounded-xl p-3 border border-slate-100 bg-slate-50/50"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-800">{c.subjectCode}</span>
                            {statusBadge(st)}
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">{c.subjectName}</p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {formatDisplayTime(c.startTime)} – {formatDisplayTime(c.endTime)} · Room {c.room}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
