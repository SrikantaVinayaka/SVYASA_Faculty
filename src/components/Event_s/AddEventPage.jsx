import React, { useState, useRef } from "react";
import { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType, LevelFormat } from "docx";

// ─────────────────────────────────────────────────────────────────────────────
// DOCX generation
// Requires in index.html:
//   <script src="https://unpkg.com/docx@8.5.0/build/index.js"></script>
// ─────────────────────────────────────────────────────────────────────────────

const fileToArrayBuffer = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsArrayBuffer(file);
  });
  
const getImageDimensions = (file) =>
  new Promise((res) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res({ w: img.naturalWidth, h: img.naturalHeight }); };
    img.onerror = () => res({ w: 400, h: 300 });
    img.src = url;
  });

const imgType = (file) => {
  const n = file.name.toLowerCase();
  if (n.endsWith(".png")) return "png";
  return "jpg";
};

export const buildDocx = async (form) => {
  const h2 = (text) => new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, size: 28, font: "Calibri", color: "000000" })],
    spacing: { before: 300, after: 120 },
  });

  const body = (text, align) => new Paragraph({
    alignment: align || AlignmentType.JUSTIFIED,
    children: [new TextRun({ text: String(text ?? ""), size: 24, font: "Calibri" })],
    spacing: { after: 80 },
  });

  const meta = (label, value) => new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 24, font: "Calibri" }),
      new TextRun({ text: String(value ?? "—"), size: 24, font: "Calibri" }),
    ],
    spacing: { after: 80 },
  });

  const bullet = (text) => new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text: String(text ?? ""), size: 24, font: "Calibri" })],
    spacing: { after: 60 },
  });

  const embedImage = async (file) => {
    try {
      const buf = await fileToArrayBuffer(file);
      const { w, h } = await getImageDimensions(file);
      const maxW = 420, maxH = 280;
      const ratio = Math.min(maxW / w, maxH / h, 1);
      return new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new ImageRun({
            type: imgType(file),
            data: buf,
            transformation: { width: Math.round(w * ratio), height: Math.round(h * ratio) },
            altText: { title: file.name, description: file.name, name: file.name },
          }),
        ],
        spacing: { after: 160 },
      });
    } catch {
      return body(`[Image: ${file.name} – could not embed]`);
    }
  };

  const children = [];

  // Logo
  if (form.logoFile) {
    try {
      const buf = await fileToArrayBuffer(form.logoFile);
      const { w, h } = await getImageDimensions(form.logoFile);
      const ratio = Math.min(100 / w, 100 / h, 1);
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new ImageRun({
          type: imgType(form.logoFile),
          data: buf,
          transformation: { width: Math.round(w * ratio), height: Math.round(h * ratio) },
          altText: { title: "Logo", description: "Logo", name: "Logo" },
        })],
        spacing: { after: 200 },
      }));
    } catch { /* skip logo on error */ }
  }

  // Title block
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: form.department || "", bold: true, size: 30, font: "Calibri" })],
    spacing: { after: 80 },
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: form.eventTitle || "", bold: true, size: 34, font: "Calibri" })],
    spacing: { after: 240 },
  }));

  // Event details
  const dateStr = form.startDate === form.endDate
    ? form.startDate
    : `${form.startDate} – ${form.endDate}`;
  children.push(meta("Event Type", form.eventType));
  children.push(meta("Date", `${dateStr}  |  ${form.startTime} – ${form.endTime}`));
  children.push(meta("Venue", form.venue));

  // Beneficiaries
  children.push(h2("Beneficiaries"));
  children.push(meta("Students", form.students));
  children.push(meta("Faculty", form.faculty));

  // Resource person
  if (form.includeResource && form.resourceName) {
    children.push(h2("Resource Person"));
    children.push(body(form.resourceName));
    if (form.resourceDetails) children.push(body(form.resourceDetails));
  }

  // Objective
  children.push(h2("Objective"));
  children.push(body(form.objective));

  // Brief
  children.push(h2("Event Summary"));
  children.push(body(form.brief));

  // Event photos
  if (form.eventImages?.length) {
    children.push(h2("Event Photographs"));
    for (const f of form.eventImages) children.push(await embedImage(f));
  }

  // Feedback photos
  if (form.feedbackImages?.length) {
    children.push(h2("Feedback Photographs"));
    for (const f of form.feedbackImages) children.push(await embedImage(f));
  }

  // Signatures
  children.push(h2("Report Creator"));
  children.push(meta("Prepared By", form.creator));
  if (form.creatorDesignation) children.push(meta("Designation", form.creatorDesignation));

  children.push(h2("Signing Authority"));
  children.push(meta("Authority", form.authority));
  if (form.authorityDesignation) children.push(meta("Designation", form.authorityDesignation));

  return new Document({
    numbering: {
      config: [{
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      }],
    },
    styles: {
      default: { document: { run: { font: "Calibri", size: 24 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal",
          run: { size: 34, bold: true, font: "Calibri", color: "000000" },
          paragraph: { spacing: { before: 0, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal",
          run: { size: 28, bold: true, font: "Calibri", color: "000000" },
          paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 1 } },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children,
    }],
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens & CSS
// ─────────────────────────────────────────────────────────────────────────────

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #f0f2f5;
  --white: #ffffff;
  --input-bg: #12192b;
  --input-border: #1e2d45;
  --input-text: #ffffff;
  --input-placeholder: #4a5a72;
  --label: #6b7280;
  --ink: #111827;
  --maroon: #7b1c2e;
  --maroon-dark: #5e1522;
  --maroon-light: #f9eaed;
  --border: #e5e7eb;
  --shadow-sm: 0 1px 3px rgba(0,0,0,.07);
  --shadow: 0 2px 8px rgba(0,0,0,.08);
  --green: #15803d;
  --green-light: #dcfce7;
  --r: 10px;
}

.add-event-page {
  font-family: 'Inter', sans-serif;
  background: var(--bg);
  color: var(--ink);
  font-size: 14px;
  line-height: 1.5;
}

.add-event-wrap {
  max-width: 1060px;
  margin: 0 auto;
  padding: 0 0 80px;
}

/* ── Form area ── */
.stack { display: flex; flex-direction: column; gap: 12px; }

/* ── Page header ── */
.page-header {
  margin-bottom: 4px;
}
.page-header h1 {
  font-size: 22px; font-weight: 700; color: var(--ink);
}
.page-header p {
  font-size: 13px; color: #6b7280; margin-top: 2px;
}

/* ── Cards ── */
.card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.card-head {
  display: flex; align-items: center; gap: 10px;
  padding: 15px 20px 13px;
  border-bottom: 1px solid #f3f4f6;
}

.card-icon-wrap {
  width: 30px; height: 30px; border-radius: 7px;
  background: var(--maroon-light);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0;
}

.card-title {
  font-size: 14px; font-weight: 600; color: var(--ink);
  letter-spacing: -0.1px;
}

.card-body {
  padding: 18px 20px;
  display: flex; flex-direction: column; gap: 14px;
}

/* ── Fields ── */
.fld { display: flex; flex-direction: column; gap: 5px; }

.fld-lbl {
  font-size: 12px; font-weight: 500;
  color: var(--label);
}

.fld input, .fld textarea, .fld select {
  font-family: 'Inter', sans-serif;
  font-size: 13.5px;
  color: var(--input-text);
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 8px;
  padding: 10px 13px;
  width: 100%;
  outline: none;
  transition: border .15s, box-shadow .15s;
}

.fld select option { background: var(--input-bg); color: var(--input-text); }

.fld input:focus, .fld textarea:focus, .fld select:focus {
  border-color: var(--maroon);
  box-shadow: 0 0 0 3px rgba(123,28,46,.12);
}

.fld input::placeholder, .fld textarea::placeholder { color: var(--input-placeholder); }

.fld textarea { resize: vertical; min-height: 96px; }

.g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

/* ── Counter ── */
.cnt {
  display: flex; align-items: center;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 8px; overflow: hidden;
}

.cnt-btn {
  all: unset; cursor: pointer;
  width: 40px; height: 42px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: #4a5a72;
  transition: background .12s, color .12s;
  flex-shrink: 0;
}

.cnt-btn:hover { background: #1e2d45; color: #fff; }

.cnt-val {
  flex: 1; text-align: center;
  font-size: 15px; font-weight: 500; color: #fff;
}

.cnt-input {
  flex: 1;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  color: #fff;
  background: transparent;
  border: none;
  outline: none;
  min-width: 0;
}

/* ── Upload ── */
.up-zone {
  background: #f9fafb;
  border: 1.5px dashed var(--border);
  border-radius: 9px;
  padding: 14px 16px;
  display: flex; align-items: center; gap: 12px;
  cursor: pointer;
  transition: border-color .15s, background .15s;
}

.up-zone:hover, .up-zone.drag { border-color: var(--maroon); background: var(--maroon-light); }

.up-info { flex: 1; }
.up-info p { font-size: 13px; font-weight: 500; color: var(--ink); }
.up-info small { font-size: 11px; color: #9ca3af; }

.up-browse {
  all: unset; cursor: pointer;
  font-size: 12px; font-weight: 500;
  padding: 6px 13px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: #374151;
  transition: background .12s, border-color .12s;
  white-space: nowrap;
  flex-shrink: 0;
}

.up-browse:hover { background: #f3f4f6; border-color: #9ca3af; }

.chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }

.chip {
  display: flex; align-items: center; gap: 5px;
  background: #f3f4f6;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 3px 8px 3px 4px;
  font-size: 11px; color: var(--ink);
  max-width: 200px;
}

.chip img { width: 20px; height: 20px; border-radius: 4px; object-fit: cover; flex-shrink: 0; }
.chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.chip-x {
  all: unset; cursor: pointer;
  color: #9ca3af; font-size: 15px; line-height: 1;
  flex-shrink: 0; transition: color .1s;
}

.chip-x:hover { color: var(--maroon); }

/* ── Toggle ── */
.tog { display: flex; align-items: center; gap: 9px; cursor: pointer; user-select: none; }

.tog input[type=checkbox] {
  appearance: none; -webkit-appearance: none;
  width: 17px; height: 17px;
  border: 2px solid var(--border);
  border-radius: 4px; cursor: pointer;
  position: relative; transition: all .15s; flex-shrink: 0;
}

.tog input[type=checkbox]:checked { background: var(--maroon); border-color: var(--maroon); }

.tog input[type=checkbox]:checked::after {
  content: '';
  position: absolute; left: 3px; top: 0px;
  width: 6px; height: 10px;
  border: 2.5px solid #fff; border-top: none; border-left: none;
  transform: rotate(45deg);
}

.tog-lbl { font-size: 13.5px; font-weight: 500; color: var(--ink); }

/* ── Buttons ── */
.btn-primary {
  all: unset; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  background: var(--maroon); color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 13.5px; font-weight: 500;
  font-family: 'Inter', sans-serif;
  transition: background .15s, box-shadow .15s;
}

.btn-primary:hover { background: var(--maroon-dark); box-shadow: 0 3px 10px rgba(123,28,46,.3); }
.btn-primary:active { box-shadow: none; }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }

.btn-full { width: 100%; padding-top: 12px; padding-bottom: 12px; }

/* ── Error ── */
.err {
  background: var(--maroon-light);
  border: 1px solid #f0b8c2;
  color: var(--maroon);
  padding: 11px 15px;
  border-radius: 8px;
  font-size: 13px;
  display: flex; align-items: flex-start; gap: 7px;
}

/* ── Report log ── */
.log-empty {
  text-align: center; padding: 24px;
  color: #9ca3af; font-size: 13px;
}

.log-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px;
  border-radius: 8px;
  background: #f9fafb;
  border: 1px solid var(--border);
}

.log-title { font-size: 13.5px; font-weight: 500; }
.log-meta { font-size: 11.5px; color: #9ca3af; margin-top: 2px; }

.badge {
  font-size: 11px; font-weight: 600;
  padding: 3px 10px; border-radius: 20px;
  background: var(--green-light); color: var(--green);
  white-space: nowrap;
}

.hr { height: 1px; background: #f3f4f6; }

@media (max-width: 720px) {
  .add-event-wrap { padding: 0 0 60px; }
  .g2 { grid-template-columns: 1fr; }
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// Tiny helpers
// ─────────────────────────────────────────────────────────────────────────────

const Fld = ({ label, children }) => (
  <div className="fld">
    {label && <label className="fld-lbl">{label}</label>}
    {children}
  </div>
);

const G2 = ({ children }) => <div className="g2">{children}</div>;

function Counter({ label, value, onChange }) {
  const onType = (next) => {
    const parsed = Number.parseInt(next, 10);
    if (Number.isNaN(parsed)) return onChange(0);
    onChange(Math.max(0, parsed));
  };

  return (
    <Fld label={label}>
      <div className="cnt">
        <button type="button" className="cnt-btn" onClick={() => onChange(Math.max(0, value - 1))}>−</button>
        <input
          type="number"
          min="0"
          className="cnt-input"
          value={value}
          onChange={(e) => onType(e.target.value)}
        />
        <button type="button" className="cnt-btn" onClick={() => onChange(value + 1)}>+</button>
      </div>
    </Fld>
  );
}

function Upload({ label, multiple, files, onChange }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);

  const add = (raw) => {
    const arr = Array.from(raw).filter(f => f.type.startsWith("image/"));
    onChange(multiple ? [...(files || []), ...arr] : arr.slice(0, 1));
  };
  const remove = (i) => { const n = [...files]; n.splice(i, 1); onChange(n); };

  return (
    <Fld label={label}>
      <div
        className={`up-zone${drag ? " drag" : ""}`}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
        onClick={() => ref.current.click()}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "#9ca3af", flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <div className="up-info">
          <p>{multiple ? "Drag & drop images here" : "Drag & drop image here"}</p>
          <small>PNG, JPG, JPEG</small>
        </div>
        <span className="up-browse">Browse</span>
      </div>
      <input ref={ref} type="file" accept="image/*" multiple={multiple} style={{ display: "none" }}
        onChange={e => add(e.target.files)} />
      {!!files?.length && (
        <div className="chips">
          {files.map((f, i) => (
            <div key={i} className="chip">
              <img src={URL.createObjectURL(f)} alt="" />
              <span>{f.name.length > 20 ? f.name.slice(0, 18) + "…" : f.name}</span>
              <button className="chip-x" type="button" onClick={e => { e.stopPropagation(); remove(i); }}>×</button>
            </div>
          ))}
        </div>
      )}
    </Fld>
  );
}

function Card({ id, icon, title, children }) {
  return (
    <div className="card" id={id}>
      <div className="card-head">
        <div className="card-icon-wrap">{icon}</div>
        <span className="card-title">{title}</span>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

const timeOpts = [];
for (let h = 0; h < 24; h++)
  for (let m of [0, 30])
    timeOpts.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);

const today = new Date().toISOString().split("T")[0];

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function AddEventPage() {
  const [f, setF] = useState({
    department: "", eventTitle: "",
    eventType: "",
    eventDuration: "single",
    eventDate: today,
    startDate: today, endDate: today,
    startTime: "09:00", endTime: "17:00",
    venue: "", students: 0, faculty: 0,
    includeResource: false, resourceName: "", resourceDetails: "",
    objective: "", brief: "",
    creator: "", creatorDesignation: "",
    authority: "", authorityDesignation: "",
    logoFile: null, eventImages: [], feedbackImages: [],
  });

  const [error, setError]   = useState("");
  const [busy, setBusy]     = useState(false);

  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const fld = e => set(e.target.name, e.target.value);
  const setCount = (k, v) => set(k, Math.max(0, Number.isFinite(v) ? v : 0));

  const onDurationChange = (e) => {
    const value = e.target.value;
    setF((prev) => {
      if (value === "single") {
        const singleDate = prev.eventDate || prev.startDate || today;
        return {
          ...prev,
          eventDuration: value,
          eventDate: singleDate,
          startDate: singleDate,
          endDate: singleDate,
        };
      }
      return {
        ...prev,
        eventDuration: value,
        startDate: prev.startDate || prev.eventDate || today,
        endDate: prev.endDate || prev.startDate || prev.eventDate || today,
      };
    });
  };

  const onSingleDateChange = (e) => {
    const value = e.target.value;
    setF((prev) => ({
      ...prev,
      eventDate: value,
      startDate: value,
      endDate: value,
    }));
  };

  const download = async () => {
    setError("");
    if (!f.department) return setError("Department name is required.");
    if (!f.eventTitle)  return setError("Event title is required.");
    if (!f.eventType) return setError("Event type is required.");
    if (f.eventDuration === "single" && !f.eventDate) return setError("Event date is required.");
    if (f.eventDuration === "multiple" && (!f.startDate || !f.endDate)) {
      return setError("Both start date and end date are required.");
    }
    if (f.students < 0 || f.faculty < 0) return setError("Beneficiary counts cannot be negative.");

    const formData = f.eventDuration === "single"
      ? { ...f, startDate: f.eventDate, endDate: f.eventDate }
      : f;

    setBusy(true);
    try {
      const doc  = await buildDocx(formData);
      const blob = await Packer.toBlob(doc);
      const name = `${f.eventTitle.replace(/\s+/g, "_")}_report.docx`;
      const url  = URL.createObjectURL(blob);
      Object.assign(document.createElement("a"), { href: url, download: name }).click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("Generation failed: " + e.message);
    }
    setBusy(false);
  };

  return (
    <div className="add-event-page">
      <style>{css}</style>

      <div className="add-event-wrap">
        <div className="stack">
          <div className="page-header">
            <p style={{ fontSize:12, color:"#9ca3af", marginBottom:4 }}>Events / <span style={{ color:"var(--maroon)" }}>Add Event</span></p>
            <h1>Add Event Report</h1>
          </div>

          <Card id="dept" icon="🏛" title="Department Details">
            <Fld label="Department Name">
              <input name="department" value={f.department} onChange={fld}
                placeholder="e.g. Department of Computer Science" />
            </Fld>
          </Card>

          <Card id="logo" icon="🖼" title="Institution Logo">
            <Upload label="Upload Logo" multiple={false}
              files={f.logoFile ? [f.logoFile] : []}
              onChange={arr => set("logoFile", arr[0] || null)} />
          </Card>

          <Card id="event" icon="📅" title="Event Details">
            <Fld label="Event Title">
              <input name="eventTitle" value={f.eventTitle} onChange={fld}
                placeholder="e.g. National Symposium on AI" />
            </Fld>
            <G2>
              <Fld label="Event Type">
                <select name="eventType" value={f.eventType} onChange={fld}>
                  <option value="">Select event type</option>
                  <option value="In-House">In-House</option>
                  <option value="External">External</option>
                </select>
              </Fld>
              <Fld label="Event Duration">
                <select name="eventDuration" value={f.eventDuration} onChange={onDurationChange}>
                  <option value="single">Single Day Event</option>
                  <option value="multiple">Multiple Day Event</option>
                </select>
              </Fld>
            </G2>
            {f.eventDuration === "single" ? (
              <Fld label="Event Date">
                <input type="date" name="eventDate" value={f.eventDate} onChange={onSingleDateChange} />
              </Fld>
            ) : (
              <G2>
                <Fld label="Start Date"><input type="date" name="startDate" value={f.startDate} onChange={fld} /></Fld>
                <Fld label="End Date"><input type="date" name="endDate" value={f.endDate} onChange={fld} /></Fld>
              </G2>
            )}
            <G2>
              <Fld label="Start Time">
                <select name="startTime" value={f.startTime} onChange={fld}>
                  {timeOpts.map(t => <option key={t}>{t}</option>)}
                </select>
              </Fld>
              <Fld label="End Time">
                <select name="endTime" value={f.endTime} onChange={fld}>
                  {timeOpts.map(t => <option key={t}>{t}</option>)}
                </select>
              </Fld>
            </G2>
            <Fld label="Venue">
              <input name="venue" value={f.venue} onChange={fld} placeholder="e.g. Main Auditorium, Block A" />
            </Fld>
          </Card>

          <Card id="bene" icon="👥" title="Beneficiaries">
            <G2>
              <Counter label="Number of Students" value={f.students} onChange={v => setCount("students", v)} />
              <Counter label="Number of Faculty"  value={f.faculty}  onChange={v => setCount("faculty",  v)} />
            </G2>
          </Card>

          <Card id="resource" icon="🎤" title="Resource Person">
            <label className="tog">
              <input type="checkbox" checked={f.includeResource}
                onChange={e => set("includeResource", e.target.checked)} />
              <span className="tog-lbl">Include Resource Person Details</span>
            </label>
            {f.includeResource && (
              <>
                <Fld label="Resource Person Name">
                  <input name="resourceName" value={f.resourceName} onChange={fld}
                    placeholder="e.g. Dr. Jane Smith" />
                </Fld>
                <Fld label="About / Designation (optional)">
                  <textarea name="resourceDetails" value={f.resourceDetails} onChange={fld}
                    placeholder="Brief bio, designation, or affiliation…" />
                </Fld>
              </>
            )}
          </Card>

          <Card id="objective" icon="🎯" title="Objective">
            <Fld label="Objective of the Event">
              <textarea name="objective" value={f.objective} onChange={fld}
                placeholder="Describe the purpose and goals of this event…"
                style={{ minHeight: 110 }} />
            </Fld>
          </Card>

          <Card id="brief" icon="📝" title="Event Brief (100–150 words)">
            <Fld label="Brief about the Event">
              <textarea name="brief" value={f.brief} onChange={fld}
                placeholder="Summarize what happened during the event…"
                style={{ minHeight: 130 }} />
            </Fld>
          </Card>

          <Card id="photos" icon="📸" title="Event & Feedback Images">
            <Upload label="Event Images" multiple
              files={f.eventImages} onChange={arr => set("eventImages", arr)} />
            <div className="hr" />
            <Upload label="Feedback Images" multiple
              files={f.feedbackImages} onChange={arr => set("feedbackImages", arr)} />
          </Card>

          <Card id="creator" icon="✍️" title="Report Creator">
            <G2>
              <Fld label="Prepared By">
                <input name="creator" value={f.creator} onChange={fld} placeholder="Your name" />
              </Fld>
              <Fld label="Designation">
                <input name="creatorDesignation" value={f.creatorDesignation} onChange={fld}
                  placeholder="e.g. Assistant Professor" />
              </Fld>
            </G2>
          </Card>

          <Card id="auth" icon="🔏" title="Signing Authority">
            <G2>
              <Fld label="Authority Name">
                <input name="authority" value={f.authority} onChange={fld} placeholder="e.g. Dr. Principal" />
              </Fld>
              <Fld label="Designation">
                <input name="authorityDesignation" value={f.authorityDesignation} onChange={fld}
                  placeholder="e.g. Head of Department" />
              </Fld>
            </G2>
          </Card>

          <Card id="download" icon="⬇️" title="Download Report">
            {error && <div className="err"><span>⚠</span>{error}</div>}
            <button className="btn-primary btn-full" onClick={download} disabled={busy}>
              {busy ? "Generating…" : "Save & Download .docx"}
            </button>
          </Card>

        </div>
      </div>
    </div>
  );
}
