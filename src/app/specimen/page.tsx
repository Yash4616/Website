import type { Metadata } from 'next';
import { siteConfig } from '@/data/config';
import { range, splitUnit } from '@/lib/utils';
import { RegistrationMarks } from '@/components/document/registration-marks';

export const metadata: Metadata = {
  title: 'Typographic specimen — yash.systems',
  description: 'Type scale, measure, rule weights, grid tracks, and texture. Reference material.',
  robots: { index: false, follow: false },
};

/* ── Local presentational helpers. Nothing here is site content. ──────────── */

function Block({
  mark,
  title,
  note,
  children,
}: {
  mark: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="doc-grid pt-20">
      <hr className="rule col-full mb-6" />
      <div className="col-margin">
        <span className="section-mark">{mark} /</span>
      </div>
      <div className="col-measure">
        <h2 className="text-title">{title}</h2>
        {note ? <p className="mt-2 text-note text-ink-2">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

function ScaleRow({
  name,
  spec,
  className,
  sample,
  mono,
}: {
  name: string;
  spec: string;
  className: string;
  sample: string;
  mono?: boolean;
}) {
  return (
    <>
      <div className="col-margin pt-[0.5em]">
        <span className="label">{name}</span>
      </div>
      <div className="col-measure border-t border-rule py-5">
        <p className={`${className} ${mono ? 'font-mono' : 'font-sans'}`}>{sample}</p>
      </div>
      <div className="col-sidenote pt-[0.6em]">
        <span className="font-mono text-label text-ink-3">{spec}</span>
      </div>
    </>
  );
}

export default function SpecimenPage() {
  const tokenizer = siteConfig.projects[0];

  return (
    <main id="main" className="relative py-24">
      {/* §2.4/3 — the measurement grid: vertical hairlines at 3% opacity. */}
      <div className="measure-grid" aria-hidden="true">
        <span style={{ left: '12%' }} />
        <span style={{ left: '30%' }} />
        <span style={{ left: '50%' }} />
        <span style={{ left: '70%' }} />
        <span style={{ left: '88%' }} />
      </div>

      {/* ── Masthead ──────────────────────────────────────────────────────── */}
      <div className="doc-grid relative">
        <div className="col-margin">
          <span className="label">Ref.</span>
        </div>
        <header className="col-measure">
          <p className="label">Typographic specimen</p>
          <h1
            className="mt-3 text-display"
            style={{ fontStretch: '125%', fontWeight: 700 }}
          >
            TYPE &amp; GRID
          </h1>
          <hr className="rule-strong mt-6" />
          <p className="mt-5 max-w-[60ch] text-body text-ink-2">
            Reference material for yash.systems. Approved before anything is built on it —
            type, colour, and grid <em>are</em> the aesthetic here, and discovering they are
            wrong at Stage 6 is expensive.
          </p>
        </header>
        <aside className="col-sidenote">
          <p className="text-note text-ink-2">
            <span className="mr-1 align-super font-mono text-[0.7em] text-accent">1</span>
            This is the sidenote track. Notes sit in the outer margin beside the text they
            annotate. Below <code className="font-mono text-[0.9em]">lg</code> they collapse
            inline as rule-marked asides, in source order, so a screen reader reads them
            where they belong.
          </p>
        </aside>
      </div>

      {/* ── 01 Type scale ─────────────────────────────────────────────────── */}
      <Block
        mark="01"
        title="Type scale"
        note="Two families, no third. Archivo for display and prose; IBM Plex Mono for every number, label, and caption."
      >
        <ScaleRow
          name="Display"
          spec="clamp(2.75–5.5rem) / 0.95 / −0.03em"
          className="text-display"
          sample="Yash Gurjar"
        />
        <ScaleRow
          name="Title"
          spec="clamp(1.5–2rem) / 1.15"
          className="text-title"
          sample="Selected Work"
        />
        <ScaleRow
          name="Heading"
          spec="20px / 1.3"
          className="text-heading"
          sample="A 262,144-token byte-level BPE tokenizer"
        />
        <ScaleRow
          name="Body"
          spec="18px / 1.65"
          className="text-body"
          sample="The anchor size. Every other size is chosen against this one."
        />
        <ScaleRow
          name="Note"
          spec="14px / 1.5"
          className="text-note text-ink-2"
          sample="Sidenotes, figure captions, and marginal apparatus."
        />
        <ScaleRow
          name="Data"
          spec="13px / 1.5 · mono"
          className="text-data"
          sample="22.1M tok/s — 1.09× tiktoken, 10.38× HF"
          mono
        />
        <ScaleRow
          name="Label"
          spec="11px · 0.1em · mono"
          className="label"
          sample="Architecture · Corpus · Throughput"
          mono
        />
      </Block>

      {/* ── 02 Measure ────────────────────────────────────────────────────── */}
      <Block mark="02" title="Measure" note="Body copy capped at 68ch. Never full-bleed prose.">
        <div className="col-measure mt-8">
          <div className="mb-2 flex items-center gap-3">
            <span className="label whitespace-nowrap">68ch</span>
            <span className="h-px flex-1 bg-rule" />
          </div>
          <p className="text-body">
            The documentation for a precision instrument. A Leica manual, a synthesizer
            service schematic, an oscilloscope spec sheet. These share a specific quality —
            dense, dark, exact, beautifully set, and entirely undecorated. Every mark on the
            page is load-bearing. Nothing is there to impress you, which is exactly why it
            does.
          </p>
        </div>
        <aside className="col-sidenote mt-8">
          <p className="text-note text-ink-2">
            <span className="mr-1 align-super font-mono text-[0.7em] text-accent">2</span>
            Measured at 1440px: the 68ch column resolves to about 640px, which is roughly 88
            rendered characters in Archivo at 18px.
          </p>
        </aside>
      </Block>

      {/* ── 03 Rule weights ───────────────────────────────────────────────── */}
      <Block
        mark="03"
        title="Rule weights"
        note="Two, and only two. Hairlines do all structural work; no cards, no shadows, no corners beyond 2px."
      >
        <div className="col-measure mt-8 space-y-8">
          <div>
            <span className="label">rule — 1px, #232326 · hairlines, table body rows</span>
            <hr className="rule mt-2" />
          </div>
          <div>
            <span className="label">
              rule-strong — 2px, #33333A · section dividers, table headers
            </span>
            <hr className="rule-strong mt-2" />
          </div>
        </div>
      </Block>

      {/* ── 04 Grid tracks ────────────────────────────────────────────────── */}
      <Block
        mark="04"
        title="Grid tracks"
        note="Three tracks, and the outer one is the feature. Figures break out across centre + sidenote."
      >
        <div className="col-full mt-8">
          <div className="doc-grid !px-0">
            {(
              [
                ['margin', '8rem', 'col-margin'],
                ['measure', '68ch max', 'col-measure'],
                ['sidenote', '15rem', 'col-sidenote'],
              ] as const
            ).map(([name, size, cls]) => (
              <div key={name} className={`${cls} relative bg-plane-1 px-3 py-7 text-center`}>
                <RegistrationMarks size={8} className="border-rule-strong" />
                <span className="label">{name}</span>
                <p className="mt-1 font-mono text-[11px] text-ink-3">{size}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="col-wide relative mt-4 bg-plane-2 px-4 py-8 text-center">
          <RegistrationMarks size={8} className="border-rule-strong" />
          <span className="label">figure breakout — measure + sidenote</span>
        </div>
      </Block>

      {/* ── 05 Registration marks ─────────────────────────────────────────── */}
      <Block
        mark="05"
        title="Registration marks"
        note="L-shaped corner ticks, as on a technical drawing. Four spans, zero cost, and the most distinctive element in the system."
      >
        <div className="col-wide mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { size: 8, label: 'small · 8px' },
            { size: 12, label: 'figure · 12px' },
            { size: 18, label: 'page frame · 18px' },
          ].map((v) => (
            <div key={v.size} className="relative bg-plane-1 px-4 py-12 text-center">
              <RegistrationMarks size={v.size} className="border-accent" />
              <span className="label">{v.label}</span>
            </div>
          ))}
        </div>
      </Block>

      {/* ── 06 Tabular figures in a spec table ────────────────────────────── */}
      <Block
        mark="06"
        title="Tabular figures"
        note="Non-negotiable on every number. Ragged numerals in a spec table destroy the premise. Real data from config.ts — not lorem."
      >
        <div className="col-margin mt-8">
          <span className="font-mono text-data text-ink-3">[1]</span>
        </div>
        <div className="col-measure mt-8">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-heading">{tokenizer.name}</h3>
            <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-3">
              {tokenizer.languages.join(' · ')}
            </span>
          </div>
          <hr className="rule mt-2" />
          <p className="mt-4 text-body text-ink-2">{tokenizer.summary}</p>

          <table className="spec-table mt-6">
            <tbody>
              {tokenizer.spec.slice(0, 6).map((row) => {
                const { value, unit } = splitUnit(row.value);
                return (
                  <tr key={row.label}>
                    <td className="spec-key">{row.label}</td>
                    <td>
                      {unit && row.value.length < 32 ? (
                        <>
                          {value}
                          <span className="unit">{unit}</span>
                        </>
                      ) : (
                        row.value
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className="mt-6">
            <span className="label">Limitations</span>
          </p>
          <p className="mt-2 text-note text-ink-2">{tokenizer.limitations}</p>
        </div>
        <aside className="col-sidenote mt-8 lg:mt-32">
          <p className="text-note text-ink-2">
            <span className="mr-1 align-super font-mono text-[0.7em] text-accent">3</span>
            LIMITATIONS is a required field on any entry carrying figures — the zod schema
            fails the build without it. A portfolio that states its own failure modes was
            unmistakably written by a practitioner.
          </p>
        </aside>
      </Block>

      {/* ── 07 Correct marks ──────────────────────────────────────────────── */}
      <Block
        mark="07"
        title="Correct marks"
        note="A hyphen doing a dash’s job is a visible error at this level of finish."
      >
        <div className="col-wide mt-8">
          <table className="spec-table">
            <thead>
              <tr>
                <th>Use</th>
                <th>Correct</th>
                <th>Wrong</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Range', range(2023, 2027), '2023-2027'],
                ['Aside', 'reranking — at a cost', 'reranking - at a cost'],
                ['Multiply', '128×128 · T4 ×2', '128x128 · T4 x2'],
                ['Minus', '−204,565 bytes', '-204,565 bytes'],
                ['Separator', 'Rust · Python', 'Rust | Python'],
                ['Quotes', '“measured, not inferred”', '"measured, not inferred"'],
              ].map(([use, right, wrong]) => (
                <tr key={use}>
                  <td className="spec-key">{use}</td>
                  <td>{right}</td>
                  <td className="text-ink-3">{wrong}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>

      {/* ── 08 Colour ─────────────────────────────────────────────────────── */}
      <Block
        mark="08"
        title="Colour"
        note="Warm-neutral graphite, one signal accent. If more than ~2% of a viewport is accent-coloured, it is wrong."
      >
        <div className="col-wide mt-8 grid grid-cols-2 gap-px bg-rule sm:grid-cols-4">
          {[
            ['ground', '#0E0E10', 'page'],
            ['plane-1', '#141416', 'tables, fields'],
            ['plane-2', '#1A1A1D', 'figure grounds'],
            ['rule', '#232326', 'hairlines'],
            ['rule-strong', '#33333A', 'dividers'],
            ['ink', '#E8E6E1', 'primary text'],
            ['ink-2', '#9A968E', 'secondary'],
            ['ink-3', '#8A857C', 'metadata'],
            ['accent', '#FF5A1F', 'signal only'],
            ['accent-dim', '#B33D12', 'pressed'],
            ['data-3', '#5B9A8B', 'third series'],
          ].map(([name, hex, use]) => (
            <div key={name} className="bg-ground p-4">
              <div
                className="h-12 w-full border border-rule"
                style={{ backgroundColor: hex }}
                aria-hidden="true"
              />
              <p className="mt-3 font-mono text-[11px] text-ink">{name}</p>
              <p className="font-mono text-[11px] text-ink-3">{hex}</p>
              <p className="mt-1 font-mono text-[11px] text-ink-3">{use}</p>
            </div>
          ))}
        </div>
      </Block>

      {/* ── 09 Grain ──────────────────────────────────────────────────────── */}
      <Block
        mark="09"
        title="Grain"
        note="A baked 128×128 tile at opacity 0.025, overlay-blended, fixed. It is live on this page — the swatch below shows the same tile at 1× and 20× so you can see what you are not consciously seeing."
      >
        <div className="col-wide mt-8 grid gap-6 sm:grid-cols-2">
          <div className="relative bg-plane-1 p-4">
            <RegistrationMarks size={8} className="border-rule-strong" />
            <p className="label mb-3">At real opacity — 0.025</p>
            <div
              className="h-32 w-full bg-plane-2"
              style={{
                backgroundImage: 'url(/assets/grain.png)',
                backgroundRepeat: 'repeat',
                opacity: 0.025,
              }}
              aria-hidden="true"
            />
          </div>
          <div className="relative bg-plane-1 p-4">
            <RegistrationMarks size={8} className="border-rule-strong" />
            <p className="label mb-3">Tile at 20× — structure only</p>
            <div
              className="h-32 w-full"
              style={{
                backgroundImage: 'url(/assets/grain.png)',
                backgroundRepeat: 'repeat',
                backgroundSize: '2560px 2560px',
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      </Block>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="doc-grid mt-24">
        <hr className="rule-strong col-full mb-6" />
        <p className="col-measure font-mono text-label uppercase tracking-[0.1em] text-ink-3">
          Specimen · not indexed · Stage 1 deliverable
        </p>
      </div>
    </main>
  );
}
