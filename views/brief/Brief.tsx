import Link from "next/link";
import { CompetitionList } from "@/components/CompetitionList";
import { site, instruments, readingText, type Instrument, type Reading } from "@/content/site";

/**
 * The Brief view: the executive view and the accessible baseline.
 * A server component. It renders complete, semantic HTML with no JavaScript.
 */

export function Pair({ reading, limitation }: { reading: Reading; limitation: string }) {
  return (
    <dl className="pair">
      <div>
        <dt>{site.labels.reading}</dt>
        <dd>
          <span className="fig">{readingText(reading)}</span>
          {reading.label}
          <span className="sub">{reading.sample}</span>
        </dd>
      </div>
      <div>
        <dt>{site.labels.limitation}</dt>
        <dd className="lim">{limitation}</dd>
      </div>
    </dl>
  );
}

function InstrumentRow({ node }: { node: Instrument }) {
  return (
    <article className="row" id={node.id} data-node={node.id}>
      <div className="row-head">
        <h3>
          <Link href={`/work/${node.id}`}>{node.name}</Link>
        </h3>
        <p className="row-meta">
          {node.period}, {node.status}
        </p>
      </div>
      <p className="row-sentence">{node.sentence}</p>
      <Pair reading={node.reading} limitation={node.limitation} />
      {node.competitions ? <CompetitionList entries={node.competitions} /> : null}
      <p className="row-links">
        <Link href={`/work/${node.id}`} className="no-print">
          Full write-up
        </Link>
        {node.links.map((l) => (
          <a key={l.href} href={l.href} rel="noopener">
            {l.label}
          </a>
        ))}
      </p>
    </article>
  );
}

export function Actions() {
  const { person } = site;
  const [github, linkedin] = person.links;
  return (
    <nav className="b-actions" aria-label="Contact">
      <a className="btn btn-cta" href={person.resume} download>
        Download résumé
      </a>
      <a className="btn" href={`mailto:${person.email}`}>
        Email
      </a>
      <a className="btn" href={github.href} rel="noopener">
        {github.label}
      </a>
      <a className="btn" href={linkedin.href} rel="noopener">
        {linkedin.label}
      </a>
    </nav>
  );
}

export function Footer() {
  const { person } = site;
  return (
    <footer className="b-foot" id="contact" data-node="contact">
      <p className="rule-line">{person.rule}</p>
      <p className="contact">
        <a href={`mailto:${person.email}`}>{person.email}</a>
        {person.links.map((l) => (
          <a key={l.href} href={l.href} rel="noopener">
            <span className="no-print">{l.label}</span>
            <span className="print-only">{l.href.replace("https://", "")}</span>
          </a>
        ))}
        <a href={person.resume} download className="no-print">
          Résumé (PDF)
        </a>
      </p>
      <p className="fine">
        {person.availability} {person.availabilityDetail}
      </p>
    </footer>
  );
}

export function Brief() {
  const { person, openSource } = site;
  return (
    <main className="brief" id="brief">
      <header>
        <h1 className="b-name">{person.name}</h1>
        <p className="b-title">
          {person.title}. {person.line}
        </p>
        <p className="b-avail">
          <strong>{person.availability}</strong> {person.availabilityDetail}
        </p>
      </header>

      <ul className="b-proofs" aria-label="Three proofs">
        {person.proofs.map((p) => (
          <li key={p.text}>
            <span className="fig">{readingText(p)}</span>
            <span>{p.text}</span>
          </li>
        ))}
      </ul>

      <Actions />

      <section className="b-section" id="work" aria-labelledby="work-h">
        <h2 id="work-h">Selected work</h2>
        <p className="b-lede">
          Each project gives one reading and one limitation, set at the same weight.
        </p>
        {instruments.map((node) => (
          <InstrumentRow key={node.id} node={node} />
        ))}
      </section>

      <section className="b-section" id="open-source" aria-labelledby="oss-h">
        <h2 id="oss-h">Open source</h2>
        <p className="b-lede">{openSource.summary}</p>
        <ul className="prs">
          {openSource.prs.map((pr) => (
            <li key={pr.number}>
              <p className="pr-id">
                {pr.href ? (
                  <a href={pr.href} rel="noopener">
                    {pr.number}
                  </a>
                ) : (
                  pr.number
                )}
                <span className="repo">{openSource.projects[pr.repo]}</span>
                {pr.area ? <span className="area">{pr.area}</span> : null}
              </p>
              <div className="pr-body">
                <p>
                  {pr.title}.{" "}
                  <span className="status" data-status={pr.status}>
                    {pr.statusNote}
                  </span>
                </p>
                {pr.detail ? <p className="detail">{pr.detail}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="b-section" id="education" data-node="background" aria-labelledby="edu-h">
        <h2 id="edu-h">Education</h2>
        <dl className="facts">
          <div>
            <dt>{person.education.years}</dt>
            <dd>
              {person.education.degree}
              <br className="edu-break" />
              <span className="edu-sep">, </span>
              {person.education.school}. {person.education.grade}. {person.education.graduates}.
            </dd>
          </div>
          <div>
            <dt>Certificates</dt>
            <dd>{person.education.certifications}</dd>
          </div>
        </dl>
      </section>

      <section className="b-section" id="skills" aria-labelledby="skills-h">
        <h2 id="skills-h">Skills</h2>
        <dl className="facts">
          {person.skills.map((s) => (
            <div key={s.group}>
              <dt>{s.group}</dt>
              <dd>{s.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Footer />
    </main>
  );
}
