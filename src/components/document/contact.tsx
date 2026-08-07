import { siteConfig } from '@/data/config';
import { ContactForm } from '@/components/document/contact-form';

export function Contact() {
  const { correspondence, contact, links, resumeUrl } = siteConfig;
  return (
    <div className="col-measure mt-8">
      <p className="max-w-[68ch]">{correspondence.intro}</p>
      <ContactForm
        nameLabel={correspondence.nameLabel}
        emailLabel={correspondence.emailLabel}
        messageLabel={correspondence.messageLabel}
        submitLabel={correspondence.submitLabel}
      />
      <dl className="mt-10 border-t border-rule font-mono text-data">
        <div className="grid grid-cols-[8rem_1fr] border-b border-rule py-3 max-sm:grid-cols-1 max-sm:gap-y-1">
          <dt className="label">Email</dt>
          <dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd>
        </div>
        <div className="grid grid-cols-[8rem_1fr] border-b border-rule py-3 max-sm:grid-cols-1 max-sm:gap-y-1">
          <dt className="label">Location</dt>
          <dd>{contact.location}</dd>
        </div>
        <div className="grid grid-cols-[8rem_1fr] border-b border-rule py-3 max-sm:grid-cols-1 max-sm:gap-y-1">
          <dt className="label">Availability</dt>
          <dd>{contact.availability}</dd>
        </div>
        <div className="grid grid-cols-[8rem_1fr] border-b border-rule py-3 max-sm:grid-cols-1 max-sm:gap-y-1">
          <dt className="label">Links</dt>
          <dd className="flex flex-wrap gap-x-4 gap-y-2">
            {links.map((link) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}
            <a href={resumeUrl} target="_blank" rel="noreferrer">Résumé</a>
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default Contact;
