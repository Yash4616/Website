import { ImageResponse } from "next/og";

// iOS ignores SVG icons, so app/icon.svg alone leaves a blank tile when the
// site is added to a home screen. This is the same glyph (the instrument's
// ring and core) as a PNG, without the rounded corners: iOS applies its own.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0d0e0f" }}>
        <svg width="180" height="180" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="9" fill="none" stroke="#e9e6df" strokeWidth="2.2" />
          <circle cx="16" cy="16" r="3.3" fill="#ff5a1f" />
        </svg>
      </div>
    ),
    size,
  );
}
