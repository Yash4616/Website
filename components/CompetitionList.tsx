import type { Competition } from "@/content/site";
import { standingText, topPercentText } from "@/content/format";

/**
 * A competition record: standing, name, type and top %, then what the entry
 * was. No hooks and no zod, so the server views and the client portal share it.
 */
export function CompetitionList({ entries }: { entries: Competition[] }) {
  return (
    <dl className="facts comps">
      {entries.map((c) => (
        <div key={c.name}>
          <dt>{standingText(c)}</dt>
          <dd>
            <p>
              {c.name}
              <span className="comp-meta">
                <span className="comp-kind">. {c.kind}</span>, {topPercentText(c)}
                {c.standingNote ? <span className="comp-prov">, provisional</span> : null}.
              </span>
            </p>
            {c.standingNote ? <p className="comp-standing">{c.standingNote}</p> : null}
            <p className="comp-note">{c.note}</p>
          </dd>
        </div>
      ))}
    </dl>
  );
}
