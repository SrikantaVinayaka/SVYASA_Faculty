import React, { useRef, useState } from "react";

const DB_KEY = "event_reports_db";
const APPROVER_OPTIONS = [
  "Dr. Priya Sharma",
  "Prof. Rajesh Kumar",
  "Dr. Ananya Iyer",
  "Prof. Vikram Singh",
];

const readStoredReports = () => {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY)) || [];
  } catch {
    return [];
  }
};

const storeReport = (report) => {
  const existing = readStoredReports();
  existing.unshift(report);
  localStorage.setItem(DB_KEY, JSON.stringify(existing));
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const timeOpts = [];
for (let h = 0; h < 24; h += 1) {
  for (const m of [0, 30]) {
    timeOpts.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

function Card({ title, children }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <header className="border-b border-gray-100 px-5 py-3">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </header>
      <div className="space-y-4 px-5 py-4">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-gray-600">{label}</span>
      {children}
    </label>
  );
}

function Counter({ label, value, onChange }) {
  const onType = (next) => {
    const parsed = Number.parseInt(next, 10);
    if (Number.isNaN(parsed)) return onChange(0);
    onChange(Math.max(0, parsed));
  };

  return (
    <Field label={label}>
      <div className="flex items-center overflow-hidden rounded-lg border border-slate-700 bg-slate-900 text-white">
        <button
          type="button"
          className="h-10 w-10 text-lg text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          -
        </button>
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onType(e.target.value)}
          className="h-10 w-full bg-transparent px-2 text-center text-sm font-medium text-white outline-none"
        />
        <button
          type="button"
          className="h-10 w-10 text-lg text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </Field>
  );
}

function LogoUpload({ file, onChange }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const acceptFiles = (raw) => {
    const [img] = Array.from(raw).filter((f) => f.type.startsWith("image/"));
    onChange(img || null);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          acceptFiles(e.dataTransfer.files);
        }}
        className={`w-full rounded-lg border-2 border-dashed px-4 py-4 text-left transition-colors ${
          drag ? "border-[#7B1C2A] bg-rose-50" : "border-gray-200 bg-gray-50 hover:border-[#7B1C2A]"
        }`}
      >
        <p className="text-sm font-medium text-gray-800">Upload Institution Logo</p>
        <p className="mt-1 text-xs text-gray-500">Drag & drop image or click to browse (PNG/JPG)</p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => acceptFiles(e.target.files)}
      />
      {file ? (
        <p className="mt-2 text-xs text-gray-600">
          Selected: <span className="font-medium">{file.name}</span>
        </p>
      ) : null}
    </div>
  );
}

