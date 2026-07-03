import { useState, useMemo } from "react";

const DEPT_OPTIONS = ["All", "BCA", "BCOM", "BBA", "BSC", "BTECH", "MCA", "MSC", "MBA"];
const SEM_OPTIONS = ["All", "1", "2", "3", "4", "5", "6", "7", "8"];
const SEC_OPTIONS = ["All", "A", "B", "C", "D"];


const staticStudents = [
  { usn: "U18BP22S0046", name: "B Deepthi", dept: "BCA", sem: "2", sec: "A", balance: 0, pending: 2, remark: "" },
  { usn: "U18BP22S0047", name: "Arun Kumar", dept: "BCA", sem: "2", sec: "A", balance: 500, pending: 0, remark: "" },
  { usn: "U18BP22S0048", name: "Priya Sharma", dept: "MCA", sem: "4", sec: "B", balance: 0, pending: 1, remark: "" },
  { usn: "U18BP22S0049", name: "Rahul Verma", dept: "MBA", sem: "2", sec: "A", balance: 1200, pending: 3, remark: "" },
  { usn: "U18BP22S0050", name: "Sneha Nair", dept: "BSC", sem: "3", sec: "C", balance: 0, pending: 0, remark: "" },
  { usn: "U18BP22S0051", name: "Kiran Raj", dept: "BTECH", sem: "5", sec: "B", balance: 800, pending: 1, remark: "" },
];

const mockInternalMarks = [
  { code: "BCA2AECKA02", subject: "Ganaka Sowrabha-2", att: 88, ia1: 24, ia2: 22, cia: 20, total: 39 },
  { code: "BCA2DSC04", subject: "Computer Architecture", att: 72, ia1: 3, ia2: 20, cia: 18, total: 28 },
  { code: "BCA2DSC05", subject: "OOP using Java", att: 65, ia1: 14, ia2: 18, cia: 16, total: 41 },
  { code: "BCA2DSC06", subject: "Database Management System", att: 90, ia1: 22, ia2: 21, cia: 19, total: 50 },
  { code: "BSC2ACEN02", subject: "Generic English Imprints II", att: 95, ia1: 28, ia2: 25, cia: 24, total: 60 },
  { code: "CHE2OE02", subject: "Chemistry in Daily Life II", att: 82, ia1: 26, ia2: 24, cia: 22, total: 55 },
];

const mockLabMarks = [
  { code: "BCA2PRA05", subject: "Java Programming Lab", att: 80, cia: 22, total: 27 },
  { code: "BCA2PRA06", subject: "Database Management System Lab", att: 85, cia: 20, total: 24 },
  { code: "SEC2SB02", subject: "Ability Enhancement Env. Studies", att: 75, cia: 18, total: 29 },
];

const mockSemExamMarks = [
  { sl: 1, code: "BCA2AECKA02", name: "Ganaka Sowrabha-2", maxMarks: 100, minMarks: 40, seMarks: 25, iaMarks: 39, scored: 64, status: "Pass" },
  { sl: 2, code: "BCA2DSC04", name: "Computer Architecture", maxMarks: 100, minMarks: 40, seMarks: 3, iaMarks: 25, scored: 28, status: "Fail" },
  { sl: 3, code: "BCA2DSC05", name: "OOP using Java", maxMarks: 100, minMarks: 40, seMarks: 14, iaMarks: 27, scored: 41, status: "Fail" },
  { sl: 4, code: "BCA2DSC06", name: "Database Management System", maxMarks: 100, minMarks: 40, seMarks: 23, iaMarks: 27, scored: 50, status: "Pass" },
  { sl: 5, code: "BSC2ACEN02", name: "Generic English Imprints II", maxMarks: 100, minMarks: 40, seMarks: 37, iaMarks: 23, scored: 60, status: "Pass" },
  { sl: 6, code: "CHE2OE02", name: "Chemistry in Daily Life II", maxMarks: 100, minMarks: 40, seMarks: 30, iaMarks: 25, scored: 55, status: "Pass" },
  { sl: 7, code: "BCA2PRA05", name: "Java Programming Lab", maxMarks: 50, minMarks: 20, seMarks: 17, iaMarks: 10, scored: 27, status: "Pass" },
  { sl: 8, code: "BCA2PRA06", name: "Database Management System Lab", maxMarks: 50, minMarks: 20, seMarks: 14, iaMarks: 10, scored: 24, status: "Pass" },
  { sl: 9, code: "SEC2SB02", name: "Ability Enhancement Env. Studies", maxMarks: 50, minMarks: 20, seMarks: 16, iaMarks: 13, scored: 29, status: "Pass" },
  { sl: 10, code: "SEC2VB0F", name: "National Cadet Corps (NCC)", maxMarks: 50, minMarks: 20, seMarks: null, iaMarks: 43, scored: 43, status: "Pass" },
];

