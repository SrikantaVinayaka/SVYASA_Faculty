import { useMemo, useState } from "react";
import { startOfDay } from "date-fns";
import { useEvents } from "../context/EventsContext";
import EventsFilter from "../components/EventsFilter";
import EventCard from "../components/EventCard";
import { eventDay, passesEventFilters } from "../components/EventsFilterLogic";

export default function ConductedEventsPage() {
  const { events } = useEvents();

  const [department, setDepartment] = useState("All");
  const [eventType, setEventType] = useState("All Events");
  const [eventNameKey, setEventNameKey] = useState("All");
  const [otherName, setOtherName] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  const todayStart = useMemo(() => startOfDay(new Date()), []);

  const uniqueTitles = useMemo(() => {
    const set = new Set(events.map((e) => e.title));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [events]);

  const filters = useMemo(
    () => ({ department, eventType, eventNameKey, otherName, selectedDate }),
    [department, eventType, eventNameKey, otherName, selectedDate]
  );

  const filtered = useMemo(() => events.filter((ev) => passesEventFilters(ev, filters)), [events, filters]);

  const conducted = useMemo(
    () => filtered.filter((ev) => eventDay(ev.date).getTime() < todayStart.getTime()),
    [filtered, todayStart]
  );

  const resetFilters = () => {
    setDepartment("All");
    setEventType("All Events");
    setEventNameKey("All");
    setOtherName("");
    setSelectedDate(null);
  };

  const emptyConducted = conducted.length === 0;

  return (
    <div className="fade-in max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
        <span>Conducted Events</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Conducted Events (VIEW ONLY)</h1>
        <div />
      </div>

      <EventsFilter
        uniqueTitles={uniqueTitles}
        value={{ department, eventType, eventNameKey, otherName, selectedDate }}
        onChange={({ department: d, eventType: t, eventNameKey: n, otherName: o, selectedDate: sd }) => {
          setDepartment(d);
          setEventType(t);
          setEventNameKey(n);
          setOtherName(o);
          setSelectedDate(sd);
        }}
        onReset={resetFilters}
      />

      {emptyConducted ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center text-slate-500">
          No events match your filters.
        </div>
      ) : (
        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-green-600 text-lg">✓</span>
              <h2 className="text-lg font-semibold text-slate-800">Conducted Events</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                {conducted.length}
              </span>
            </div>
            <div className="space-y-3">
              {conducted.map((ev) => (
                <EventCard key={ev.id} ev={ev} upcoming={false} />
              ))}
            </div>
          </section>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px);} to { opacity:1; transform:none; } }
      `}</style>
    </div>
  );
}

