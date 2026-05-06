import React, { useState } from 'react';
import {
  User, Phone, Mail, Droplet, MapPin, Calendar,
  CreditCard, Plus, Download,
  Briefcase, Cpu, BookOpen, FolderGit2, Lightbulb,
  Award, GraduationCap, Globe, ClipboardList, Star,
  Users, X
} from 'lucide-react';

/* ─── DATA ──────────────────────────────────────────── */
const INFO_CARDS = [
  { label: 'EMPLOYEE ID',        value: 'GCC1228',                         emoji: '🪪' },
  { label: 'CONTACT #',          value: '9902084476',                       emoji: '📞' },
  { label: 'DATE OF BIRTH',      value: null,                               emoji: '🎂' },
  { label: 'EMAIL',              value: 'csa-associate-dean@svyasa.edu.in', emoji: '📧' },
  { label: 'GENDER',             value: 'Female',                           emoji: '🧑' },
  { label: 'BLOOD GROUP',        value: null,                               emoji: '🩸' },
  { label: 'LOCAL ADDRESS',      value: null,                               emoji: '🏠' },
  { label: 'PERMANENT ADDRESS',  value: null,                               emoji: '🏡' },
];

const PERSONAL_SECTIONS = [
  { id: 'summary',   label: 'Profile Summary',  emoji: '🧑' },
  { id: 'education', label: 'Education',        emoji: '🎓' },
  { id: 'languages', label: 'Languages',        emoji: '🌐' },
  { id: 'personal',  label: 'Personal Details', emoji: '📋' },
  { id: 'hobbies',   label: 'Hobbies',          emoji: '✏️' },
];

const PROFESSIONAL_SECTIONS = [
  { id: 'work',           label: 'Work Experience',   emoji: '💼' },
  { id: 'technical',      label: 'Technical Skills',  emoji: '⚙️' },
  { id: 'publications',   label: 'Publications',      emoji: '📚' },
  { id: 'projects',       label: 'Projects',          emoji: '🧩' },
  { id: 'patents',        label: 'Patents',           emoji: '💡' },
  { id: 'certifications', label: 'Certifications',    emoji: '🏅' },
  { id: 'events',         label: 'Events',            emoji: '🎉' },
  { id: 'honors',         label: 'Honors & Award',    emoji: '🛡️' },
  { id: 'scholarships',   label: 'Scholarships',      emoji: '🎓' },
  { id: 'membership',     label: 'Membership',        emoji: '🪪' },
];

/* ─── INFO CARD ─────────────────────────────────────── */
function InfoCard({ emoji, label, value }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-1 min-h-20">
      <div className="flex items-center gap-1.5">
        <span className="text-base">{emoji}</span>
        <span className="text-[10px] font-semibold text-gray-400 tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-medium text-gray-700 pl-1">{value ?? '—'}</p>
    </div>
  );
}

