import { ImageResponse } from 'next/og';
import { siteConfig } from '@/data/config';

/**
 * A12 — moved here from Stage 8.
 *
 * `layout.tsx` has been advertising `/og-image.png` since before this rebuild,
 * and that file does not exist — every share of this site currently resolves a
 * 404 for its preview image. Generating it from `siteConfig` closes that today
 * and guarantees it can never drift from the site's own copy (§9.4).
 *
 * Next injects both `og:image` and `twitter:image` from this file convention,
 * which is why layout.tsx declares neither.
 */

export const alt = 'Yash Gurjar — AI & ML Engineer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#030303',
          padding: '72px 80px',
          position: 'relative',
        }}
      >
        {/* Cyan bleed, top-left — the accent discipline of §4.1 in one mark. */}
        <div
          style={{
            position: 'absolute',
            top: -220,
            left: -160,
            width: 720,
            height: 720,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(0,240,255,0.18) 0%, rgba(0,240,255,0) 70%)',
            display: 'flex',
          }}
        />
        {/* Violet bleed, bottom-right — strictly secondary. */}
        <div
          style={{
            position: 'absolute',
            bottom: -260,
            right: -180,
            width: 760,
            height: 760,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(138,43,226,0.20) 0%, rgba(138,43,226,0) 70%)',
            display: 'flex',
          }}
        />

        {/* Monogram */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: 14,
              border: '2px solid rgba(0,240,255,0.45)',
              color: '#00F0FF',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: -1,
            }}
          >
            YG
          </div>
          <div
            style={{
              display: 'flex',
              color: '#6E6E6E',
              fontSize: 22,
              letterSpacing: 6,
              textTransform: 'uppercase',
            }}
          >
            yash.systems
          </div>
        </div>

        {/* Name + role */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 118,
              fontWeight: 700,
              letterSpacing: -4,
              backgroundImage: 'linear-gradient(135deg, #00F0FF, #8A2BE2)',
              backgroundClip: 'text',
              color: 'transparent',
              lineHeight: 1.05,
            }}
          >
            {siteConfig.hero.name}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 18,
              fontSize: 44,
              color: '#FAFAFA',
              fontWeight: 300,
              letterSpacing: 1,
            }}
          >
            {siteConfig.hero.title}
          </div>
        </div>

        {/* Focus areas */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {['Computer Vision', 'Neural Networks', 'TensorFlow', 'PyTorch'].map(
            (label) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  padding: '12px 26px',
                  borderRadius: 9999,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#A0A0A0',
                  fontSize: 24,
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    ),
    size
  );
}
