import { useState, useRef } from "react";
import { createPortal } from "react-dom";

const BRAND = "#7B1D2E";
const BRAND_LIGHT = "rgba(123,29,46,0.08)";

/* ─── SECTION CONFIGS ────────────────────────────────── */
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
  { label: "Funding Projects", icon: "🧩" },
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
  { id: "projects", label: "Funding Projects", icon: "🧩" },
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

/* ─── PROFILE DATA CONFIG ─────────────────────────────── */
const BASIC_DETAILS_CONFIG = [
  { key: "employeeId",       label: "Employee ID",        icon: "🪪",  type: "text",     placeholder: "e.g. GCC1228" },
  { key: "contact",          label: "Contact #",          icon: "📞",  type: "tel",      placeholder: "e.g. 9902084476" },
  { key: "dob",              label: "Date of Birth",      icon: "🎂",  type: "date",     placeholder: "" },
  { key: "email",            label: "Email",              icon: "✉️",  type: "email",    placeholder: "e.g. name@example.com" },
  { key: "gender",           label: "Gender",             icon: "👤",  type: "select",   options: ["", "Male", "Female", "Non-binary", "Prefer not to say"] },
  { key: "bloodGroup",       label: "Blood Group",        icon: "🩸",  type: "select",   options: ["", "A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"] },
  { key: "localAddress",     label: "Local Address",      icon: "🏠",  type: "textarea", placeholder: "Enter local address" },
  { key: "permanentAddress", label: "Permanent Address",  icon: "🏡",  type: "textarea", placeholder: "Enter permanent address" },
];

const INITIAL_PROFILE_DATA = {
  employeeId: "GCC1228",
  contact: "9902084476",
  dob: "",
  email: "csa-associate-dean@svyasa.edu.in",
  gender: "Female",
  bloodGroup: "",
  localAddress: "",
  permanentAddress: "",
};

function calcCompletion(data) {
  const filled = Object.keys(INITIAL_PROFILE_DATA).filter(k => data[k] && data[k] !== "").length;
  return Math.round((filled / Object.keys(INITIAL_PROFILE_DATA).length) * 100);
}

/* ─── SHARED INLINE STYLES ───────────────────────────── */
const inputStyle = {
  width: "100%",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "8px 12px",
  fontSize: "13px",
  color: "#334155",
  outline: "none",
  background: "#fff",
  fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  boxSizing: "border-box",
};

const labelStyle = {
  fontSize: "11px",
  fontWeight: 600,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  display: "block",
  marginBottom: "4px",
};

const btnPrimary = {
  padding: "7px 18px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#fff",
  background: `linear-gradient(135deg, ${BRAND}, #a53050)`,
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
};

const btnOutline = {
  padding: "7px 18px",
  fontSize: "13px",
  fontWeight: 600,
  color: BRAND,
  background: "#fff",
  border: `1px solid ${BRAND}`,
  borderRadius: "10px",
  cursor: "pointer",
};

const btnGhost = {
  padding: "7px 18px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#64748b",
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  cursor: "pointer",
};

const btnDanger = {
  padding: "5px 12px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#dc2626",
  background: "#fff",
  border: "1px solid #fca5a5",
  borderRadius: "8px",
  cursor: "pointer",
};

