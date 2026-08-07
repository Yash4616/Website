import { siteConfig } from '@/data/config';
import { DocumentUtilities } from '@/components/document/document-utilities';

const citation = `@misc{gurjar2026,
  author = {Gurjar, Yash},
  title  = {Yash Gurjar — AI & ML Engineer},
  year   = {2026},
  url    = {https://www.yash.systems}
}`;

export function Colophon() {
  const date = new Date().toISOString().slice(0, 10);
  return (
    <footer className="doc-grid pb-24 pt-20">
      <hr className="rule col-full mb-6" />
      <div className="col-margin"><span className="label">Colophon</span></div>
      <div className="col-measure">
        <p className="max-w-[68ch] text-note text-ink-2">{siteConfig.colophon.join(' ')}</p>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-rule pt-4">
          <p className="label">Last revised <time dateTime={date}>{date}</time> · {siteConfig.masthead.revision} · j / k sections · g h top</p>
          <DocumentUtilities citation={citation} />
        </div>
      </div>
    </footer>
  );
}

export default Colophon;
