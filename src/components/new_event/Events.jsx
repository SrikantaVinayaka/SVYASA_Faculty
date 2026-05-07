import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Calendar, Users, MapPin, BookOpen, Clock } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import AddEventPage, { buildDocx } from './AddEventPage.jsx';

const DB_KEY = 'event_reports_db';

const loadEvents = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(DB_KEY)) || [];
    return stored.map((item, index) => ({
      id: item.id || Date.now() + index,
      title: item.event_title || 'Untitled Event',
      type: item.event_type || 'In-House',
      typeBg: (item.event_type || 'In-House') === 'External' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700',
      date: item.event_date || '',
      rawDate: item.event_date || '',
      department: item.department || 'Not specified',
      coordinator: item.resourceName || item.creator || 'Event Cell',
      venue: item.venue || 'TBA',
      time: item.start_time && item.end_time ? `${item.start_time} – ${item.end_time}` : 'TBA',
      students: Number(item.students) || 0,
      faculty: Number(item.faculty) || 0,
      objective: item.objective || '',
      brief: item.brief || '',
      file: item.file || '',
      authorityPermission: item.authority_permission || item.authority || '',
      authorityDesignation: item.authority_designation || item.authorityDesignation || '',
      permissionStatus: item.permission_status || (item.approval_status === 'Approved' ? 'Granted' : 'Pending'),
    }))
    .filter((item) => item.permissionStatus === 'Granted');
  } catch {
    return [];
  }
};

const deleteEventById = (id) => {
  try {
    const stored = JSON.parse(localStorage.getItem(DB_KEY)) || [];
    const next = stored.filter((item) => item.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(next));
  } catch {
    // Ignore malformed storage and keep UI responsive.
  }
};

const EVENT_TYPES = ['All Events', 'In-House', 'External'];
const DATE_VIEWS = ['All', 'Upcoming', 'Conducted'];
const SAMPLE_CONDUCTED_EVENTS = [
  {
    id: 'sample-conducted-1',
    title: 'Faculty Development Program on AI Tools',
    type: 'In-House',
    typeBg: 'bg-pink-100 text-pink-700',
    date: '12 Jan 2026',
    rawDate: '2026-01-12',
    department: 'Computer Science',
    coordinator: 'Academic Cell',
    venue: 'Seminar Hall A',
    time: '10:00 – 13:00',
    students: 48,
    faculty: 26,
    objective: 'Hands-on orientation for faculty on practical AI teaching tools.',
    brief: 'The session covered classroom-ready AI workflows and assessment support.',
  },
  {
    id: 'sample-conducted-2',
    title: 'Research Methodology Workshop',
    type: 'External',
    typeBg: 'bg-blue-100 text-blue-700',
    date: '18 Feb 2026',
    rawDate: '2026-02-18',
    department: 'Management Studies',
    coordinator: 'Research Cell',
    venue: 'Conference Hall',
    time: '09:30 – 16:00',
    students: 62,
    faculty: 19,
    objective: 'Strengthen academic research writing and publication practices.',
    brief: 'Experts guided participants through proposal design, review, and journals.',
  },
];

const getEventDateValue = (event) => event.startDate || event.eventDate || event.rawDate || '';

