import type { InstrumentInput } from "../site";
import { belowPercent } from "../format";

/**
 * Sources:
 * - Ranks, field sizes, competition types and task lines: his Kaggle profile,
 *   "Your Competitions (7)", shared on 15 Nov 2026. Kaggle listed ROGII and
 *   Autonomous Agent as ended about 3 months earlier, which sets the span's
 *   start at August. Biohub, Nemotron and PTCG are left out at his request.
 * - WEAR: C:\Dev\Build\Stuff\Kaggle comp\Test (README.md results log, sessions
 *   1 to 3, 3 to 4 Sep 2026; logs/submissions.json). Leaderboard figures are the
 *   public leaderboard on 4 Sep 2026.
 * - UMUD: C:\Dev\Build\Stuff\Kaggle comp\UMUD\README.md (private leaderboard due
 *   21 Nov 2026, so its rank is the standing at the close).
 * - Autonomous Agent, ROGII: no local notes, so each line is the
 *   competition's own task, not a claim about the work.
 */
const entries = [
  {
    name: "Autonomous Agent Prediction (Beta)",
    short: "Autonomous Agent",
    kind: "Playground",
    rank: 219,
    teams: 570,
    standingNote: null,
    note: "The task: an agent that trains a model and submits it to a competition on its own.",
  },
  {
    name: "ROGII: Wellbore Geology Prediction",
    short: "ROGII",
    kind: "Featured code competition",
    rank: 2779,
    teams: 6125,
    standingNote: null,
    note: "The task: a model that helps automate drilling operations in oil and gas.",
  },
  {
    name: "UMUD Challenge: Muscle Architecture in Ultrasound Data",
    short: "UMUD",
    kind: "Community",
    rank: 348,
    teams: 689,
    standingNote: "Standing at the close on 14 Nov 2026; the private leaderboard is due 21 Nov.",
    note: "Pennation angle, fascicle length and muscle thickness from ultrasound images. A U-Net segments aponeuroses and fascicles, the measures are derived from the masks, and pixels are calibrated to millimetres from each image's ruler for all 309 test images.",
  },
  {
    name: "3rd WEAR Dataset Challenge @HASCA 2026",
    short: "WEAR",
    kind: "Community",
    rank: 130,
    teams: 232,
    standingNote: null,
    note: "The one written up in full: best public macro F1 0.72114, from validation by participant, label spreading over each participant's video and decision offsets at the test prior.",
  },
];

// Listed best first, and every listed entry is ranked.
const ranked = entries;
const best = ranked[0];

