import { useMemo, useState } from "react";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";

const DB_KEY = "event_reports_db";

function getReports() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY)) || [];
  } catch {
    return [];
  }
}

function toDateOnly(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getConductedApprovedEvents() {
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return getReports()
    .filter((report) => {
      const permissionStatus = report.permission_status || (report.approval_status === "Approved" ? "Granted" : "Pending");
      const eventDate = toDateOnly(report.event_date || report.start_date);
      return permissionStatus === "Granted" && eventDate && eventDate < todayDate;
    })
    .map((report, index) => ({
      id: report.id || Date.now() + index,
      label: `${report.event_title || "Untitled Event"}${report.event_date ? ` (${report.event_date})` : ""}`,
      department_name: report.department || "",
      logo: report.logo_file || report.logo_data_url || null,
      event_title: report.event_title || "",
      start_date: report.start_date || report.event_date || "",
      start_time: report.start_time || "",
      end_date: report.end_date || report.event_date || "",
      end_time: report.end_time || "",
      venue: report.venue || "",
      students: Number(report.students) || 0,
      faculty: Number(report.faculty) || 0,
      include_resource: Boolean(report.resource_name || report.resourceName || report.resource_details || report.resourceDetails),
      resource_person: report.resource_name || report.resourceName || "",
      resource_details: report.resource_details || report.resourceDetails || "",
      objective: report.objective || "",
      brief: report.brief || "",
      outcome1: report.outcome1 || "",
      outcome2: report.outcome2 || "",
      outcome3: report.outcome3 || "",
      outcome4: report.outcome4 || "",
      event_images: report.event_images || [],
      feedback_images: report.feedback_images || [],
      creator_name: report.creator || report.creator_name || "",
      creator_designation: report.creator_designation || report.creatorDesignation || "",
      authority_name: report.grant_permission || report.authority_permission || report.authority_name || "",
      authority_designation: report.authority_designation || "",
    }));
}

function saveReports(reports) {
  localStorage.setItem(DB_KEY, JSON.stringify(reports));
}

function addReport(dept, title, date, fileB64) {
  const reports = getReports();
  reports.unshift({
    id: Date.now(),
    department: dept,
    event_title: title,
    event_date: date,
    file: fileB64,
    report_source: "generator",
    created_at: new Date().toISOString(),
  });
  saveReports(reports);
}

function deleteReport(id) {
  saveReports(getReports().filter((report) => report.id !== id));
}

function searchReports(search, dateFilter) {
  return getReports().filter((report) => {
    const isGeneratorReport =
      report.report_source === "generator" ||
      (Boolean(report.file) &&
        !report.permission_status &&
        !report.approval_status &&
        !report.grant_permission &&
        !report.authority_permission);

    if (!isGeneratorReport) return false;

    const matchSearch =
      !search ||
      report.event_title.toLowerCase().includes(search.toLowerCase()) ||
      report.department.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || report.event_date.includes(dateFilter);
    return matchSearch && matchDate;
  });
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    if (!(file instanceof Blob)) {
      const src = file?.dataUrl || file?.url || (typeof file === "string" ? file : "");
      if (!src) {
        reject(new Error("Unsupported file format"));
        return;
      }
      fetch(src)
        .then((resp) => resp.arrayBuffer())
        .then(resolve)
        .catch(reject);
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = (e) => resolve(e.target.result);
    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(file);
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = reject;
    fileReader.readAsDataURL(blob);
  });
}

