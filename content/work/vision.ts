import type { InstrumentInput } from "../site";

/**
 * Source: C:\Dev\Build\Object_Detection_Semantic_Segmentation (results_report.txt,
 * README.md, PROJECT_DOCUMENTATION.md). The README and report prose give mean IoU
 * 96.04% and foreground accuracy 97.67%, but the generated results_report.txt gives
 * 0.9595 and 0.9745 with different per-class values: two runs. The site uses the
 * generated file. Detection figures agree in every source.
 */
export const vision: InstrumentInput = {
  kind: "instrument",
  id: "vision",
  name: "Object Detection and Segmentation",
  short: "Object Detection",
  pieces: ["Object", " Detect", "ion", " and", " Segment", "ation"],
  period: "Mar to May 2026",
  status: "complete",
  plot: { layer: 1.5, start: "2026-03", end: "2026-05" },
  skills: ["Python", "PyTorch", "NumPy"],
  sentence:
    "YOLOv8 detection and a from-scratch U-Net segmentation on 120,000 synthetic two-digit scenes, my minor project at JECRC.",
  what: "A two-task computer vision pipeline built from raw MNIST: find each digit with a box and a label, and classify every pixel by digit. 120,000 synthetic 128×128 scenes, YOLOv8 Small fine-tuned for detection, a 4-level U-Net written from scratch for segmentation, trained on 2 T4 GPUs in one notebook. My BCO074C minor project.",
  stack: ["Python", "PyTorch (AMP, DataParallel)", "Ultralytics YOLOv8 (DDP)", "NumPy", "Matplotlib", "Kaggle, 2× T4"],
  reading: {
    value: 94.39,
    decimals: 2,
    suffix: "%",
    label: "detection F1, YOLOv8 Small",
    sample: "10,000 held-out scenes, 20,000 digits, all from the unseen MNIST test digits",
    source: "results_report.txt. Segmentation on the same scenes: mean IoU 0.9595, pixel accuracy 0.9996.",
    scaleMax: 100,
    scaleLabel: "100%",
  },
  limitation:
    "Synthetic scenes with exactly two digits on a noisy background; nothing here is tested on real photographs. Precision (0.9111) trails recall (0.9792): the detector raises more false detections than it misses digits.",
  finding:
    "Moving from 60,000 to 100,000 training scenes and from YOLOv8 nano to small raised detection F1 from 92.87% to 94.39%. Loading all 120,000 scenes into RAM (about 3.2 GB) took GPU use from 10 to 40% up to 86 to 90%.",
  story: {
    problem:
      "MNIST holds one centred digit per image. Reading meters, forms or postcodes needs several digits at once, anywhere in the frame, on varied backgrounds.",
    approach:
      "Generate the data with labels for free: two random MNIST digits per 128×128 scene on a noisy coloured background, scaled and rotated in training only, with boxes and per-pixel masks saved alongside. The test split uses the official MNIST test digits, never seen in training. YOLOv8 Small handles detection; a 4-level U-Net written from scratch handles segmentation.",
    result:
      "On 10,000 held-out scenes YOLOv8 Small finds 19,585 of 20,000 digits: recall 0.9792, precision 0.9111, F1 0.9439. The U-Net reaches mean IoU 0.9595 and pixel accuracy 0.9996, with every digit class above 0.94 IoU.",
  },
  spec: [
    { k: "Dataset", v: "120,000 scenes at 128×128: 100,000 train, 10,000 validation, 10,000 test from the MNIST test digits" },
    {
      k: "Detector",
      v: "YOLOv8 Small, 11.2M parameters, COCO-pretrained, fine-tuned for 10 classes; batch 256, AdamW, cosine decay, fp16, DDP on 2 T4s",
    },
    {
      k: "Segmenter",
      v: "U-Net from scratch, 4 levels (32 to 256 channels, 512 at the bottleneck), about 7.8M parameters; batch 512, AdamW, mixed precision, DataParallel",
    },
    { k: "Detection, per digit", v: "F1 from 0.9105 (digit 1) to 0.9706 (digit 3), at IoU 0.5 and confidence 0.25" },
    { k: "Segmentation, per digit", v: "IoU from 0.9403 (digit 9) to 0.9656 (digit 0); background 0.9998" },
    { k: "Engineering", v: "Batch size set from available VRAM; all scenes held in RAM; early stopping with the best checkpoint reloaded" },
    { k: "Course", v: "BCO074C Minor Project, JECRC University" },
  ],
  links: [{ label: "Code on GitHub", href: "https://github.com/Yash4616/Object_Detection_Semantic_Segmentation" }],
  bench: {
    kind: "compare",
    title: "Vision bench",
    groups: [
      {
        id: "overall",
        label: "Overall",
        caption: "10,000 held-out scenes. Axis from 0.85.",
        floor: 0.85,
        ceiling: 1,
        decimals: 4,
        suffix: "",
        bars: [
          { label: "Detection precision", value: 0.9111, emphasis: false },
          { label: "Detection recall", value: 0.9792, emphasis: false },
          { label: "Detection F1", value: 0.9439, emphasis: true },
          { label: "Segmentation mean IoU", value: 0.9595, emphasis: true },
          { label: "Foreground accuracy", value: 0.9745, emphasis: false },
          { label: "Pixel accuracy", value: 0.9996, emphasis: false },
        ],
      },
      {
        id: "det",
        label: "Detection, per digit",
        caption: "YOLOv8 Small F1 per digit class. Axis from 0.85.",
        floor: 0.85,
        ceiling: 1,
        decimals: 4,
        suffix: "",
        bars: [
          { label: "Digit 0", value: 0.9318, emphasis: false },
          { label: "Digit 1", value: 0.9105, emphasis: true },
          { label: "Digit 2", value: 0.9439, emphasis: false },
          { label: "Digit 3", value: 0.9706, emphasis: false },
          { label: "Digit 4", value: 0.9577, emphasis: false },
          { label: "Digit 5", value: 0.9504, emphasis: false },
          { label: "Digit 6", value: 0.9509, emphasis: false },
          { label: "Digit 7", value: 0.9454, emphasis: false },
          { label: "Digit 8", value: 0.9478, emphasis: false },
          { label: "Digit 9", value: 0.939, emphasis: false },
        ],
      },
      {
        id: "seg",
        label: "Segmentation, per digit",
        caption: "U-Net IoU per digit class. Axis from 0.85.",
        floor: 0.85,
        ceiling: 1,
        decimals: 4,
        suffix: "",
        bars: [
          { label: "Digit 0", value: 0.9656, emphasis: false },
          { label: "Digit 1", value: 0.9522, emphasis: false },
          { label: "Digit 2", value: 0.9625, emphasis: false },
          { label: "Digit 3", value: 0.9617, emphasis: false },
          { label: "Digit 4", value: 0.9469, emphasis: false },
          { label: "Digit 5", value: 0.9492, emphasis: false },
          { label: "Digit 6", value: 0.9606, emphasis: false },
          { label: "Digit 7", value: 0.9535, emphasis: false },
          { label: "Digit 8", value: 0.9626, emphasis: false },
          { label: "Digit 9", value: 0.9403, emphasis: true },
        ],
      },
    ],
  },
};