export default function CreateEventPage() {
  const [f, setF] = useState({
    department: "",
    eventTitle: "",
    eventType: "",
    eventDuration: "single",
    eventDate: "",
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "17:00",
    venue: "",
    students: 0,
    faculty: 0,
    grantPermission: "",
    authorityDesignation: "",
    logoFile: null,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (key, value) => setF((prev) => ({ ...prev, [key]: value }));
  const fld = (e) => set(e.target.name, e.target.value);

  const onDurationChange = (e) => {
    const value = e.target.value;
    setF((prev) => {
      if (value === "single") {
        const singleDate = prev.eventDate || prev.startDate || "";
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
        startDate: prev.startDate || prev.eventDate || "",
        endDate: prev.endDate || prev.startDate || prev.eventDate || "",
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

  const saveEvent = async () => {
    setError("");
    if (!f.department) return setError("Department name is required.");
    if (!f.eventTitle) return setError("Event title is required.");
    if (!f.eventType) return setError("Event type is required.");
    if (!f.grantPermission) return setError("Grant permission is required.");
    if (f.eventDuration === "single" && !f.eventDate) return setError("Event date is required.");
    if (f.eventDuration === "multiple" && (!f.startDate || !f.endDate)) {
      return setError("Both start date and end date are required.");
    }
    if (f.students < 0 || f.faculty < 0) return setError("Beneficiary counts cannot be negative.");

    const formData =
      f.eventDuration === "single" ? { ...f, startDate: f.eventDate, endDate: f.eventDate } : f;

    setBusy(true);
    try {
      const serializedLogo = formData.logoFile
        ? {
            name: formData.logoFile.name || "logo",
            type: formData.logoFile.type || "image/jpeg",
            dataUrl: await fileToDataUrl(formData.logoFile),
          }
        : null;

      storeReport({
        id: Date.now(),
        department: formData.department,
        event_title: formData.eventTitle,
        event_date: formData.startDate || formData.eventDate || "",
        event_type: formData.eventType || "",
        venue: formData.venue || "",
        students: Number(formData.students) || 0,
        faculty: Number(formData.faculty) || 0,
        start_time: formData.startTime || "",
        end_time: formData.endTime || "",
        grant_permission: formData.grantPermission || "",
        authority_permission: formData.grantPermission || "",
        authority_designation: formData.authorityDesignation || "",
        logo_file: serializedLogo,
        logo_data_url: serializedLogo?.dataUrl || "",
        permission_status: "Granted",
        approval_status: "Approved",
        created_at: new Date().toISOString(),
      });

      setF({
        department: "",
        eventTitle: "",
        eventType: "",
        eventDuration: "single",
        eventDate: "",
        startDate: "",
        endDate: "",
        startTime: "09:00",
        endTime: "17:00",
        venue: "",
        students: 0,
        faculty: 0,
        grantPermission: "",
        authorityDesignation: "",
        logoFile: null,
      });
    } catch (e) {
      setError(`Failed to save event: ${e.message}`);
    }
    setBusy(false);
  };

  return (
    <div className="min-h-full bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <header>
          <p className="text-xs text-gray-500">
            Events / <span className="font-medium text-[#7B1C2A]">Create Event</span>
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Create Event</h1>
        </header>

        <Card title="Department Name">
          <Field label="Department Name">
            <input
              name="department"
              value={f.department}
              onChange={fld}
              placeholder="e.g. Department of Computer Science"
              className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-[#7B1C2A]"
            />
          </Field>
        </Card>

        <Card title="Institution Logo">
          <LogoUpload file={f.logoFile} onChange={(file) => set("logoFile", file)} />
        </Card>

        <Card title="Event Details">
          <Field label="Event Title">
            <input
              name="eventTitle"
              value={f.eventTitle}
              onChange={fld}
              placeholder="e.g. National Symposium on AI"
              className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-[#7B1C2A]"
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Event Type">
              <select
                name="eventType"
                value={f.eventType}
                onChange={fld}
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-[#7B1C2A]"
              >
                <option value="">Select event type</option>
                <option value="In-House">In-House</option>
                <option value="External">External</option>
              </select>
            </Field>
            <Field label="Event Duration">
              <select
                name="eventDuration"
                value={f.eventDuration}
                onChange={onDurationChange}
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-[#7B1C2A]"
              >
                <option value="single">Single Day Event</option>
                <option value="multiple">Multiple Day Event</option>
              </select>
            </Field>
          </div>

          {f.eventDuration === "single" ? (
            <Field label="Event Date">
              <input
                type="date"
                name="eventDate"
                value={f.eventDate}
                onChange={onSingleDateChange}
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-[#7B1C2A]"
              />
            </Field>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Start Date">
                <input
                  type="date"
                  name="startDate"
                  value={f.startDate}
                  onChange={fld}
                  className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-[#7B1C2A]"
                />
              </Field>
              <Field label="End Date">
                <input
                  type="date"
                  name="endDate"
                  value={f.endDate}
                  onChange={fld}
                  className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-[#7B1C2A]"
                />
              </Field>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Start Time">
              <select
                name="startTime"
                value={f.startTime}
                onChange={fld}
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-[#7B1C2A]"
              >
                {timeOpts.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="End Time">
              <select
                name="endTime"
                value={f.endTime}
                onChange={fld}
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-[#7B1C2A]"
              >
                {timeOpts.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Venue">
            <input
              name="venue"
              value={f.venue}
              onChange={fld}
              placeholder="e.g. Main Auditorium"
              className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-[#7B1C2A]"
            />
          </Field>
        </Card>

        <Card title="Beneficiaries">
          <div className="grid gap-4 md:grid-cols-2">
            <Counter label="Number of Students" value={f.students} onChange={(v) => set("students", v)} />
            <Counter label="Number of Faculty" value={f.faculty} onChange={(v) => set("faculty", v)} />
          </div>
        </Card>

        <Card title="Request Event">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Grant Permission">
              <select
                name="grantPermission"
                value={f.grantPermission}
                onChange={fld}
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-[#7B1C2A]"
              >
                <option value="">Select approver</option>
                {APPROVER_OPTIONS.map((approver) => (
                  <option key={approver} value={approver}>
                    {approver}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Designation">
              <input
                name="authorityDesignation"
                value={f.authorityDesignation}
                onChange={fld}
                placeholder="e.g. Head of Department"
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-[#7B1C2A]"
              />
            </Field>
          </div>
        </Card>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        <button
          type="button"
          onClick={saveEvent}
          disabled={busy}
          className="w-full rounded-lg bg-[#7B1C2A] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#5e1520] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Saving..." : "Save Event"}
        </button>
      </div>
    </div>
  );
}
