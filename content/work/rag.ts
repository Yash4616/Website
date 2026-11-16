import type { InstrumentInput } from "../site";

/** Sources: build brief facts; C:\Dev\Sandbox\Rag (CLAUDE.md, docs/ABOUT.md, ARCHITECTURE.md, TECHNICAL.md). */
export const rag: InstrumentInput = {
  kind: "instrument",
  id: "rag",
  name: "Evaluation-Driven Local RAG",
  short: "Local RAG",
  pieces: ["Eval", "uation", "-", "Driven", " Local", " RAG"],
  period: "Jun to Jul 2026",
  status: "complete",
  plot: { layer: 3, start: "2026-06", end: "2026-07" },
  skills: ["Python", "SQL", "PostgreSQL", "FastAPI", "RAG", "LLM evaluation", "vector search"],
  sentence:
    "Retrieval-augmented generation over 5 ML books, built evaluation-first, on one laptop with a 6 GB GPU.",
  what: "Retrieval-augmented generation over 5 ML books, built evaluation-first: a fixed, hand-labelled query set decides every change. Embeddings, retrieval, reranking, generation and the judge all run locally on one laptop with a 6 GB GPU. No cloud calls at runtime or in evaluation.",
  stack: [
    "Python 3.12",
    "PostgreSQL 17 + pgvector",
    "bge-m3 embeddings",
    "bm25s",
    "bge-reranker-v2-m3",
    "qwen2.5:7b via Ollama",
    "FastAPI",
    "React",
    "No LangChain",
  ],
  reading: {
    value: 0.942,
    decimals: 3,
    suffix: "",
    label: "recall@5",
    sample: "n = 43 answerable queries from a 48-query gold set",
    source: "Hybrid + rerank, the shipped configuration. Hand-labelled gold set.",
    scaleMax: 1,
    scaleLabel: "1",
  },
  limitation:
    "Only 5 paraphrase and 2 multi-hop queries; the judge is the same model as the generator; 1 of 5 unanswerable questions is still answered.",
  finding:
    "On the first 25 queries the reranker seemed to win every metric. At 48 queries its top-1 lead vanished. Dense is the best top-1 ranker; hybrid + rerank wins recall@5, which is what feeds the generator.",
  story: {
    problem:
      "Answer questions over 5 ML books on one laptop with a 6 GB GPU and no cloud calls, and know how often the answers are right.",
    approach:
      "Evaluation came first: a hand-labelled gold set of 48 queries, 43 answerable and 5 unanswerable, with retrieval scored by recall@k, MRR and NDCG, and answers judged locally for faithfulness, relevancy and context. Three retrieval configurations ran against the same 1,721 chunks. 41 tests. No LangChain.",
    result:
      "Hybrid + rerank ships with recall@5 of 0.942 against 0.884 for dense, and refuses 4 of 5 unanswerable questions against 2 of 5. Context recall rose from 0.556 to 0.716. Dense still ranks best at top-1: R@1 of 0.616 against 0.570.",
  },
  spec: [
    { k: "Corpus", v: "5 ML books, 1,721 chunks after 24,286 repeated header and footer lines were stripped" },
    { k: "Gold set", v: "48 queries: 36 factoid, 5 paraphrase, 2 multi-hop, 5 unanswerable" },
    {
      k: "Pipeline",
      v: "Token-aware recursive chunker (about 900 tokens, 15% overlap); bge-m3 into pgvector with an HNSW cosine index; dense top-50 and BM25 top-50 fused by RRF (k = 60); cross-encoder rerank to 5; answers cite chunk IDs or refuse",
    },
    {
      k: "Evaluation",
      v: "Retrieval: recall@k, MRR, NDCG@10. Generation: faithfulness, answer relevancy, context precision and context recall, judged by qwen2.5:7b at temperature 0",
    },
    { k: "Tests", v: "41; ruff and mypy clean" },
    { k: "Hardware", v: "One laptop, 6 GB GPU, no cloud calls" },
    {
      k: "Stack",
      v: "Python 3.12, PostgreSQL 17 + pgvector, bge-m3 embeddings, bm25s, bge-reranker-v2-m3, qwen2.5:7b via Ollama, FastAPI, React. No LangChain.",
    },
  ],
  links: [{ label: "Code on GitHub", href: "https://github.com/Yash4616/Rag" }],
  bench: {
    kind: "retrieval",
    title: "Retrieval bench",
    n: 43,
    decimals: 3,
    metrics: [
      { key: "r1", label: "R@1", onBench: true },
      { key: "r3", label: "R@3", onBench: true },
      { key: "r5", label: "R@5", onBench: true },
      { key: "r10", label: "R@10", onBench: true },
      { key: "mrr", label: "MRR", onBench: true },
      { key: "ndcg10", label: "NDCG@10", onBench: false },
    ],
    generationLabels: [
      { key: "faithfulness", label: "Faithfulness" },
      { key: "relevancy", label: "Relevancy" },
      { key: "contextPrecision", label: "Context precision" },
      { key: "contextRecall", label: "Context recall" },
    ],
    stages: [
      { id: "dense", label: "dense top-50" },
      { id: "bm25", label: "BM25 top-50" },
      { id: "rrf", label: "RRF fusion" },
      { id: "rerank", label: "rerank" },
      { id: "top5", label: "top-5" },
      { id: "answer", label: "cited answer" },
    ],
    configs: [
      {
        id: "dense",
        label: "Dense",
        shipped: false,
        stages: ["dense", "top5", "answer"],
        retrieval: { r1: 0.616, r3: 0.86, r5: 0.884, r10: 0.93, mrr: 0.753, ndcg10: 0.799 },
        generation: {
          faithfulness: 0.665,
          relevancy: 0.874,
          contextPrecision: 0.686,
          contextRecall: 0.556,
          refused: 2,
          unanswerable: 5,
        },
      },
      {
        id: "hybrid",
        label: "Hybrid",
        shipped: false,
        stages: ["dense", "bm25", "rrf", "top5", "answer"],
        retrieval: { r1: 0.407, r3: 0.791, r5: 0.86, r10: 0.919, mrr: 0.62, ndcg10: 0.687 },
        generation: null,
      },
      {
        id: "rerank",
        label: "Hybrid + rerank",
        shipped: true,
        stages: ["dense", "bm25", "rrf", "rerank", "top5", "answer"],
        retrieval: { r1: 0.57, r3: 0.895, r5: 0.942, r10: 0.954, mrr: 0.729, ndcg10: 0.783 },
        generation: {
          faithfulness: 0.67,
          relevancy: 0.926,
          contextPrecision: 0.754,
          contextRecall: 0.716,
          refused: 4,
          unanswerable: 5,
        },
      },
    ],
    topOneNote: "Dense wins R@1. The shipped configuration wins R@5, which is what feeds the generator.",
    refusalLabel: "Unanswerable questions refused",
    refusalMissing: "Generation was not measured for this configuration.",
  },
};
