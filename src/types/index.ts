/**
 * Type set for yash.systems — MASTER_PLAN.md §5.2, extended by §8.1/S1.
 *
 * Nullability is deliberate and load-bearing. Per D8, a field is `null` when the
 * real repo does not verifiably state it. `null` means "not logged", never "zero"
 * and never "we'll fill it in later". Rendering code must branch on null rather
 * than substituting a plausible default.
 */

export type Proficiency = 'Expert' | 'Advanced' | 'Proficient';

export type SkillCategory =
  | 'Language'
  | 'Framework'
  | 'Tool'
  | 'Cloud'
  | 'Soft Skill';

export type ProjectCategory =
  | 'machine-learning'
  | 'computer-vision'
  | 'nlp'
  | 'web-development';

export interface SkillNode {
  name: string;
  category: SkillCategory;
  level: Proficiency;
  /** 1 = inner/Expert, 2 = middle/Advanced, 3 = outer/Proficient */
  orbit: 1 | 2 | 3;
  /** Key into the icon registry in src/components/icons/ (Stage 5). */
  icon: string;
  /** One specific, technical line for the hover tooltip. */
  blurb: string;
}

export interface ProjectMetric {
  label: string;
  value: string;
}

/**
 * The HuggingFace-style model card (§8.1/S1) — the expanded view behind a project.
 *
 * Every field here must trace to something real in the repo. Fields the repo does
 * not state are `null` and are not rendered.
 */
export interface ModelCard {
  /** e.g. "ResNet-18" — mirrors Project.architecture, restated for a standalone card. */
  architecture: string;
  /** e.g. "11.2M". Null when the repo never reports a parameter count. */
  params: string | null;
  /** e.g. "CIFAR-10 · 50k train / 10k test". */
  dataset: string;
  /** e.g. "1× T4, mixed precision". Null when unlogged. */
  hardware: string | null;
  /** Null when the repo does not state an epoch count. */
  epochs: number | null;
  /** e.g. "SGD with momentum". Null when unlogged. */
  optimizer: string | null;
  /** Empty array when the repo lists no augmentation. */
  augmentation: string[];
  /** The full metric set. Project.metrics is the 2-item card-front subset of this. */
  metrics: ProjectMetric[];
  /** One honest sentence. Required — a model card without limitations is marketing. */
  limitations: string;
  /** Stage 6 / S2. Real logged curves only, downsampled to <= 48 points. */
  trainingCurve?: {
    epoch: number[];
    trainLoss: number[];
    valAcc: number[];
  };
  /** Stage 6 / S3. Real eval output only. */
  confusion?: {
    labels: string[];
    matrix: number[][];
  };
}

export interface Project {
  /** Kebab-case. Doubles as the /projects/[slug] param and the terminal's project id (§8.1/S4). */
  id: string;
  title: string;
  /** 2–3 lines max. */
  description: string;
  category: ProjectCategory;
  tags: string[];
  stack: string[];
  /** e.g. "ResNet-18". Null for non-model projects. */
  architecture: string | null;
  /** Card-front summary metrics. Null for non-ML projects; never fabricated (D8). */
  metrics: ProjectMetric[] | null;
  /**
   * Primary GitHub language, verbatim from the API (D7).
   *
   * A19 — NEVER surfaced on a card or detail page. GitHub's linguist counts
   * bytes, so `tokenizer` reports "Python" for a project whose engine is Rust.
   * `stack` is strictly more informative and leads with the real answer. This
   * field exists only for structured metadata (JSON-LD `programmingLanguage`).
   */
  language: string | null;
  stars: number;
  forks: number;
  featured: boolean;
  links: { github: string; demo?: string };
  /** Path under /public. Null means render the designed gradient placeholder, never stock art (AP-11). */
  image: string | null;
  /** The expanded §8.1/S1 card. Null for projects that are not models. */
  modelCard: ModelCard | null;
}

export interface LoaderStep {
  /** Seconds from loader mount. */
  at: number;
  text: string;
  progress?: number;
  done?: boolean;
}

export interface Strength {
  title: string;
  description: string;
  icon: string;
}

export interface Education {
  degree: string;
  institution: string;
  start: number;
  end: number;
  note?: string;
}

export interface ContactInfo {
  email: string;
  location: string;
  availability: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}

export interface SiteConfig {
  meta: {
    title: string;
    description: string;
    keywords: string[];
    url: string;
    ogImage: string;
  };
  hero: {
    name: string;
    title: string;
    typewriterPrefix: string;
    typewriterWords: string[];
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    scrollHint: string;
  };
  about: {
    bio: string[];
    avatar: string;
    education: Education[];
    strengths: Strength[];
    location: { label: string; sub: string; lat: number; lng: number };
  };
  skills: SkillNode[];
  projects: Project[];
  contact: ContactInfo;
  social: SocialLink[];
  loader: LoaderStep[];
  footer: {
    tagline: string;
    copyright: string;
    quickLinks: { label: string; href: string }[];
  };
  resumeUrl: string;
}
