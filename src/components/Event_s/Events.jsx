import React, { useState, useEffect } from 'react';
import { X, Download, Calendar, Users, MapPin, BookOpen, Clock } from 'lucide-react';
import { Packer } from 'docx';
import AddEventPage, { buildDocx } from './AddEventPage';

// ── Sample data ──────────────────────────────────────────────────────────────
const SAMPLE_EVENTS = [
  {
    id: 1,
    title: 'International Conference on Data Science',
    type: 'In-House',
    typeBg: 'bg-pink-100 text-pink-700',
    date: '15 Apr 2026',
    rawDate: '2026-04-15',
    department: 'Computer Science',
    coordinator: 'Data Science Lab',
    venue: 'Main Auditorium',
    time: '09:00 – 17:00',
    students: 120,
    faculty: 18,
    objective: 'To explore the latest trends in data science, machine learning, and AI-driven analytics among students and faculty.',
    brief: 'The conference featured keynote sessions by leading researchers in data science. Students presented papers on machine learning and AI applications. Panel discussions covered industry trends and academic collaborations.',
    outcomes: ['Understanding of modern ML pipelines', 'Exposure to research methodologies', 'Networking with industry experts'],
  },
  {
    id: 2,
    title: 'Yoga Symposium 2026',
    type: 'External',
    typeBg: 'bg-blue-100 text-blue-700',
    date: '20 Apr 2026',
    rawDate: '2026-04-20',
    department: 'Yoga & Naturopathy',
    coordinator: 'Yoga Department',
    venue: 'Convention Hall A',
    time: '08:00 – 13:00',
    students: 200,
    faculty: 25,
    objective: 'To promote holistic wellness and traditional yoga practices among participants.',
    brief: 'The symposium brought together yoga practitioners and researchers. Sessions included pranayama techniques, meditation practices, and scientific evidence on yoga therapy.',
    outcomes: ['Awareness of yoga therapy', 'Practical pranayama skills', 'Scientific understanding of yoga'],
  },
  {
    id: 3,
    title: 'National Workshop on Vedic Mathematics',
    type: 'In-House',
    typeBg: 'bg-pink-100 text-pink-700',
    date: '25 Apr 2026',
    rawDate: '2026-04-25',
    department: 'Mathematics',
    coordinator: 'Academic Cell',
    venue: 'Seminar Hall B',
    time: '10:00 – 16:00',
    students: 90,
    faculty: 12,
    objective: 'To introduce Vedic mathematical concepts and their modern applications.',
    brief: 'Experts conducted interactive workshops on Vedic sutras and their computational applications. Students practiced rapid calculation techniques and explored historical roots.',
    outcomes: ['Faster mental arithmetic', 'Historical context of Vedic math', 'Application in competitive exams'],
  },
];

const DEPARTMENTS = ['All', 'Computer Science', 'Yoga & Naturopathy', 'Mathematics'];
const EVENT_TYPES = ['All Events', 'In-House', 'External'];
const DATE_VIEWS = ['All', 'Upcoming', 'Conducted'];

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
    authorityDesignation: event.authorityDesignation || '',
    logoFile: event.logoFile || null,
    eventImages: event.eventImages || [],
    feedbackImages: event.feedbackImages || [],
  };
};

