import type { InstrumentInput } from "../site";

/**
 * Source: C:\Dev\C.R.A.P(Code RequiringAnotherPass)\Oracle (README.md, ROADMAP.md,
 * RESEARCH_LOG.md). Phase 5's 0.940 is the single-seed gate run; the headline is
 * the 3-seed replication logged on 2026-07-10.
 */
export const oracle: InstrumentInput = {
  kind: "instrument",
  id: "oracle",
  name: "Oracle: Continual Learning",
  short: "Oracle",
  pieces: ["Or", "acle", ":", " Contin", "ual", " Learn", "ing"],
  period: "Jul 2026",
  status: "self-study",
  plot: { layer: 2, start: "2026-07", end: null },
  skills: ["Python", "PyTorch", "LLM evaluation"],
  sentence:
    "A self-study of continual learning in 8 phases, from sparse networks that rewire themselves to a 1.5B language model that learns 5 new skills without losing its base capability.",
  what: "A self-directed study, over 4 to 11 July 2026, of a model that keeps learning new skills without losing old ones and decides for itself when it needs more capacity. It runs in 8 gated phases: sparse networks that prune and regrow their own connections, a learned controller, a transformer bridge, and finally a frozen Qwen2.5-1.5B that grows LoRA adapters. Every experiment is journaled with its seeds, config and git SHA, negative results included.",
  stack: ["Python", "PyTorch", "Hugging Face Transformers", "LoRA", "Evolution strategies", "REINFORCE", "pytest"],
  reading: {
    value: 0.912,
    decimals: 3,
    suffix: "",
    label: "mean exact match on 5 new skills",
    sample: "3 seeds, ± 0.062",
    source:
      "Frozen Qwen2.5-1.5B that decides when to grow a new LoRA adapter (3 to 4 for 5 skills). Reusing one adapter instead: 0.731 ± 0.031, with one skill erased in every seed.",
    scaleMax: 1,
    scaleLabel: "1",
  },
  limitation:
    "Synthetic skills on a 1.5B model, and base capability is checked with a 16-prompt probe, not a benchmark suite. Splits in the language-model phases were not byte-reproducible until a hashing defect was found and fixed in phase 7.",
  finding:
    "Isolation plus routing beat constrained sharing at every scale tried. A maths sprint pitted three new methods against the baselines; all three lost, and the losses, with their causes, are recorded as the result.",
  story: {
    problem:
      "Fine-tuning a model on a new skill can erase the old ones. Can a 1.5B model learn 5 skills in sequence, keep what it had, and decide on its own when it needs new capacity?",
    approach:
      "Eight phases, each with a gate, baselines and ablations before any claim. Sparse networks that prune and regrow connections; an evolved controller that decides when to rewire; then LoRA adapters on a frozen Qwen2.5-1.5B, where a novelty probe decides between growing a new adapter and reusing one, and a router picks the adapter without task labels. 85 tests.",
    result:
      "Over 3 seeds the controller scores 0.912 ± 0.062 mean exact match on 5 new skills with 3 to 4 adapters, against 0.731 ± 0.031 for reusing one adapter, which erased a skill in every seed. The canary probe never fell below the base model, and routing was 100 of 100 correct on the gate run.",
  },
  spec: [
    { k: "Period", v: "4 to 11 Jul 2026, 21 journal entries, 85 tests" },
    { k: "Phase 0", v: "Sparse rewiring + EWC 0.645 ± 0.020 against dense 0.413 ± 0.050 (5 seeds), with 20% of the connections" },
    {
      k: "Phase 1",
      v: "20% active beat dense on 3 of 3 benchmarks (3 seeds): Split-MNIST 0.992 against 0.700, Permuted-MNIST 0.858 against 0.622, Split-CIFAR-100 0.415 against 0.100",
    },
    { k: "Phase 2", v: "An evolved controller beat the best hand-tuned rule on 31 of 39 paired held-out streams (p = 0.0001)" },
    { k: "Phase 3", v: "20-task Split-CIFAR-100: SI + replay 0.632 ± 0.007, forgetting 0.033, against dense 0.551" },
    {
      k: "Phase 4",
      v: "One LoRA per task: 0.611 ± 0.011, forgetting 0.000, about 1% extra parameters per task, against full fine-tuning 0.425 (forgetting 0.158)",
    },
    {
      k: "Phase 5",
      v: "Frozen Qwen2.5-1.5B, LoRA r = 8 on q and v (0.07% of base parameters per adapter): 0.912 ± 0.062 over 3 seeds",
    },
    { k: "Phase 6", v: "Task-free: skill boundaries found 5 of 5 with 0 false alarms in 120 batches; exact match 0.833 against 0.813 with labels given" },
    {
      k: "Phase 7",
      v: "An agent learned an invented board game from prose, labelling its own data with an engine it verified: exact match 0.050 to 0.567. Verified self-training matched human labels on one skill (0.783) with no labels",
    },
    { k: "Method", v: "Append-only research log; every run records config, seed and git SHA" },
  ],
  links: [],
  bench: {
    kind: "compare",
    title: "Gate bench",
    groups: [
      {
        id: "p5",
        label: "Phase 5",
        caption: "Frozen Qwen2.5-1.5B, 5 new skills, 3 seeds. Mean exact match after the whole stream.",
        floor: 0,
        ceiling: 1,
        decimals: 3,
        suffix: "",
        bars: [
          { label: "Reuse one adapter", value: 0.731, emphasis: false },
          { label: "Controller decides", value: 0.912, emphasis: true },
        ],
      },
      {
        id: "p5gate",
        label: "Phase 5 gate run",
        caption: "One seed. Every skill starts at 0.000 on the base model. Mean exact match after the stream.",
        floor: 0,
        ceiling: 1,
        decimals: 3,
        suffix: "",
        bars: [
          { label: "Frozen base", value: 0, emphasis: false },
          { label: "Always reuse", value: 0.72, emphasis: false },
          { label: "Reuse + replay", value: 0.917, emphasis: false },
          { label: "Controller (3 adapters)", value: 0.94, emphasis: true },
          { label: "Always grow (5 adapters)", value: 0.96, emphasis: false },
        ],
      },
      {
        id: "p0",
        label: "Phase 0",
        caption: "Synthetic 5-task stream, 5 seeds. Accuracy after the stream.",
        floor: 0,
        ceiling: 1,
        decimals: 3,
        suffix: "",
        bars: [
          { label: "Dense", value: 0.413, emphasis: false },
          { label: "Rewire + EWC, 20% active", value: 0.645, emphasis: true },
        ],
      },
      {
        id: "p1",
        label: "Phase 1",
        caption: "Real vision streams, 3 seeds. Accuracy, dense against 20% active.",
        floor: 0,
        ceiling: 1,
        decimals: 3,
        suffix: "",
        bars: [
          { label: "Split-MNIST, dense", value: 0.7, emphasis: false },
          { label: "Split-MNIST, sparse", value: 0.992, emphasis: true },
          { label: "Permuted-MNIST, dense", value: 0.622, emphasis: false },
          { label: "Permuted-MNIST, sparse", value: 0.858, emphasis: true },
          { label: "Split-CIFAR-100, dense", value: 0.1, emphasis: false },
          { label: "Split-CIFAR-100, sparse", value: 0.415, emphasis: true },
        ],
      },
      {
        id: "p4",
        label: "Phase 4",
        caption: "Transformer on a 5-task text stream, 3 seeds. Accuracy after the stream.",
        floor: 0,
        ceiling: 1,
        decimals: 3,
        suffix: "",
        bars: [
          { label: "Full fine-tuning", value: 0.425, emphasis: false },
          { label: "One LoRA per task", value: 0.611, emphasis: true },
        ],
      },
      {
        id: "p6",
        label: "Phase 6",
        caption: "Task-free online learning on an unlabelled stream, one seed. Mean exact match.",
        floor: 0,
        ceiling: 1,
        decimals: 3,
        suffix: "",
        bars: [
          { label: "One online adapter", value: 0.73, emphasis: false },
          { label: "Labels given", value: 0.813, emphasis: false },
          { label: "Task-free, no labels", value: 0.833, emphasis: true },
        ],
      },
      {
        id: "p7",
        label: "Phase 7",
        caption: "An invented board game, learned from prose with self-labelled data. Exact match.",
        floor: 0,
        ceiling: 1,
        decimals: 3,
        suffix: "",
        bars: [
          { label: "Before", value: 0.05, emphasis: false },
          { label: "After", value: 0.567, emphasis: true },
        ],
      },
    ],
  },
};