export const kaggle: InstrumentInput = {
  kind: "instrument",
  id: "kaggle",
  name: "Kaggle Competitions",
  short: "Kaggle",
  pieces: ["Kag", "gle", " Compet", "itions"],
  period: "Aug to Nov 2026",
  status: "competitions",
  plot: { layer: 2.5, start: "2026-08", end: "2026-11" },
  skills: ["Python", "PyTorch", "NumPy", "scikit-learn"],
  sentence: `${entries.length} Kaggle competitions: activity recognition, ultrasound, geology and agents. Best finish ${best.rank} of ${best.teams}.`,
  what: `${entries.length} Kaggle competitions in 2026, across wearable sensors, ultrasound, geology and agents, each listed with its standing. The WEAR activity-recognition entry is written up in full: its story, bench and specification are below. UMUD has notes; the other two are listed with the competition's own task.`,
  stack: ["Python", "XGBoost (GPU)", "LightGBM", "PyTorch", "U-Net", "NumPy"],
  reading: {
    value: 0.72114,
    decimals: 5,
    suffix: "",
    label: "best macro F1 on the WEAR public leaderboard",
    sample: "4 Sep 2026; final standing 130 of 232",
    source:
      "Kaggle submission log. Held-out validation predicted +0.0178 for the last change; the leaderboard moved +0.0198.",
    scaleMax: 1,
    scaleLabel: "1",
  },
  limitation:
    "No finish in the top third: the best is 219 of 570, and WEAR's leaderboard score ended 130 of 232. Only WEAR and UMUD have notes behind them, and UMUD's rank is provisional until 21 Nov.",
  finding:
    "In WEAR, video features don't transfer between people (cross-subject kNN 0.42 on video, against 0.49 on the accelerometer), but within one person neighbouring clips share a label 0.978 of the time. So video went in as a graph for spreading predictions across each participant, not as classifier features, and every later gain came from that.",
  story: {
    problem:
      "Four competitions with very different data. The one written up in full is WEAR: classify 19 activities, about 40% of them 'null', from one second of 4-limb accelerometer data plus video features, for 4 people the model has never seen. The metric is macro F1, so rare classes count as much as common ones.",
    approach:
      "WEAR: validation that matches the test, with GroupKFold by participant because random splits leak overlapping windows. 169 signal features plus rotation- and scale-invariant blocks into gradient-boosted trees; label spreading over a graph of each participant's video clips; then per-class decision offsets fitted at the test-time class prior. UMUD: segmentation masks turned into geometry, with pixel calibration per image.",
    result:
      "In WEAR the public leaderboard score rose from 0.65348 to 0.72114 macro F1 over 3 sessions, and validation and leaderboard agreed: the held-out protocol predicted the last change at +0.0178, and the leaderboard moved +0.0198. WEAR's final standing was 130 of 232. Across the four, the best finish is 219 of 570, in Autonomous Agent Prediction.",
  },
  spec: [
    { k: "Best finish", v: `${best.rank} of ${best.teams}, ${best.name}` },
    { k: "WEAR validation", v: "GroupKFold on participant ID; out-of-fold to leaderboard offset measured at -0.0676" },
    {
      k: "WEAR features",
      v: "169 vectorised signal features per window; gravity-aligned invariant features took out-of-fold F1 from 0.7015 to 0.7083, winning all 5 folds",
    },
    { k: "WEAR label spreading", v: "Over the raw 768-d video graph per participant: out-of-fold F1 0.7009 to 0.7613" },
    {
      k: "WEAR decision rule",
      v: "Offsets fitted after spreading, at the test-time prior: 0.7501 against 0.7352 for plain argmax; offsets fitted at the training prior scored 0.7238, worse than none",
    },
    { k: "WEAR negatives kept", v: "Neural nets 0.6273 against 0.7015 for trees; pseudo-labelling -0.0025; segment clustering 0.7270" },
    { k: "UMUD calibration", v: "Pixels to millimetres solved for all 309 test images and checked against the printed ruler labels" },
    { k: "Hardware", v: "RTX 4050 laptop, 6 GB; the WEAR hyperparameter search moved to a Kaggle T4" },
  ],
  links: [],
  competitions: entries,
  bench: {
    kind: "compare",
    title: "Leaderboard bench",
    groups: [
      {
        id: "standings",
        label: "Standings",
        caption:
          "Share of teams that finished below, rounded down. UMUD is the standing at the close.",
        floor: 0,
        ceiling: 100,
        decimals: 0,
        suffix: "%",
        bars: ranked.map((e, i) => ({ label: e.short, value: belowPercent(e), emphasis: i === 0 })),
      },
      {
        id: "lb",
        label: "WEAR leaderboard",
        caption: "WEAR public leaderboard macro F1 after each change, 3 to 4 Sep 2026. Axis from 0.60.",
        floor: 0.6,
        ceiling: 0.75,
        decimals: 5,
        suffix: "",
        bars: [
          { label: "First submission", value: 0.65348, emphasis: false },
          { label: "Decision rule at the test prior", value: 0.65991, emphasis: false },
          { label: "+ video-neighbour smoothing", value: 0.66659, emphasis: false },
          { label: "+ label spreading", value: 0.68246, emphasis: false },
          { label: "+ raw 768-d video graph", value: 0.69532, emphasis: false },
          { label: "+ invariant features", value: 0.70137, emphasis: false },
          { label: "+ tuned ensemble, offsets refit", value: 0.72114, emphasis: true },
        ],
      },
      {
        id: "rule",
        label: "WEAR decision rule",
        caption: "WEAR held-out macro F1 after label spreading, scored at the test-time class prior. Axis from 0.70.",
        floor: 0.7,
        ceiling: 0.76,
        decimals: 4,
        suffix: "",
        bars: [
          { label: "Plain argmax", value: 0.7352, emphasis: false },
          { label: "Argmax + null offset", value: 0.7354, emphasis: false },
          { label: "Offsets fitted at the training prior", value: 0.7238, emphasis: false },
          { label: "Offsets fitted after spreading, test prior", value: 0.7501, emphasis: true },
        ],
      },
      {
        id: "errors",
        label: "WEAR failures",
        caption: "WEAR recall of the four static activities most often lost to 'null'.",
        floor: 0,
        ceiling: 1,
        decimals: 3,
        suffix: "",
        bars: [
          { label: "Stretching, shoulders", value: 0.34, emphasis: true },
          { label: "Stretching, triceps", value: 0.494, emphasis: false },
          { label: "Stretching, lunging", value: 0.643, emphasis: false },
          { label: "Bench dips", value: 0.686, emphasis: false },
        ],
      },
    ],
  },
};