// ── Reusable Modal wrapper ────────────────────────────────────────────────────
function Modal({ onClose, children, wide = false }) {
  // Lock background scroll
  useEffect(() => {
    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center p-4 overflow-hidden"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`relative bg-white rounded-lg shadow-2xl flex flex-col ${wide ? 'w-full max-w-4xl' : 'w-full max-w-2xl'}`}
        style={{ maxHeight: '90vh' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Scrollable content area */}
        <div className="overflow-y-auto flex-1 rounded-lg">
          {children}
        </div>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors s flex items-center justify-center"
        >
          <X size={18} className="text-gray-600" />
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
      <div className="px-6 pt-6 pb-5 border-b" style={{ borderColor: '#f3f4f6' }}>
        <div className="flex items-start gap-4 pr-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900">{modalTitle}</h2>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${event.typeBg}`}>
                {event.type}
              </span>
            </div>
            <p className="text-sm text-gray-600">{modalDepartment}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-6 space-y-6">
        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Calendar, label: 'Date', value: modalDate },
            { icon: Clock,    label: 'Time', value: modalTime },
            { icon: MapPin,   label: 'Venue', value: modalVenue },
            { icon: Users,    label: 'Department', value: modalDepartment },
            { icon: BookOpen, label: 'Students', value: event.students },
            { icon: Users,    label: 'Faculty', value: event.faculty },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <Icon size={16} className="mt-0.5 shrink-0" style={{ color: '#7B1C2A' }} />
              <div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
                <p className="text-sm text-gray-800 font-semibold">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Objective */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Objective</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{modalObjective}</p>
        </div>

        {/* Brief */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Event Summary</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{modalSummary}</p>
        </div>
      </div>

      {/* Footer: Download button */}
      <div className="px-6 py-5 border-t" style={{ borderColor: '#f3f4f6' }}>
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ backgroundColor: '#7B1C2A' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#5e1520'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7B1C2A'}
          onClick={downloadReport}
        >
          <Download size={16} />
          Download Report
        </button>
      </div>
    </Modal>
  );
}

// ── Add Event Modal ───────────────────────────────────────────────────────────
function AddEventModal({ onClose }) {
  return (
    <Modal onClose={onClose} wide>
      <AddEventPage />
    </Modal>
  );
}

// ── Event Card ────────────────────────────────────────────────────────────────
function EventCard({ event, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md p-5 cursor-pointer transition-all duration-200 hover:border-gray-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <h3 className="text-sm font-bold text-gray-900">{event.title}</h3>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md shrink-0 ${event.typeBg}`}>
              {event.type}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-gray-600">
              <Calendar size={14} className="shrink-0 text-indigo-500" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-600">
              <Users size={14} className="shrink-0 text-purple-500" />
              <span>{event.coordinator}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-600">
              <BookOpen size={14} className="shrink-0 text-teal-500" />
              <span>{event.department}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-600">
              <MapPin size={14} className="shrink-0 text-red-500" />
              <span>{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Clock icon on right */}
        <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 hover:bg-gray-100 transition-colors">
          <Clock size={16} className="text-gray-500" />
        </div>
      </div>
    </div>
  );
}

// ── Main Events Page ──────────────────────────────────────────────────────────
export default function Events() {
  const [dept, setDept]       = useState('All');
  const [type, setType]       = useState('All Events');
  const [name, setName]       = useState('All');
  const [date, setDate]       = useState('');
  const [dateView, setDateView] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddModal, setShowAddModal]   = useState(false);

  const filtered = SAMPLE_EVENTS.filter(e => {
    if (dept !== 'All' && e.department !== dept) return false;
    if (type !== 'All Events' && e.type !== type) return false;
    if (name !== 'All' && e.title !== name) return false;
    if (date && toIsoDate(getEventDateValue(e)) !== date) return false;
    return true;
  });

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
    <div className="h-screen overflow-y-auto bg-gray-50">
      <div className="px-6 py-6 min-h-full">
        {/* ── Page title ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Events Management</p>
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#7B1C2A' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#5e1520'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7B1C2A'}
          >
            <span className="text-lg">+</span> Create Event
          </button>
        </div>

      {/* ── Filter card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <p className="text-xs font-semibold text-gray-600 tracking-widest mb-5 uppercase">Filters</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 tracking-wider mb-2 uppercase">Department</label>
            <div className="relative">
              <select value={dept} onChange={e => setDept(e.target.value)} style={selectStyle}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 tracking-wider mb-2 uppercase">Event Type</label>
            <div className="relative">
              <select value={type} onChange={e => setType(e.target.value)} style={selectStyle}>
                {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 tracking-wider mb-2 uppercase">Event Name</label>
            <div className="relative">
              <select value={name} onChange={e => setName(e.target.value)} style={selectStyle}>
                <option>All</option>
                {SAMPLE_EVENTS.map(e => <option key={e.id}>{e.title}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 tracking-wider mb-2 uppercase">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              placeholder="Select date"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg px-4 py-2 transition-colors hover:bg-gray-50"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Reset Filters
        </button>
      </div>

      <div className="flex items-center gap-3 mb-8">
        {DATE_VIEWS.map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => setDateView(view)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              dateView === view 
                ? 'text-white shadow-md' 
                : 'text-gray-700 bg-white border border-gray-200 hover:border-gray-300'
            }`}
            style={dateView === view ? { backgroundColor: '#7B1C2A' } : undefined}
          >
            {view}
          </button>
        ))}
      </div>

      {showUpcoming && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <Clock size={20} style={{ color: '#7B1C2A' }} className="shrink-0" />
            <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
            <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
              {upcomingEvents.length}
            </span>
          </div>
          <div className="flex flex-col gap-3 mb-8">
            {upcomingEvents.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center text-gray-400 text-sm border border-gray-100">
                <p>No upcoming events found</p>
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
              ))
            )}
          </div>
        </>
      )}

      {showConducted && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <Clock size={20} style={{ color: '#7B1C2A' }} className="shrink-0" />
            <h2 className="text-xl font-bold text-gray-900">Conducted Events</h2>
            <span className="w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">
              {conductedEvents.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {conductedEvents.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center text-gray-400 text-sm border border-gray-100">
                <p>No conducted events found</p>
              </div>
            ) : (
              conductedEvents.map((event) => (
                <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
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
        <AddEventModal onClose={() => setShowAddModal(false)} />
      )}
      </div>
    </div>
  );
}
