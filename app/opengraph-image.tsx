import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/content/site";
import { readingText } from "@/content/format";

export const alt = `${site.person.name}, ${site.person.title}. ${site.person.line}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// OFL fonts, read at build time from the repo (assets/fonts).
const archivo = await readFile(join(process.cwd(), "assets/fonts/Archivo-SemiBold.ttf"));
const plex = await readFile(join(process.cwd(), "assets/fonts/IBMPlexMono-Regular.ttf"));

const C = { bg: "#0d0e0f", ink: "#e9e6df", muted: "#8b877f", rule: "#2a2b2c", signal: "#ff5a1f" };

export default async function Image() {
  const { person } = site;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: C.bg,
          color: C.ink,
          fontFamily: "Archivo",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, lineHeight: 1, letterSpacing: -2 }}>{person.name}</div>
          <div style={{ marginTop: 22, fontSize: 34 }}>
            {`${person.title}. ${person.line}`}
          </div>
          <div style={{ marginTop: 10, fontSize: 26, color: C.muted }}>{person.availability}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", borderTop: `1px solid ${C.rule}` }}>
          {person.proofs.map((p) => (
            <div
              key={p.text}
              style={{ display: "flex", alignItems: "baseline", padding: "14px 0", borderBottom: `1px solid ${C.rule}` }}
            >
              <div style={{ width: 120, fontFamily: "Plex", fontSize: 34, color: C.ink }}>{readingText(p)}</div>
              <div style={{ fontSize: 26 }}>{p.text}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Archivo", data: archivo, style: "normal", weight: 600 },
        { name: "Plex", data: plex, style: "normal", weight: 400 },
      ],
    },
  );
}
