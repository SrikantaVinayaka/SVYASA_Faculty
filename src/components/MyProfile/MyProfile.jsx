import { useState, useRef } from "react";
import html2pdf from "html2pdf.js";

const BRAND = "#7B1D2E";
const BRAND_LIGHT = "rgba(123,29,46,0.08)";

const PERSONAL_LINKS = [
  { label: "Profile Summary", icon: "👤" },
  { label: "Education", icon: "🎓" },
  { label: "Languages", icon: "🌐" },
  { label: "Personal Details", icon: "📋" },
  { label: "Hobbies", icon: "✏️" },
];

const PROFESSIONAL_LINKS = [
  { label: "Work Experience", icon: "💼" },
  { label: "Technical Skills", icon: "⚙️" },
  { label: "Publications", icon: "📚" },
  { label: "Projects", icon: "🧩" },
  { label: "Patents", icon: "💡" },
  { label: "Certifications", icon: "🏅" },
  { label: "Events", icon: "📡" },
  { label: "Honors & Award", icon: "🛡️" },
  { label: "Scholarships", icon: "🎓" },
  { label: "Membership", icon: "🪪" },
  { label: "Other Achievements", icon: "🏆" },
  { label: "Training Details", icon: "📒" },
  { label: "Competitive Exam", icon: "📄" },
  { label: "Career Details", icon: "💼" },
  { label: "Official Registration", icon: "🖥️" },
  { label: "Refresher Course", icon: "📖" },
];

const PERSONAL_SECTIONS = [
  { id: "profile-summary", label: "Profile Summary", icon: "👤" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "languages", label: "Languages", icon: "🌐" },
  { id: "personal-details", label: "Personal Details", icon: "📋" },
  { id: "hobbies", label: "Hobbies", icon: "✏️" },
];

const PROFESSIONAL_SECTIONS = [
  { id: "work-experience", label: "Work Experience", icon: "💼" },
  { id: "technical-skills", label: "Technical Skills", icon: "⚙️" },
  { id: "publications", label: "Publications", icon: "📚" },
  { id: "projects", label: "Projects", icon: "🧩" },
  { id: "patents", label: "Patents", icon: "💡" },
  { id: "certifications", label: "Certifications", icon: "🏅" },
  { id: "events", label: "Events", icon: "📡" },
  { id: "honors-award", label: "Honors & Award", icon: "🛡️" },
  { id: "scholarships", label: "Scholarships", icon: "🎓" },
  { id: "membership", label: "Membership", icon: "🪪" },
  { id: "other-achievements", label: "Other Achievements", icon: "🏆" },
  { id: "training-details", label: "Training Details", icon: "📒" },
  { id: "competitive-exam", label: "Competitive Exam", icon: "📄" },
  { id: "career-details", label: "Career Details", icon: "💼" },
  { id: "official-registration", label: "Official Registration", icon: "🖥️" },
  { id: "refresher-course", label: "Refresher Course", icon: "📖" },
];

const BASIC_DETAILS = [
  { label: "Employee ID", value: "GCC1228", icon: "🪪" },
  { label: "Contact #", value: "9902084476", icon: "📞" },
  { label: "Date of Birth", value: "—", icon: "🎂" },
  { label: "Email", value: "csa-associate-dean@svyasa.edu.in", icon: "✉️" },
  { label: "Gender", value: "Female", icon: "👤" },
  { label: "Blood Group", value: "—", icon: "🩸" },
  { label: "Local Address", value: "—", icon: "🏠" },
  { label: "Permanent Address", value: "—", icon: "🏡" },
];