async function generateDocxBlob(form) {
  const children = [];

  if (form.logo) {
    const arrayBuffer = await readFileAsArrayBuffer(form.logo);
    children.push(
      new Paragraph({
        children: [new ImageRun({ data: arrayBuffer, transformation: { width: 144, height: 80 } })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      })
    );
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: form.department_name.toUpperCase(), bold: true, size: 26 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    })
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: form.event_title, bold: true, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    })
  );

  const startDate = new Date(form.start_date);
  const dateText = Number.isNaN(startDate.getTime())
    ? form.start_date
    : startDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  children.push(
    new Paragraph({
      children: [new TextRun({ text: `Date: ${dateText} | ${form.start_time} - ${form.end_time}` })],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 80 },
    })
  );

  if (form.venue) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Venue: ${form.venue}` })],
        spacing: { after: 80 },
      })
    );
  }

  children.push(new Paragraph({ text: "Beneficiaries", heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 } }));
  children.push(new Paragraph({ children: [new TextRun({ text: `Students: ${form.students}` })], spacing: { after: 60 } }));
  children.push(new Paragraph({ children: [new TextRun({ text: `Faculty: ${form.faculty}` })], spacing: { after: 80 } }));

  if (form.include_resource && form.resource_person) {
    children.push(new Paragraph({ text: "Resource Person", heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 } }));
    children.push(new Paragraph({ children: [new TextRun({ text: form.resource_person, bold: true })], spacing: { after: 60 } }));
    if (form.resource_details) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: form.resource_details })],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 80 },
        })
      );
    }
  }

  children.push(new Paragraph({ text: "Objective", heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 } }));
  children.push(new Paragraph({ children: [new TextRun({ text: form.objective })], alignment: AlignmentType.JUSTIFIED, spacing: { after: 80 } }));

  children.push(new Paragraph({ text: "Event Summary", heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 } }));
  children.push(new Paragraph({ children: [new TextRun({ text: form.brief })], alignment: AlignmentType.JUSTIFIED, spacing: { after: 80 } }));

  const outcomes = [form.outcome1, form.outcome2, form.outcome3, form.outcome4].filter((item) => item && item.trim());
  if (outcomes.length) {
    children.push(new Paragraph({ text: "Learning Outcomes", heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 } }));
    outcomes.forEach((item) => children.push(new Paragraph({ text: item, bullet: { level: 0 }, spacing: { after: 60 } })));
  }

  async function addImageSection(images, title) {
    if (!images || !images.length) return;
    children.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 } }));
    for (let i = 0; i < images.length; i += 2) {
      const cells = [];
      for (let j = i; j < Math.min(i + 2, images.length); j += 1) {
        const imageBuffer = await readFileAsArrayBuffer(images[j]);
        cells.push(
          new TableCell({
            children: [
              new Paragraph({
                children: [new ImageRun({ data: imageBuffer, transformation: { width: 216, height: 162 } })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
          })
        );
      }
      if (cells.length === 1) {
        cells.push(new TableCell({ children: [new Paragraph("")], width: { size: 50, type: WidthType.PERCENTAGE } }));
      }
      children.push(new Table({ rows: [new TableRow({ children: cells })], width: { size: 100, type: WidthType.PERCENTAGE } }));
    }
  }

  await addImageSection(form.event_images, "Event Photographs");
  await addImageSection(form.feedback_images, "Feedback");

  children.push(new Paragraph({ text: "", spacing: { after: 240 } }));

  children.push(
    new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: form.creator_name, bold: true })], spacing: { after: 60 } }),
                new Paragraph({ children: [new TextRun({ text: form.creator_designation })] }),
              ],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: form.authority_name, bold: true })], spacing: { after: 60 } }),
                new Paragraph({ children: [new TextRun({ text: form.authority_designation })] }),
              ],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  );

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBlob(doc);
}

const defaultForm = {
  department_name: "",
  logo: null,
  event_title: "",
  start_date: "",
  start_time: "",
  end_date: "",
  end_time: "",
  venue: "",
  students: 0,
  faculty: 0,
  include_resource: false,
  resource_person: "",
  resource_details: "",
  objective: "",
  brief: "",
  outcome1: "",
  outcome2: "",
  outcome3: "",
  outcome4: "",
  event_images: [],
  feedback_images: [],
  creator_name: "",
  creator_designation: "",
  authority_name: "",
  authority_designation: "",
};

function Field({ label, error, children }) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-gray-600">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder = "", type = "text", ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...rest}
    />
  );
}

function TextArea({ value, onChange, placeholder = "", rows = 4 }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 border-b border-gray-100 pb-2 text-base font-semibold text-gray-800">{title}</h3>
      {children}
    </div>
  );
}

function FileUploadButton({ label, accept, multiple = false, onChange, fileNames = [] }) {
  const id = label.replace(/\s+/g, "_");
  return (
    <div>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 transition-colors hover:bg-gray-50"
      >
        <span className="text-lg">📁</span>
        {fileNames.length > 0
          ? `${fileNames.length} file(s) selected: ${fileNames.slice(0, 2).join(", ")}${fileNames.length > 2 ? "..." : ""}`
          : label}
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => onChange(Array.from(e.target.files || []))}
      />
    </div>
  );
}

function CreateReport({ onSaved }) {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState("");
  const [eventSearch, setEventSearch] = useState("");
  const conductedEvents = useMemo(() => getConductedApprovedEvents(), [success]);
  const filteredConductedEvents = eventSearch
    ? conductedEvents.filter((event) => event.label.toLowerCase().includes(eventSearch.toLowerCase()))
    : conductedEvents;

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const hydrateFromEvent = (selectedEvent) => {
    if (!selectedEvent) return;
    setForm((prev) => ({
      ...prev,
      ...defaultForm,
      ...selectedEvent,
    }));
    setEventSearch(selectedEvent.label);
  };

  function validate() {
    const nextErrors = {};
    if (!form.department_name.trim()) nextErrors.department_name = "Department name is required";
    if (!form.event_title.trim()) nextErrors.event_title = "Event title is required";
    if (!form.objective.trim()) nextErrors.objective = "Objective cannot be empty";
    if (!form.brief.trim()) nextErrors.brief = "Event brief is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleGenerate(save) {
    if (!validate()) return;
    setGenerating(true);
    try {
      const blob = await generateDocxBlob(form);
      saveAs(blob, "event_report.docx");
      if (save) {
        const b64 = await blobToBase64(blob);
        addReport(form.department_name, form.event_title, form.start_date, b64);
        onSaved();
        setSuccess("Report saved successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Error generating document:", err);
    }
    setGenerating(false);
  }

  return (
    <div>
      <SectionCard title="🔎 Search Conducted Events">
        <Field label="Search Event Name">
          <TextInput
            value={eventSearch}
            onChange={(value) => {
              setEventSearch(value);
              const exactMatch = conductedEvents.find((event) => event.label === value);
              if (exactMatch) hydrateFromEvent(exactMatch);
            }}
            placeholder="Search approved conducted events..."
            list="report-generator-events"
          />
        </Field>
        <datalist id="report-generator-events">
          {filteredConductedEvents.map((event) => (
            <option key={event.id} value={event.label} />
          ))}
        </datalist>
        <div className="mb-2 flex flex-wrap gap-2">
          {filteredConductedEvents.slice(0, 6).map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => hydrateFromEvent(event)}
              className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
            >
              {event.label}
            </button>
          ))}
        </div>
        {!conductedEvents.length && <p className="text-sm text-gray-500">No approved conducted events are available.</p>}
      </SectionCard>

      <SectionCard title="🏛️ Department Details">
        <Field label="Department Name" error={errors.department_name}>
          <TextInput value={form.department_name} onChange={(v) => setField("department_name", v)} placeholder="e.g. Department of Computer Science" />
        </Field>
        <Field label="Institution Logo">
          <FileUploadButton
            label="Upload Logo (PNG / JPG)"
            accept=".png,.jpg,.jpeg"
            fileNames={form.logo ? [form.logo.name || "Stored logo"] : []}
            onChange={(files) => setField("logo", files[0] || null)}
          />
        </Field>
      </SectionCard>

      <SectionCard title="📅 Event Details">
        <Field label="Event Title" error={errors.event_title}>
          <TextInput value={form.event_title} onChange={(v) => setField("event_title", v)} placeholder="e.g. National Tech Symposium 2025" />
        </Field>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Start Date">
            <TextInput type="date" value={form.start_date} onChange={(v) => setField("start_date", v)} />
          </Field>
          <Field label="Start Time">
            <TextInput type="time" value={form.start_time} onChange={(v) => setField("start_time", v)} />
          </Field>
        </div>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="End Date">
            <TextInput type="date" value={form.end_date} onChange={(v) => setField("end_date", v)} />
          </Field>
          <Field label="End Time">
            <TextInput type="time" value={form.end_time} onChange={(v) => setField("end_time", v)} />
          </Field>
        </div>
        <Field label="Venue">
          <TextInput value={form.venue} onChange={(v) => setField("venue", v)} placeholder="e.g. Main Auditorium, Block A" />
        </Field>
      </SectionCard>

      <SectionCard title="👥 Beneficiaries">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Number of Students">
            <TextInput type="number" value={form.students} onChange={(v) => setField("students", Number.parseInt(v, 10) || 0)} />
          </Field>
          <Field label="Number of Faculty">
            <TextInput type="number" value={form.faculty} onChange={(v) => setField("faculty", Number.parseInt(v, 10) || 0)} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="🎤 Resource Person">
        <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.include_resource}
            onChange={(e) => setField("include_resource", e.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
          Include Resource Person Details
        </label>
        {form.include_resource && (
          <>
            <Field label="Resource Person Name">
              <TextInput value={form.resource_person} onChange={(v) => setField("resource_person", v)} placeholder="Full name" />
            </Field>
            <Field label="Resource Person Details">
              <TextArea value={form.resource_details} onChange={(v) => setField("resource_details", v)} placeholder="Designation, institution, expertise..." />
            </Field>
          </>
        )}
      </SectionCard>

      <SectionCard title="📝 Content">
        <Field label="Objective of the Event" error={errors.objective}>
          <TextArea value={form.objective} onChange={(v) => setField("objective", v)} placeholder="What was the aim of this event?" rows={3} />
        </Field>
        <Field label="Event Brief (100-150 words)" error={errors.brief}>
          <TextArea value={form.brief} onChange={(v) => setField("brief", v)} placeholder="Describe the event in detail..." rows={5} />
        </Field>
      </SectionCard>

      <SectionCard title="🎯 Learning Outcomes">
        {[1, 2, 3, 4].map((n) => (
          <Field key={n} label={`Outcome ${n}`}>
            <TextInput value={form[`outcome${n}`]} onChange={(v) => setField(`outcome${n}`, v)} placeholder={`Learning outcome ${n}`} />
          </Field>
        ))}
      </SectionCard>

      <SectionCard title="🖼️ Event Images">
        <FileUploadButton
          label="Upload Event Images (multiple)"
          accept=".png,.jpg,.jpeg"
          multiple
          fileNames={form.event_images.map((file) => file.name || "Stored image")}
          onChange={(files) => setField("event_images", files)}
        />
      </SectionCard>

      <SectionCard title="📋 Feedback Images">
        <FileUploadButton
          label="Upload Feedback Images (multiple)"
          accept=".png,.jpg,.jpeg"
          multiple
          fileNames={form.feedback_images.map((file) => file.name || "Stored image")}
          onChange={(files) => setField("feedback_images", files)}
        />
      </SectionCard>

      <SectionCard title="✍️ Signatures">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Report Creator</p>
            <Field label="Prepared By">
              <TextInput value={form.creator_name} onChange={(v) => setField("creator_name", v)} placeholder="Full name" />
            </Field>
            <Field label="Designation">
              <TextInput value={form.creator_designation} onChange={(v) => setField("creator_designation", v)} placeholder="e.g. Assistant Professor" />
            </Field>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Signing Authority</p>
            <Field label="Authority Name">
              <TextInput value={form.authority_name} onChange={(v) => setField("authority_name", v)} placeholder="Full name" />
            </Field>
            <Field label="Designation">
              <TextInput value={form.authority_designation} onChange={(v) => setField("authority_designation", v)} placeholder="e.g. Head of Department" />
            </Field>
          </div>
        </div>
      </SectionCard>

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span>✓</span> {success}
        </div>
      )}

      <div className="flex flex-wrap gap-3 pb-8">
        <button
          onClick={() => handleGenerate(true)}
          disabled={generating}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {generating ? (
            <>
              <span className="animate-spin">⟳</span> Generating...
            </>
          ) : (
            <>⬇ Download &amp; Save</>
          )}
        </button>
        <button
          onClick={() => handleGenerate(false)}
          disabled={generating}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          ⬇ Download Only
        </button>
      </div>
    </div>
  );
}

function ReportManagement() {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [, forceUpdate] = useState(0);

  const reports = searchReports(search, dateFilter);

  function handleDelete(id) {
    deleteReport(id);
    forceUpdate((n) => n + 1);
  }

  function handleDownload(b64, title) {
    const anchor = document.createElement("a");
    anchor.href = b64;
    anchor.download = `${title}.docx`;
    anchor.click();
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by title or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">📅</span>
          <input
            type="text"
            placeholder="Filter by date..."
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-44"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {reports.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <div className="mb-3 text-4xl">📂</div>
            <p className="text-sm">No reports found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {reports.map((report) => (
              <li key={report.id} className="flex flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-800">{report.event_title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{report.department} · {report.event_date}</p>
                </div>
                <button
                  onClick={() => handleDownload(report.file, report.event_title)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-100"
                  title="Download"
                >
                  ⬇ Download
                </button>
                <button
                  onClick={() => handleDelete(report.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-50"
                  title="Delete"
                >
                  🗑 Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function EventReportGenerator() {
  const [tab, setTab] = useState("create");
  const [reportCount, setReportCount] = useState(getReports().length);

  function handleSaved() {
    setReportCount(getReports().length);
  }

  const tabs = [
    { id: "create", label: "📄 Create Report" },
    { id: "manage", label: `📂 Report Management (${reportCount})` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">📄 Event Report Generator</h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-6">
        <div className="mb-6 flex w-fit gap-1 rounded-xl bg-gray-100 p-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                tab === item.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "create" ? <CreateReport onSaved={handleSaved} /> : <ReportManagement />}
      </div>
    </div>
  );
}
