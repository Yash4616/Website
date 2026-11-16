import type { InstrumentInput } from "../site";

/** Sources: build brief facts; C:\Dev\Build\tokenizer (README, docs/training.md, technical.md, perf_investigation.md). */
export const tokenizer: InstrumentInput = {
  kind: "instrument",
  id: "tokenizer",
  name: "BPE Tokenizer",
  short: "BPE Tokenizer",
  pieces: ["B", "PE", " Token", "izer"],
  period: "Apr to Jun 2026",
  status: "complete",
  plot: { layer: 0.3, start: "2026-04", end: "2026-06" },
  skills: ["Python", "Rust", "tokenisation"],
  sentence:
    "Byte-level BPE tokenizer: a Rust engine exposed to Python through PyO3, with a 262,144-token vocabulary.",
  what: "Byte-level BPE tokenizer. Rust engine exposed to Python through PyO3. 262,144-token vocabulary trained on a 16 GB curated corpus. A drop-in for tiktoken's cl100k_base and o200k_base and for Hugging Face tokenizer.json files. 185 Rust tests, 140 commits.",
  stack: ["Rust", "PyO3", "maturin", "Rayon", "Python", "GitHub Actions"],
  reading: {
    value: 100,
    decimals: 0,
    suffix: "%",
    label: "byte-identical with tiktoken",
    sample: "verified across 28 languages",
    source: "Parity on cl100k_base and o200k_base.",
    scaleMax: 100,
    scaleLabel: "100%",
  },
  limitation:
    "Loses on Arabic and Hindi. Encode trails current tiktoken on single long strings and large batches; the lead is decode and short batches.",
  finding:
    "16 GB of aggressively sub-sampled data beat 40 to 45 GB at the same vocabulary size.",
  story: {
    problem:
      "Train a byte-level BPE vocabulary of 262,144 tokens and prove the engine against a reference: tiktoken, on cl100k_base and o200k_base.",
    approach:
      "A Rust engine exposed to Python through PyO3, with 185 Rust tests across 140 commits. Batches run in parallel with the GIL released, each thread keeps its own cache of merged pieces, and decoding reads from one flat byte array. The vocabulary was trained by a ten-stage pipeline on a 12 vCPU, 96 GB cloud machine; 16 GB of aggressively sub-sampled data beat 40 to 45 GB at the same vocabulary size.",
    result:
      "100% byte-identical with tiktoken across 28 languages. About 5.7 million tokens per second in bulk: 1 GB of prose in about 28 s on 16 cores. Decode runs about 10x faster than Hugging Face tokenizers. Profiling found nested thread oversubscription; the fix gave +25% on long batches and +14% on short ones.",
  },
  spec: [
    { k: "Vocabulary", v: "262,144 tokens" },
    { k: "Training corpus", v: "16 GB, curated" },
    {
      k: "Training run",
      v: "Ten idempotent stages on a GCP N2 machine (12 vCPU, 96 GB RAM); serial BPE training took about 118 min",
    },
    { k: "Engine", v: "Rust, exposed to Python through PyO3" },
    { k: "Tests", v: "185 Rust tests, 140 commits" },
    {
      k: "Parity",
      v: "100% byte-identical with tiktoken on cl100k_base and o200k_base, 28 languages",
    },
    {
      k: "Speed",
      v: "About 5.7 million tokens per second in bulk (1 GB of prose in about 28 s on 16 cores)",
    },
    { k: "Decode", v: "About 10x faster than Hugging Face tokenizers" },
    {
      k: "Profiling",
      v: "Fixing nested Rayon oversubscription: +25% encode on long batches, +14% on short batches, parity unchanged",
    },
  ],
  links: [{ label: "Code on GitHub", href: "https://github.com/Yash4616/tokenizer" }],
  bench: {
    kind: "compression",
    title: "Compression bench",
    baseline: 1,
    baselineLabel: "1.00x",
    decimals: 2,
    axisNote: "Bytes per token against o200k_base. Higher is better.",
    languages: [
      { name: "Python", ratio: 1.06, group: "code" },
      { name: "JS/TS", ratio: 1.06, group: "code" },
      { name: "Java", ratio: 1.07, group: "code" },
      { name: "C++", ratio: 1.08, group: "code" },
      { name: "C#", ratio: 1.1, group: "code" },
      { name: "Go", ratio: 1.08, group: "code" },
      { name: "Rust", ratio: 1.07, group: "code" },
      { name: "Kotlin", ratio: 1.11, group: "code" },
      { name: "Haskell", ratio: 1.14, group: "code" },
      { name: "shell", ratio: 1.11, group: "code" },
      { name: "SQL", ratio: 1.04, group: "code" },
      { name: "English", ratio: 1.04, group: "text" },
      { name: "maths", ratio: 1.08, group: "text" },
      { name: "Japanese", ratio: 1.24, group: "text" },
      { name: "Chinese", ratio: 1.1, group: "text" },
      { name: "Arabic", ratio: 0.93, group: "text" },
      { name: "Hindi", ratio: 0.63, group: "text" },
    ],
    sample: ["I", " do", " not", " ship", " what", " I", " can", "not", " meas", "ure", "."],
    sampleNote:
      "Move the pointer across the sentence. These are word and sub-word pieces drawn for this page, not output from the tokenizer.",
  },
};
