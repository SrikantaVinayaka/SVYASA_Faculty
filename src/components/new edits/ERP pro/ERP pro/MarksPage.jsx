import { useState, useMemo } from "react";

const DEPT_OPTIONS = ["All", "BCA", "BCM", "BBA", "BSC", "BTECH", "MCA", "MSC", "MBA"];
const SEM_OPTIONS = ["1","2","3","4","5","6","7","8"];

const mockStudents = [
  { usn: "U18BP22S0046", name: "B Deepthi", dept: "BCA", sem: "2", sec: "A" },
  { usn: "U18BP22S0047", name: "Arun Kumar", dept: "BCA", sem: "2", sec: "A" },
  { usn: "U18BP22S0048", name: "Priya Sharma", dept: "MCA", sem: "4", sec: "B" },
];

const defaultTheory = [
  { code: "BCA2AECKA02", subject: "Ganaka Sowrabha-2", att: 88, ia1: 24, ia2: 22, cia: 20, total: 39 },
  { code: "BCA2DSC04", subject: "Computer Architecture", att: 72, ia1: 3, ia2: 20, cia: 18, total: 28 },
  { code: "BCA2DSC05", subject: "OOP using Java", att: 65, ia1: 14, ia2: 18, cia: 16, total: 41 },
  { code: "BCA2DSC06", subject: "Database Management System", att: 90, ia1: 22, ia2: 21, cia: 19, total: 50 },
  { code: "BSC2ACEN02", subject: "Generic English Imprints II", att: 95, ia1: 28, ia2: 25, cia: 24, total: 60 },
  { code: "CHE2OE02", subject: "Chemistry in Daily Life II", att: 82, ia1: 26, ia2: 24, cia: 22, total: 55 },
];

const defaultLab = [
  { code: "BCA2PRA05", subject: "Java Programming Lab", att: 80, cia: 22, total: 27 },
  { code: "BCA2PRA06", subject: "Database Management System Lab", att: 85, cia: 20, total: 24 },
  { code: "SEC2SB02", subject: "Ability Enhancement Env. Studies", att: 75, cia: 18, total: 29 },
];

const semResult = [
  { sl: 1, code: "BCA2AECKA02", name: "Ganaka Sowrabha-2", maxMarks: 100, minMarks: 40, seMarks: 25, iaMarks: 39, scored: 64, credits: 3, grade: 6.5, creditPoints: 19.5, letterGrade: "B+", status: "Pass" },
  { sl: 2, code: "BCA2DSC04", name: "Computer Architecture", maxMarks: 100, minMarks: 40, seMarks: 3, iaMarks: 25, scored: 28, credits: 3, grade: null, creditPoints: null, letterGrade: null, status: "Fail" },
  { sl: 3, code: "BCA2DSC05", name: "OOP using Java", maxMarks: 100, minMarks: 40, seMarks: 14, iaMarks: 27, scored: 41, credits: 3, grade: null, creditPoints: null, letterGrade: null, status: "Fail" },
  { sl: 4, code: "BCA2DSC06", name: "Database Management System", maxMarks: 100, minMarks: 40, seMarks: 23, iaMarks: 27, scored: 50, credits: 3, grade: 5, creditPoints: 15, letterGrade: "C", status: "Pass" },
  { sl: 5, code: "BSC2ACEN02", name: "Generic English Imprints II", maxMarks: 100, minMarks: 40, seMarks: 37, iaMarks: 23, scored: 60, credits: 3, grade: 6, creditPoints: 18, letterGrade: "B+", status: "Pass" },
  { sl: 6, code: "CHE2OE02", name: "Chemistry in Daily Life II", maxMarks: 100, minMarks: 40, seMarks: 30, iaMarks: 25, scored: 55, credits: 3, grade: 5.5, creditPoints: 16.5, letterGrade: "B", status: "Pass" },
  { sl: 7, code: "BCA2PRA05", name: "Java Programming Lab", maxMarks: 50, minMarks: 20, seMarks: 17, iaMarks: 10, scored: 27, credits: 2, grade: 5.5, creditPoints: 11, letterGrade: "B", status: "Pass" },
  { sl: 8, code: "BCA2PRA06", name: "Database Management System Lab", maxMarks: 50, minMarks: 20, seMarks: 14, iaMarks: 10, scored: 24, credits: 2, grade: 5, creditPoints: 10, letterGrade: "C", status: "Pass" },
  { sl: 9, code: "SEC2SB02", name: "Ability Enhancement Env. Studies", maxMarks: 50, minMarks: 20, seMarks: 16, iaMarks: 13, scored: 29, credits: 2, grade: 6, creditPoints: 12, letterGrade: "B+", status: "Pass" },
  { sl: 10, code: "SEC2VB0F", name: "National Cadet Corps (NCC)", maxMarks: 50, minMarks: 20, seMarks: null, iaMarks: 43, scored: 43, credits: 2, grade: 8.5, creditPoints: 17, letterGrade: "A+", status: "Pass" },
];

