import type { InstrumentInput } from "../site";

/** Sources: build brief facts; C:\Dev\Yash\03 Open Source (from his OSS Chronicle); PR states read from the GitHub API on 15 Nov 2026. */
export const pytorch: InstrumentInput = {
  kind: "instrument",
  id: "pytorch",
  name: "PyTorch contributions",
  short: "PyTorch",
  pieces: ["Py", "Torch", " contrib", "utions"],
  period: "Jul to Sep 2026",
  status: "merged",
  plot: { layer: 0.95, start: "2026-07", end: "2026-09" },
  skills: ["Python", "PyTorch"],
  sentence:
    "3 merged PRs in PyTorch: a Dynamo fix for torch.compile, an ONNX test fix and a CMake fix.",
  what: "3 merged PRs in PyTorch, including a fix in Dynamo, the torch.compile frontend, and 1 withdrawn. Outside PyTorch: 3 merged Hindi translation PRs in Hugging Face Hub and 1 open in the Kubernetes website. Total across projects: 8 PRs, 6 merged.",
  stack: ["Python", "PyTorch Dynamo", "ONNX", "CMake"],
  reading: {
    value: 3,
    decimals: 0,
    suffix: "",
    label: "PRs merged in PyTorch",
    sample: "8 PRs across projects, 6 merged",
    source: "github.com/pytorch/pytorch, July to September 2026.",
    scaleMax: 8,
    scaleLabel: "8 PRs",
  },
  limitation: "Three merged PRs is a start, not a track record, and one was withdrawn.",
  finding: null,
  story: {
    problem:
      "torch.compile raised a TypeError on some traces. Dynamo modelled UserMethodVariable as a subclass of UserFunctionVariable, but in CPython a bound method composes its function (im_func, im_self). The subclassing dropped self.",
    approach:
      "PR #193593: UserMethodVariable now inherits BaseUserFunctionVariable and composes the function, mirroring PyMethodObject, with its delegation read from CPython's own method code. 20 files, +886 / -130. Checked against a nightly with identical Dynamo files across 5 test files (1,394 tests); every error seen was reproduced on the unpatched nightly first.",
    result:
      "Merged 16 Sep 2026. Two more are merged: #189734 routed CUDA export tests to the CUDA provider and took a bfloat16 test from 32 errors to passing, with all 312 tests in the file passing; #188793 fixed detection of system Eigen 5.0.x.",
  },
  spec: [
    { k: "Merged in PyTorch", v: "3 PRs: #193593, #189734, #188793" },
    { k: "Largest change", v: "#193593 [dynamo]: 20 files, +886 / -130" },
    {
      k: "#193593 checks",
      v: "test_functions (535), test_decorators (100), test_higher_order_ops (224), test_modules (147), test_repros (388)",
    },
    { k: "Withdrawn", v: "#190432 [c10d], closed by me" },
    { k: "Hugging Face Hub", v: "3 merged Hindi translation PRs: #4428, #4463, #4464" },
    { k: "Kubernetes website", v: "1 open Hindi localisation PR: #56506" },
    { k: "Total", v: "8 PRs across projects, 6 merged" },
  ],
  links: [
    { label: "PR #193593", href: "https://github.com/pytorch/pytorch/pull/193593" },
    { label: "PR #189734", href: "https://github.com/pytorch/pytorch/pull/189734" },
    { label: "PR #188793", href: "https://github.com/pytorch/pytorch/pull/188793" },
  ],
  bench: {
    kind: "diff",
    title: "Diff bench",
    base: "BaseUserFunctionVariable",
    fn: "UserFunctionVariable",
    method: "UserMethodVariable",
    cpython: "PyMethodObject",
    fields: ["im_func", "im_self"],
    beforeLabel: "Before",
    afterLabel: "After #193593",
    beforeNote:
      "The method variable subclassed the function variable. Some traces dropped self and torch.compile raised a TypeError.",
    afterNote:
      "The method variable inherits the base and composes its function, the way CPython's PyMethodObject holds im_func and im_self.",
    subclassLabel: "subclasses",
    inheritLabel: "inherits",
    composeLabel: "composes",
  },
};
