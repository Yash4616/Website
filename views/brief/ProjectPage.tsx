import Link from "next/link";
import { CompetitionList } from "@/components/CompetitionList";
import { site, tablesFor, type Instrument } from "@/content/site";
import { Footer, Pair } from "./Brief";

/**
 * /work/<slug> in the Brief view: one project's section, server-rendered.
 * This is also what the portal URL shows when JavaScript is off.
 */
export function ProjectPage({ node }: { node: Instrument }) {
  const beats = site.labels.beats;
  const story = [
    { label: beats.problem, text: node.story.problem },
    { label: beats.approach, text: node.story.approach },
    { label: beats.result, text: node.story.result },
    { label: beats.limitation, text: node.limitation },
  ];
  const tables = tablesFor(node);

  return (
    <main className="brief" id="brief">
      <Link href={`/#${node.id}`} className="back no-print">
        All work
      </Link>
      <article data-project={node.id}>
        <header>
          <h1 className="p-name">{node.name}</h1>
          <p className="row-meta" style={{ marginTop: 12 }}>
            {node.period}, {node.status}
          </p>
          <p className="p-what">{node.what}</p>
        </header>

        <Pair reading={node.reading} limitation={node.limitation} />
        <p className="pair-source row-meta" style={{ marginTop: 8 }}>
          {node.reading.source}
        </p>

        <ol className="beats">
          {story.map((b) => (
            <li key={b.label}>
              <h2>{b.label}</h2>
              <p>{b.text}</p>
            </li>
          ))}
          {node.finding ? (
            <li>
              <h2>{site.labels.finding}</h2>
              <p>{node.finding}</p>
            </li>
          ) : null}
        </ol>

        {node.competitions ? (
          <section className="b-section" aria-labelledby="record-h">
            <h2 id="record-h">Every entry</h2>
            <CompetitionList entries={node.competitions} />
          </section>
        ) : null}

        {tables.map((t) => (
          <div className="table-wrap" key={t.caption}>
            <table className="data">
              <caption>{t.caption}</caption>
              <thead>
                <tr>
                  {t.columns.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.rows.map((r) => (
                  <tr key={r[0]}>
                    {r.map((cell, i) =>
                      i === 0 ? (
                        <th key={i} scope="row">
                          {cell}
                        </th>
                      ) : (
                        <td key={i}>{cell}</td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <section className="b-section" aria-labelledby="spec-h">
          <h2 id="spec-h">Specification</h2>
          <dl className="facts">
            {node.spec.map((s) => (
              <div key={s.k}>
                <dt>{s.k}</dt>
                <dd>{s.v}</dd>
              </div>
            ))}
          </dl>
          <p className="row-links">
            {node.links.map((l) => (
              <a key={l.href} href={l.href} rel="noopener">
                {l.label}
              </a>
            ))}
          </p>
        </section>
      </article>
      <Footer />
    </main>
  );
}