/* ─── SECTION CARD ──────────────────────────────────── */
function SectionCard({ id, label, emoji, isOpen, onToggle, isSummary }) {
  const [showForm, setShowForm] = useState(false);
  return (
    <div id={'section-' + id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: '#F9E8EA' }}>
            {emoji}
          </div>
          <span className="font-semibold text-gray-700 text-sm">{label}</span>
        </div>
        {isOpen ? <X size={16} className="text-gray-400" /> : <Plus size={16} className="text-gray-400" />}
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 px-5 py-5">
          {isSummary && !showForm ? (
            <div className="text-center py-2">
              <p className="text-sm text-gray-400 italic">
                No information added yet.{' '}
                <button onClick={() => setShowForm(true)} className="font-semibold not-italic" style={{ color: '#7B1C2A' }}>
                  + Add Profile Summary
                </button>
              </p>
            </div>
          ) : isSummary && showForm ? (
            <div className="space-y-3">
              <textarea
                rows={4}
                placeholder="Write a brief summary about yourself..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none resize-none"
                style={{ focusBorderColor: '#7B1C2A' }}
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowForm(false)} className="px-4 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button className="px-4 py-1.5 text-sm text-white rounded-lg" style={{ backgroundColor: '#7B1C2A' }}>Save</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-2">
              <p className="text-sm text-gray-400 italic">No information added yet.</p>
              <button
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-lg border"
                style={{ color: '#7B1C2A', borderColor: '#7B1C2A' }}
              >
                <Plus size={14} /> Add {label}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── MAIN PROFILE PAGE ──────────────────────────────── */
const Profile = () => {
  const [activeTab, setActiveTab]       = useState('personal');
  const [activeLink, setActiveLink]     = useState('summary');
  const [openSections, setOpenSections] = useState({ summary: true });

  const sections = activeTab === 'personal' ? PERSONAL_SECTIONS : PROFESSIONAL_SECTIONS;

  const toggleSection = (id) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  const scrollTo = (id) => {
    setActiveLink(id);
    if (!openSections[id]) setOpenSections(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      const el = document.getElementById('section-' + id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    const first = (tab === 'personal' ? PERSONAL_SECTIONS : PROFESSIONAL_SECTIONS)[0].id;
    setActiveLink(first);
    setOpenSections({ [first]: true });
  };

  return (
    <div className="min-h-full" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ── PROFILE BANNER CARD ── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-visible mb-5">
        <div className="h-36 rounded-t-2xl relative" style={{ background: 'linear-gradient(135deg, #7B1C2A 0%, #9B2535 55%, #C04060 100%)' }}>
          <button
            className="absolute right-5 bottom-4 flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#5E1520' }}
          >
            <Download size={15} />
            Download PDF
          </button>
        </div>

        <div className="px-6 pb-5 relative">
          <div className="flex items-end gap-4 -mt-10 mb-3">
            <div
              className="relative w-20 h-20 rounded-full border-4 border-white shadow-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #7B1C2A, #9B2535)' }}
            >
              <span className="text-white text-xl font-bold">DB</span>
              <button
                className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center shadow"
                style={{ borderColor: '#7B1C2A' }}
              >
                <Plus size={12} style={{ color: '#7B1C2A' }} />
              </button>
            </div>
            <div className="mb-1">
              <h2 className="text-xl font-bold text-gray-800">Dr Dr. Bharathi</h2>
              <p className="text-sm text-gray-500">Data science and Big data analytics</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border" style={{ color: '#7B1C2A', borderColor: '#7B1C2A', backgroundColor: '#FDF0F1' }}>
                  FACULTY
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border" style={{ color: '#16a34a', borderColor: '#16a34a', backgroundColor: '#f0fdf4' }}>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── INFO CARDS GRID ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {INFO_CARDS.map((card) => (
          <InfoCard key={card.label} emoji={card.emoji} label={card.label} value={card.value} />
        ))}
      </div>

      {/* ── PROFILE COMPLETION ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">📝</span>
            <span className="text-xs font-semibold text-gray-500 tracking-wider">PROFILE COMPLETION</span>
          </div>
          <span className="text-sm font-bold" style={{ color: '#7B1C2A' }}>35%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
          <div className="h-2 rounded-full" style={{ width: '35%', background: 'linear-gradient(90deg, #7B1C2A, #C04060)' }} />
        </div>
        <p className="text-xs text-gray-400">Complete your profile to unlock all features</p>
      </div>

      {/* ── TABS ── */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-2">
        {[
          { id: 'personal',     label: 'Personal Details' },
          { id: 'professional', label: 'Professional Details' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabSwitch(tab.id)}
            className="px-5 py-3.5 text-sm font-semibold transition-colors border-b-2 -mb-px"
            style={activeTab === tab.id
              ? { borderColor: '#7B1C2A', color: '#7B1C2A' }
              : { borderColor: 'transparent', color: '#9ca3af' }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── INNER LAYOUT ── */}
      <div className="flex bg-white rounded-b-xl shadow-sm overflow-hidden">

        {/* Inner Quick-Links sidebar */}
        <div className="w-52 shrink-0 border-r border-gray-100 py-4 overflow-y-auto" style={{ maxHeight: '580px' }}>
          <p className="text-[10px] font-bold text-gray-400 tracking-widest px-4 mb-3 uppercase">Quick Links</p>
          <nav className="flex flex-col gap-0.5 px-2">
            {sections.map(({ id, label, emoji }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-left w-full transition-all"
                style={activeLink === id
                  ? { backgroundColor: '#FDF0F1', color: '#7B1C2A', fontWeight: 600 }
                  : { color: '#6b7280' }
                }
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
                  style={{ backgroundColor: activeLink === id ? '#F9D0D5' : '#f3f4f6' }}
                >
                  {emoji}
                </div>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sections content */}
        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-3" style={{ maxHeight: '580px' }}>
          {sections.map(({ id, label, emoji }) => (
            <SectionCard
              key={id}
              id={id}
              label={label}
              emoji={emoji}
              isOpen={!!openSections[id]}
              onToggle={() => toggleSection(id)}
              isSummary={id === 'summary'}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
