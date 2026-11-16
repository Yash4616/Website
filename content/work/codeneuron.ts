import type { InstrumentInput } from "../site";

/** Sources: build brief facts; C:\Dev\Build\CodeNeuron (ARCHITECTURE.md, TECHNICAL.md, src/Backend/main.py). */
export const codeneuron: InstrumentInput = {
  kind: "instrument",
  id: "codeneuron",
  name: "CodeNeuron",
  short: "CodeNeuron",
  pieces: ["Code", "Neuron"],
  period: "Apr 2025 to present",
  status: "live",
  plot: { layer: 3.55, start: "2025-04", end: "present" },
  skills: [
    "JavaScript/TypeScript",
    "FastAPI",
    "Docker",
    "Google Cloud",
    "agentic workflows",
    "LLM evaluation",
  ],
  sentence:
    "Browser platform for learning ML by solving real problems on real datasets. 60+ users within six months.",
  what: "Browser platform for learning ML by solving real problems on real datasets, with a Monaco editor, sandboxed execution, automatic grading and AI follow-up questions that test why an approach worked. 60+ users within six months. 30+ ML problems.",
  stack: ["React 18", "TypeScript", "FastAPI", "Firestore", "Docker", "Cloud Run", "Gemini 2.5 Flash", "DeepSeek"],
  reading: {
    value: 60,
    decimals: 0,
    suffix: "+",
    label: "users",
    sample: "within six months",
    source: "codeneuron.tech, live since April 2025.",
    scaleMax: 60,
    scaleLabel: "60+",
  },
  limitation: "The sandbox is process-level, not kernel-level isolation; single region.",
  finding: null,
  story: {
    problem:
      "Practise ML in the browser on real datasets: 30+ problems, a Monaco editor, sandboxed execution, automatic grading and AI follow-up questions.",
    approach:
      "Two people built it. I am Lead AI Developer: the Concepts section (about 6,600 lines of interactive canvas/SVG teaching pages for 7 algorithms), the AI grading workflows and the developer guide. My co-developer built the sandboxed code runner. Three isolated Cloud Run services keep the runner away from the database and the internet. In grading, Gemini 2.5 Flash drafts and refines questions and DeepSeek critiques them, so no model checks its own work.",
    result:
      "Live at codeneuron.tech with 60+ users within six months. In the grading loop one model drafts 5 interview follow-up questions, a second scores each PASS/FAIL on 5 criteria, and failed questions are refined and re-checked. Answers get two graded attempts.",
  },
  spec: [
    { k: "Users", v: "60+ within six months" },
    { k: "Problems", v: "30+ ML problems" },
    { k: "Team", v: "Two people" },
    {
      k: "My part",
      v: "Lead AI Developer: the Concepts section, the AI grading workflows and the developer guide",
    },
    {
      k: "Concepts section",
      v: "About 6,600 lines of interactive canvas/SVG teaching pages for 7 algorithms: linear regression, logistic regression, decision trees, KNN, naive Bayes, random forests, SVM",
    },
    {
      k: "Grading models",
      v: "Gemini 2.5 Flash drafts and refines follow-up questions; DeepSeek (deepseek-chat) critiques them on 5 criteria",
    },
    { k: "Code runner", v: "Sandboxed code runner built by my co-developer" },
    {
      k: "Runner limits",
      v: "Production: 25 s of CPU and 1,536 MB of memory per run",
    },
    {
      k: "Architecture",
      v: "Three isolated Cloud Run services: frontend, API, code runner. The runner has no database access and cannot be called from the internet.",
    },
    { k: "Running cost", v: "Scale-to-zero services: about $0 to $10 a month at idle" },
    { k: "Stack", v: "React 18, TypeScript, FastAPI, Firestore, Docker, Cloud Run" },
  ],
  links: [{ label: "codeneuron.tech", href: "https://codeneuron.tech" }],
  bench: {
    kind: "grading",
    title: "Grading loop",
    questions: 5,
    criteria: 5,
    attempts: 2,
    stages: [
      { id: "draft", label: "Draft", note: "One model drafts 5 interview follow-up questions." },
      { id: "critique", label: "Critique", note: "A second model scores each PASS/FAIL on 5 criteria." },
      { id: "refine", label: "Refine", note: "Failed questions are refined and re-checked." },
    ],
    loopNote:
      "A schematic of the loop. Which questions fail varies by run; one fails here to show the refine path.",
    services: [
      { id: "frontend", label: "Frontend", note: "Cloud Run" },
      { id: "api", label: "API", note: "Cloud Run" },
      { id: "runner", label: "Code runner", note: "No database access. Not callable from the internet." },
    ],
    boundaryNote: "A request from the internet is stopped at the runner's boundary. Only the API reaches it.",
    credit: "The sandboxed code runner was built by my co-developer.",
  },
};
