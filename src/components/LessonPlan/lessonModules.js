export const LESSON_MODULES = [
  {
    id: "web",
    name: "Advanced Web Technologies",
    code: "MCA-202",
    semester: "Sem 2",
    coreTopics: ["Client-Side Rendering", "Performance Tuning", "Security Best Practices"],
  },
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    code: "MCA-101",
    semester: "Sem 1",
    coreTopics: ["Trees & Graphs", "Sorting & Searching", "Dynamic Programming Basics"],
  },
  {
    id: "cloud",
    name: "Cloud Computing Elective",
    code: "MCA-305",
    semester: "Sem 3",
    coreTopics: ["IaaS / PaaS / SaaS", "Deployment Models", "Monitoring & Scaling"],
  },
  {
    id: "ml",
    name: "Machine Learning Foundations",
    code: "MCA-402",
    semester: "Sem 4",
    coreTopics: ["Supervised Learning", "Model Evaluation", "Feature Engineering"],
  },
  {
    id: "dbms",
    name: "Database Management Systems",
    code: "MCA-210",
    semester: "Sem 2",
    coreTopics: ["Normalization", "Indexing Strategies", "Query Optimization"],
  },
];

export function getModuleById(id) {
  return LESSON_MODULES.find((m) => m.id === id);
}