const mockSMR = {
  name: "B Deepthi",
  usn: "U18BP22S0046",
  dept: "BCA",
  sem: "II",
  dob: "15-Mar-2004",
  phone: "+91 9876543210",
  email: "deepthi@svyasa.edu",
  address: "123, MG Road, Bengaluru - 560001",
  parentName: "B Ramesh",
  parentPhone: "+91 9876543211",
  blood: "B+",
  category: "General",
  photo: null,
  attendance: 78,
  gpa: 6.2,
  backlogs: 2,
};

const mockMeetings = [
  { id: 1, date: "2025-05-12", time: "10:00", section: "A", topic: "Academic Progress Review", notified: true },
  { id: 2, date: "2025-05-20", time: "11:30", section: "A", topic: "Career Counseling", notified: false },
];

const mockMessages = [
  { id: 1, from: "student", text: "Sir, I am having trouble with DBMS assignments.", time: "10:32 AM" },
  { id: 2, from: "mentor", text: "Let's discuss this in our next meeting. Please prepare your doubts.", time: "10:45 AM" },
  { id: 3, from: "student", text: "Sure sir, I will prepare. Thank you!", time: "10:50 AM" },
];

function Avatar({ name, size = 36, color = "#7c3238" }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 600, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Badge({ color, children }) {
  const colors = {
    red: { bg: "#fce8e8", text: "#a32d2d" },
    green: { bg: "#eaf3de", text: "#3b6d11" },
    amber: { bg: "#faeeda", text: "#854f0b" },
    gray: { bg: "#f1efe8", text: "#5f5e5a" },
    blue: { bg: "#e6f1fb", text: "#185fa5" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{ background: c.bg, color: c.text, borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 500 }}>
      {children}
    </span>
  );
}

function SMRModal({ student, onClose, onMeeting, onMessage }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.38)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--color-background-primary)", borderRadius: 16, width: "min(680px, 96vw)", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#7c3238", borderRadius: "16px 16px 0 0", padding: "20px 24px", color: "#fff", display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar name={mockSMR.name} size={56} color="#5a2228" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{mockSMR.name}</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>{mockSMR.usn} &bull; {mockSMR.dept} &bull; Sem {mockSMR.sem}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onMeeting} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>+ Meeting</button>
            <button onClick={onMessage} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>Message</button>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>&times;</button>
          </div>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <Section title="Personal Details">
              <Row label="Date of Birth" value={mockSMR.dob} />
              <Row label="Blood Group" value={mockSMR.blood} />
              <Row label="Category" value={mockSMR.category} />
              <Row label="Phone" value={mockSMR.phone} />
              <Row label="Email" value={mockSMR.email} />
            </Section>
            <Section title="Parent / Guardian">
              <Row label="Name" value={mockSMR.parentName} />
              <Row label="Phone" value={mockSMR.parentPhone} />
              <Row label="Address" value={mockSMR.address} />
            </Section>
          </div>
          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <StatCard label="Attendance" value={`${mockSMR.attendance}%`} color={mockSMR.attendance < 75 ? "red" : "green"} />
            <StatCard label="GPA" value={mockSMR.gpa} color="blue" />
            <StatCard label="Backlogs" value={mockSMR.backlogs} color={mockSMR.backlogs > 0 ? "amber" : "green"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#7c3238", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{title}</div>
      <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 13 }}>
      <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--color-text-primary)", fontWeight: 500, maxWidth: "60%", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = { red: "#a32d2d", green: "#3b6d11", blue: "#185fa5", amber: "#854f0b" };
  return (
    <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: colors[color] || "var(--color-text-primary)" }}>{value}</div>
    </div>
  );
}

