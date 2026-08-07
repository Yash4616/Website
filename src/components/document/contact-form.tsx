'use client';

import { useState, type FormEvent } from 'react';

export function ContactForm({
  nameLabel,
  emailLabel,
  messageLabel,
  submitLabel,
}: {
  nameLabel: string;
  emailLabel: string;
  messageLabel: string;
  submitLabel: string;
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(data)),
    }).catch(() => null);

    if (response?.ok) {
      form.reset();
      setStatus('success');
    } else {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={submit} className="contact-form mt-7" noValidate>
      <div className="contact-field">
        <label htmlFor="contact-name">{nameLabel}</label>
        <input id="contact-name" name="name" autoComplete="name" required maxLength={100} />
      </div>
      <div className="contact-field">
        <label htmlFor="contact-email">{emailLabel}</label>
        <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} />
      </div>
      <div className="contact-field">
        <label htmlFor="contact-message">{messageLabel}</label>
        <textarea id="contact-message" name="message" rows={6} required maxLength={5000} />
      </div>
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="submit" className="instrument-button" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : submitLabel}
        </button>
        <p className="font-mono text-data text-ink-2" aria-live="polite">
          {status === 'success' ? 'Message sent.' : status === 'error' ? 'Message could not be sent. Please use the email address below.' : ''}
        </p>
      </div>
    </form>
  );
}

export default ContactForm;
