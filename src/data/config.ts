import type { SiteConfig } from '@/types';

/**
 * THE single source of content for yash.systems (MASTER_PLAN.md §5.1).
 *
 * No user-facing string, URL, number, or array literal belongs in a component.
 * Adding a project, changing the bio, or swapping a social link means editing
 * this file and nothing else.
 *
 * ── Data provenance (D7 / D8 / AP-12) ────────────────────────────────────────
 * Every star count, fork count, metric, and architecture name below was read
 * from the GitHub API or from the repo's own README on 2026-08-06. Nothing is
 * estimated, rounded up, or filled in from memory.
 *
 * Star/fork counts are a snapshot, marked `as of 2026-08-06`. Stage 6 hides the
 * star/fork row entirely when both are 0 (A13) — which is currently every card.
 *
 * `metrics: null` and `modelCard: null` mean the repo does not verifiably state
 * those numbers. They do NOT mean zero, and they must never be backfilled with
 * plausible-looking values.
 */

const SITE_URL = 'https://www.yash.systems';
const GITHUB_USER = 'https://github.com/Yash4616';

export const siteConfig: SiteConfig = {
  meta: {
    title: 'Yash Gurjar — AI & ML Engineer | Computer Vision & Deep Learning',
    description:
      'Portfolio of Yash Gurjar, an AI & ML Engineer from Jaipur specializing in Computer Vision, Neural Networks, TensorFlow, and PyTorch. Building intelligent solutions.',
    keywords: [
      'Yash Gurjar',
      'AI Engineer',
      'ML Engineer',
      'Computer Vision Developer',
      'Deep Learning',
      'TensorFlow',
      'PyTorch',
      'Jaipur',
      'Machine Learning Portfolio',
      'Neural Networks',
      'JECRC University',
    ],
    url: SITE_URL,
    // Generated at build time by src/app/opengraph-image.tsx (A12).
    ogImage: '/opengraph-image',
  },

  hero: {
    name: 'Yash Gurjar',
    title: 'AI & ML Engineer',
    typewriterPrefix: 'Specializing in ',
    typewriterWords: [
      'Computer Vision',
      'Neural Networks',
      'Deep Learning',
      'TensorFlow',
      'PyTorch',
    ],
    primaryCta: { label: 'View Projects ↗', href: '#projects' },
    secondaryCta: {
      label: 'Download Resume',
      href: '/assets/pdfs/Yash_Resume.pdf',
    },
    scrollHint: 'Scroll to explore',
  },

  about: {
    // §5.4 — condensed. Do not rewrite these longer.
    bio: [
      "I'm a Computer Science student from Jaipur with a deep fascination for how machines learn and adapt. I spend my time training neural networks, building web applications, and exploring the vast landscape of AI — constantly moving between theory and hands-on experimentation.",
      'What drives me is the creative problem-solving side of ML engineering — that moment when a model finally converges, when complex data reveals its patterns. I learn best by building, breaking things, and iterating until they work better than before.',
    ],
    avatar: '/assets/images/myimage.jpg',
    education: [
      {
        degree: 'B.Tech — CSE (AI & ML specialization, IBM)',
        institution: 'JECRC University, Jaipur',
        start: 2023,
        end: 2027,
      },
      {
        degree: 'High School',
        institution: 'Alwar Public School',
        start: 2009,
        end: 2022,
      },
    ],
    strengths: [
      {
        title: 'Deep Learning Expert',
        description:
          'Trains and evaluates CNNs end to end — ResNet, U-Net, YOLO — in both TensorFlow and PyTorch.',
        icon: 'brain',
      },
      {
        title: 'Production-Ready Code',
        description:
          'Typed interfaces, test suites, CI, and reproducible pipelines — not notebooks thrown over a wall.',
        icon: 'code',
      },
      {
        title: 'Research-Oriented',
        description:
          'Reads the paper, reproduces the baseline, then measures whether the change actually helped.',
        icon: 'microscope',
      },
      {
        title: 'Problem Solver',
        description:
          'Profiles before optimizing, and follows the evidence when the obvious explanation turns out wrong.',
        icon: 'puzzle',
      },
    ],
    location: {
      label: 'Jaipur, Rajasthan',
      sub: 'Available for remote work worldwide',
      lat: 26.9,
      lng: 75.8,
    },
  },

  // ── Skills — §5.5, 24 nodes (A14 added Rust) ───────────────────────────────
  // 6 Expert (orbit 1) · 16 Advanced (orbit 2) · 2 Proficient (orbit 3)
  skills: [
    // Orbit 1 — Expert
    {
      name: 'Python',
      category: 'Language',
      level: 'Expert',
      orbit: 1,
      icon: 'python',
      blurb: 'Primary language for every model, training pipeline, and eval harness here.',
    },
    {
      name: 'TensorFlow',
      category: 'Framework',
      level: 'Expert',
      orbit: 1,
      icon: 'tensorflow',
      blurb: 'Trained the CIFAR-10 ResNet-18 in Keras, including a custom F1 metric.',
    },
    {
      name: 'Git',
      category: 'Tool',
      level: 'Expert',
      orbit: 1,
      icon: 'git',
      blurb: 'Branch-per-experiment workflow with CI gates on format, lint, and tests.',
    },
    {
      name: 'Problem Solving',
      category: 'Soft Skill',
      level: 'Expert',
      orbit: 1,
      icon: 'problemSolving',
      blurb: 'Found that a 16 GB BPE corpus beat 45 GB — then explained why, instead of shipping the bigger number.',
    },
    {
      name: 'Research',
      category: 'Soft Skill',
      level: 'Expert',
      orbit: 1,
      icon: 'research',
      blurb: 'Evaluation-first: every retrieval change proven on a fixed labeled set before it is kept.',
    },
    {
      name: 'Team Collaboration',
      category: 'Soft Skill',
      level: 'Expert',
      orbit: 1,
      icon: 'team',
      blurb: 'Writes the README that lets someone else reproduce the run without asking.',
    },

    // Orbit 2 — Advanced
    {
      name: 'JavaScript',
      category: 'Language',
      level: 'Advanced',
      orbit: 2,
      icon: 'js',
      blurb: 'Canvas render loops and polling state machines that survive a dropped connection.',
    },
    {
      name: 'TypeScript',
      category: 'Language',
      level: 'Advanced',
      orbit: 2,
      icon: 'typescript',
      blurb: 'Strict mode, zero `any` — the type system is the first test suite.',
    },
    {
      name: 'C++',
      category: 'Language',
      level: 'Advanced',
      orbit: 2,
      icon: 'cpp',
      blurb: 'Systems fundamentals: memory layout, cache behaviour, and where the cycles actually go.',
    },
    {
      name: 'Rust',
      category: 'Language',
      level: 'Advanced',
      orbit: 2,
      icon: 'rust',
      blurb: 'Wrote the BPE tokenizer engine — thread-local caches, Rayon batching, and a released GIL.',
    },
    {
      name: 'PyTorch',
      category: 'Framework',
      level: 'Advanced',
      orbit: 2,
      icon: 'pytorch',
      blurb: 'U-Net trained from scratch for pixel-level segmentation at 95.95% mean IoU.',
    },
    {
      name: 'Scikit-learn',
      category: 'Framework',
      level: 'Advanced',
      orbit: 2,
      icon: 'scikitLearn',
      blurb: 'Classical baselines and metric implementations to sanity-check the deep models.',
    },
    {
      name: 'Matplotlib',
      category: 'Tool',
      level: 'Advanced',
      orbit: 2,
      icon: 'matplotlib',
      blurb: 'Training curves and confusion matrices — the plots that tell you the run went wrong.',
    },
    {
      name: 'React',
      category: 'Framework',
      level: 'Advanced',
      orbit: 2,
      icon: 'react',
      blurb: 'Component trees kept shallow so state changes do not cascade into re-render storms.',
    },
    {
      name: 'Next.js',
      category: 'Framework',
      level: 'Advanced',
      orbit: 2,
      icon: 'nextjs',
      blurb: 'App Router with Server Components by default and "use client" pushed to the leaves.',
    },
    {
      name: 'Docker',
      category: 'Tool',
      level: 'Advanced',
      orbit: 2,
      icon: 'docker',
      blurb: 'Compose stacks that bring up Postgres + pgvector with the schema already applied.',
    },
    {
      name: 'Figma',
      category: 'Tool',
      level: 'Advanced',
      orbit: 2,
      icon: 'figma',
      blurb: 'Designs the token set — spacing, type scale, colour — before writing any CSS.',
    },
    {
      name: 'MySQL',
      category: 'Tool',
      level: 'Advanced',
      orbit: 2,
      icon: 'mysql',
      blurb: 'Schema design and index planning for queries that stay fast as rows accumulate.',
    },
    {
      name: 'Google Cloud',
      category: 'Cloud',
      level: 'Advanced',
      orbit: 2,
      icon: 'googleCloud',
      blurb: 'GPU VM provisioning for training runs too large for a laptop.',
    },
    {
      name: 'CSS',
      category: 'Language',
      level: 'Advanced',
      orbit: 2,
      icon: 'css',
      blurb: 'Compositor-only animation — transform and opacity, never layout-triggering properties.',
    },
    {
      name: 'Technical Writing',
      category: 'Soft Skill',
      level: 'Advanced',
      orbit: 2,
      icon: 'techWrite',
      blurb: 'Documents the negative result too — the 45 GB run that lost is in the README.',
    },
    {
      name: 'Project Management',
      category: 'Soft Skill',
      level: 'Advanced',
      orbit: 2,
      icon: 'project',
      blurb: 'Ships in phases with a measurable gate at each boundary, not one big-bang merge.',
    },

    // Orbit 3 — Proficient
    {
      name: 'Flutter',
      category: 'Framework',
      level: 'Proficient',
      orbit: 3,
      icon: 'flutter',
      blurb: 'Cross-platform UI with a single Dart codebase for Android and iOS.',
    },
    {
      name: 'CUDA & cuDNN',
      category: 'Tool',
      level: 'Proficient',
      orbit: 3,
      icon: 'cuda',
      blurb: 'Keeps training on the GPU — mixed precision, batch sizing, and reading nvidia-smi honestly.',
    },
  ],

  // ── Projects ────────────────────────────────────────────────────────────────
  // Sourced from https://api.github.com/users/Yash4616/repos on 2026-08-06.
  // All star/fork counts below are `0` because that is what the API returned.
  // Forks of upstream repos (pytorch, huggingface_hub, riscv-unified-db,
  // website_Kubernetes) are excluded, as is the Yash4616 profile-config repo.
  projects: [
    {
      id: 'tokenizer',
      title: 'Rust BPE Tokenizer — 262k Vocabulary',
      description:
        'A CPU-only byte-level BPE tokenizer written in Rust and exposed to Python via PyO3. Ships a trained 262,144-token vocabulary that beats OpenAI’s o200k_base on compression across code, English, and math.',
      category: 'nlp',
      tags: ['BPE', 'Tokenizer', 'Rust', 'NLP'],
      stack: ['Rust', 'PyO3', 'Python', 'Rayon', 'maturin', 'Criterion'],
      architecture: 'Byte-level BPE — byte_fallback, GPT-4 split regex',
      metrics: [
        { label: 'Vocabulary', value: '262,144' },
        { label: 'Decode vs HF', value: '10.38×' },
      ],
      // GitHub reports Python as the primary language (the training pipeline is
      // Python); the engine itself is Rust. Reported here as the API returns it.
      language: 'Python',
      stars: 0, // as of 2026-08-06
      forks: 0, // as of 2026-08-06
      featured: true,
      links: { github: `${GITHUB_USER}/tokenizer` },
      image: null,
      modelCard: {
        architecture: 'Byte-level BPE — byte_fallback, GPT-4 split regex, 10 special tokens',
        params: null, // A vocabulary, not a parameterised model. Size is in metrics.
        dataset:
          '16 GB sub-sampled from ~180 GB of filtered public data — code 45% · English 40% · math 10% · conversational 2.5% · multilingual 2.5% (seed 42, deterministic assembly)',
        hardware: '16-core laptop, CPU-only — no GPU required to train or run',
        epochs: null, // BPE merge training, not epoch-based.
        optimizer: null, // Greedy frequency-based merge selection has no optimizer.
        augmentation: [],
        metrics: [
          { label: 'Vocabulary size', value: '262,144 (+10 special)' },
          { label: 'English b/t vs o200k', value: '4.9089 vs 4.7351 — 1.04×' },
          { label: 'Python b/t vs o200k', value: '4.5311 vs 4.2659 — 1.06×' },
          { label: 'C++ b/t vs o200k', value: '3.9105 vs 3.6061 — 1.08×' },
          { label: 'Haskell b/t vs o200k', value: '4.3868 vs 3.8447 — 1.14×' },
          { label: 'Japanese b/t vs o200k', value: '4.6009 vs 3.7074 — 1.24×' },
          { label: 'Decode throughput', value: '22.1M tok/s — 1.09× tiktoken, 10.38× HF' },
          { label: 'Batch-short encode', value: '2.95M tok/s — 4.14× tiktoken' },
          { label: 'Bulk tokenization', value: '~1 GB prose in ~28 s (≈5.7M tok/s)' },
          { label: 'tiktoken parity', value: '100% on cl100k_base and o200k_base' },
        ],
        limitations:
          'Loses to o200k_base on Arabic (0.93×) and Hindi (0.63×) — non-Latin scripts v1 deliberately does not optimize for. Single-string and large-batch encode trail tiktoken 0.13+, whose rewritten encode path is faster than the 0.12.0 baseline these ratios were measured against; the lead holds on small-batch encode and decode. Throughput ratios jitter ±10% run-to-run.',
      },
    },

    {
      id: 'object-detection-semantic-segmentation',
      title: 'Object Detection & Semantic Segmentation',
      description:
        'A two-task computer vision pipeline on MNISTDD-RGB: YOLOv8-Small locates and labels digits with bounding boxes, while a 4-level U-Net classifies every pixel in the scene.',
      category: 'computer-vision',
      tags: ['YOLOv8', 'U-Net', 'Object Detection', 'Segmentation'],
      stack: ['PyTorch', 'Ultralytics', 'torchvision', 'NumPy', 'Pillow', 'Matplotlib', 'pandas'],
      architecture: 'YOLOv8-S + U-Net (4-level)',
      metrics: [
        { label: 'Detection Acc', value: '97.92%' },
        { label: 'Mean IoU', value: '95.95%' },
      ],
      language: 'Jupyter Notebook',
      stars: 0, // as of 2026-08-06
      forks: 0, // as of 2026-08-06
      featured: true,
      links: { github: `${GITHUB_USER}/Object_Detection_Semantic_Segmentation` },
      image: null,
      modelCard: {
        architecture: 'YOLOv8-Small (detection) + U-Net 4-level (segmentation)',
        params: 'YOLOv8-S 11.2M · U-Net ~7.8M',
        dataset:
          'MNISTDD-RGB — 100,000 synthetic 128×128 scenes generated from MNIST (2 digits per scene on a coloured noisy canvas), 10,000 val / 10,000 held-out test',
        hardware: 'Kaggle — GPU T4 ×2',
        epochs: null, // U-Net used early stopping; the notebook does not state a final count.
        optimizer: null, // Not stated in the README.
        augmentation: [
          'Synthetic scene composition — random digit placement',
          'Coloured noise canvas backgrounds',
        ],
        // Values taken from the "Final report snapshot (from results_report.txt)"
        // table, which is machine-generated. NOTE: the README's headline table
        // reports Mean IoU as 96.04% while the generated report says 0.9595 —
        // the generated file is treated as authoritative here.
        metrics: [
          { label: 'Detection Accuracy', value: '97.92%' },
          { label: 'Detection Precision', value: '91.11%' },
          { label: 'Detection Recall', value: '97.92%' },
          { label: 'Detection F1', value: '94.39%' },
          { label: 'Seg Accuracy (fg)', value: '97.45%' },
          { label: 'Mean IoU', value: '95.95%' },
          { label: 'Pixel Accuracy', value: '99.96%' },
        ],
        limitations:
          'Trained and evaluated entirely on synthetically composed MNIST scenes — two digits on a 128×128 coloured noise canvas. Those scores describe that distribution and not natural imagery; the only out-of-distribution check is the notebook’s own generalisation test on unseen MNIST digits. The headline README table and the generated results report disagree on mean IoU (96.04% vs 95.95%); the generated figure is the one reported here.',
      },
    },

    {
      id: 'local-rag',
      title: 'Local RAG — Evaluation-Driven',
      description:
        'A retrieval-augmented generation system built evaluation-first: every retrieval change is proven with numbers on a fixed labeled gold set before it is kept. Runs entirely locally on a 6 GB GPU.',
      category: 'nlp',
      tags: ['RAG', 'Retrieval', 'Evaluation', 'Local LLM'],
      stack: [
        'Ollama',
        'qwen2.5:7b',
        'bge-m3',
        'PostgreSQL + pgvector',
        'HNSW',
        'BM25 (bm25s)',
        'RRF',
        'bge-reranker-v2-m3',
        'FastAPI',
        'React',
      ],
      architecture: 'dense → BM25 + RRF(k=60) → cross-encoder rerank (top-50 → 5)',
      metrics: [
        { label: 'recall@5', value: '0.94' },
        { label: 'recall@10', value: '0.95' },
      ],
      language: 'Python',
      stars: 0, // as of 2026-08-06
      forks: 0, // as of 2026-08-06
      featured: true,
      links: { github: `${GITHUB_USER}/Rag` },
      image: null,
      modelCard: {
        architecture:
          'Hybrid retrieval — dense (bge-m3, 1024-d, HNSW cosine) → BM25 → RRF(k=60) → cross-encoder rerank (top-50 → 5) → grounded generation with inline citations',
        params: null, // Off-the-shelf models; no parameter count claimed for the system.
        dataset: '5-book ML corpus — 1,721 chunks · 48-query validated gold set (n=43 scored)',
        hardware: '6 GB GPU, fully local via Ollama — no cloud dependency',
        epochs: null, // Retrieval system; nothing is trained.
        optimizer: null,
        augmentation: [],
        metrics: [
          { label: 'recall@5 (hybrid+rerank)', value: '0.94' },
          { label: 'recall@10 (hybrid+rerank)', value: '0.95' },
          { label: 'recall@1 (dense baseline)', value: '0.62' },
          { label: 'MRR (dense baseline)', value: '0.75' },
          { label: 'Test suite', value: '41 tests' },
        ],
        limitations:
          'The reranked hybrid config wins recall@5 and recall@10, but the plain dense baseline still holds the best top-1 (R@1 0.62, MRR 0.75) — reranking buys coverage at the cost of precision-at-one. Scored on 43 queries over a single 5-book ML corpus; nothing here is validated outside that domain, and the sample is small enough that small deltas are noise.',
      },
    },

    {
      id: 'resnet18-cifar10-classifier',
      title: 'ResNet-18 CIFAR-10 Classifier',
      description:
        'A notebook-first CIFAR-10 image classifier built on ResNet-18 with residual blocks, batch normalization, and a CutMix-based augmentation stack, with reproducible training and evaluation reporting.',
      category: 'computer-vision',
      tags: ['ResNet', 'CIFAR-10', 'Image Classification', 'TensorFlow'],
      stack: ['TensorFlow 2.19', 'Keras', 'NumPy', 'Matplotlib'],
      architecture: 'ResNet-18',
      metrics: [
        { label: 'Accuracy', value: '88.22%' },
        { label: 'Loss', value: '0.7198' },
      ],
      language: 'Python',
      stars: 0, // as of 2026-08-06
      forks: 0, // as of 2026-08-06
      featured: false, // A16 — kept in the grid, not led with.
      links: { github: `${GITHUB_USER}/ResNet18-CIFAR10-Classifier` },
      image: null,
      modelCard: {
        architecture:
          'ResNet-18 — residual blocks, BatchNormalization after each convolution, global average pooling, L2 weight decay',
        params: null, // Not stated in the repo. Not inferred from the canonical 11.2M.
        dataset: 'CIFAR-10 — 60,000 32×32 RGB images across 10 classes, 50k train / 10k test',
        hardware: null, // README notes GPU optimization but names no device.
        epochs: null, // Early stopping; final epoch count not recorded.
        optimizer: 'SGD with momentum',
        augmentation: [
          'Random horizontal flip',
          'Random translation',
          'Random crop',
          'CutMix',
        ],
        // A15 — the README's F1 of 98.62% is OMITTED. It is arithmetically
        // impossible from its own Precision 91.16% / Recall 85.35% (true F1
        // ≈ 88.16%), so publishing it would be a number a reader could
        // disprove with a calculator. Per D8 and AP-12, it is left out rather
        // than silently corrected.
        metrics: [
          { label: 'Accuracy', value: '88.22%' },
          { label: 'Precision', value: '91.16%' },
          { label: 'Recall', value: '85.35%' },
          { label: 'Loss', value: '0.7198' },
          { label: 'Training time', value: '~28.8 min (1,729.7 s)' },
        ],
        limitations:
          'Test accuracy of 88.22% sits below the standard published ResNet-18 CIFAR-10 baseline, so there is real headroom left in the training schedule rather than in the architecture. Recall (85.35%) trails precision (91.16%) — the model misses more than it over-calls. Nothing here is validated outside the CIFAR-10 distribution. The README additionally reports an F1 of 98.62% that is inconsistent with its own precision and recall; it is excluded here pending a re-run.',
      },
    },

    {
      id: 'computer-vision',
      title: 'Vision Detection Systems',
      description:
        'A computer vision toolkit pairing YOLOv8-based person detection with OpenCV Haar-cascade face detection, running on webcam input or video files with real-time annotated output.',
      category: 'computer-vision',
      tags: ['YOLOv8', 'OpenCV', 'Detection', 'Real-time'],
      stack: ['Python', 'OpenCV', 'YOLOv8', 'Ultralytics', 'PyTorch', 'NumPy'],
      architecture: 'YOLOv8 + OpenCV Haar Cascades',
      metrics: [
        { label: 'Throughput', value: '~30 FPS @ 1080p' },
        { label: 'Model size', value: '6–136 MB' },
      ],
      language: 'Python',
      stars: 0, // as of 2026-08-06
      forks: 0, // as of 2026-08-06
      featured: false,
      links: { github: `${GITHUB_USER}/Computer-Vision` },
      image: null,
      // Applied toolkit built on pretrained detectors — nothing was trained here,
      // so there is no model card to present. Claiming one would be dishonest.
      modelCard: null,
    },

    {
      id: 'website',
      title: 'yash.systems',
      description:
        'This site. A single-page portfolio built on the Next.js App Router with an OGL particle field, Framer Motion throughout, and every piece of content driven from one typed config object.',
      category: 'web-development',
      tags: ['Next.js', 'WebGL', 'Portfolio', 'Design System'],
      stack: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'OGL'],
      architecture: null,
      metrics: null,
      language: 'TypeScript',
      stars: 0, // as of 2026-08-06
      forks: 0, // as of 2026-08-06
      featured: false,
      links: { github: `${GITHUB_USER}/Website`, demo: SITE_URL },
      image: '/assets/images/website.png',
      modelCard: null,
    },
  ],

  contact: {
    email: 'yashgurjar9714@gmail.com',
    location: 'Jaipur, Rajasthan, India',
    availability: 'Open to internships and remote work',
  },

  social: [
    { label: 'GitHub', href: GITHUB_USER, icon: 'github' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/yashgurjar9', icon: 'linkedin' },
    { label: 'X', href: 'https://x.com/Yash_9724', icon: 'x' },
  ],

  // §5.6 — exit at 3.5 s. Mobile scales every `at` by 0.57 (→ ~2.0 s).
  loader: [
    { at: 0.0, text: 'Initializing system...' },
    { at: 0.3, text: 'Loading neural weights...', progress: 80 },
    { at: 0.6, text: 'Loading neural weights...', progress: 100, done: true },
    { at: 0.9, text: 'Allocating GPU memory... 24GB VRAM', done: true },
    { at: 1.2, text: 'Initializing tensor cores...', done: true },
    { at: 1.5, text: 'Loading model architecture... ResNet-152', done: true },
    { at: 1.8, text: 'Compiling computation graph...' },
    { at: 2.2, text: 'Optimizing inference pipeline...', done: true },
    { at: 2.5, text: 'Running validation... accuracy: 99.2%', done: true },
    { at: 2.8, text: 'System ready.' },
    { at: 3.0, text: 'Deploying yash.systems...' },
    { at: 3.3, text: 'DEPLOYED', progress: 100, done: true },
  ],

  footer: {
    tagline: 'Building intelligent systems, one converged model at a time.',
    // `{year}` is substituted at render time — never hardcode the year.
    copyright: '© {year} Yash Gurjar. Crafted with Next.js, OGL & too much coffee.',
    quickLinks: [
      { label: 'Home', href: '#hero' },
      { label: 'About', href: '#about' },
      { label: 'Skills', href: '#skills' },
      { label: 'Projects', href: '#projects' },
      { label: 'Contact', href: '#contact' },
    ],
  },

  resumeUrl: '/assets/pdfs/Yash_Resume.pdf',
};

/** Lookup used by /projects/[slug] and the Stage 7 terminal's `cat <id>` command. */
export function getProjectById(id: string) {
  return siteConfig.projects.find((project) => project.id === id);
}