function MeetingModal({ onClose, onSchedule }) {
  const [form, setForm] = useState({ day: "", date: "", time: "", section: "A", topic: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.38)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--color-background-primary)", borderRadius: 14, width: "min(460px, 94vw)", padding: 28, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: "var(--color-text-primary)" }}>Schedule Meeting</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Day</label>
            <select value={form.day} onChange={e => set("day", e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", fontSize: 13 }}>
              <option value="">Select Day</option>
              {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Date</label>
            <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Time</label>
            <input type="time" value={form.time} onChange={e => set("time", e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Section</label>
            <select value={form.section} onChange={e => set("section", e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", fontSize: 13 }}>
              {["A","B","C","D"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Topic / Agenda</label>
          <input value={form.topic} onChange={e => set("topic", e.target.value)} placeholder="e.g. Academic Progress Review" style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", fontSize: 13, boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 20px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "transparent", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => { onSchedule(form); onClose(); }} style={{ padding: "8px 20px", borderRadius: 8, background: "#7c3238", color: "#fff", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Send Notification</button>
        </div>
      </div>
    </div>
  );
}

function ChatModal({ student, onClose }) {
  const [msgs, setMsgs] = useState(mockMessages);
  const [input, setInput] = useState("");
  const send = () => {
    if (!input.trim()) return;
    setMsgs(m => [...m, { id: Date.now(), from: "mentor", text: input.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setInput("");
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.38)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--color-background-primary)", borderRadius: 16, width: "min(420px, 96vw)", height: "min(560px, 90vh)", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <div style={{ background: "#7c3238", padding: "14px 18px", color: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={student?.name || "Student"} size={36} color="#5a2228" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{student?.name || "Student"}</div>
            <div style={{ fontSize: 11, opacity: 0.75 }}>Mentee &bull; Online</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>&times;</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10, background: "#f6f0eb" }}>
          {msgs.map(m => (
            <div key={m.id} style={{ display: "flex", justifyContent: m.from === "mentor" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "78%", background: m.from === "mentor" ? "#7c3238" : "#fff", color: m.from === "mentor" ? "#fff" : "var(--color-text-primary)", borderRadius: m.from === "mentor" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "9px 13px", fontSize: 13, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                <div>{m.text}</div>
                <div style={{ fontSize: 10, opacity: 0.6, textAlign: "right", marginTop: 4 }}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 14px", borderTop: "0.5px solid var(--color-border-tertiary)", display: "flex", gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Type a message..." style={{ flex: 1, padding: "9px 12px", borderRadius: 20, border: "0.5px solid var(--color-border-secondary)", fontSize: 13 }} />
          <button onClick={send} style={{ background: "#7c3238", color: "#fff", border: "none", borderRadius: "50%", width: 38, height: 38, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>&#9658;</button>
        </div>
      </div>
    </div>
  );
}

function InternalMarksModal({ student, onClose }) {
  const [marks, setMarks] = useState(mockInternalMarks.map(r => ({ ...r })));
  const [labs, setLabs] = useState(mockLabMarks.map(r => ({ ...r })));
  const [semExamMarks, setSemExamMarks] = useState(mockSemExamMarks.map(r => ({ ...r })));
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.38)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--color-background-primary)", borderRadius: 16, width: "min(780px, 98vw)", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <div style={{ background: "#7c3238", padding: "16px 22px", color: "#fff", borderRadius: "16px 16px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 600 }}>{student?.name} — Internal Marks</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{student?.usn} &bull; Sem {student?.sem}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>&times;</button>
        </div>
        <div style={{ padding: "20px 22px" }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Theory Subjects</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--color-background-secondary)" }}>
                  {["Sl","Code","Subject","Att %","IA-1","IA-2","CIA","Total"].map(h => (
                    <th key={h} style={{ padding: "9px 12px", textAlign: h === "Subject" || h === "Code" ? "left" : "center", fontWeight: 600, color: "var(--color-text-secondary)", fontSize: 12, borderBottom: "0.5px solid var(--color-border-tertiary)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {marks.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                    <td style={{ padding: "9px 12px", textAlign: "center" }}>{i + 1}</td>
                    <td style={{ padding: "9px 12px", color: "var(--color-text-secondary)", fontSize: 12 }}>{r.code}</td>
                    <td style={{ padding: "9px 12px" }}>{r.subject}</td>
                    {["att","ia1","ia2","cia","total"].map(k => (
                      <td key={k} style={{ padding: "9px 12px", textAlign: "center" }}>
                        <span style={{ color: k === "att" && r.att < 75 ? "#a32d2d" : "var(--color-text-primary)", fontWeight: k === "total" ? 600 : 400 }}>
                          {r[k]}{k === "att" ? "%" : ""}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontWeight: 600, fontSize: 14, margin: "20px 0 10px" }}>Lab Subjects</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--color-background-secondary)" }}>
                  {["Sl","Code","Subject","Att %","CIA","Total"].map(h => (
                    <th key={h} style={{ padding: "9px 12px", textAlign: h === "Subject" || h === "Code" ? "left" : "center", fontWeight: 600, color: "var(--color-text-secondary)", fontSize: 12, borderBottom: "0.5px solid var(--color-border-tertiary)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {labs.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                    <td style={{ padding: "9px 12px", textAlign: "center" }}>{i + 1}</td>
                    <td style={{ padding: "9px 12px", color: "var(--color-text-secondary)", fontSize: 12 }}>{r.code}</td>
                    <td style={{ padding: "9px 12px" }}>{r.subject}</td>
                    <td style={{ padding: "9px 12px", textAlign: "center" }}><span style={{ color: r.att < 75 ? "#a32d2d" : "var(--color-text-primary)" }}>{r.att}%</span></td>
                    <td style={{ padding: "9px 12px", textAlign: "center" }}>{r.cia}</td>
                    <td style={{ padding: "9px 12px", textAlign: "center", fontWeight: 600 }}>{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ fontWeight: 600, fontSize: 14, margin: "20px 0 10px" }}>Semester Examination</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--color-background-secondary)" }}>
                  {["Sl","Code","Course Name","Max","Min","SE Marks","IA Marks","Scored","Status"].map(h => (
                    <th key={h} style={{ padding: "9px 12px", textAlign: h === "Course Name" || h === "Code" ? "left" : "center", fontWeight: 600, color: "var(--color-text-secondary)", fontSize: 12, borderBottom: "0.5px solid var(--color-border-tertiary)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {semExamMarks.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", background: r.status === "Fail" ? "#fffaf9" : "transparent" }}>
                    <td style={{ padding: "9px 12px", textAlign: "center" }}>{r.sl}</td>
                    <td style={{ padding: "9px 12px", color: "var(--color-text-secondary)", fontSize: 12 }}>{r.code}</td>
                    <td style={{ padding: "9px 12px", minWidth: 180 }}>{r.name}</td>
                    <td style={{ padding: "9px 12px", textAlign: "center" }}>{r.maxMarks}</td>
                    <td style={{ padding: "9px 12px", textAlign: "center" }}>{r.minMarks}</td>
                    <td style={{ padding: "9px 12px", textAlign: "center" }}>{r.seMarks ?? "—"}</td>
                    <td style={{ padding: "9px 12px", textAlign: "center" }}>{r.iaMarks}</td>
                    <td style={{ padding: "9px 12px", textAlign: "center", fontWeight: 600, color: r.scored < r.minMarks ? "#a32d2d" : "var(--color-text-primary)" }}>{r.scored}</td>
                    <td style={{ padding: "9px 12px", textAlign: "center", color: r.status === "Pass" ? "#3b6d11" : "#a32d2d", fontWeight: 500 }}>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MentoringPage() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [sem, setSem] = useState("All");
  const [sec, setSec] = useState("All");
  const [remarks, setRemarks] = useState({});
  const [showSMR, setShowSMR] = useState(null);
  const [showMeeting, setShowMeeting] = useState(false);
  const [showChat, setShowChat] = useState(null);
  const [showMarks, setShowMarks] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const filtered = useMemo(() => staticStudents.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.usn.toLowerCase().includes(q);
    return matchQ && (dept === "All" || s.dept === dept) && (sem === "All" || s.sem === sem) && (sec === "All" || s.sec === sec);
  }), [search, dept, sem, sec]);

  const handleSchedule = (form) => {
    setNotifications(n => [...n, { ...form, id: Date.now() }]);
  };

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}>
      {showSMR && <SMRModal student={showSMR} onClose={() => setShowSMR(null)} onMeeting={() => setShowMeeting(true)} onMessage={() => { setShowChat(showSMR); }} />}
      {showMeeting && <MeetingModal onClose={() => setShowMeeting(false)} onSchedule={handleSchedule} />}
      {showChat && <ChatModal student={showChat} onClose={() => setShowChat(null)} />}
      {showMarks && <InternalMarksModal student={showMarks} onClose={() => setShowMarks(null)} />}

      {notifications.length > 0 && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 300, display: "flex", flexDirection: "column", gap: 8 }}>
          {notifications.slice(-2).map(n => (
            <div key={n.id} style={{ background: "#eaf3de", color: "#3b6d11", borderRadius: 10, padding: "10px 16px", fontSize: 13, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 10 }}>
              <span>&#10003;</span> Meeting notification sent — {n.topic || "Meeting"} on {n.date}
              <button onClick={() => setNotifications(ns => ns.filter(x => x.id !== n.id))} style={{ background: "none", border: "none", color: "#3b6d11", cursor: "pointer", fontSize: 14, marginLeft: 4 }}>&times;</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Mentoring</div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Manage your mentees, schedule meetings, and track progress</div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "7px 12px", background: "var(--color-background-primary)", flex: "1 1 200px", minWidth: 180 }}>
          <svg width="14" height="14" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or USN" style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, width: "100%" }} />
        </div>
        {[["Dept", dept, setDept, DEPT_OPTIONS], ["Sem", sem, setSem, SEM_OPTIONS], ["Section", sec, setSec, SEC_OPTIONS]].map(([label, val, setter, opts]) => (
          <select key={label} value={val} onChange={e => setter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", fontSize: 13, background: "var(--color-background-primary)", minWidth: 110 }}>
            {opts.map(o => <option key={o}>{o === "All" ? `All ${label}` : o}</option>)}
          </select>
        ))}
        <button onClick={() => setShowMeeting(true)} style={{ marginLeft: "auto", background: "#7c3238", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>+ Schedule Meeting</button>
      </div>

      <div style={{ background: "var(--color-background-primary)", borderRadius: 12, border: "0.5px solid var(--color-border-tertiary)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                {["Sl","USN","Name","Dept","Sem","Sec","Balance","Pending","Remark","Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: h === "Name" || h === "Remark" || h === "USN" ? "left" : "center", fontWeight: 600, fontSize: 12, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.usn} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--color-background-secondary)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "11px 14px", textAlign: "center", color: "var(--color-text-secondary)" }}>{i + 1}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <button onClick={() => setShowMarks(s)} style={{ background: "none", border: "none", color: "#185fa5", fontWeight: 500, cursor: "pointer", fontSize: 13, padding: 0, textDecoration: "underline dotted" }}>{s.usn}</button>
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <button onClick={() => setShowSMR(s)} style={{ background: "none", border: "none", color: "#7c3238", fontWeight: 500, cursor: "pointer", fontSize: 13, padding: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar name={s.name} size={26} color="#7c3238" />
                      {s.name}
                    </button>
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center" }}><Badge color="blue">{s.dept}</Badge></td>
                  <td style={{ padding: "11px 14px", textAlign: "center" }}>{s.sem}</td>
                  <td style={{ padding: "11px 14px", textAlign: "center" }}>{s.sec}</td>
                  <td style={{ padding: "11px 14px", textAlign: "center" }}>
                    {s.balance > 0 ? <Badge color="red">₹{s.balance}</Badge> : <Badge color="green">Nil</Badge>}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center" }}>
                    {s.pending > 0 ? <Badge color="amber">{s.pending}</Badge> : <Badge color="gray">0</Badge>}
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <input
                      value={remarks[s.usn] ?? s.remark}
                      onChange={e => setRemarks(r => ({ ...r, [s.usn]: e.target.value }))}
                      placeholder="Add remark..."
                      style={{ border: "0.5px solid var(--color-border-secondary)", borderRadius: 6, padding: "5px 8px", fontSize: 12, width: "100%", minWidth: 120, background: "var(--color-background-primary)" }}
                    />
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                      <button onClick={() => setShowMeeting(true)} title="Schedule Meeting" style={{ background: "#faeeda", color: "#854f0b", border: "none", borderRadius: 6, padding: "5px 8px", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Meet</button>
                      <button onClick={() => setShowChat(s)} title="Message" style={{ background: "#e6f1fb", color: "#185fa5", border: "none", borderRadius: 6, padding: "5px 8px", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Chat</button>
                      <button onClick={() => setShowSMR(s)} title="View SMR" style={{ background: "#fce8e8", color: "#a32d2d", border: "none", borderRadius: 6, padding: "5px 8px", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>SMR</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-secondary)", fontSize: 13 }}>No students found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "10px 16px", borderTop: "0.5px solid var(--color-border-tertiary)", fontSize: 12, color: "var(--color-text-secondary)", display: "flex", justifyContent: "space-between" }}>
          <span>Showing {filtered.length} of {staticStudents.length} mentees</span>
          <button style={{ background: "none", border: "0.5px solid var(--color-border-secondary)", borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer", color: "var(--color-text-secondary)" }}>Export CSV</button>
        </div>
      </div>
    </div>
  );
}
