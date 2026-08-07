import { NextResponse } from 'next/server';
import { z } from 'zod';
import { siteConfig } from '@/data/config';

const requestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email().max(254),
  message: z.string().trim().min(1).max(5000),
  website: z.string().max(0).optional(),
});
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 3;
const attempts = new Map<string, number[]>();

function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

function withinLimit(ip: string): boolean {
  const cutoff = Date.now() - WINDOW_MS;
  const recent = (attempts.get(ip) ?? []).filter((time) => time > cutoff);
  if (recent.length >= MAX_REQUESTS) {
    attempts.set(ip, recent);
    return false;
  }
  recent.push(Date.now());
  attempts.set(ip, recent);
  return true;
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid submission.' }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ ok: true });
  if (!withinLimit(clientIp(request))) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Contact delivery is not configured.' }, { status: 503 });

  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? 'yash.systems <onboarding@resend.dev>',
      to: [process.env.CONTACT_TO_EMAIL ?? siteConfig.contact.email],
      reply_to: parsed.data.email,
      subject: `Portfolio contact from ${parsed.data.name}`,
      text: `Name: ${parsed.data.name}\nEmail: ${parsed.data.email}\n\n${parsed.data.message}`,
    }),
  }).catch(() => null);

  if (!result?.ok) return NextResponse.json({ error: 'Delivery failed.' }, { status: 502 });
  return NextResponse.json({ ok: true });
}