export default function MyProfile() {
  const [activeTab, setActiveTab] = useState("Personal Details");
  const [openSection, setOpenSection] = useState(null);
  const [activeLink, setActiveLink] = useState("Profile Summary");
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const contentRef = useRef(null);

  const QUICK_LINKS = activeTab === "Personal Details" ? PERSONAL_LINKS : PROFESSIONAL_LINKS;
  const SECTIONS = activeTab === "Personal Details" ? PERSONAL_SECTIONS : PROFESSIONAL_SECTIONS;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setOpenSection(null);
    setActiveLink(tab === "Personal Details" ? "Profile Summary" : "Work Experience");
  };

  const toggleSection = (label) => {
    setOpenSection(openSection === label ? null : label);
    setActiveLink(label);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setProfileImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadPDF = () => {
    const element = contentRef.current;
    const opt = {
      margin: 1,
      filename: 'my-profile.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div ref={contentRef} style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#F0F4F8", minHeight: "100vh", overflowY: "auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .fade-in { animation: fadeIn 0.5s ease both; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px);} to { opacity:1; transform:none; } }
        .section-hover { transition: all 0.2s ease; }
        .section-hover:hover { background: rgba(123,29,46,0.03); }
        .tab-underline { position: relative; }
        .tab-underline::after {
          content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
          height: 3px; border-radius: 2px;
          background: linear-gradient(90deg, #7B1D2E, #e85a72);
        }
        .quick-link { transition: all 0.18s ease; }
        .quick-link:hover { background: rgba(123,29,46,0.08); transform: translateX(4px); }
        .active-link { background: rgba(123,29,46,0.10) !important; color: #7B1D2E !important; font-weight: 600; }
        .info-card { transition: transform 0.2s, box-shadow 0.2s; }
        .info-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.10); }
        .download-btn { transition: all 0.2s ease; }
        .download-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(123,29,46,0.35); }
        .progress-bar {
          background: linear-gradient(90deg, #7B1D2E, #e85a72, #f0a0b0);
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }
        @keyframes shimmer { 0%{ background-position: 200% 0; } 100%{ background-position: -200% 0; } }
        .section-toggle { transition: transform 0.25s ease; display: inline-block; }
        .section-toggle.open { transform: rotate(45deg); }
      `}</style>

      {/* BREADCRUMB */}
      <div className="px-6 pt-5 pb-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>⊞</span>
          <span>My Profile</span>
        </div>
      </div>

      {/* HERO PROFILE CARD */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden fade-in">

          {/* Gradient Banner */}
          <div
            className="h-28 w-full relative"
            style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #a53050 50%, #d4607a 100%)` }}
          >
            <div className="absolute top-3 right-8 w-16 h-16 rounded-full bg-white/5" />
            <div className="absolute top-6 right-24 w-8 h-8 rounded-full bg-white/5" />
          </div>

          {/* Profile Content */}
          <div className="px-6 pb-6">

            {/* Avatar + Download row */}
            <div className="flex items-end justify-between" style={{ marginTop: "-48px" }}>
              {/* Avatar */}
              <div
                className="w-24 h-24 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-3xl font-bold relative shrink-0"
                style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #c45070 100%)`, color: "#fff" }}
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  "DB"
                )}
                <div
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm shadow-md cursor-pointer"
                  style={{ background: BRAND }}
                  onClick={() => fileInputRef.current.click()}
                >
                  +
                </div>
              </div>

              {/* Download PDF */}
              <button
                className="download-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md"
                style={{ background: `linear-gradient(135deg, ${BRAND}, #a53050)` }}
                onClick={handleDownloadPDF}
              >
                <span>⬇</span> Download PDF
              </button>
            </div>

            {/* Name & Role — clearly below avatar */}
            <div className="mt-3">
              <h1 className="text-2xl font-bold text-slate-800">Dr Dr. Bharathi</h1>
              <p className="text-slate-500 text-sm mt-0.5">Data science and Big data analytics</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: BRAND_LIGHT, color: BRAND }}
                >
                  FACULTY
                </span>
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-emerald-50 text-emerald-600">
                  Active
                </span>
              </div>
            </div>

            {/* Basic Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {BASIC_DETAILS.map((item, i) => (
                <div
                  key={item.label}
                  className="info-card fade-in bg-slate-50 rounded-xl p-4 border border-slate-100"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {item.label}
                    </span>
                  </div>
                  <div
                    className="text-sm font-medium truncate"
                    style={{ color: item.value === "—" ? "#cbd5e1" : "#1e293b" }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Profile Completion */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  📈 Profile Completion
                </span>
                <span className="text-xs font-bold" style={{ color: BRAND }}>35%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-2 rounded-full progress-bar" style={{ width: "35%" }} />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Complete your profile to unlock all features
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* TABS + CONTENT */}
      <div className="px-6 pb-8">

        {/* Tab Bar */}
        <div className="flex gap-1 border-b border-slate-200 mb-6">
          {["Personal Details", "Professional Details"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-5 py-3 text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "tab-underline text-slate-800"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-5">

          {/* QUICK LINKS */}
          <div className="md:w-56 shrink-0 fade-in">
            <div
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sticky top-4"
              style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
                Quick Links
              </h3>
              <div className="flex flex-col gap-1">
                {QUICK_LINKS.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => toggleSection(link.label)}
                    className={`quick-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left w-full ${
                      activeLink === link.label ? "active-link" : "text-slate-600"
                    }`}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                      style={{
                        background: activeLink === link.label ? BRAND_LIGHT : "#F0F4F8",
                      }}
                    >
                      {link.icon}
                    </span>
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ACCORDION SECTIONS */}
          <div className="flex-1 flex flex-col gap-3">
            {SECTIONS.map((section, i) => (
              <div
                key={section.id}
                className="fade-in bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <button
                  onClick={() => toggleSection(section.label)}
                  className="section-hover w-full flex items-center justify-between px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                      style={{ background: BRAND_LIGHT }}
                    >
                      {section.icon}
                    </div>
                    <span
                      className="font-semibold text-sm"
                      style={{ color: openSection === section.label ? BRAND : "#334155" }}
                    >
                      {section.label}
                    </span>
                  </div>
                  <span
                    className={`section-toggle text-slate-400 text-xl font-light ${
                      openSection === section.label ? "open" : ""
                    }`}
                    style={{ color: openSection === section.label ? BRAND : undefined }}
                  >
                    +
                  </span>
                </button>

                {openSection === section.label && (
                  <div
                    className="px-5 pb-5 pt-1 border-t"
                    style={{ borderColor: "rgba(123,29,46,0.08)" }}
                  >
                    <div className="text-slate-400 text-sm italic text-center py-6">
                      No information added yet.{" "}
                      <span
                        className="cursor-pointer font-medium not-italic"
                        style={{ color: BRAND }}
                      >
                        + Add {section.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </div>
  );
} 