import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { getModuleById } from "./lessonModules";

const H = {
  h1: { heading: HeadingLevel.HEADING_1 },
  h2: { heading: HeadingLevel.HEADING_2 },
  h3: { heading: HeadingLevel.HEADING_3 },
};

function formatDateLike(input) {
  if (!input) return "";
  // input is expected yyyy-mm-dd; keeping it human readable without locale surprises
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (m) {
    const [, y, mm, dd] = m;
    return `${dd}/${mm}/${y}`;
  }
  return input;
}

function paragraph(text, opts = {}) {
  return new Paragraph({
    text,
    ...opts,
  });
}

export async function downloadLessonPlanDocx(plan, filenameBase = "Lesson-Plan") {
  const safeName = filenameBase.replace(/[^a-z0-9-_ ]/gi, "").trim().replace(/\s+/g, "-");

  const start = formatDateLike(plan.startDate);
  const end = formatDateLike(plan.endDate);
  const moduleNames = (plan.selectedModuleIds ?? [])
    .map((id) => getModuleById(id)?.name)
    .filter(Boolean);

  const moduleLine = moduleNames.length ? moduleNames.join(", ") : "";

  const sections = [];

  sections.push(
    new Paragraph({
      ...H.h1,
      children: [new TextRun({ text: "Lesson Plan", bold: true })],
    }),
  );
  if (start || end) {
    sections.push(
      paragraph(`Date Range: ${start} - ${end}`),
    );
  }
  sections.push(paragraph(`Generation Type: ${plan.generationType === "combined" ? "All modules combined" : "Individual module-wise plan"}`));
  sections.push(paragraph(`Total Lecture Hours: ${plan.totalLectureHours}`));
  if (moduleLine) sections.push(paragraph(`Modules: ${moduleLine}`));

  sections.push(paragraph(" "));

  const pushUnit = (unit) => {
    sections.push(
      new Paragraph({
        ...H.h2,
        children: [new TextRun({ text: unit.title, bold: true })],
      }),
    );
    unit.chapters.forEach((ch) => {
      sections.push(
        new Paragraph({
          ...H.h3,
          children: [new TextRun({ text: ch.title, bold: true })],
        }),
      );
      ch.topics.forEach((t) => {
        sections.push(paragraph(`• ${t}`));
      });
      sections.push(paragraph(" "));
    });
  };

  if (plan.outline?.kind === "combined") {
    plan.outline.units.forEach((unit) => pushUnit(unit));
  } else if (plan.outline?.kind === "individual") {
    plan.outline.modules.forEach((m) => {
      sections.push(
        new Paragraph({
          ...H.h2,
          children: [new TextRun({ text: m.moduleName, bold: true })],
        }),
      );
      m.units.forEach((unit) => pushUnit(unit));
    });
  }

  sections.push(
    new Paragraph({
      text: " ",
    }),
  );

  sections.push(
    new Paragraph({
      text: `Academic Details: ${plan.academicDetails?.program ?? ""} · ${plan.academicDetails?.department ?? ""}`,
    }),
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName}-${start || "dates"}-${end || ""}.docx`.replace(/--+/g, "-");
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

