import type { SiteInput } from "./site";
import { arista } from "./work/arista";
import { codeneuron } from "./work/codeneuron";
import { oracle } from "./work/oracle";
import { pytorch } from "./work/pytorch";
import { rag } from "./work/rag";
import { tokenizer } from "./work/tokenizer";
import { vision } from "./work/vision";
import { kaggle } from "./work/kaggle";

/**
 * The content itself, as plain data. This module has no zod import: the server
 * validates it once (content/site.ts) and the client reads the same object
 * from its own lazy chunk, so the validator never ships to the browser and
 * the content is not repeated inside every HTML document.
 */
export const data: SiteInput = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://yash.systems",

  person: {
    name: "Yash Gurjar",
    namePieces: ["Yash", " Gur", "jar"],
    title: "AI & ML Engineer",
    line: "I build LLM systems and measure them.",
    rule: "I do not ship what I cannot measure.",
    rulePieces: ["I", " do", " not", " ship", " what", " I", " can", "not", " meas", "ure", "."],
    availability: "Available for a full-time internship, January to June 2027.",
    availabilityDetail: "In-office, open to relocating. Full-time roles from June 2027.",
    availabilityShort: "Internship, January to June 2027",
    email: "yashgurjar9714@gmail.com",
    resume: "/Yash_Gurjar_Resume.pdf",
    links: [
      { label: "GitHub", href: "https://github.com/Yash4616" },
      { label: "LinkedIn", href: "https://linkedin.com/in/yashgurjar9" },
      { label: "X", href: "https://x.com/Yash_9724" },
    ],
    proofs: [
      {
        value: 3,
        decimals: 0,
        suffix: "",
        text: "merged PRs in PyTorch, including Dynamo (the torch.compile frontend)",
      },
      {
        value: 0.94,
        decimals: 2,
        suffix: "",
        text: "recall@5 on a hand-labelled 48-query gold set",
      },
      {
        value: 60,
        decimals: 0,
        suffix: "+",
        text: "users on CodeNeuron, a live ML practice platform",
      },
    ],
    education: {
      degree: "B.Tech, Computer Science & Engineering (AI/ML, IBM programme)",
      school: "JECRC University, Jaipur, India",
      years: "2023 to 2027",
      grade: "CGPA 8.31/10",
      graduates: "Graduates June 2027",
      certifications:
        "23 IBM Developer Skills Network course certificates, including Deep Learning with TensorFlow (2025), Spark MLlib (2025) and Machine Learning with Python (2026).",
    },
    skills: [
      { group: "Languages", items: ["Python", "Rust", "SQL", "JavaScript/TypeScript"] },
      {
        group: "ML and data science",
        items: ["PyTorch", "TensorFlow", "scikit-learn", "NumPy", "pandas", "deep learning", "NLP", "generative AI"],
      },
      {
        group: "LLM engineering",
        items: ["RAG", "LLM evaluation", "agentic workflows", "OpenCV", "vector search", "tokenisation"],
      },
      {
        group: "Tools",
        items: ["Docker", "Git", "GitHub Actions (CI/CD)", "Google Cloud", "FastAPI", "PostgreSQL", "Claude Code"],
      },
    ],
  },

  field: {
    origin: "2025-01",
    asOf: "2026-11",
    until: "2027-06",
    xTitle: "layer of the stack",
    yTitle: "time",
    layers: ["below Python", "framework", "model", "system", "product surface"],
    hint: "Drag to move · scroll to zoom · type to search · B for brief",
    hintTouch: "Drag to move · pinch to zoom · tap to open · hold for the lens",
    queryPrompt: "Ask the Field",
    refusal: "No instrument matches that. Nearest: {name}.",
    lensNote: "Under the lens: the measured layer.",
  },

  labels: {
    reading: "Reading",
    limitation: "Limitation",
    finding: "Finding",
    benchNote: "recorded measurements, not live inference",
    beats: {
      problem: "Problem",
      approach: "Approach",
      result: "Result",
      limitation: "Limitation",
    },
  },

  instruments: [rag, tokenizer, pytorch, codeneuron, arista, oracle, vision, kaggle],

  satellites: [],

  stations: {
    background: {
      kind: "station",
      id: "background",
      name: "Background",
      short: "Background",
      period: "2023 to 2027",
      status: "station",
      plot: { layer: 0.05, start: "2025-02", end: null },
      skills: [],
      sentence: "Education and skills.",
    },
    contact: {
      kind: "station",
      id: "contact",
      name: "Contact",
      short: "Contact",
      period: "January to June 2027",
      status: "station",
      plot: { layer: 2.9, start: "2027-01", end: "2027-06" },
      skills: [],
      sentence: "Open for a full-time internship, January to June 2027.",
    },
  },

  openSource: {
    summary: "8 PRs across 3 projects: 6 merged, 1 open, 1 withdrawn.",
    projects: { pytorch: "PyTorch", huggingface: "Hugging Face Hub", kubernetes: "Kubernetes website" },
    prs: [
      {
        repo: "pytorch",
        number: "#193593",
        area: "[dynamo]",
        title: "UserMethodVariable composes its function instead of subclassing it",
        status: "merged",
        statusNote: "Merged 16 Sep 2026",
        detail:
          "20 files, +886 / -130. Dynamo modelled UserMethodVariable as a subclass of UserFunctionVariable; the subclassing dropped self in some traces, so torch.compile raised a TypeError. It now inherits BaseUserFunctionVariable and composes the function, mirroring PyMethodObject.",
        href: "https://github.com/pytorch/pytorch/pull/193593",
      },
      {
        repo: "pytorch",
        number: "#189734",
        area: "[ONNX]",
        title: "Verify CUDA export tests on the CUDA execution provider",
        status: "merged",
        statusNote: "Merged 20 Jul 2026",
        detail:
          "CUDA export tests were being verified on the CPU execution provider. Routing them to the CUDA provider took a bfloat16 test from 32 errors to passing; all 312 tests in the file pass.",
        href: "https://github.com/pytorch/pytorch/pull/189734",
      },
      {
        repo: "pytorch",
        number: "#188793",
        area: "CMake",
        title: "Detect system Eigen 5.0.x",
        status: "merged",
        statusNote: "Merged 2 Jul 2026",
        detail:
          "Eigen 5.0 no longer sets the legacy EIGEN3_* variables, so detection failed; the fix reads the include directory from the Eigen3::Eigen target. Revived an approved PR that had stalled on an unsigned CLA, crediting its author. Verified with Eigen 5.0.1.",
        href: "https://github.com/pytorch/pytorch/pull/188793",
      },
      {
        repo: "pytorch",
        number: "#190432",
        area: "[c10d]",
        title: "Withdrawn patch",
        status: "withdrawn",
        statusNote: "Closed, withdrawn by me",
        detail:
          "Allowed a CPU device_id in init_process_group and added a 2-rank Gloo test. The patch worked, but whether the behaviour should exist was a maintainer decision that never came.",
        href: null,
      },
      {
        repo: "huggingface",
        number: "#4428",
        area: "",
        title: "Hindi translation of the Search guide",
        status: "merged",
        statusNote: "Merged 6 Jul 2026",
        detail: "",
        href: "https://github.com/huggingface/huggingface_hub/pull/4428",
      },
      {
        repo: "huggingface",
        number: "#4463",
        area: "",
        title: "Hindi translation of the Upload guide",
        status: "merged",
        statusNote: "Merged 6 Jul 2026",
        detail: "",
        href: "https://github.com/huggingface/huggingface_hub/pull/4463",
      },
      {
        repo: "huggingface",
        number: "#4464",
        area: "",
        title: "Hindi translation of the Repository guide",
        status: "merged",
        statusNote: "Merged 6 Jul 2026",
        detail: "",
        href: "https://github.com/huggingface/huggingface_hub/pull/4464",
      },
      {
        repo: "kubernetes",
        number: "#56506",
        area: "[hi]",
        title: "Hindi localisation of the Assign Memory Resources task page",
        status: "open",
        statusNote: "Open, awaiting review",
        detail: "Prose and headings translated; code, YAML, shortcodes and links left unchanged, with heading anchors pinned to the English slugs.",
        href: "https://github.com/kubernetes/website/pull/56506",
      },
    ],
  },
};
