import type { FieldNode } from "@/content/site";
import { readingText } from "@/content/format";
import { CSS_COLOR, LENS } from "./config";
import type { World } from "./world";

/**
 * Canvas labels. Every piece of text in the Field is drawn once to an
 * offscreen 2D canvas (the atlas), uploaded as one texture, and then placed
 * as textured quads. The atlas is only redrawn when its content changes: a
 * resize of the pixel ratio, a tier change, or fonts arriving.
 */

export type Entry = {
  /** Size in CSS px. */
  w: number;
  h: number;
  u0: number;
  v0: number;
  u1: number;
  v1: number;
};

export type Fonts = { sans: string; mono: string };

const ATLAS_SIZE = 2048;
const PAD = 2;

type Line = { text: string; font: string; color: string; height: number; gapAfter?: number };

export class LabelAtlas {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private entries = new Map<string, Entry>();
  private cx = PAD;
  private cy = PAD;
  private rowH = 0;
  private overflow = false;
  /** Bumped whenever the pixels change. The renderer uploads when it differs. */
  version = 0;
  scale = 1;
  glyphAdvance = 7;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = ATLAS_SIZE;
    this.canvas.height = ATLAS_SIZE;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");
    this.ctx = ctx;
  }

  get(key: string): Entry | undefined {
    return this.entries.get(key);
  }

  /** Redraw every label. Lowers the raster scale until everything fits. */
  build(world: World, fonts: Fonts, dpr: number): void {
    let scale = dpr;
    for (let attempt = 0; attempt < 5; attempt++) {
      this.reset(scale);
      this.drawAll(world, fonts);
      if (!this.overflow) break;
      scale = Math.max(1, scale - 0.25);
    }
    this.version++;
  }

  private reset(scale: number): void {
    this.scale = scale;
    this.entries.clear();
    this.cx = PAD;
    this.cy = PAD;
    this.rowH = 0;
    this.overflow = false;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, ATLAS_SIZE, ATLAS_SIZE);
  }

  private alloc(w: number, h: number): { x: number; y: number } | null {
    const dw = Math.ceil(w * this.scale) + PAD;
    const dh = Math.ceil(h * this.scale) + PAD;
    if (this.cx + dw > ATLAS_SIZE) {
      this.cx = PAD;
      this.cy += this.rowH;
      this.rowH = 0;
    }
    if (this.cy + dh > ATLAS_SIZE) {
      this.overflow = true;
      return null;
    }
    const spot = { x: this.cx, y: this.cy };
    this.cx += dw;
    this.rowH = Math.max(this.rowH, dh);
    return spot;
  }

  /** `maxW` is one width for every line, or one width per line (the last repeats). */
  private wrap(text: string, font: string, maxW: number | number[], maxLines: number): string[] {
    const ctx = this.ctx;
    ctx.font = font;
    const widthOf = (i: number) => (typeof maxW === "number" ? maxW : maxW[Math.min(i, maxW.length - 1)]);
    const words = text.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const trial = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(trial).width > widthOf(lines.length)) {
        lines.push(line);
        line = word;
      } else {
        line = trial;
      }
    }
    if (line) lines.push(line);
    if (lines.length > maxLines) {
      const kept = lines.slice(0, maxLines);
      let last = kept[maxLines - 1];
      const lastW = widthOf(maxLines - 1);
      while (last.length > 1 && ctx.measureText(`${last}…`).width > lastW) last = last.slice(0, -1);
      kept[maxLines - 1] = `${last.replace(/[\s,;:.]+$/, "")}…`;
      return kept;
    }
    return lines;
  }

  /** Draw a block of lines and register it. `maxW` of 0 means size to the text. */
  private block(key: string, lines: Line[], maxW: number, align: "left" | "center"): void {
    const ctx = this.ctx;
    let w = 0;
    let h = 0;
    for (const l of lines) {
      ctx.font = l.font;
      w = Math.max(w, ctx.measureText(l.text).width);
      h += l.height + (l.gapAfter ?? 0);
    }
    w = Math.ceil(maxW > 0 ? maxW : w) + 2;
    h = Math.ceil(h) + 2;
    const spot = this.alloc(w, h);
    if (!spot) return;
    ctx.setTransform(this.scale, 0, 0, this.scale, spot.x, spot.y);
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = align;
    let y = 1;
    for (const l of lines) {
      ctx.font = l.font;
      ctx.fillStyle = l.color;
      // Baseline sits at roughly 78% of the line box for both families.
      ctx.fillText(l.text, align === "center" ? w / 2 : 1, y + l.height * 0.78);
      y += l.height + (l.gapAfter ?? 0);
    }
    this.entries.set(key, {
      w,
      h,
      u0: spot.x / ATLAS_SIZE,
      v0: spot.y / ATLAS_SIZE,
      u1: (spot.x + w * this.scale) / ATLAS_SIZE,
      v1: (spot.y + h * this.scale) / ATLAS_SIZE,
    });
  }

  private drawAll(world: World, fonts: Fonts): void {
    const { mono } = fonts;
    const ink = CSS_COLOR.ink;
    const muted = CSS_COLOR.muted;
    const signal = CSS_COLOR.signal;

    for (const wn of world.nodes) {
      this.drawNode(wn.node, fonts);
    }

    const tickFont = `400 11px ${mono}`;
    world.xTicks.forEach((t, i) => {
      this.block(`x:${i}`, [{ text: t.label, font: tickFont, color: muted, height: 14 }], 0, "left");
    });
    world.yTicks.forEach((t, i) => {
      this.block(
        `y:${i}`,
        [{ text: t.label, font: tickFont, color: t.major ? ink : muted, height: 14 }],
        0,
        "left",
      );
    });
    this.block("xt", [{ text: world.site.field.xTitle, font: tickFont, color: muted, height: 14 }], 0, "left");
    this.block("yt", [{ text: world.site.field.yTitle, font: tickFont, color: muted, height: 14 }], 0, "left");

    world.edges.forEach((e, i) => {
      this.block(
        `edge:${i}`,
        [{ text: e.skills.join(", "), font: `400 10.5px ${mono}`, color: muted, height: 13 }],
        0,
        "left",
      );
    });

    // Score glyphs for the query beams: digits are placed one by one, so a
    // new score never needs a new upload.
    const glyphFont = `500 11px ${mono}`;
    this.ctx.font = glyphFont;
    this.glyphAdvance = this.ctx.measureText("0").width;
    for (const ch of "0123456789.") {
      this.block(`g:i:${ch}`, [{ text: ch, font: glyphFont, color: ink, height: 14 }], this.glyphAdvance, "left");
      this.block(`g:s:${ch}`, [{ text: ch, font: glyphFont, color: signal, height: 14 }], this.glyphAdvance, "left");
    }

  }

  private drawNode(node: FieldNode, { sans, mono }: Fonts): void {
    const ink = CSS_COLOR.ink;
    const muted = CSS_COLOR.muted;
    const signal = CSS_COLOR.signal;
    const id = node.id;

    if (node.kind === "station") {
      const nameFont = `500 12.5px ${mono}`;
      this.block(`${id}:name`, [{ text: node.short, font: nameFont, color: ink, height: 17 }], 0, "left");
      const W = 200;
      const sentence = this.wrap(node.sentence, `400 12.5px ${sans}`, W, 3).map((text) => ({
        text,
        font: `400 12.5px ${sans}`,
        color: muted,
        height: 17,
      }));
      this.block(
        `${id}:full`,
        [{ text: node.name, font: nameFont, color: ink, height: 17, gapAfter: 2 }, ...sentence],
        W,
        "left",
      );
      const LW = 190;
      const lensSentence = this.wrap(node.sentence, `500 12.5px ${sans}`, LW, 4).map((text) => ({
        text,
        font: `500 12.5px ${sans}`,
        color: ink,
        height: 17,
      }));
      this.block(
        `${id}:lens`,
        [
          { text: node.name, font: `600 15px ${sans}`, color: signal, height: 20 },
          { text: node.period, font: `400 11px ${mono}`, color: muted, height: 15, gapAfter: 6 },
          ...lensSentence,
        ],
        LW,
        "center",
      );
      return;
    }

    const big = node.kind === "instrument";
    const nameFont = big ? `600 14px ${sans}` : `500 12.5px ${sans}`;
    this.block(
      `${id}:name`,
      [{ text: node.short, font: nameFont, color: ink, height: big ? 19 : 17 }],
      0,
      "left",
    );

    // Neighbourhood level: name, headline reading, one sentence.
    const W = big ? 236 : 204;
    const fullNameFont = big ? `600 15px ${sans}` : `600 13px ${sans}`;
    const readFont = big ? `500 13px ${mono}` : `500 12px ${mono}`;
    const bodyFont = big ? `400 12.5px ${sans}` : `400 12px ${sans}`;
    const reading = `${readingText(node.reading)} ${node.reading.label}`;
    const lines: Line[] = [
      ...this.wrap(node.name, fullNameFont, W, 2).map((text) => ({
        text,
        font: fullNameFont,
        color: ink,
        height: big ? 20 : 18,
      })),
      ...this.wrap(reading, readFont, W, 2).map((text) => ({
        text,
        font: readFont,
        color: ink,
        height: 18,
      })),
      ...this.wrap(node.sentence, bodyFont, W, big ? 4 : 3).map((text) => ({
        text,
        font: bodyFont,
        color: muted,
        height: 17,
      })),
    ];
    lines[0].gapAfter = 0;
    this.block(`${id}:full`, lines, W, "left");

    // The measured layer, seen through the lens: what it is, its reading and
    // its limitation.
    const LW = 190;
    const limFont = `500 12.5px ${sans}`;
    const labelFont = `400 11px ${mono}`;
    const titleFont = `600 14px ${sans}`;
    const titleLines = this.wrap(node.short, titleFont, LW, 1);
    const labelLines = this.wrap(node.reading.label, labelFont, LW, 2);
    // The readout is centred on the node and the dome bends hard near its rim,
    // so each limitation line is only as wide as the flat middle of the glass
    // is at that height. Without this the last line ran into the bend.
    const LIM_LINES = 3;
    const LIM_H = 16;
    const aboveLim = titleLines.length * 18 + 4 + 28 + labelLines.length * 14 + 7;
    const half = (aboveLim + LIM_LINES * LIM_H) / 2;
    const flat = LENS.radius * 0.8;
    const limWidths = Array.from({ length: LIM_LINES }, (_, k) => {
      const y = aboveLim + (k + 1) * LIM_H - half;
      return Math.min(LW, 2 * Math.sqrt(Math.max(0, flat * flat - y * y)));
    });
    const lens: Line[] = [
      ...titleLines.map((text, i) => ({
        text,
        font: titleFont,
        color: ink,
        height: 18,
        gapAfter: i === titleLines.length - 1 ? 4 : 0,
      })),
      { text: readingText(node.reading), font: `500 24px ${mono}`, color: signal, height: 28 },
      ...labelLines.map((text, i) => ({
        text,
        font: labelFont,
        color: muted,
        height: 14,
        gapAfter: i === labelLines.length - 1 ? 7 : 0,
      })),
      ...this.wrap(node.limitation, limFont, limWidths, LIM_LINES).map((text) => ({
        text,
        font: limFont,
        color: ink,
        height: 16,
      })),
    ];
    this.block(`${id}:lens`, lens, LW, "center");
  }
}
