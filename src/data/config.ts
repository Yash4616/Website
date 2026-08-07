import { validateConfig } from '@/data/schema';

/**
 * THE single source of content for yash.systems — REBUILD.md §6.
 *
 * ── Provenance ───────────────────────────────────────────────────────────────
 * Every metric is ported unchanged from `src/data/config.ts` at commit
 * `33b0a6d`, where it was sourced from the GitHub API (2026-08-06) and each
 * repository's own README. That work is fact, not design. The shape changed to
 * suit a document; no number did.
 *
 * Rules carried forward verbatim (§6):
 *   · Every metric traces to a repo README or code. Nothing estimated.
 *   · ResNet18's README F1 of 98.62% stays EXCLUDED — arithmetically impossible
 *     from its own precision (91.16%) and recall (85.35%), which give ≈88.16%.
 *     It is named in the limitations line rather than published as a result.
 *   · Star and fork counts were all zero, so they are omitted entirely. The
 *     schema has no field for them, so they cannot creep back.
 *   · Seven projects. Featured: tokenizer · detection+segmentation · local RAG.
 *
 * Validated by zod at module scope, so a malformed entry fails `next build`.
 */

const SITE_URL = 'https://www.yash.systems';
const GH = 'https://github.com/Yash4616';

export const siteConfig = validateConfig({
  meta: {
    title: 'Yash Gurjar — AI & ML Engineer',
    description:
      'Tokenizers, retrieval systems, and vision pipelines. Machine learning engineering by Yash Gurjar, JECRC University, Jaipur.',
    url: SITE_URL,
  },

  masthead: {
    name: 'Yash Gurjar',
    role: 'AI & ML Engineer',
    institution: 'JECRC University · Jaipur, IN',
    // §8.3 — "Nowhere does the site say what Yash is looking for." It does now.
    availability: 'Available from 2027 · Research or applied ML · Remote or Jaipur',
    revision: 'REV 3.0',
  },

  /*
   * §5 — a positioning statement, not a bio. "This paragraph is the
   * highest-leverage text on the entire site; write it last." It is written
   * here to be rewritten at Stage 9, once the document has said what it should
   * say. Flagging that explicitly so it does not quietly become permanent.
   */
  summary: [
    'I train neural networks and build the systems around them. Most of my work runs on hardware I actually own — a 262k-vocabulary BPE tokenizer written in Rust, a retrieval pipeline that fits in 6 GB of VRAM, and detection and segmentation models evaluated against held-out data rather than a demo.',
    'I care about the part most portfolios skip: what the numbers cost, where the model fails, and which result is noise. Every figure below is measured, and every limitation is stated.',
  ],

  sections: [
    { id: 'selected-work', mark: '01', title: 'Selected Work' },
    { id: 'methods', mark: '02', title: 'Methods' },
    { id: 'background', mark: '03', title: 'Background' },
    { id: 'notes', mark: '04', title: 'Notes' },
    { id: 'correspondence', mark: '05', title: 'Correspondence' },
  ],

  projects: [
    {
      id: 'tokenizer',
      name: 'tokenizer',
      title: 'A 262,144-token byte-level BPE tokenizer',
      // GitHub's linguist reports "Python" because the training pipeline is
      // Python. The engine is Rust. This list is the honest answer.
      languages: ['Rust', 'Python'],
      summary:
        'A CPU-only byte-level BPE tokenizer written in Rust and exposed to Python via PyO3. Ships a trained 262,144-token vocabulary that beats OpenAI’s o200k_base on compression across code, English, and math.',
      spec: [
        {
          label: 'Architecture',
          value: 'Byte-level BPE — byte_fallback, GPT-4 split regex, 10 special tokens',
        },
        { label: 'Vocab', value: '262,144 (+10 special)' },
        {
          label: 'Corpus',
          value:
            '16 GB sub-sampled from ~180 GB of filtered public data — code 45% · English 40% · math 10% · conversational 2.5% · multilingual 2.5% (seed 42)',
        },
        { label: 'Hardware', value: '16-core laptop, CPU-only — no GPU required' },
        { label: 'Throughput', value: '~1 GB prose in ~28 s (≈5.7M tok/s)' },
        { label: 'Decode', value: '22.1M tok/s — 1.09× tiktoken, 10.38× HF' },
        { label: 'Batch encode', value: '2.95M tok/s — 4.14× tiktoken, short batches' },
        { label: 'Parity', value: 'cl100k_base ✓   o200k_base ✓' },
      ],
      limitations:
        'Loses to o200k_base on Arabic (0.93×) and Hindi (0.63×) — non-Latin scripts v1 deliberately does not optimize for. Single-string and large-batch encode trail tiktoken 0.13+, whose rewritten encode path is faster than the 0.12.0 baseline these ratios were measured against; the lead holds on small-batch encode and decode. Throughput ratios jitter ±10% run-to-run.',
      figures: [
        {
          kind: 'bar',
          caption:
            'Bytes per token against o200k_base; higher is better. The margin is widest on Haskell and Japanese and narrowest on English — the corpus was weighted 45% code, and the compression follows the weighting.',
          alt: 'Grouped bar chart comparing bytes-per-token against o200k_base across five domains. This tokenizer scores higher in every one: English 4.9089 versus 4.7351, Python 4.5311 versus 4.2659, C++ 3.9105 versus 3.6061, Haskell 4.3868 versus 3.8447, and Japanese 4.6009 versus 3.7074.',
          xLabel: 'Domain',
          yLabel: 'Bytes per token',
          bars: [
            { label: 'English', value: 4.9089, reference: 4.7351, note: '1.04×' },
            { label: 'Python', value: 4.5311, reference: 4.2659, note: '1.06×' },
            { label: 'C++', value: 3.9105, reference: 3.6061, note: '1.08×' },
            { label: 'Haskell', value: 4.3868, reference: 3.8447, note: '1.14×' },
            { label: 'Japanese', value: 4.6009, reference: 3.7074, note: '1.24×' },
          ],
        },
      ],
      links: { repository: `${GH}/tokenizer` },
      featured: true,
    },

    {
      id: 'object-detection-semantic-segmentation',
      name: 'object detection + segmentation',
      title: 'Two-task detection and segmentation on MNISTDD-RGB',
      languages: ['Python', 'PyTorch'],
      summary:
        'A two-task computer vision pipeline on MNISTDD-RGB: YOLOv8-Small locates and labels digits with bounding boxes, while a 4-level U-Net classifies every pixel in the scene.',
      spec: [
        { label: 'Architecture', value: 'YOLOv8-Small (detection) + U-Net 4-level (segmentation)' },
        { label: 'Params', value: 'YOLOv8-S 11.2M · U-Net ~7.8M' },
        {
          label: 'Dataset',
          value:
            'MNISTDD-RGB — 100,000 synthetic 128×128 scenes from MNIST, 2 digits per scene on a coloured noisy canvas · 10,000 val · 10,000 held-out test',
        },
        { label: 'Hardware', value: 'Kaggle — GPU T4 ×2' },
        {
          label: 'Augmentation',
          value: 'Synthetic scene composition, random digit placement, coloured noise grounds',
        },
      ],
      limitations:
        'Trained and evaluated entirely on synthetically composed MNIST scenes — two digits on a 128×128 coloured noise canvas. Those scores describe that distribution and not natural imagery; the only out-of-distribution check is the notebook’s own generalisation test on unseen MNIST digits. The headline README table and the generated results report disagree on mean IoU (96.04% vs 95.95%); the generated figure is the one reported here.',
      figures: [
        {
          kind: 'bar',
          // From the machine-generated "Final report snapshot", treated as
          // authoritative over the hand-written headline table.
          caption:
            'Detection and segmentation scores on the held-out split. Pixel accuracy is near-saturated because most of each scene is background — mean IoU is the honest number to read.',
          alt: 'Bar chart of seven evaluation scores. Detection: accuracy 97.92 percent, precision 91.11 percent, recall 97.92 percent, F1 94.39 percent. Segmentation: foreground accuracy 97.45 percent, mean IoU 95.95 percent, pixel accuracy 99.96 percent.',
          yLabel: 'Score',
          bars: [
            { label: 'Det. accuracy', value: 97.92, unit: '%' },
            { label: 'Det. precision', value: 91.11, unit: '%' },
            { label: 'Det. recall', value: 97.92, unit: '%' },
            { label: 'Det. F1', value: 94.39, unit: '%' },
            { label: 'Seg. accuracy (fg)', value: 97.45, unit: '%' },
            { label: 'Mean IoU', value: 95.95, unit: '%' },
            { label: 'Pixel accuracy', value: 99.96, unit: '%' },
          ],
        },
      ],
      links: { repository: `${GH}/Object_Detection_Semantic_Segmentation` },
      featured: true,
    },

    {
      id: 'local-rag',
      name: 'local RAG',
      title: 'An evaluation-driven retrieval-augmented generation system',
      languages: ['Python', 'TypeScript'],
      summary:
        'A retrieval-augmented generation system built evaluation-first: every retrieval change is proven with numbers on a fixed labeled gold set before it is kept. Runs entirely locally on a 6 GB GPU.',
      spec: [
        {
          label: 'Architecture',
          value:
            'dense (bge-m3, 1024-d, HNSW cosine) → BM25 → RRF(k=60) → cross-encoder rerank (top-50 → 5) → grounded generation with inline citations',
        },
        { label: 'Generation', value: 'Ollama qwen2.5:7b, explicit refusal when unsupported' },
        { label: 'Store', value: 'PostgreSQL + pgvector 0.8, HNSW cosine' },
        {
          label: 'Corpus',
          value: '5-book ML corpus — 1,721 chunks · 48-query validated gold set, n=43 scored',
        },
        { label: 'Hardware', value: '6 GB GPU, fully local via Ollama — no cloud dependency' },
        { label: 'Tests', value: '41' },
      ],
      limitations:
        'The reranked hybrid config wins recall@5 and recall@10, but the plain dense baseline still holds the best top-1 (R@1 0.62, MRR 0.75) — reranking buys coverage at the cost of precision-at-one. Scored on 43 queries over a single 5-book ML corpus; nothing here is validated outside that domain, and the sample is small enough that small deltas are noise.',
      figures: [
        {
          kind: 'bar',
          caption:
            'Hybrid retrieval with reranking wins on coverage; the dense baseline still wins at rank one. Both are reported because choosing between them is the actual engineering decision.',
          alt: 'Bar chart of four retrieval scores. Hybrid with reranking: recall at 5 is 0.94, recall at 10 is 0.95. Dense baseline: recall at 1 is 0.62, mean reciprocal rank is 0.75.',
          yLabel: 'Score',
          bars: [
            { label: 'recall@5 · hybrid+rerank', value: 0.94 },
            { label: 'recall@10 · hybrid+rerank', value: 0.95 },
            { label: 'recall@1 · dense', value: 0.62 },
            { label: 'MRR · dense', value: 0.75 },
          ],
        },
      ],
      links: { repository: `${GH}/Rag` },
      featured: true,
    },

    {
      id: 'resnet18-cifar10-classifier',
      name: 'ResNet-18 / CIFAR-10',
      title: 'A ResNet-18 CIFAR-10 image classifier',
      languages: ['Python', 'TensorFlow'],
      summary:
        'A notebook-first CIFAR-10 image classifier built on ResNet-18 with residual blocks, batch normalization, and a CutMix-based augmentation stack, with reproducible training and evaluation reporting.',
      spec: [
        {
          label: 'Architecture',
          value:
            'ResNet-18 — residual blocks, BatchNormalization after each convolution, global average pooling, L2 weight decay',
        },
        {
          label: 'Dataset',
          value: 'CIFAR-10 — 60,000 32×32 RGB images across 10 classes · 50k train · 10k test',
        },
        { label: 'Optimizer', value: 'SGD with momentum' },
        {
          label: 'Augmentation',
          value: 'Random horizontal flip · random translation · random crop · CutMix',
        },
        { label: 'Accuracy', value: '88.22%' },
        { label: 'Precision', value: '91.16%' },
        { label: 'Recall', value: '85.35%' },
        { label: 'Loss', value: '0.7198' },
        { label: 'Train time', value: '~28.8 min (1,729.7 s)' },
      ],
      limitations:
        'Test accuracy of 88.22% sits below the standard published ResNet-18 CIFAR-10 baseline, so there is real headroom left in the training schedule rather than in the architecture. Recall (85.35%) trails precision (91.16%) — the model misses more than it over-calls. Nothing here is validated outside the CIFAR-10 distribution. The README additionally reports an F1 of 98.62% that is inconsistent with its own precision and recall; it is excluded here pending a re-run.',
      // AWAITING REAL DATA (§6). Two figures belong here and are deliberately
      // absent rather than approximated:
      //   1. kind 'matrix' — the 10×10 CIFAR-10 confusion matrix from running
      //      eval on the saved model. Must NOT be read off a rendered PNG.
      //   2. kind 'curve'  — downsampled train-loss / val-accuracy arrays,
      //      ≤48 points each, from the training logs.
      // Figure components render nothing when the array is empty.
      figures: [],
      links: { repository: `${GH}/ResNet18-CIFAR10-Classifier` },
      featured: false,
    },

    {
      id: 'computer-vision',
      name: 'vision detection systems',
      title: 'An applied detection toolkit around pretrained models',
      languages: ['Python'],
      summary:
        'An applied toolkit built around pretrained detectors — YOLOv8 for person detection and OpenCV Haar cascades for face detection — wired into a pipeline that runs on webcam or video files with annotated real-time output. Integration work; no models were trained here.',
      spec: [
        { label: 'Components', value: 'YOLOv8 (person) + OpenCV Haar cascades (face)' },
        { label: 'Throughput', value: '~30 FPS at 1080p' },
        { label: 'Model size', value: '6–136 MB' },
        { label: 'Stack', value: 'Python · OpenCV · Ultralytics · PyTorch · NumPy' },
      ],
      // Nothing was trained here, so there is no model to state failure modes
      // for. Manufacturing a limitations line would be the dishonest move.
      limitations: null,
      figures: [],
      links: { repository: `${GH}/Computer-Vision` },
      featured: false,
    },

    {
      id: 'sorting-visualizer',
      name: 'sorting visualizer',
      title: 'A threaded sorting visualizer with a streaming step API',
      languages: ['Python', 'TypeScript'],
      summary:
        'A full-stack sorting visualizer where a Flask backend runs each sort in a daemon worker thread and streams its steps through a polling API, and a TypeScript canvas frontend replays them through a guarded state machine with backpressure handling.',
      spec: [
        {
          label: 'Architecture',
          value: 'Threaded run manager + cursor-paginated polling API + RAF renderer',
        },
        { label: 'Algorithms', value: 'Bubble · selection · insertion · merge · quick · heap' },
        { label: 'Safeguards', value: '10,000-step buffer cap · 60 s hard timeout · reaper thread' },
        { label: 'Determinism', value: 'Array generation seeded by run ID' },
        { label: 'Stack', value: 'Flask · Waitress · TypeScript · Vite · HTML Canvas' },
      ],
      limitations: null,
      figures: [],
      links: { repository: `${GH}/Sorting_Visualizer` },
      featured: false,
    },

    {
      id: 'website',
      name: 'yash.systems',
      title: 'This document',
      languages: ['TypeScript'],
      summary:
        'This site, built as a typeset technical document rather than a portfolio. Server-rendered with the Next.js App Router, figures drawn as inline SVG from measured data, and every piece of content driven from one validated configuration object.',
      spec: [
        { label: 'Stack', value: 'Next.js 15 · React 19 · TypeScript · Tailwind 4' },
        { label: 'Type', value: 'Archivo · IBM Plex Mono' },
        { label: 'Figures', value: 'Inline SVG from measured data — no canvas, no WebGL' },
        { label: 'Content', value: 'One config object, validated by zod at build time' },
      ],
      limitations: null,
      figures: [],
      links: { repository: `${GH}/Website`, demo: SITE_URL },
      featured: false,
    },
  ],

  /*
   * §5 / 02 METHODS — reference material, deliberately quiet and short.
   *
   * NOTE, needs sign-off: the previous roster carried 24 entries, five of them
   * soft skills (Problem Solving, Research, Team Collaboration, Technical
   * Writing, Project Management). They are omitted because §5's own example
   * lists only technical methods, and an unfalsifiable claim like "Team
   * Collaboration" set beside measured numbers weakens everything near it. The
   * 19 technical entries below are the complete carried-over set.
   */
  methods: [
    {
      label: 'Languages',
      items: [
        { name: 'Python', depth: 'Expert' },
        { name: 'Rust', depth: 'Advanced' },
        { name: 'TypeScript', depth: 'Advanced' },
        { name: 'C++', depth: 'Advanced' },
        { name: 'JavaScript', depth: 'Advanced' },
        { name: 'CSS', depth: 'Advanced' },
      ],
    },
    {
      label: 'Frameworks',
      items: [
        { name: 'TensorFlow', depth: 'Expert' },
        { name: 'PyTorch', depth: 'Advanced' },
        { name: 'scikit-learn', depth: 'Advanced' },
        { name: 'React', depth: 'Advanced' },
        { name: 'Next.js', depth: 'Advanced' },
        { name: 'Flutter', depth: 'Proficient' },
      ],
    },
    {
      label: 'Infrastructure',
      items: [
        { name: 'Docker', depth: 'Advanced' },
        { name: 'Google Cloud', depth: 'Advanced' },
        { name: 'MySQL', depth: 'Advanced' },
        { name: 'CUDA / cuDNN', depth: 'Proficient' },
      ],
    },
    {
      label: 'Tooling',
      items: [
        { name: 'Git', depth: 'Expert' },
        { name: 'Matplotlib', depth: 'Advanced' },
        { name: 'Figma', depth: 'Advanced' },
      ],
    },
  ],

  background: [
    {
      qualification: 'B.Tech, Computer Science & Engineering (AI & ML, IBM)',
      institution: 'JECRC University, Jaipur',
      from: 2023,
      to: 2027,
    },
    {
      qualification: 'Secondary & Senior Secondary',
      institution: 'Alwar Public School',
      from: 2009,
      to: 2022,
    },
  ],

  contact: {
    email: 'yashgurjar9714@gmail.com',
    location: 'Jaipur, Rajasthan, India',
    availability: 'Available from 2027 · Research or applied ML · Remote or Jaipur',
  },

  links: [
    { label: 'GitHub', href: GH },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/yashgurjar9' },
    { label: 'X', href: 'https://x.com/Yash_9724' },
  ],

  resumeUrl: '/assets/pdfs/Yash_Resume.pdf',

  colophon: [
    'Set in Archivo and IBM Plex Mono. Built with Next.js, deployed on Vercel.',
    'Figures rendered as inline SVG from measured data. Source on GitHub.',
  ],
});

/** Lookup for /projects/[slug]. */
export function getProjectById(id: string) {
  return siteConfig.projects.find((project) => project.id === id);
}

/** Featured first, declaration order preserved within each group. */
export const orderedProjects = [
  ...siteConfig.projects.filter((p) => p.featured),
  ...siteConfig.projects.filter((p) => !p.featured),
];