const toDateOnly = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const toIsoDate = (value) => {
  const d = toDateOnly(value);
  if (!d) return '';
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const mapEventToDocForm = (event) => {
  const startDate = event.startDate || event.eventDate || event.rawDate || '';
  const endDate = event.endDate || startDate;
  const [startTime = '09:00', endTime = '17:00'] = (event.time || '').split('–').map((v) => v?.trim()).filter(Boolean);

  return {
    department: event.department || '',
    eventTitle: event.eventTitle || event.title || 'Event',
    eventType: event.eventType || event.type || '',
    eventDuration: startDate === endDate ? 'single' : 'multiple',
    eventDate: startDate,
    startDate,
    endDate,
    startTime,
    endTime,
    venue: event.venue || '',
    students: Math.max(0, Number(event.students) || 0),
    faculty: Math.max(0, Number(event.faculty) || 0),
    includeResource: Boolean(event.includeResource || event.resourceName),
    resourceName: event.resourceName || event.coordinator || '',
    resourceDetails: event.resourceDetails || '',
    objective: event.objective || '',
    brief: event.brief || '',
    creator: event.creator || '',
    creatorDesignation: event.creatorDesignation || '',
    authority: event.authority || '',
    authorityPermission: event.authorityPermission || event.authority || '',
    authorityDesignation: event.authorityDesignation || '',
    logoFile: event.logoFile || null,
    eventImages: event.eventImages || [],
    feedbackImages: event.feedbackImages || [],
  };
};

// ── Reusable Modal wrapper ────────────────────────────────────────────────────
function Modal({ onClose, children, wide = false, ariaLabel = "Dialog" }) {
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastActiveElementRef = useRef(null);

  // Lock background scroll + restore when closed.
  useEffect(() => {
    lastActiveElementRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const t = window.setTimeout(() => closeBtnRef.current?.focus?.(), 0);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = previousOverflow;
      lastActiveElementRef.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;
      const root = dialogRef.current;
      if (!root) return;

      const focusable = Array.from(
        root.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className={`relative bg-white rounded-2xl shadow-2xl flex flex-col ${
          wide ? 'w-full max-w-3xl' : 'w-full max-w-xl'
        }`}
        style={{ maxHeight: '90vh' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto flex-1 rounded-2xl">
          {children}
        </div>

        <button
          ref={closeBtnRef}
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
          aria-label="Close modal"
        >
          <X size={16} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}

// ── Event Detail Modal ────────────────────────────────────────────────────────
function EventDetailModal({ event, onClose }) {
  const modalTitle = event.eventTitle || event.title || 'Untitled Event';
  const modalDepartment = event.department || 'Not specified';
  const modalDate = event.date || event.startDate || event.eventDate || event.rawDate || 'Not specified';
  const modalTime = event.time || 'Not specified';
  const modalVenue = event.venue || 'Not specified';
  const modalObjective = event.objective || 'Not specified';
  const modalSummary = event.brief || event.eventSummary || 'Not specified';

  const downloadReport = async () => {
    console.log('Download clicked. selectedEvent:', event);
    if (!event) {
      console.log('Download blocked: selectedEvent is null');
      return;
    }

    try {
      const mapped = mapEventToDocForm(event);
      const doc = await buildDocx(mapped);
      console.log('DOCX object generated:', doc);
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${mapped.eventTitle || 'event-report'}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <Modal onClose={onClose}>
      {/* Header banner */}
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: '#f0f0f0' }}>
        <div className="flex items-start gap-3 pr-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900">{modalTitle}</h2>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${event.typeBg}`}>
                {event.type}
              </span>
            </div>
            <p className="text-sm text-gray-500">{modalDepartment}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-4 space-y-5">
        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Calendar, label: 'Date', value: modalDate },
            { icon: Clock,    label: 'Time', value: modalTime },
            { icon: MapPin,   label: 'Venue', value: modalVenue },
            { icon: Users,    label: 'Department', value: modalDepartment },
            { icon: BookOpen, label: 'Students', value: event.students },
            { icon: Users,    label: 'Faculty', value: event.faculty },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
              <Icon size={15} className="mt-0.5 shrink-0" style={{ color: '#7B1C2A' }} />
              <div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-sm text-gray-800 font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Objective */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Objective</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{modalObjective}</p>
        </div>

        {/* Brief */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Event Summary</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{modalSummary}</p>
        </div>
      </div>

      {/* Footer: Download button */}
      <div className="px-6 py-4 border-t" style={{ borderColor: '#f0f0f0' }}>
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: '#7B1C2A' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#5e1520'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7B1C2A'}
          onClick={downloadReport}
        >
          <Download size={15} />
          Download Report
        </button>
      </div>
    </Modal>
  );
}

// ── Add Event Modal ─────────────────────────────────────────────────────────
function AddEventModal({ onClose, onSaved }) {
  return (
    <Modal onClose={onClose} wide ariaLabel="Add Event">
      <AddEventPage
        onSaved={() => {
          onSaved?.();
          onClose();
        }}
      />
    </Modal>
  );
}

// ── Event Card ────────────────────────────────────────────────────────────────
function EventCard({ event, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all duration-150"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <h3 className="text-sm font-bold text-gray-900">{event.title}</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${event.typeBg}`}>
              {event.type}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar size={13} className="shrink-0 text-indigo-400" />
              {event.date}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Users size={13} className="shrink-0 text-purple-400" />
              {event.coordinator}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <BookOpen size={13} className="shrink-0 text-teal-400" />
              {event.department}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin size={13} className="shrink-0 text-red-400" />
              {event.venue}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {/* Clock icon on right */}
          <div className="w-9 h-9 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center">
            <Clock size={15} className="text-gray-400" />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(event.id);
            }}
            className="text-[11px] px-2 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            aria-label={`Delete ${event.title}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Events Page ──────────────────────────────────────────────────────────
export default function Events() {
  const [events, setEvents] = useState([]);
  const [dept, setDept]       = useState('All');
  const [type, setType]       = useState('All Events');
  const [name, setName]       = useState('All');
  const [date, setDate]       = useState('');
  const [dateView, setDateView] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  const eventsWithSamples = [...events, ...SAMPLE_CONDUCTED_EVENTS];

  const filtered = eventsWithSamples.filter(e => {
    if (dept !== 'All' && e.department !== dept) return false;
    if (type !== 'All Events' && e.type !== type) return false;
    if (name !== 'All' && e.title !== name) return false;
    if (date && toIsoDate(getEventDateValue(e)) !== date) return false;
    return true;
  });

  const departments = ['All', ...new Set(eventsWithSamples.map((event) => event.department).filter(Boolean))];

  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const upcomingEvents = filtered.filter((event) => {
    const eventDate = toDateOnly(getEventDateValue(event));
    return eventDate && eventDate >= todayDate;
  });

  const conductedEvents = filtered.filter((event) => {
    const eventDate = toDateOnly(getEventDateValue(event));
    return eventDate && eventDate < todayDate;
  });

  const showUpcoming = dateView === 'All' || dateView === 'Upcoming';
  const showConducted = dateView === 'All' || dateView === 'Conducted';

  const reset = () => {
    setDept('All');
    setType('All Events');
    setName('All');
    setDate('');
    setDateView('All');
  };

  const handleDeleteEvent = (id) => {
    const shouldDelete = window.confirm('Delete this event?');
    if (!shouldDelete) return;

    deleteEventById(id);
    setEvents((prev) => prev.filter((event) => event.id !== id));
    if (selectedEvent?.id === id) setSelectedEvent(null);
  };

  const downloadAllEventsReport = async () => {
    if (!filtered.length) return;

    const content = [
      new Paragraph({
        text: 'All Events Report',
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        children: [new TextRun({ text: `Generated on: ${new Date().toLocaleString()}` })],
      }),
      ...filtered.flatMap((event, idx) => ([
        new Paragraph({ text: `${idx + 1}. ${event.title}`, heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: `Department: ${event.department}` }),
        new Paragraph({ text: `Type: ${event.type}` }),
        new Paragraph({ text: `Date: ${event.date || 'N/A'}` }),
        new Paragraph({ text: `Venue: ${event.venue || 'N/A'}` }),
        new Paragraph({ text: `Students: ${event.students} | Faculty: ${event.faculty}` }),
        new Paragraph({ text: '' }),
      ])),
    ];

    const doc = new Document({
      sections: [{ children: content }],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'all-events-report.docx';
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectStyle = {
    appearance: 'none',
    WebkitAppearance: 'none',
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 36px 10px 14px',
    fontSize: 14,
    width: '100%',
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
  };

  return (
    <div>
      {/* ── Page title ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Events</p>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#7B1C2A' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5e1520')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#7B1C2A')}
            >
              <span className="text-lg" aria-hidden="true">+</span>
              <span>Create Event</span>
            </button>
            <button
              onClick={downloadAllEventsReport}
              disabled={!filtered.length}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              Download All Events Report
            </button>
          </div>
      </div>

      {/* ── Filter card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <p className="text-xs font-semibold text-gray-400 tracking-widest mb-4"></p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 tracking-wider mb-2">DEPARTMENT</label>
            <div className="relative">
              <select value={dept} onChange={e => setDept(e.target.value)} style={selectStyle}>
                {departments.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 tracking-wider mb-2">EVENT TYPE</label>
            <div className="relative">
              <select value={type} onChange={e => setType(e.target.value)} style={selectStyle}>
                {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 tracking-wider mb-2">EVENT NAME</label>
            <div className="relative">
              <select value={name} onChange={e => setName(e.target.value)} style={selectStyle}>
                <option>All</option>
                {eventsWithSamples.map(e => <option key={e.id}>{e.title}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 tracking-wider mb-2">DATE</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              placeholder="Select date"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400"
            />
          </div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Reset
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {DATE_VIEWS.map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => setDateView(view)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              dateView === view ? 'text-white' : 'text-gray-700 bg-white border border-gray-200'
            }`}
            style={dateView === view ? { backgroundColor: '#7B1C2A' } : undefined}
          >
            {view}
          </button>
        ))}
      </div>

      {showUpcoming && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-gray-500" />
            <h2 className="text-lg font-bold text-gray-800">Upcoming Events</h2>
            <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
              {upcomingEvents.length}
            </span>
          </div>
          <div className="flex flex-col gap-3 mb-6">
            {upcomingEvents.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center text-gray-400 text-sm border border-gray-100">
                No events found
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => setSelectedEvent(event)}
                  onDelete={handleDeleteEvent}
                />
              ))
            )}
          </div>
        </>
      )}

      {showConducted && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-gray-500" />
            <h2 className="text-lg font-bold text-gray-800">Conducted Events</h2>
            <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">
              {conductedEvents.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {conductedEvents.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center text-gray-400 text-sm border border-gray-100">
                No events found
              </div>
            ) : (
              conductedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => setSelectedEvent(event)}
                  onDelete={handleDeleteEvent}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* ── Modals ── */}
      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => setEvents(loadEvents())}
        />
      )}
    </div>
  );
}