/* ─── EDIT PROFILE MODAL ─────────────────────────────── */
function EditProfileModal({ profileData, onSave, onCancel }) {
  const [draft, setDraft] = useState({ ...profileData });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "480px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px 14px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: BRAND_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✏️</div>
            <span style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>Edit Profile</span>
          </div>
          <button onClick={onCancel} style={{ width: 28, height: 28, borderRadius: "50%", background: "#f1f5f9", border: "none", cursor: "pointer", fontSize: 14, color: "#64748b" }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {BASIC_DETAILS_CONFIG.map(({ key, label, type, placeholder, options }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              {type === "textarea" ? (
                <textarea rows={2} value={draft[key] ?? ""} placeholder={placeholder}
                  onChange={e => setDraft(p => ({ ...p, [key]: e.target.value }))}
                  style={{ ...inputStyle, resize: "none" }} />
              ) : type === "select" ? (
                <select value={draft[key] ?? ""} onChange={e => setDraft(p => ({ ...p, [key]: e.target.value }))} style={inputStyle}>
                  {options.map(opt => <option key={opt} value={opt}>{opt === "" ? `Select ${label}` : opt}</option>)}
                </select>
              ) : (
                <input type={type} value={draft[key] ?? ""} placeholder={placeholder}
                  onChange={e => setDraft(p => ({ ...p, [key]: e.target.value }))} style={inputStyle} />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", padding: "14px 24px 18px", borderTop: "1px solid #f1f5f9", background: "#fafafa", borderRadius: "0 0 20px 20px" }}>
          <button onClick={onCancel} style={btnGhost}>Cancel</button>
          <button onClick={() => onSave(draft)} style={btnPrimary}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

/* ─── PROFILE SUMMARY SECTION ────────────────────────── */
const EMPTY_SUMMARY = { designation: "", department: "", specialization: "", experience: "", researchInterests: "", summary: "" };

function ProfileSummarySection() {
  const [mode, setMode] = useState("empty");
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState({ ...EMPTY_SUMMARY });

  const openAdd  = () => { setDraft({ ...EMPTY_SUMMARY }); setMode("form"); };
  const openEdit = () => { setDraft({ ...saved }); setMode("form"); };
  const cancel   = () => setMode(saved ? "view" : "empty");
  const reset    = () => setDraft({ ...EMPTY_SUMMARY });
  const save     = () => { setSaved({ ...draft }); setMode("view"); };
  const del      = () => { setSaved(null); setDraft({ ...EMPTY_SUMMARY }); setMode("empty"); };

  const renderField = (key, label, type = "text", placeholder = "", rows = 1) => (
    <div key={key} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label style={labelStyle}>{label}</label>
      {type === "textarea" ? (
        <textarea rows={rows} value={draft[key]} placeholder={placeholder}
          onChange={e => setDraft(p => ({ ...p, [key]: e.target.value }))}
          style={{ ...inputStyle, resize: "none" }} />
      ) : (
        <input type={type} value={draft[key]} placeholder={placeholder}
          onChange={e => setDraft(p => ({ ...p, [key]: e.target.value }))} style={inputStyle} />
      )}
    </div>
  );

  if (mode === "empty") return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "20px 0" }}>
      <p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>No information added yet.</p>
      <button onClick={openAdd} style={btnPrimary}>+ Add Professional Summary</button>
    </div>
  );

  if (mode === "form") return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {renderField("designation",    "Designation",            "text", "e.g. Assistant Professor")}
        {renderField("department",     "Department",             "text", "e.g. Computer Science")}
        {renderField("specialization", "Area of Specialization", "text", "e.g. Machine Learning")}
        {renderField("experience",     "Years of Experience",    "text", "e.g. 8 years")}
      </div>
      {renderField("researchInterests", "Research Interests",    "textarea", "e.g. Deep Learning, NLP, Computer Vision", 2)}
      {renderField("summary",           "Professional Summary",  "textarea", "Write a professional summary about yourself...", 4)}
      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", paddingTop: "4px" }}>
        <button onClick={cancel} style={btnGhost}>Cancel</button>
        <button onClick={reset}  style={btnOutline}>Reset</button>
        <button onClick={save}   style={btnPrimary}>Save</button>
      </div>
    </div>
  );

  // view mode
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b", margin: 0 }}>{saved.designation || "—"}</p>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0" }}>{saved.department || "—"}</p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <button onClick={openEdit} style={{ ...btnOutline, padding: "5px 12px", fontSize: "12px" }}>✏️ Edit</button>
            <button onClick={del}      style={btnDanger}>🗑 Delete</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[["Area of Specialization", saved.specialization], ["Years of Experience", saved.experience]].map(([lbl, val]) => (
            <div key={lbl} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 12px" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 3px" }}>{lbl}</p>
              <p style={{ fontSize: "13px", color: "#334155", fontWeight: 500, margin: 0 }}>{val || "—"}</p>
            </div>
          ))}
        </div>
        {saved.researchInterests && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 12px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 3px" }}>Research Interests</p>
            <p style={{ fontSize: "13px", color: "#334155", margin: 0 }}>{saved.researchInterests}</p>
          </div>
        )}
        {saved.summary && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 12px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>Professional Summary</p>
            <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", margin: 0 }}>{saved.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── LANGUAGES SECTION ──────────────────────────────── */
const EMPTY_LANG = { name: "", read: false, speak: false, write: false };
const LANG_OPTIONS = ["English","Hindi","Kannada","Tamil","Telugu","Malayalam","Marathi","Bengali","Gujarati","Punjabi","Other"];

function LanguagesSection() {
  const [languages, setLanguages] = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [editIdx, setEditIdx]     = useState(null);
  const [draft, setDraft]         = useState({ ...EMPTY_LANG });

  const openAdd  = ()  => { setDraft({ ...EMPTY_LANG }); setEditIdx(null); setShowForm(true); };
  const openEdit = (i) => { setDraft({ ...languages[i] }); setEditIdx(i); setShowForm(true); };
  const cancel   = ()  => setShowForm(false);
  const reset    = ()  => setDraft({ ...EMPTY_LANG });
  const del      = (i) => setLanguages(prev => prev.filter((_, idx) => idx !== i));
  const save     = ()  => {
    if (!draft.name) return;
    setLanguages(prev =>
      editIdx !== null
        ? prev.map((l, i) => i === editIdx ? { ...draft } : l)
        : [...prev, { ...draft }]
    );
    setShowForm(false);
  };

  const proficiency = (lang) => {
    const parts = [];
    if (lang.read)  parts.push("Read");
    if (lang.speak) parts.push("Speak");
    if (lang.write) parts.push("Write");
    return parts.length ? parts.join(", ") : "—";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* Table */}
      {languages.length > 0 && (
        <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: BRAND_LIGHT }}>
                {["#", "Language", "Proficiency Level", "Actions"].map((h, i) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: i === 3 ? "right" : "left", fontSize: "11px", fontWeight: 700, color: BRAND, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {languages.map((lang, i) => (
                <tr key={i} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 14px", color: "#94a3b8", fontSize: "12px" }}>{i + 1}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "#1e293b" }}>{lang.name}</td>
                  <td style={{ padding: "12px 14px", color: "#475569" }}>{proficiency(lang)}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button onClick={() => openEdit(i)} style={{ ...btnOutline, padding: "4px 10px", fontSize: "12px" }}>✏️ Edit</button>
                      <button onClick={() => del(i)} style={btnDanger}>🗑 Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {languages.length === 0 && !showForm && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "20px 0" }}>
          <p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>No information added yet.</p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
            {editIdx !== null ? "Edit Language" : "Add Language"}
          </p>
          <div>
            <label style={labelStyle}>Language Name</label>
            <select value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))} style={inputStyle}>
              <option value="">Select Language</option>
              {LANG_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Proficiency</label>
            <div style={{ display: "flex", gap: "20px", marginTop: "6px" }}>
              {["read", "speak", "write"].map(k => (
                <label key={k} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px", color: "#334155" }}>
                  <input type="checkbox" checked={draft[k]}
                    onChange={e => setDraft(p => ({ ...p, [k]: e.target.checked }))}
                    style={{ width: 15, height: 15, accentColor: BRAND }} />
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button onClick={cancel} style={btnGhost}>Cancel</button>
            <button onClick={reset}  style={btnOutline}>Reset</button>
            <button onClick={save}   style={btnPrimary}>Save</button>
          </div>
        </div>
      )}

      {/* Add button */}
      {!showForm && (
        <div>
          <button onClick={openAdd} style={btnPrimary}>+ Add Language</button>
        </div>
      )}
    </div>
  );
}

/* ─── WORK EXPERIENCE SECTION ────────────────────────── */
const EMPTY_WORK = {
  category: "", organization: "", designation: "", description: "",
  fromDate: "", toDate: "", currentlyWorking: false,
  offerDetails: "", docName: "", docData: "", docError: "",
};
const WORK_CATEGORIES = ["", "Full-Time", "Part-Time", "Contract", "Internship", "Freelance", "Visiting Faculty", "Research", "Consultancy", "Other"];
const MAX_DOC_SIZE = 1 * 1024 * 1024; // 1 MB

function WorkExperienceSection() {
  const [records, setRecords]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editIdx, setEditIdx]   = useState(null);
  const [draft, setDraft]       = useState({ ...EMPTY_WORK });
  const fileRef                 = useRef(null);

  const openAdd  = ()  => { setDraft({ ...EMPTY_WORK }); setEditIdx(null); setShowForm(true); };
  const openEdit = (i) => { setDraft({ ...records[i], docError: "" }); setEditIdx(i); setShowForm(true); };
  const cancel   = ()  => setShowForm(false);
  const reset    = ()  => { setDraft({ ...EMPTY_WORK }); if (fileRef.current) fileRef.current.value = ""; };
  const del      = (i) => setRecords(prev => prev.filter((_, idx) => idx !== i));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_DOC_SIZE) {
      setDraft(p => ({ ...p, docError: "File exceeds 1 MB. Please choose a smaller file.", docName: "", docData: "" }));
      e.target.value = "";
      return;
    }
    const allowed = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setDraft(p => ({ ...p, docError: "Only PNG, JPG, or JPEG files are allowed.", docName: "", docData: "" }));
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setDraft(p => ({ ...p, docName: file.name, docData: ev.target.result, docError: "" }));
    reader.readAsDataURL(file);
  };

  const removeDoc = () => {
    setDraft(p => ({ ...p, docName: "", docData: "", docError: "" }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const save = () => {
    const { docError, ...toSave } = draft;
    setRecords(prev =>
      editIdx !== null
        ? prev.map((r, i) => i === editIdx ? { ...toSave } : r)
        : [...prev, { ...toSave }]
    );
    setShowForm(false);
  };

  const fmt = (dateStr) => {
    if (!dateStr) return "—";
    const [y, m] = dateStr.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[parseInt(m, 10) - 1]} ${y}`;
  };

  /* ── card meta rows helper ── */
  const MetaRow = ({ icon, label, value }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "7px" }}>
      <span style={{ fontSize: "13px", marginTop: "1px" }}>{icon}</span>
      <div>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}: </span>
        <span style={{ fontSize: "13px", color: "#334155" }}>{value}</span>
      </div>
    </div>
  );

  /* ── field wrapper ── */
  const Field = ({ label, children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* ── RECORDS ── */}
      {records.map((rec, i) => (
        <div key={i} className="info-card" style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px",
          overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          {/* Card header strip */}
          <div style={{ background: BRAND_LIGHT, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: "10px", background: BRAND, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", flexShrink: 0 }}>💼</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {rec.organization || "—"}
                </p>
                <p style={{ fontSize: "12px", color: "#475569", margin: "1px 0 0" }}>{rec.designation || "—"}</p>
              </div>
              {rec.category && (
                <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: BRAND, color: "#fff", flexShrink: 0 }}>
                  {rec.category}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <button onClick={() => openEdit(i)} style={{ ...btnOutline, padding: "5px 12px", fontSize: "12px" }}>✏️ Edit</button>
              <button onClick={() => del(i)} style={btnDanger}>🗑 Delete</button>
            </div>
          </div>

          {/* Card body */}
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <MetaRow icon="📅" label="Duration"
              value={<>{fmt(rec.fromDate)} – {rec.currentlyWorking ? <span style={{ color: "#22c55e", fontWeight: 700 }}>Present</span> : fmt(rec.toDate)}</>} />

            {rec.description && (
              <MetaRow icon="📝" label="Description" value={rec.description} />
            )}
            {rec.offerDetails && (
              <MetaRow icon="📄" label="Offer Details" value={rec.offerDetails} />
            )}
            {rec.docName && rec.docData && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <span style={{ fontSize: "13px" }}>🖼️</span>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Document: </span>
                <a href={rec.docData} download={rec.docName}
                  style={{ fontSize: "12px", color: BRAND, fontWeight: 600, textDecoration: "underline", wordBreak: "break-all" }}>
                  {rec.docName}
                </a>
                <img src={rec.docData} alt="preview"
                  style={{ width: 36, height: 36, borderRadius: "6px", objectFit: "cover", border: "1px solid #e2e8f0", marginLeft: "4px" }} />
              </div>
            )}
          </div>
        </div>
      ))}

      {/* ── EMPTY STATE ── */}
      {records.length === 0 && !showForm && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "20px 0" }}>
          <div style={{ fontSize: "36px", opacity: 0.25 }}>💼</div>
          <p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic", margin: 0 }}>No work experience added yet.</p>
        </div>
      )}

      {/* ── FORM ── */}
      {showForm && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Form title */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingBottom: "10px", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ width: 30, height: 30, borderRadius: "8px", background: BRAND_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>💼</div>
            <p style={{ fontSize: "13px", fontWeight: 700, color: BRAND, textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
              {editIdx !== null ? "Edit Work Experience" : "Add Work Experience"}
            </p>
          </div>

          {/* Row 1: Category + Designation */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Category *">
              <select value={draft.category} onChange={e => setDraft(p => ({ ...p, category: e.target.value }))} style={inputStyle}>
                {WORK_CATEGORIES.map(c => <option key={c} value={c}>{c === "" ? "Select Category" : c}</option>)}
              </select>
            </Field>
            <Field label="Designation">
              <input type="text" value={draft.designation} placeholder="e.g. Assistant Professor"
                onChange={e => setDraft(p => ({ ...p, designation: e.target.value }))} style={inputStyle} />
            </Field>
          </div>

          {/* Organization */}
          <Field label="Organization">
            <input type="text" value={draft.organization} placeholder="e.g. SVYASA University"
              onChange={e => setDraft(p => ({ ...p, organization: e.target.value }))} style={inputStyle} />
          </Field>

          {/* Description */}
          <Field label="Description">
            <textarea rows={3} value={draft.description} placeholder="Describe your role and responsibilities..."
              onChange={e => setDraft(p => ({ ...p, description: e.target.value }))}
              style={{ ...inputStyle, resize: "none" }} />
          </Field>

          {/* Row 2: From + To Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="From Date">
              <input type="month" value={draft.fromDate}
                onChange={e => setDraft(p => ({ ...p, fromDate: e.target.value }))} style={inputStyle} />
            </Field>
            <Field label="To Date">
              <input type="month" value={draft.toDate} disabled={draft.currentlyWorking}
                onChange={e => setDraft(p => ({ ...p, toDate: e.target.value }))}
                style={{ ...inputStyle, opacity: draft.currentlyWorking ? 0.45 : 1 }} />
            </Field>
          </div>

          {/* Currently Working checkbox */}
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#334155", userSelect: "none" }}>
            <input type="checkbox" checked={draft.currentlyWorking}
              onChange={e => setDraft(p => ({ ...p, currentlyWorking: e.target.checked, toDate: e.target.checked ? "" : p.toDate }))}
              style={{ width: 15, height: 15, accentColor: BRAND }} />
            Currently Working Here
          </label>

          {/* Offer Details */}
          <Field label="Offer Details">
            <textarea rows={2} value={draft.offerDetails} placeholder="e.g. Appointment letter number, salary details, offer reference..."
              onChange={e => setDraft(p => ({ ...p, offerDetails: e.target.value }))}
              style={{ ...inputStyle, resize: "none" }} />
          </Field>

          {/* Upload Supporting Document */}
          <Field label="Upload Supporting Document (PNG / JPG / JPEG · max 1 MB)">
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* Drop zone / picker */}
              {!draft.docData ? (
                <div
                  onClick={() => fileRef.current && fileRef.current.click()}
                  style={{
                    border: `2px dashed ${draft.docError ? "#fca5a5" : "#cbd5e1"}`,
                    borderRadius: "12px", padding: "18px 16px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                    cursor: "pointer", background: draft.docError ? "#fff5f5" : "#fafafa",
                    transition: "border-color 0.2s",
                  }}>
                  <span style={{ fontSize: "24px" }}>📁</span>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: 0, textAlign: "center" }}>
                    Click to browse or drag &amp; drop<br />
                    <span style={{ color: "#94a3b8", fontSize: "11px" }}>PNG, JPG, JPEG — max 1 MB</span>
                  </p>
                </div>
              ) : (
                /* Preview row */
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px" }}>
                  <img src={draft.docData} alt="preview"
                    style={{ width: 44, height: 44, objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{draft.docName}</p>
                    <p style={{ fontSize: "11px", color: "#94a3b8", margin: "2px 0 0" }}>Image uploaded successfully</p>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <button onClick={() => fileRef.current && fileRef.current.click()}
                      style={{ ...btnOutline, padding: "4px 10px", fontSize: "11px" }}>Replace</button>
                    <button onClick={removeDoc} style={{ ...btnDanger, padding: "4px 10px", fontSize: "11px" }}>Remove</button>
                  </div>
                </div>
              )}
              {/* Error */}
              {draft.docError && (
                <p style={{ fontSize: "12px", color: "#dc2626", margin: 0, display: "flex", alignItems: "center", gap: "5px" }}>
                  ⚠️ {draft.docError}
                </p>
              )}
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/jpg"
                onChange={handleFile} style={{ display: "none" }} />
            </div>
          </Field>

          {/* Actions */}
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", paddingTop: "4px" }}>
            <button onClick={cancel} style={btnGhost}>Cancel</button>
            <button onClick={reset}  style={btnOutline}>Reset</button>
            <button onClick={save}   style={btnPrimary}>Save</button>
          </div>
        </div>
      )}

      {/* ── ADD BUTTON ── */}
      {!showForm && (
        <div>
          <button onClick={openAdd} style={btnPrimary}>+ Add Work Experience</button>
        </div>
      )}
    </div>
  );
}

/* ─── TECHNICAL SKILLS SECTION ───────────────────────── */
function TechnicalSkillsSection() {
  const [saved, setSaved]         = useState(null);   // null = no record yet; array = saved skills
  const [showForm, setShowForm]   = useState(false);
  const [inputVal, setInputVal]   = useState("");
  const [draftSkills, setDraftSkills] = useState([]);

  const openAdd = () => {
    setDraftSkills([]);
    setInputVal("");
    setShowForm(true);
  };

  const openEdit = () => {
    setDraftSkills([...(saved || [])]);
    setInputVal("");
    setShowForm(true);
  };

  const cancel = () => setShowForm(false);

  const reset = () => {
    setDraftSkills([]);
    setInputVal("");
  };

  const addChip = () => {
    const v = inputVal.trim();
    if (v && !draftSkills.includes(v)) {
      setDraftSkills(prev => [...prev, v]);
    }
    setInputVal("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); addChip(); }
  };

  const removeChip = (skill) => setDraftSkills(prev => prev.filter(s => s !== skill));

  const save = () => {
    setSaved([...draftSkills]);
    setShowForm(false);
  };

  const del = () => {
    setSaved(null);
    setShowForm(false);
  };

  const chipStyle = (color = BRAND, bg = BRAND_LIGHT) => ({
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "5px 12px", borderRadius: "999px",
    fontSize: "12px", fontWeight: 600,
    background: bg, color: color,
    border: `1px solid ${color}22`,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* Saved skills view */}
      {saved && !showForm && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>Technical Skills</p>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={openEdit} style={{ ...btnOutline, padding: "5px 12px", fontSize: "12px" }}>✏️ Edit</button>
              <button onClick={del} style={btnDanger}>🗑 Delete</button>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {saved.map(skill => (
              <span key={skill} style={chipStyle()}>{skill}</span>
            ))}
            {saved.length === 0 && (
              <span style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>No skills added.</span>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!saved && !showForm && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "20px 0" }}>
          <p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>No information added yet.</p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
            {saved ? "Edit Technical Skills" : "Add Technical Skills"}
          </p>
          {/* Input + Add inline */}
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={inputVal}
              placeholder="e.g. React.js, Python, Machine Learning…"
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={addChip} style={{ ...btnPrimary, whiteSpace: "nowrap" }}>+ Add</button>
          </div>
          {/* Draft chips */}
          {draftSkills.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {draftSkills.map(skill => (
                <span key={skill} style={{ ...chipStyle(), paddingRight: "8px" }}>
                  {skill}
                  <button onClick={() => removeChip(skill)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: BRAND, fontSize: "13px", lineHeight: 1, padding: 0, marginLeft: "2px" }}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {draftSkills.length === 0 && (
            <p style={{ fontSize: "12px", color: "#cbd5e1", fontStyle: "italic", margin: 0 }}>Type a skill and press Enter or click Add.</p>
          )}
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button onClick={cancel} style={btnGhost}>Cancel</button>
            <button onClick={reset}  style={btnOutline}>Reset</button>
            <button onClick={save}   style={btnPrimary}>Save</button>
          </div>
        </div>
      )}

      {/* Add / Edit buttons */}
      {!showForm && !saved && (
        <div>
          <button onClick={openAdd} style={btnPrimary}>+ Add Technical Skill</button>
        </div>
      )}
      {!showForm && saved && null /* edit/delete already shown inside card */}
    </div>
  );
}

/* ─── FUNDING PROJECTS SECTION ───────────────────────── */
const EMPTY_FUNDING_PROJECT = {
  // Step 1 – Funding Project Details
  category: "", projectType: "", title: "", description: "", location: "",
  status: "", fromDate: "", role: "",
  // Step 2 – Funding Details
  fundingAgency: "", fundingAmount: "", sanctionNumber: "", duration: "",
  fundingStartDate: "", fundingEndDate: "",
  // Step 3 – Team Members & Mentor
  principalInvestigator: "", coInvestigator: "", mentorName: "", teamMembers: [],
  // Step 4 – Curriculum Activity & Other Details
  curriculumActivity: "", outcomes: "", achievements: "", remarks: "",
  docName: "", docData: "", docError: "",
};

const FUNDING_PROJECT_CATEGORIES = ["", "Government", "Private", "International", "Institutional", "Collaborative", "Other"];
const FUNDING_PROJECT_TYPES = ["", "Research", "Development", "Consultancy", "Outreach", "Curriculum", "Student Project", "Other"];
const FUNDING_PROJECT_STATUSES = ["", "Proposed", "Ongoing", "Completed", "On Hold", "Terminated"];

const FUNDING_STEP_TITLES = [
  "Funding Project Details",
  "Funding Details",
  "Team Members & Mentor",
  "Curriculum Activity & Other Details",
];

function FundingProjectsSection() {
  const [records, setRecords]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep]         = useState(1);
  const [editIdx, setEditIdx]   = useState(null);
  const [draft, setDraft]       = useState({ ...EMPTY_FUNDING_PROJECT });
  const [teamInput, setTeamInput] = useState("");
  const fileRef = useRef(null);

  const openAdd  = () => { setDraft({ ...EMPTY_FUNDING_PROJECT }); setTeamInput(""); setEditIdx(null); setStep(1); setShowForm(true); };
  const openEdit = (i) => { setDraft({ ...EMPTY_FUNDING_PROJECT, ...records[i], docError: "" }); setTeamInput(""); setEditIdx(i); setStep(1); setShowForm(true); };
  const cancel   = () => setShowForm(false);
  const reset    = () => { setDraft({ ...EMPTY_FUNDING_PROJECT }); setTeamInput(""); if (fileRef.current) fileRef.current.value = ""; };
  const del      = (i) => setRecords(prev => prev.filter((_, idx) => idx !== i));

  const next = () => setStep(s => Math.min(s + 1, 4));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const addTeamMember = () => {
    const v = teamInput.trim();
    if (v && !draft.teamMembers.includes(v)) {
      setDraft(p => ({ ...p, teamMembers: [...p.teamMembers, v] }));
    }
    setTeamInput("");
  };
  const removeTeamMember = (m) => setDraft(p => ({ ...p, teamMembers: p.teamMembers.filter(t => t !== m) }));
  const handleTeamKeyDown = (e) => { if (e.key === "Enter") { e.preventDefault(); addTeamMember(); } };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setDraft(p => ({ ...p, docError: "Only PDF, PNG, JPG, or JPEG files are allowed.", docName: "", docData: "" }));
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setDraft(p => ({ ...p, docName: file.name, docData: ev.target.result, docError: "" }));
    reader.readAsDataURL(file);
  };

  const removeDoc = () => {
    setDraft(p => ({ ...p, docName: "", docData: "", docError: "" }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const save = () => {
    const { docError, ...toSave } = draft;
    setRecords(prev =>
      editIdx !== null
        ? prev.map((r, i) => i === editIdx ? { ...toSave } : r)
        : [...prev, { ...toSave }]
    );
    setShowForm(false);
  };

  const fmt = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const Field = ({ label, children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );

  const MetaRow = ({ icon, label, value }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "7px" }}>
      <span style={{ fontSize: "13px", marginTop: "1px" }}>{icon}</span>
      <div>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}: </span>
        <span style={{ fontSize: "13px", color: "#334155" }}>{value}</span>
      </div>
    </div>
  );

  /* ── Step indicator ── */
  const StepIndicator = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
      {FUNDING_STEP_TITLES.map((t, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: "6px", flex: i < 3 ? 1 : "0 0 auto" }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: 700,
              background: active || done ? BRAND : "#f1f5f9",
              color: active || done ? "#fff" : "#94a3b8",
              border: active ? `2px solid ${BRAND}` : "2px solid transparent",
            }}>
              {done ? "✓" : n}
            </div>
            {i < 3 && (
              <div style={{ flex: 1, height: 2, borderRadius: 2, background: done ? BRAND : "#e2e8f0" }} />
            )}
          </div>
        );
      })}
    </div>
  );

  /* ── Step 1 ── */
  const renderStep1 = () => (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Field label="Project Category">
          <select value={draft.category} onChange={e => setDraft(p => ({ ...p, category: e.target.value }))} style={inputStyle}>
            {FUNDING_PROJECT_CATEGORIES.map(c => <option key={c} value={c}>{c === "" ? "Select Category" : c}</option>)}
          </select>
        </Field>
        <Field label="Project Type">
          <select value={draft.projectType} onChange={e => setDraft(p => ({ ...p, projectType: e.target.value }))} style={inputStyle}>
            {FUNDING_PROJECT_TYPES.map(t => <option key={t} value={t}>{t === "" ? "Select Type" : t}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Project Title">
        <input type="text" value={draft.title} placeholder="e.g. AI-Based Yoga Posture Detection"
          onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} style={inputStyle} />
      </Field>
      <Field label="Description">
        <textarea rows={3} value={draft.description} placeholder="Describe the funding project..."
          onChange={e => setDraft(p => ({ ...p, description: e.target.value }))}
          style={{ ...inputStyle, resize: "none" }} />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Field label="Location">
          <input type="text" value={draft.location} placeholder="e.g. Bengaluru, Karnataka"
            onChange={e => setDraft(p => ({ ...p, location: e.target.value }))} style={inputStyle} />
        </Field>
        <Field label="Project Status">
          <select value={draft.status} onChange={e => setDraft(p => ({ ...p, status: e.target.value }))} style={inputStyle}>
            {FUNDING_PROJECT_STATUSES.map(s => <option key={s} value={s}>{s === "" ? "Select Status" : s}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Field label="From Date">
          <input type="date" value={draft.fromDate}
            onChange={e => setDraft(p => ({ ...p, fromDate: e.target.value }))} style={inputStyle} />
        </Field>
        <Field label="Role">
          <input type="text" value={draft.role} placeholder="e.g. Principal Investigator"
            onChange={e => setDraft(p => ({ ...p, role: e.target.value }))} style={inputStyle} />
        </Field>
      </div>
    </>
  );

  /* ── Step 2 ── */
  const renderStep2 = () => (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Field label="Funding Agency">
          <input type="text" value={draft.fundingAgency} placeholder="e.g. DST, ICMR, AICTE"
            onChange={e => setDraft(p => ({ ...p, fundingAgency: e.target.value }))} style={inputStyle} />
        </Field>
        <Field label="Funding Amount">
          <input type="text" value={draft.fundingAmount} placeholder="e.g. ₹12,50,000"
            onChange={e => setDraft(p => ({ ...p, fundingAmount: e.target.value }))} style={inputStyle} />
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Field label="Sanction Number">
          <input type="text" value={draft.sanctionNumber} placeholder="e.g. DST/SB/2024/1123"
            onChange={e => setDraft(p => ({ ...p, sanctionNumber: e.target.value }))} style={inputStyle} />
        </Field>
        <Field label="Project Duration">
          <input type="text" value={draft.duration} placeholder="e.g. 2 Years"
            onChange={e => setDraft(p => ({ ...p, duration: e.target.value }))} style={inputStyle} />
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Field label="Funding Start Date">
          <input type="date" value={draft.fundingStartDate}
            onChange={e => setDraft(p => ({ ...p, fundingStartDate: e.target.value }))} style={inputStyle} />
        </Field>
        <Field label="Funding End Date">
          <input type="date" value={draft.fundingEndDate}
            onChange={e => setDraft(p => ({ ...p, fundingEndDate: e.target.value }))} style={inputStyle} />
        </Field>
      </div>
    </>
  );

  /* ── Step 3 ── */
  const renderStep3 = () => (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Field label="Principal Investigator">
          <input type="text" value={draft.principalInvestigator} placeholder="e.g. Dr. A. Sharma"
            onChange={e => setDraft(p => ({ ...p, principalInvestigator: e.target.value }))} style={inputStyle} />
        </Field>
        <Field label="Co-Investigator">
          <input type="text" value={draft.coInvestigator} placeholder="e.g. Dr. B. Rao"
            onChange={e => setDraft(p => ({ ...p, coInvestigator: e.target.value }))} style={inputStyle} />
        </Field>
      </div>
      <Field label="Mentor Name">
        <input type="text" value={draft.mentorName} placeholder="e.g. Prof. C. Iyer"
          onChange={e => setDraft(p => ({ ...p, mentorName: e.target.value }))} style={inputStyle} />
      </Field>
      <Field label="Team Members">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <input type="text" value={teamInput} placeholder="Type a name and press Enter or click Add"
              onChange={e => setTeamInput(e.target.value)}
              onKeyDown={handleTeamKeyDown}
              style={{ ...inputStyle, flex: 1 }} />
            <button onClick={addTeamMember} style={{ ...btnPrimary, whiteSpace: "nowrap" }}>+ Add</button>
          </div>
          {draft.teamMembers.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {draft.teamMembers.map(m => (
                <span key={m} style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "5px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600,
                  background: BRAND_LIGHT, color: BRAND, border: `1px solid ${BRAND}22`,
                }}>
                  {m}
                  <button onClick={() => removeTeamMember(m)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: BRAND, fontSize: "13px", lineHeight: 1, padding: 0 }}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "12px", color: "#cbd5e1", fontStyle: "italic", margin: 0 }}>No team members added yet.</p>
          )}
        </div>
      </Field>
    </>
  );

  /* ── Step 4 ── */
  const renderStep4 = () => (
    <>
      <Field label="Curriculum Activity">
        <textarea rows={2} value={draft.curriculumActivity} placeholder="e.g. Integrated into M.Sc. capstone curriculum"
          onChange={e => setDraft(p => ({ ...p, curriculumActivity: e.target.value }))}
          style={{ ...inputStyle, resize: "none" }} />
      </Field>
      <Field label="Outcomes">
        <textarea rows={2} value={draft.outcomes} placeholder="Describe project outcomes..."
          onChange={e => setDraft(p => ({ ...p, outcomes: e.target.value }))}
          style={{ ...inputStyle, resize: "none" }} />
      </Field>
      <Field label="Achievements">
        <textarea rows={2} value={draft.achievements} placeholder="Describe achievements..."
          onChange={e => setDraft(p => ({ ...p, achievements: e.target.value }))}
          style={{ ...inputStyle, resize: "none" }} />
      </Field>
      <Field label="Remarks">
        <textarea rows={2} value={draft.remarks} placeholder="Any additional remarks..."
          onChange={e => setDraft(p => ({ ...p, remarks: e.target.value }))}
          style={{ ...inputStyle, resize: "none" }} />
      </Field>

      <Field label="Supporting Document Upload (PDF / PNG / JPG / JPEG)">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {!draft.docData ? (
            <div
              onClick={() => fileRef.current && fileRef.current.click()}
              style={{
                border: `2px dashed ${draft.docError ? "#fca5a5" : "#cbd5e1"}`,
                borderRadius: "12px", padding: "18px 16px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                cursor: "pointer", background: draft.docError ? "#fff5f5" : "#fafafa",
                transition: "border-color 0.2s",
              }}>
              <span style={{ fontSize: "24px" }}>📁</span>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0, textAlign: "center" }}>
                Click to browse or drag &amp; drop<br />
                <span style={{ color: "#94a3b8", fontSize: "11px" }}>PDF, PNG, JPG, JPEG</span>
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px" }}>
              <span style={{ fontSize: "22px", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", background: BRAND_LIGHT, flexShrink: 0 }}>
                {draft.docName && draft.docName.toLowerCase().endsWith(".pdf") ? "📄" : "🖼️"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{draft.docName}</p>
                <p style={{ fontSize: "11px", color: "#94a3b8", margin: "2px 0 0" }}>File uploaded successfully</p>
              </div>
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <button onClick={() => fileRef.current && fileRef.current.click()}
                  style={{ ...btnOutline, padding: "4px 10px", fontSize: "11px" }}>Replace</button>
                <button onClick={removeDoc} style={{ ...btnDanger, padding: "4px 10px", fontSize: "11px" }}>Remove</button>
              </div>
            </div>
          )}
          {draft.docError && (
            <p style={{ fontSize: "12px", color: "#dc2626", margin: 0, display: "flex", alignItems: "center", gap: "5px" }}>
              ⚠️ {draft.docError}
            </p>
          )}
          <input ref={fileRef} type="file" accept="application/pdf,image/png,image/jpeg,image/jpg"
            onChange={handleFile} style={{ display: "none" }} />
        </div>
      </Field>
    </>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* ── RECORDS ── */}
      {records.map((rec, i) => (
        <div key={i} className="info-card" style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px",
          overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          {/* Card header strip */}
          <div style={{ background: BRAND_LIGHT, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: "10px", background: BRAND, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", flexShrink: 0 }}>🧩</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {rec.title || "Untitled Funding Project"}
                </p>
                <p style={{ fontSize: "12px", color: "#475569", margin: "1px 0 0" }}>{rec.projectType || "—"}</p>
              </div>
              {rec.category && (
                <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: BRAND, color: "#fff", flexShrink: 0 }}>
                  {rec.category}
                </span>
              )}
              {rec.status && (
                <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: "#fff", color: BRAND, border: `1px solid ${BRAND}`, flexShrink: 0 }}>
                  {rec.status}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <button onClick={() => openEdit(i)} style={{ ...btnOutline, padding: "5px 12px", fontSize: "12px" }}>✏️ Edit</button>
              <button onClick={() => del(i)} style={btnDanger}>🗑 Delete</button>
            </div>
          </div>

          {/* Card body */}
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {rec.description && <MetaRow icon="📝" label="Description" value={rec.description} />}
            {rec.location    && <MetaRow icon="📍" label="Location" value={rec.location} />}
            <MetaRow icon="📅" label="From Date" value={fmt(rec.fromDate)} />
            {rec.role && <MetaRow icon="🎯" label="Role" value={rec.role} />}

            {/* Funding details */}
            {(rec.fundingAgency || rec.fundingAmount || rec.sanctionNumber || rec.duration || rec.fundingStartDate || rec.fundingEndDate) && (
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 12px", marginTop: "4px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>💰 Funding Details</p>
                {rec.fundingAgency    && <MetaRow icon="🏛️" label="Agency" value={rec.fundingAgency} />}
                {rec.fundingAmount    && <MetaRow icon="💵" label="Amount" value={rec.fundingAmount} />}
                {rec.sanctionNumber   && <MetaRow icon="🔖" label="Sanction No." value={rec.sanctionNumber} />}
                {rec.duration         && <MetaRow icon="⏳" label="Duration" value={rec.duration} />}
                {(rec.fundingStartDate || rec.fundingEndDate) && (
                  <MetaRow icon="📆" label="Funding Period" value={`${fmt(rec.fundingStartDate)} – ${fmt(rec.fundingEndDate)}`} />
                )}
              </div>
            )}

            {/* Team & Mentor */}
            {(rec.principalInvestigator || rec.coInvestigator || rec.mentorName || (rec.teamMembers && rec.teamMembers.length > 0)) && (
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 12px", marginTop: "4px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>👥 Team Members & Mentor</p>
                {rec.principalInvestigator && <MetaRow icon="🧑‍🔬" label="Principal Investigator" value={rec.principalInvestigator} />}
                {rec.coInvestigator        && <MetaRow icon="🧑‍🔬" label="Co-Investigator" value={rec.coInvestigator} />}
                {rec.mentorName             && <MetaRow icon="🎓" label="Mentor" value={rec.mentorName} />}
                {rec.teamMembers && rec.teamMembers.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "2px" }}>
                    {rec.teamMembers.map(m => (
                      <span key={m} style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: "#fff", color: BRAND, border: `1px solid ${BRAND}33` }}>
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Curriculum Activity & Other Details */}
            {(rec.curriculumActivity || rec.outcomes || rec.achievements || rec.remarks) && (
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 12px", marginTop: "4px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>📘 Curriculum Activity & Other Details</p>
                {rec.curriculumActivity && <MetaRow icon="📘" label="Curriculum Activity" value={rec.curriculumActivity} />}
                {rec.outcomes           && <MetaRow icon="🎯" label="Outcomes" value={rec.outcomes} />}
                {rec.achievements       && <MetaRow icon="🏆" label="Achievements" value={rec.achievements} />}
                {rec.remarks            && <MetaRow icon="🗒️" label="Remarks" value={rec.remarks} />}
              </div>
            )}

            {rec.docName && rec.docData && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <span style={{ fontSize: "13px" }}>{rec.docName.toLowerCase().endsWith(".pdf") ? "📄" : "🖼️"}</span>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Supporting Document: </span>
                <a href={rec.docData} download={rec.docName}
                  style={{ fontSize: "12px", color: BRAND, fontWeight: 600, textDecoration: "underline", wordBreak: "break-all" }}>
                  {rec.docName}
                </a>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* ── EMPTY STATE ── */}
      {records.length === 0 && !showForm && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "20px 0" }}>
          <div style={{ fontSize: "36px", opacity: 0.25 }}>🧩</div>
          <p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic", margin: 0 }}>No funding projects added yet.</p>
        </div>
      )}

      {/* ── MULTI-STEP FORM MODAL ── */}
      {showForm && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "900px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px 14px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: BRAND_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧩</div>
                <div>
                  <span style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b", display: "block" }}>
                    {editIdx !== null ? "Edit Funding Project" : "Add Funding Project"}
                  </span>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>Step {step} of 4 — {FUNDING_STEP_TITLES[step - 1]}</span>
                </div>
              </div>
              <button onClick={cancel} style={{ width: 28, height: 28, borderRadius: "50%", background: "#f1f5f9", border: "none", cursor: "pointer", fontSize: 14, color: "#64748b" }}>✕</button>
            </div>

            {/* Step indicator */}
            <div style={{ padding: "16px 24px 0" }}>
              <StepIndicator />
            </div>

            {/* Body */}
            <div style={{ overflowY: "auto", padding: "16px 24px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </div>

            {/* Footer actions */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap", padding: "14px 24px 18px", borderTop: "1px solid #f1f5f9", background: "#fafafa", borderRadius: "0 0 20px 20px" }}>
              <button onClick={cancel} style={btnGhost}>Cancel</button>
              <button onClick={reset} style={btnOutline}>Reset</button>
              {step > 1 && <button onClick={prev} style={btnOutline}>Previous</button>}
              {step < 4
                ? <button onClick={next} style={btnPrimary}>Next</button>
                : <button onClick={save} style={btnPrimary}>Save</button>}
            </div>
          </div>
        </div>,
        document.body
      )}


      {/* ── ADD BUTTON ── */}
      {!showForm && (
        <div>
          <button onClick={openAdd} style={{ ...btnPrimary, padding: "10px 22px", fontSize: "14px", boxShadow: "0 6px 18px rgba(123,29,46,0.30)" }}>
            + Add Funding Project
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── PATENTS SECTION ────────────────────────────────── */
const EMPTY_PATENT = {
  level: "", patentType: "", title: "", applicationNo: "", applicantName: "",
  claim: "", status: "", filedDate: "", description: "", patentUrl: "",
};

const PATENT_LEVELS = ["", "National", "International"];

const PATENT_TYPES = [
  "", "Utility Patent", "Design Patent", "Provisional Patent",
  "Non-Provisional Patent", "International Patent", "Copyright", "Trademark", "Other",
];

const PATENT_STATUSES = ["", "Issued", "Pending", "Filed", "Published", "Granted"];

/* Strips legacy "PATENT " prefixes (e.g. "PATENT ISSUED" → "Issued") and
   normalizes to the canonical status casing used by PATENT_STATUSES. */
function cleanPatentStatus(raw) {
  if (!raw) return "";
  const stripped = String(raw).replace(/^PATENT[\s_-]+/i, "").trim();
  const canonical = PATENT_STATUSES.filter(Boolean);
  const match = canonical.find(c => c.toLowerCase() === stripped.toLowerCase());
  return match || stripped;
}

function PatentsSection() {
  const [records, setRecords]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editIdx, setEditIdx]   = useState(null);
  const [draft, setDraft]       = useState({ ...EMPTY_PATENT });

  const openAdd  = ()  => { setDraft({ ...EMPTY_PATENT }); setEditIdx(null); setShowForm(true); };
  const openEdit = (i) => { setDraft({ ...EMPTY_PATENT, ...records[i], status: cleanPatentStatus(records[i].status) }); setEditIdx(i); setShowForm(true); };
  const cancel   = ()  => setShowForm(false);
  const reset    = ()  => setDraft({ ...EMPTY_PATENT });
  const del      = (i) => setRecords(prev => prev.filter((_, idx) => idx !== i));
  const save     = ()  => {
    const toSave = { ...draft, status: cleanPatentStatus(draft.status) };
    setRecords(prev =>
      editIdx !== null
        ? prev.map((r, i) => i === editIdx ? { ...toSave } : r)
        : [...prev, { ...toSave }]
    );
    setShowForm(false);
  };

  const fmt = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const Field = ({ label, children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );

  const MetaRow = ({ icon, label, value }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "7px" }}>
      <span style={{ fontSize: "13px", marginTop: "1px" }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}: </span>
        <span style={{ fontSize: "13px", color: "#334155" }}>{value}</span>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* ── RECORDS ── */}
      {records.map((rec, i) => (
        <div key={i} className="info-card" style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px",
          overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          {/* Card header strip */}
          <div style={{ background: BRAND_LIGHT, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: "10px", background: BRAND, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", flexShrink: 0 }}>💡</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {rec.title || "—"}
                </p>
                <p style={{ fontSize: "12px", color: "#475569", margin: "1px 0 0" }}>{rec.applicationNo || "—"}</p>
              </div>
              {rec.patentType && (
                <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: BRAND, color: "#fff", flexShrink: 0 }}>
                  {rec.patentType}
                </span>
              )}
              {rec.status && (
                <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: "#fff", color: BRAND, border: `1px solid ${BRAND}`, flexShrink: 0 }}>
                  {cleanPatentStatus(rec.status)}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <button onClick={() => openEdit(i)} style={{ ...btnOutline, padding: "5px 12px", fontSize: "12px" }}>✏️ Edit</button>
              <button onClick={() => del(i)} style={btnDanger}>🗑 Delete</button>
            </div>
          </div>

          {/* Card body */}
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <MetaRow icon="🔖" label="Application No / Patent No" value={rec.applicationNo || "—"} />
            <MetaRow icon="🧑‍🔬" label="Applicant Name" value={rec.applicantName || "—"} />
            <MetaRow icon="📅" label="Filed Date" value={fmt(rec.filedDate)} />
            {rec.description && <MetaRow icon="📝" label="Description" value={rec.description} />}
            {rec.patentUrl && (
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <span style={{ fontSize: "13px", marginTop: "1px" }}>🔗</span>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Patent URL: </span>
                <a href={rec.patentUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "13px", color: BRAND, fontWeight: 600, textDecoration: "underline", wordBreak: "break-all" }}>
                  {rec.patentUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* ── EMPTY STATE ── */}
      {records.length === 0 && !showForm && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "20px 0" }}>
          <div style={{ fontSize: "36px", opacity: 0.25 }}>💡</div>
          <p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic", margin: 0 }}>No patents added yet.</p>
        </div>
      )}

      {/* ── FORM ── */}
      {showForm && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Form title */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingBottom: "10px", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ width: 30, height: 30, borderRadius: "8px", background: BRAND_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>💡</div>
            <p style={{ fontSize: "13px", fontWeight: 700, color: BRAND, textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
              {editIdx !== null ? "Edit Patent" : "Add Patent"}
            </p>
          </div>

          {/* Row: Level + Patent Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Level">
              <select value={draft.level} onChange={e => setDraft(p => ({ ...p, level: e.target.value }))} style={inputStyle}>
                {PATENT_LEVELS.map(l => <option key={l} value={l}>{l === "" ? "Select Level" : l}</option>)}
              </select>
            </Field>
            <Field label="Patent Type">
              <select value={draft.patentType} onChange={e => setDraft(p => ({ ...p, patentType: e.target.value }))} style={inputStyle}>
                {PATENT_TYPES.map(t => <option key={t} value={t}>{t === "" ? "Select Patent Type" : t}</option>)}
              </select>
            </Field>
          </div>

          {/* Title */}
          <Field label="Title">
            <input type="text" value={draft.title} placeholder="e.g. AI-Based Yoga Posture Detection System"
              onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} style={inputStyle} />
          </Field>

          {/* Row: Application No + Applicant Name */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Application No / Patent No">
              <input type="text" value={draft.applicationNo} placeholder="e.g. 202141012345"
                onChange={e => setDraft(p => ({ ...p, applicationNo: e.target.value }))} style={inputStyle} />
            </Field>
            <Field label="Applicant Name">
              <input type="text" value={draft.applicantName} placeholder="e.g. SVYASA University"
                onChange={e => setDraft(p => ({ ...p, applicantName: e.target.value }))} style={inputStyle} />
            </Field>
          </div>

          {/* Claim */}
          <Field label="Claim">
            <textarea rows={2} value={draft.claim} placeholder="Describe the key claim(s) of the patent..."
              onChange={e => setDraft(p => ({ ...p, claim: e.target.value }))}
              style={{ ...inputStyle, resize: "none" }} />
          </Field>

          {/* Row: Status + Filed Date */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Status">
              <select value={draft.status} onChange={e => setDraft(p => ({ ...p, status: e.target.value }))} style={inputStyle}>
                {PATENT_STATUSES.map(s => <option key={s} value={s}>{s === "" ? "Select Status" : s}</option>)}
              </select>
            </Field>
            <Field label="Filed Date">
              <input type="date" value={draft.filedDate}
                onChange={e => setDraft(p => ({ ...p, filedDate: e.target.value }))} style={inputStyle} />
            </Field>
          </div>

          {/* Description */}
          <Field label="Description">
            <textarea rows={3} value={draft.description} placeholder="Describe the patent in detail..."
              onChange={e => setDraft(p => ({ ...p, description: e.target.value }))}
              style={{ ...inputStyle, resize: "none" }} />
          </Field>

          {/* Patent URL */}
          <Field label="Patent URL">
            <input type="url" value={draft.patentUrl} placeholder="e.g. https://patents.google.com/patent/..."
              onChange={e => setDraft(p => ({ ...p, patentUrl: e.target.value }))} style={inputStyle} />
          </Field>

          {/* Actions */}
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", paddingTop: "4px" }}>
            <button onClick={cancel} style={btnGhost}>Cancel</button>
            <button onClick={reset}  style={btnOutline}>Reset</button>
            <button onClick={save}   style={btnPrimary}>Save</button>
          </div>
        </div>
      )}

      {/* ── ADD BUTTON ── */}
      {!showForm && (
        <div>
          <button onClick={openAdd} style={{ ...btnPrimary, padding: "10px 22px", fontSize: "14px", boxShadow: "0 6px 18px rgba(123,29,46,0.30)" }}>
            + Add Patent
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── SECTION CONTENT ROUTER ─────────────────────────── */
function SectionContent({ sectionId, sectionLabel }) {
  if (sectionId === "profile-summary")  return <ProfileSummarySection />;
  if (sectionId === "languages")        return <LanguagesSection />;
  if (sectionId === "work-experience")  return <WorkExperienceSection />;
  if (sectionId === "technical-skills") return <TechnicalSkillsSection />;
  if (sectionId === "projects")         return <FundingProjectsSection />;
  if (sectionId === "patents")          return <PatentsSection />;
  return (
    <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: "13px", fontStyle: "italic" }}>
      No information added yet.{" "}
      <span style={{ color: BRAND, fontStyle: "normal", fontWeight: 600, cursor: "pointer" }}>
        + Add {sectionLabel}
      </span>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────── */
export default function MyProfile() {
  const [activeTab, setActiveTab]       = useState("Personal Details");
  const [openSection, setOpenSection]   = useState(null);
  const [activeLink, setActiveLink]     = useState("Profile Summary");
  const [profileImage, setProfileImage] = useState(null);
  const [profileData, setProfileData]   = useState(INITIAL_PROFILE_DATA);
  const [showEditModal, setShowEditModal] = useState(false);
  const fileInputRef = useRef(null);
  const contentRef   = useRef(null);

  const completion = calcCompletion(profileData);
  const basicDetails = BASIC_DETAILS_CONFIG.map(({ key, label, icon }) => ({
    label, icon, value: profileData[key] || "—",
  }));

  const QUICK_LINKS = activeTab === "Personal Details" ? PERSONAL_LINKS : PROFESSIONAL_LINKS;
  const SECTIONS    = activeTab === "Personal Details" ? PERSONAL_SECTIONS : PROFESSIONAL_SECTIONS;

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

  return (
    <div ref={contentRef} style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#F0F4F8", minHeight: "100vh", overflowY: "auto" }}>

      {showEditModal && (
        <EditProfileModal
          profileData={profileData}
          onSave={(updated) => { setProfileData(updated); setShowEditModal(false); }}
          onCancel={() => setShowEditModal(false)}
        />
      )}

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
        .edit-btn { transition: all 0.2s ease; }
        .edit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(123,29,46,0.35); }
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
          <div className="h-28 w-full relative"
            style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #a53050 50%, #d4607a 100%)` }}>
            <div className="absolute top-3 right-8 w-16 h-16 rounded-full bg-white/5" />
            <div className="absolute top-6 right-24 w-8 h-8 rounded-full bg-white/5" />
          </div>

          {/* Profile Content */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between" style={{ marginTop: "-48px" }}>
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-3xl font-bold relative shrink-0"
                style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #c45070 100%)`, color: "#fff" }}>
                {profileImage
                  ? <img src={profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  : "DB"}
                <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm shadow-md cursor-pointer"
                  style={{ background: BRAND }}
                  onClick={() => fileInputRef.current.click()}>
                  +
                </div>
              </div>

              {/* Edit Profile Button */}
              <button className="edit-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md"
                style={{ background: `linear-gradient(135deg, ${BRAND}, #a53050)` }}
                onClick={() => setShowEditModal(true)}>
                <span>✏️</span> Edit Profile
              </button>
            </div>

            {/* Name & Role */}
            <div className="mt-3">
              <h1 className="text-2xl font-bold text-slate-800">Dr Dr. Bharathi</h1>
              <p className="text-slate-500 text-sm mt-0.5">Data science and Big data analytics</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: BRAND_LIGHT, color: BRAND }}>FACULTY</span>
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-emerald-50 text-emerald-600">Active</span>
              </div>
            </div>

            {/* Basic Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {basicDetails.map((item, i) => (
                <div key={item.label} className="info-card fade-in bg-slate-50 rounded-xl p-4 border border-slate-100"
                  style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{item.label}</span>
                  </div>
                  <div className="text-sm font-medium truncate" style={{ color: item.value === "—" ? "#cbd5e1" : "#1e293b" }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Profile Completion */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">📈 Profile Completion</span>
                <span className="text-xs font-bold" style={{ color: BRAND }}>{completion}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-2 rounded-full progress-bar" style={{ width: `${completion}%`, transition: "width 0.5s ease" }} />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Complete your profile to unlock all features</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS + CONTENT */}
      <div className="px-6 pb-8">

        {/* Tab Bar */}
        <div className="flex gap-1 border-b border-slate-200 mb-6">
          {["Personal Details", "Professional Details"].map((tab) => (
            <button key={tab} onClick={() => handleTabChange(tab)}
              className={`px-5 py-3 text-sm font-semibold transition-all ${activeTab === tab ? "tab-underline text-slate-800" : "text-slate-400 hover:text-slate-600"}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-5">

          {/* QUICK LINKS */}
          <div className="md:w-56 shrink-0 fade-in">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sticky top-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Quick Links</h3>
              <div className="flex flex-col gap-1">
                {QUICK_LINKS.map((link) => (
                  <button key={link.label} onClick={() => toggleSection(link.label)}
                    className={`quick-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left w-full ${activeLink === link.label ? "active-link" : "text-slate-600"}`}>
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                      style={{ background: activeLink === link.label ? BRAND_LIGHT : "#F0F4F8" }}>
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
              <div key={section.id}
                className="fade-in bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                style={{ animationDelay: `${i * 0.07}s` }}>
                <button onClick={() => toggleSection(section.label)}
                  className="section-hover w-full flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: BRAND_LIGHT }}>
                      {section.icon}
                    </div>
                    <span className="font-semibold text-sm" style={{ color: openSection === section.label ? BRAND : "#334155" }}>
                      {section.label}
                    </span>
                  </div>
                  <span className={`section-toggle text-slate-400 text-xl font-light ${openSection === section.label ? "open" : ""}`}
                    style={{ color: openSection === section.label ? BRAND : undefined }}>
                    +
                  </span>
                </button>

                {openSection === section.label && (
                  <div className="px-5 pb-5 pt-2 border-t" style={{ borderColor: "rgba(123,29,46,0.08)" }}>
                    <SectionContent sectionId={section.id} sectionLabel={section.label} />
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: "none" }} />
    </div>
  );
}