function Tab({ label, active, onClick, count }) {
  return (
    <button onClick={onClick} style={{ padding: "10px 22px", fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#7c3238" : "var(--color-text-secondary)", borderBottom: active ? "2px solid #7c3238" : "2px solid transparent", background: "none", border: "none", borderBottom: active ? "2px solid #7c3238" : "2px solid transparent", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6 }}>
      {label}
      {count !== undefined && <span style={{ background: active ? "#fce8e8" : "var(--color-background-secondary)", color: active ? "#a32d2d" : "var(--color-text-secondary)", borderRadius: 12, padding: "1px 7px", fontSize: 11 }}>{count}</span>}
    </button>
  );
}

function AttBadge({ pct }) {
  const color = pct < 75 ? { bg: "#fce8e8", fg: "#a32d2d" } : pct < 85 ? { bg: "#faeeda", fg: "#854f0b" } : { bg: "#eaf3de", fg: "#3b6d11" };
  return <span style={{ background: color.bg, color: color.fg, borderRadius: 6, padding: "2px 9px", fontSize: 12, fontWeight: 500 }}>{pct}%</span>;
}

function StatusBadge({ status }) {
  const pass = status === "Pass";
  return <span style={{ background: pass ? "#eaf3de" : "#fce8e8", color: pass ? "#3b6d11" : "#a32d2d", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 500 }}>{status}</span>;
}

export default function MarksPage() {
  const [selectedSem, setSelectedSem] = useState("2");
  const [selectedDept, setSelectedDept] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedUSN, setSelectedUSN] = useState("");
  const [activeTab, setActiveTab] = useState("internal");
  const [quickEdit, setQuickEdit] = useState(false);
  const [theoryMarks, setTheoryMarks] = useState(defaultTheory.map(r => ({ ...r })));
  const [labMarks, setLabMarks] = useState(defaultLab.map(r => ({ ...r })));
  const [draftTheory, setDraftTheory] = useState(defaultTheory.map(r => ({ ...r })));
  const [draftLab, setDraftLab] = useState(defaultLab.map(r => ({ ...r })));

  const filtered = useMemo(() => mockStudents.filter(s => {
    const q = search.toLowerCase();
    return (!q || s.name.toLowerCase().includes(q) || s.usn.toLowerCase().includes(q)) &&
      (selectedDept === "All" || s.dept === selectedDept);
  }), [search, selectedDept]);

  const selectedStudent = useMemo(() => mockStudents.find(s => s.usn === selectedUSN), [selectedUSN]);

  const failCount = semResult.filter(r => r.status === "Fail").length;
  const totalCredits = semResult.filter(r => r.creditPoints).reduce((a, b) => a + b.creditPoints, 0);
  const sgpa = semResult.filter(r => r.creditPoints && r.credits).reduce((a, b) => a + (b.grade || 0) * b.credits, 0) / semResult.filter(r => r.credits).reduce((a, b) => a + b.credits, 0);

  const startEdit = () => {
    setDraftTheory(theoryMarks.map(r => ({ ...r })));
    setDraftLab(labMarks.map(r => ({ ...r })));
    setQuickEdit(true);
  };
  const saveEdit = () => {
    setTheoryMarks(draftTheory.map(r => ({ ...r })));
    setLabMarks(draftLab.map(r => ({ ...r })));
    setQuickEdit(false);
  };
  const cancelEdit = () => {
    setDraftTheory(theoryMarks.map(r => ({ ...r })));
    setDraftLab(labMarks.map(r => ({ ...r })));
    setQuickEdit(false);
  };

  const numInput = (val, onChange) => (
    <input type="number" value={val} onChange={e => onChange(Number(e.target.value))} style={{ width: 60, padding: "4px 6px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 6, fontSize: 12, textAlign: "center" }} />
  );

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Marks & Assessment</div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>View and manage internal, lab, and semester examination results</div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "7px 12px", background: "var(--color-background-primary)", flex: "1 1 200px", minWidth: 180 }}>
          <svg width="14" height="14" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e => { setSearch(e.target.value); const q = e.target.value.toLowerCase(); const f = mockStudents.find(s => s.name.toLowerCase().includes(q) || s.usn.toLowerCase().includes(q)); if (f) setSelectedUSN(f.usn); else if (!e.target.value) setSelectedUSN(""); }} placeholder="Search student name or USN" style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, width: "100%" }} />
        </div>
        <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", fontSize: 13, background: "var(--color-background-primary)", minWidth: 120 }}>
          {DEPT_OPTIONS.map(d => <option key={d}>{d === "All" ? "All Depts" : d}</option>)}
        </select>
        <select value={selectedSem} onChange={e => setSelectedSem(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", fontSize: 13, background: "var(--color-background-primary)", minWidth: 130 }}>
          {SEM_OPTIONS.map(s => <option key={s} value={s}>Semester {s} - 2025</option>)}
        </select>
        <button style={{ marginLeft: "auto", background: "var(--color-background-primary)", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Report
        </button>
      </div>

      {selectedStudent ? (
        <div>
          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{selectedStudent.name}</div>
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{selectedStudent.usn} &bull; {selectedStudent.dept} &bull; Sem {selectedSem} &bull; Section {selectedStudent.sec}</div>
            </div>
            <button onClick={() => setSelectedUSN("")} style={{ background: "none", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", color: "var(--color-text-secondary)" }}>&#8592; Back to search</button>
          </div>

          <div style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", marginBottom: 20, display: "flex" }}>
            <Tab label="Internal Marks" active={activeTab === "internal"} onClick={() => setActiveTab("internal")} />
            <Tab label="Lab Assessment" active={activeTab === "lab"} onClick={() => setActiveTab("lab")} />
            <Tab label="Semester Result" active={activeTab === "sem"} onClick={() => setActiveTab("sem")} count={failCount > 0 ? `${failCount} fail` : undefined} />
          </div>

          {(activeTab === "internal" || activeTab === "lab") && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{activeTab === "internal" ? "Theory Subjects — Internal Assessment" : "Lab Subjects — Assessment"}</div>
              {!quickEdit ? (
                <button onClick={startEdit} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "7px 16px", fontSize: 12, cursor: "pointer" }}>Quick Edit</button>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={saveEdit} style={{ background: "#7c3238", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>Save Changes</button>
                  <button onClick={cancelEdit} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "7px 16px", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                </div>
              )}
            </div>
          )}

          {activeTab === "internal" && (
            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--color-background-secondary)" }}>
                      {["Sl","Course Code","Subject Name","Att %","IA-1 / 30","IA-2 / 30","CIA / 30","Total / 50"].map(h => (
                        <th key={h} style={{ padding: "11px 14px", textAlign: h.includes("Subject") || h.includes("Course") ? "left" : "center", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(quickEdit ? draftTheory : theoryMarks).map((r, i) => (
                      <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                        <td style={{ padding: "11px 14px", textAlign: "center", color: "var(--color-text-secondary)" }}>{i + 1}</td>
                        <td style={{ padding: "11px 14px", color: "var(--color-text-secondary)", fontSize: 12 }}>{r.code}</td>
                        <td style={{ padding: "11px 14px", fontWeight: 500 }}>{r.subject}</td>
                        <td style={{ padding: "11px 14px", textAlign: "center" }}>
                          {quickEdit ? numInput(r.att, v => setDraftTheory(prev => prev.map((x, j) => j === i ? { ...x, att: v } : x))) : <AttBadge pct={r.att} />}
                        </td>
                        {["ia1","ia2","cia","total"].map(k => (
                          <td key={k} style={{ padding: "11px 14px", textAlign: "center", fontWeight: k === "total" ? 600 : 400 }}>
                            {quickEdit ? numInput(r[k], v => setDraftTheory(prev => prev.map((x, j) => j === i ? { ...x, [k]: v } : x))) : r[k]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "lab" && (
            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--color-background-secondary)" }}>
                      {["Sl","Course Code","Subject Name","Att %","CIA / 30","Total / 30"].map(h => (
                        <th key={h} style={{ padding: "11px 14px", textAlign: h.includes("Subject") || h.includes("Course") ? "left" : "center", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(quickEdit ? draftLab : labMarks).map((r, i) => (
                      <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                        <td style={{ padding: "11px 14px", textAlign: "center", color: "var(--color-text-secondary)" }}>{i + 1}</td>
                        <td style={{ padding: "11px 14px", color: "var(--color-text-secondary)", fontSize: 12 }}>{r.code}</td>
                        <td style={{ padding: "11px 14px", fontWeight: 500 }}>{r.subject}</td>
                        <td style={{ padding: "11px 14px", textAlign: "center" }}>
                          {quickEdit ? numInput(r.att, v => setDraftLab(prev => prev.map((x, j) => j === i ? { ...x, att: v } : x))) : <AttBadge pct={r.att} />}
                        </td>
                        {["cia","total"].map(k => (
                          <td key={k} style={{ padding: "11px 14px", textAlign: "center", fontWeight: k === "total" ? 600 : 400 }}>
                            {quickEdit ? numInput(r[k], v => setDraftLab(prev => prev.map((x, j) => j === i ? { ...x, [k]: v } : x))) : r[k]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "sem" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Result", value: failCount > 0 ? "FAIL" : "PASS", color: failCount > 0 ? "#a32d2d" : "#3b6d11" },
                  { label: "SGPA", value: isNaN(sgpa) ? "—" : sgpa.toFixed(2), color: "var(--color-text-primary)" },
                  { label: "Total Credits", value: totalCredits.toFixed(1), color: "var(--color-text-primary)" },
                  { label: "Backlogs", value: failCount, color: failCount > 0 ? "#a32d2d" : "#3b6d11" },
                ].map(c => (
                  <div key={c.label} style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{c.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: c.color }}>{c.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: "#faeeda", border: "0.5px solid #f0c070", borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontSize: 12, color: "#854f0b" }}>
                Result was re-published by your University/College on 07-05-25 AT 12:50
              </div>

              <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "var(--color-background-secondary)" }}>
                        {["Sl.No","Course Code","Course Name","Max Marks","Min Marks","SE Marks","IA Marks","Marks Scored","Credits","Grade","Credit Points","Letter Grade","Status"].map(h => (
                          <th key={h} style={{ padding: "10px 12px", textAlign: h === "Course Name" || h === "Course Code" ? "left" : "center", fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {semResult.map((r, i) => (
                        <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", background: r.status === "Fail" ? "#fffaf9" : "transparent" }}>
                          <td style={{ padding: "10px 12px", textAlign: "center", color: "var(--color-text-secondary)" }}>{r.sl}</td>
                          <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)" }}>{r.code}</td>
                          <td style={{ padding: "10px 12px", fontWeight: 500, minWidth: 200 }}>{r.name}</td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>{r.maxMarks}</td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>{r.minMarks}</td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>{r.seMarks ?? "—"}</td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>{r.iaMarks}</td>
                          <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 600, color: r.scored < r.minMarks ? "#a32d2d" : "var(--color-text-primary)" }}>{r.scored}</td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>{r.credits}</td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>{r.grade ?? "—"}</td>
                          <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 500 }}>{r.creditPoints ?? "—"}</td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>{r.letterGrade ?? "—"}</td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}><StatusBadge status={r.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ background: "#7c3238", padding: "12px 16px", color: "#fff", fontSize: 12, display: "flex", gap: 24, flexWrap: "wrap" }}>
                  <span>Result: <strong>{failCount > 0 ? "FAIL" : "PASS"}</strong></span>
                  <span>SGPA: <strong>{isNaN(sgpa) ? "null" : sgpa.toFixed(2)}</strong></span>
                  <span>CGPA: <strong>—</strong></span>
                  <span>Term Grade: <strong>—</strong></span>
                  <span>Promotion Status: <strong>Eligible</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>All Students — Semester {selectedSem}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Click a student to view their marks</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--color-background-secondary)" }}>
                  {["Sl","USN","Name","Dept","Sem","Section","Quick View"].map(h => (
                    <th key={h} style={{ padding: "11px 14px", textAlign: h === "Name" || h === "USN" ? "left" : "center", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.usn} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", cursor: "pointer" }} onClick={() => setSelectedUSN(s.usn)} onMouseEnter={e => e.currentTarget.style.background = "var(--color-background-secondary)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "11px 14px", textAlign: "center", color: "var(--color-text-secondary)" }}>{i + 1}</td>
                    <td style={{ padding: "11px 14px", color: "#185fa5", fontWeight: 500 }}>{s.usn}</td>
                    <td style={{ padding: "11px 14px", fontWeight: 500 }}>{s.name}</td>
                    <td style={{ padding: "11px 14px", textAlign: "center" }}><span style={{ background: "#e6f1fb", color: "#185fa5", borderRadius: 6, padding: "2px 9px", fontSize: 12 }}>{s.dept}</span></td>
                    <td style={{ padding: "11px 14px", textAlign: "center" }}>{s.sem}</td>
                    <td style={{ padding: "11px 14px", textAlign: "center" }}>{s.sec}</td>
                    <td style={{ padding: "11px 14px", textAlign: "center" }}>
                      <button onClick={e => { e.stopPropagation(); setSelectedUSN(s.usn); }} style={{ background: "#7c3238", color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>View Marks</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
