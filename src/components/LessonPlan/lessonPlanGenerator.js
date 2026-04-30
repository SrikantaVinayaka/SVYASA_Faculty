import { getModuleById } from "./lessonModules";

function safeUUID() {
  // crypto.randomUUID is supported in modern browsers; fall back for safety.
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `plan_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function clampInt(n, min, max) {
  const v = Number.isFinite(n) ? n : 0;
  return Math.max(min, Math.min(max, v));
}

export function generateLessonPlan({
  selectedModuleIds,
  generationType,
  startDate,
  endDate,
  periods,
  academicDetails,
}) {
  const selectedModules = selectedModuleIds
    .map((id) => getModuleById(id))
    .filter(Boolean);

  const periodCount = clampInt(periods, 1, 500);
  const unitCount = Math.max(1, Math.ceil(periodCount / 3));
  const totalLectureHours = periodCount * selectedModules.length;

  const baseTitleModules =
    generationType === "combined"
      ? `${selectedModules.length} modules (combined)`
      : selectedModules.map((m) => m.name).join(", ");

  const createdAt = new Date().toISOString();
  const planId = safeUUID();

  const makeOutlineForModules = (modulesForOutline) => {
    return modulesForOutline.map((module, moduleIdx) => {
      const units = Array.from({ length: unitCount }, (_, unitOffset) => {
        const unitNo = unitOffset + 1;
        const unitCoreTopic = module.coreTopics[unitOffset % module.coreTopics.length] || module.name;

        const chapters = Array.from({ length: 2 }, (_, chapterOffset) => {
          const chapterNo = chapterOffset + 1;

          const topics = Array.from({ length: 3 }, (_, topicOffset) => {
            const topicNo = topicOffset + 1;
            const topicModule =
              generationType === "combined"
                ? selectedModules[(moduleIdx + unitOffset + chapterOffset + topicOffset) % selectedModules.length]
                : module;
            return `${unitCoreTopic}: Topic ${chapterNo}.${topicNo} (${topicModule.name})`;
          });

          return {
            chapterNo,
            title: `Chapter ${chapterNo} - ${unitCoreTopic}`,
            topics,
          };
        });

        return {
          unitNo,
          title: `Unit ${unitNo} - ${unitCoreTopic}`,
          chapters,
        };
      });

      return {
        moduleId: module.id,
        moduleName: module.name,
        units,
      };
    });
  };

  const outline =
    generationType === "combined"
      ? {
          kind: "combined",
          // Use the first module as the "anchor"; topics still rotate across modules.
          units: makeOutlineForModules([selectedModules[0]])[0].units,
          combinedModules: selectedModules,
        }
      : {
          kind: "individual",
          modules: makeOutlineForModules(selectedModules),
        };

  return {
    id: planId,
    title: `Lesson Plan: ${baseTitleModules}`,
    createdAt,
    startDate,
    endDate,
    periods: periodCount,
    generationType,
    selectedModuleIds,
    totalLectureHours,
    academicDetails: academicDetails ?? {
      program: "MCA (Faculty)",
      department: "SVYASA",
    },
    outline,
  };
}

