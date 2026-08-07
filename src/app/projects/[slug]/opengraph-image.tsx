import { ImageResponse } from 'next/og';
import { getProjectById } from '@/data/config';

export const runtime = 'edge';
export const alt = 'Yash Gurjar project record';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function ProjectOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProjectById((await params).slug);
  const metric = project?.spec[0];
  return new ImageResponse(
    (
      <div style={{ background: '#0E0E10', color: '#E8E6E1', display: 'flex', height: '100%', width: '100%', padding: '70px', flexDirection: 'column', fontFamily: 'Arial, sans-serif', border: '2px solid #33333A' }}>
        <div style={{ color: '#FF5A1F', fontSize: 24, letterSpacing: 4 }}>YASH GURJAR · SELECTED WORK</div>
        <div style={{ display: 'flex', height: 2, background: '#33333A', width: '100%', marginTop: 30 }} />
        <div style={{ fontSize: 56, lineHeight: 1.1, marginTop: 48 }}>{project?.title ?? 'Project record'}</div>
        <div style={{ color: '#9A968E', fontSize: 28, marginTop: 34 }}>{metric ? `${metric.label.toUpperCase()} · ${metric.value}` : ''}</div>
        <div style={{ marginTop: 'auto', color: '#8A857C', fontSize: 22 }}>yash.systems</div>
      </div>
    ),
    size
  );
}
