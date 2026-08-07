import { ImageResponse } from 'next/og';
import { siteConfig } from '@/data/config';

export const runtime = 'edge';
export const alt = 'Yash Gurjar — AI and ML Engineer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ background: '#0E0E10', color: '#E8E6E1', display: 'flex', width: '100%', height: '100%', padding: '70px', flexDirection: 'column', fontFamily: 'Arial, sans-serif', border: '2px solid #33333A' }}>
        <div style={{ color: '#FF5A1F', fontSize: 24, letterSpacing: 4 }}>AI &amp; ML ENGINEER · JAIPUR, IN</div>
        <div style={{ display: 'flex', height: 2, background: '#33333A', width: '100%', marginTop: 30 }} />
        <div style={{ fontSize: 76, fontWeight: 700, marginTop: 60 }}>{siteConfig.masthead.name.toUpperCase()}</div>
        <div style={{ color: '#9A968E', fontSize: 30, marginTop: 26 }}>{siteConfig.meta.description}</div>
        <div style={{ marginTop: 'auto', color: '#8A857C', fontSize: 22 }}>yash.systems · REV 3.0</div>
      </div>
    ),
    size
  );
}
