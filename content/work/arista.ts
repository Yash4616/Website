import type { InstrumentInput } from "../site";

/**
 * Sources: build brief facts; C:\Dev\Hym\arista\BUILD_LOG.md (the face);
 * C:\Dev\HyperMechatronics\arista-brain (docs/ROADMAP.md, docs/adr/0001-local-llm-runtime.md,
 * docs/DEBT.md DEBT-013, docs/PROGRESS.md, docs/BACKLOG.md), read 15 Nov 2026.
 */
export const arista: InstrumentInput = {
  kind: "instrument",
  id: "arista",
  name: "Arista",
  short: "Arista",
  pieces: ["Ar", "ista"],
  period: "Sep 2026 to present",
  status: "in progress",
  plot: { layer: 4.1, start: "2026-09", end: "present" },
  skills: ["Python", "JavaScript/TypeScript", "LLM evaluation", "FastAPI"],
  sentence:
    "AI companion with an expressive face in raw WebGL2, memory, and English, Hindi and Hinglish understanding.",
  what: "An AI companion with an expressive face (a luminous orb whose eyes carry the emotion), memory, and English, Hindi and Hinglish understanding. Two repos: the face and web client, live at hymtech.in/bot, and the brain, a local-first Python service for understanding, memory, persona and evaluation. Built under my brand HymTech. \"Arista\" is a working name.",
  stack: ["WebGL2", "SDF fragment shader", "TypeScript", "Python 3.12", "FastAPI", "SQLite + sqlite-vec", "Qwen3.5-4B", "llama.cpp"],
  reading: {
    value: 19,
    decimals: 0,
    suffix: " ms",
    label: "from the model's first token to the face reacting",
    sample: "against a 120 ms budget",
    source: "417 of 417 tests passing.",
    scaleMax: 120,
    scaleLabel: "120 ms budget",
  },
  limitation:
    "Unfinished. The face is 137 of 164 build tasks done, with microphone input and speech synthesis pending. The brain is on milestone 2 of 6, and at typing pace its first word arrives at a median 453 ms against a 350 ms target.",
  finding:
    "With no memory, the local model agrees with a false \"you told me my brother is Kunal, didn't you?\" about a quarter of the time, so the persona needs an \"I don't remember that\" rule and the reply needs recalled items to check against.",
  story: {
    problem:
      "An AI companion whose face is a luminous orb with eyes that carry the emotion. The face has a 2 ms budget per frame and 120 ms to react to the model's first token; the brain has 350 ms to start a reply on a laptop GPU.",
    approach:
      "The face is raw WebGL2: one full-screen quad, an SDF fragment shader, a 44-parameter rig and 25 expressions. For the brain, three local runtimes were scored against a rule fixed in advance; llama.cpp won at 101 ms to a warm first token against 497 ms for Ollama, the only option inside the 350 ms budget, though Ollama was my own preference. Every prompt is versioned, every turn traced, and every reply checked against the persona.",
    result:
      "The shader costs 0.25 to 0.33 ms per frame against the 2 ms budget, and the face reacts 19 ms after the model's first token against the 120 ms budget, with 417 of 417 tests passing. The brain's first milestone, a walking skeleton with traces and a smoke evaluation, was done on 13 Nov 2026, and its persona is measured on 28 provocations and 100-turn chats.",
  },
  spec: [
    { k: "Face", v: "Raw WebGL2, one full-screen quad, SDF fragment shader" },
    { k: "Rig", v: "44 parameters, 25 expressions" },
    { k: "Shader cost", v: "0.25 to 0.33 ms per frame against a 2 ms budget" },
    { k: "Reaction", v: "19 ms after the model's first token against a 120 ms budget" },
    { k: "Face tests", v: "417 of 417 passing; 137 of 164 build tasks done" },
    { k: "Brain", v: "Local Qwen3.5-4B on llama.cpp, 350 ms first-token budget" },
    {
      k: "Runtime choice",
      v: "llama.cpp scored 98.3 against Ollama's 76.4 under a pre-declared weighted rule: warm first token 101 ms (95% CI 97 to 107) against 497 ms",
    },
    {
      k: "Brain status",
      v: "335 commits. M0, the walking skeleton, done 13 Nov 2026; M1, the daily text companion, in progress; voice, face, tools and beta planned",
    },
    {
      k: "Evaluation",
      v: "576 seed items drafted across 7 sets, 152 memory-safety cases, persona measured on 28 provocations and 100-turn chats",
    },
    { k: "Languages", v: "English, Hindi and Hinglish" },
    { k: "Brand", v: "HymTech. \"Arista\" is a working name." },
  ],
  links: [{ label: "hymtech.in/bot", href: "https://hymtech.in/bot" }],
  bench: {
    kind: "face",
    title: "Face bench",
    studyNote:
      "A simplified study drawn for this page: one SDF orb with capsule eyes. It is not the production face.",
    shader: {
      min: 0.25,
      max: 0.33,
      budget: 2,
      decimals: 2,
      unit: "ms",
      label: "Production shader cost per frame",
    },
    reaction: {
      value: 19,
      budget: 120,
      unit: "ms",
      label: "First token to face reaction",
    },
    progress: { done: 137, total: 164, label: "build tasks done" },
    expressions: [
      { id: "neutral", label: "Neutral" },
      { id: "glad", label: "Glad" },
      { id: "curious", label: "Curious" },
      { id: "sleepy", label: "Sleepy" },
    ],
  },
};
