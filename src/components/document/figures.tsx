import { type Figure } from '@/types';
import { RegisteredFrame } from '@/components/document/registration-marks';

const PLOT = { width: 1000, height: 390, left: 72, right: 28, top: 26, bottom: 84 };

function BarFigure({ figure }: { figure: Figure }) {
  if (!figure.bars?.length) return null;

  const bars = figure.bars;
  const maximum = Math.max(...bars.flatMap((bar) => [bar.value, bar.reference ?? 0]));
  const plotWidth = PLOT.width - PLOT.left - PLOT.right;
  const plotHeight = PLOT.height - PLOT.top - PLOT.bottom;
  const groupWidth = plotWidth / bars.length;
  const barWidth = bars.some((bar) => bar.reference !== undefined) ? groupWidth * 0.29 : groupWidth * 0.56;
  const y = (value: number) => PLOT.top + plotHeight - (value / maximum) * plotHeight;

  return (
    <svg
      viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
      className="block h-auto w-full"
      role="img"
      aria-label={figure.alt}
    >
      {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
        const yy = PLOT.top + plotHeight - tick * plotHeight;
        return (
          <g key={tick}>
            <line x1={PLOT.left} x2={PLOT.width - PLOT.right} y1={yy} y2={yy} stroke="var(--color-rule)" strokeWidth="1" />
            <text x={PLOT.left - 12} y={yy + 4} textAnchor="end" className="svg-axis">
              {(maximum * tick).toFixed(maximum <= 1 ? 2 : maximum < 10 ? 1 : 0)}
            </text>
          </g>
        );
      })}
      <line x1={PLOT.left} x2={PLOT.width - PLOT.right} y1={PLOT.top + plotHeight} y2={PLOT.top + plotHeight} stroke="var(--color-rule-strong)" strokeWidth="1" />
      {bars.map((bar, index) => {
        const center = PLOT.left + groupWidth * index + groupWidth / 2;
        const valueY = y(bar.value);
        const referenceY = bar.reference === undefined ? null : y(bar.reference);
        return (
          <g key={bar.label}>
            <rect className="figure-bar" x={center - (referenceY === null ? barWidth / 2 : barWidth - 3)} y={valueY} width={barWidth} height={PLOT.top + plotHeight - valueY} fill="var(--color-data-2)" />
            {referenceY !== null ? (
              <rect className="figure-bar" x={center + 3} y={referenceY} width={barWidth} height={PLOT.top + plotHeight - referenceY} fill="var(--color-data-1)" opacity="0.72" />
            ) : null}
            <text x={center} y={PLOT.top + plotHeight + 19} textAnchor="middle" className="svg-label">
              {bar.label}
            </text>
            <text x={center} y={PLOT.top + plotHeight + 35} textAnchor="middle" className="svg-note">
              {bar.note ?? `${bar.value}${bar.unit ?? ''}`}
            </text>
          </g>
        );
      })}
      {figure.yLabel ? <text x={PLOT.left} y={14} className="svg-axis">{figure.yLabel}</text> : null}
      {bars.some((bar) => bar.reference !== undefined) ? (
        <g transform={`translate(${PLOT.width - 220}, 16)`} className="svg-axis">
          <rect x="0" y="-8" width="10" height="10" fill="var(--color-data-2)" />
          <text x="16" y="0">This implementation</text>
          <rect x="116" y="-8" width="10" height="10" fill="var(--color-data-1)" opacity="0.72" />
          <text x="132" y="0">Reference</text>
        </g>
      ) : null}
    </svg>
  );
}

function CurveFigure({ figure }: { figure: Figure }) {
  if (!figure.curve || figure.curve.epoch.length === 0) return null;
  const { epoch, trainLoss, valAcc } = figure.curve;
  const values = [...trainLoss, ...valAcc];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const graphWidth = PLOT.width - PLOT.left - PLOT.right;
  const graphHeight = PLOT.height - PLOT.top - PLOT.bottom;
  const path = (valuesToPlot: number[]) => valuesToPlot.map((value, index) => {
    const x = PLOT.left + (index / Math.max(valuesToPlot.length - 1, 1)) * graphWidth;
    const y = PLOT.top + graphHeight - ((value - min) / Math.max(max - min, 0.0001)) * graphHeight;
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} className="block h-auto w-full" role="img" aria-label={figure.alt}>
      <line x1={PLOT.left} x2={PLOT.width - PLOT.right} y1={PLOT.top + graphHeight} y2={PLOT.top + graphHeight} stroke="var(--color-rule-strong)" />
      <line x1={PLOT.left} x2={PLOT.left} y1={PLOT.top} y2={PLOT.top + graphHeight} stroke="var(--color-rule-strong)" />
      <path className="figure-line" pathLength="1" d={path(trainLoss)} fill="none" stroke="var(--color-data-2)" strokeWidth="3" />
      <path className="figure-line" pathLength="1" d={path(valAcc)} fill="none" stroke="var(--color-data-3)" strokeWidth="3" />
      <text x={PLOT.left} y={14} className="svg-axis">train loss</text>
      <text x={PLOT.left + 94} y={14} className="svg-axis" fill="var(--color-data-3)">validation accuracy</text>
      <text x={PLOT.left} y={PLOT.height - 18} className="svg-axis">epoch {epoch[0]}–{epoch[epoch.length - 1]}</text>
    </svg>
  );
}

function MatrixFigure({ figure }: { figure: Figure }) {
  if (!figure.matrix || figure.matrix.matrix.length === 0) return null;
  const { labels, matrix } = figure.matrix;
  const maximum = Math.max(...matrix.flat());
  const cell = Math.min(52, 680 / labels.length);
  const origin = 100;
  return (
    <svg viewBox={`0 0 1000 ${origin + labels.length * cell + 70}`} className="block h-auto w-full" role="img" aria-label={figure.alt}>
      {labels.map((label, index) => (
        <text key={`x-${label}`} x={origin + index * cell + cell / 2} y={origin - 12} textAnchor="middle" className="svg-axis">{label}</text>
      ))}
      {matrix.map((row, rowIndex) => (
        <g key={labels[rowIndex]}>
          <text x={origin - 12} y={origin + rowIndex * cell + cell / 2 + 3} textAnchor="end" className="svg-axis">{labels[rowIndex]}</text>
          {row.map((value, columnIndex) => {
            const intensity = Math.max(0.08, value / maximum);
            return <rect key={columnIndex} x={origin + columnIndex * cell} y={origin + rowIndex * cell} width={cell - 2} height={cell - 2} fill="var(--color-data-2)" opacity={intensity} />;
          })}
        </g>
      ))}
      <text x={origin} y={30} className="svg-axis">Predicted →</text>
      <text x={12} y={origin - 26} className="svg-axis">Actual ↓</text>
    </svg>
  );
}

/** Inline, server-rendered figures. Unknown or absent data deliberately yields no chart. */
export function DocumentFigure({ figure, number }: { figure: Figure; number: number }) {
  const visual = figure.kind === 'bar'
    ? <BarFigure figure={figure} />
    : figure.kind === 'curve'
      ? <CurveFigure figure={figure} />
      : <MatrixFigure figure={figure} />;

  if (!visual) return null;
  return (
    <figure className="mt-9" aria-label={`Figure ${number}: ${figure.alt}`}>
      <RegisteredFrame className="bg-plane-2 px-5 py-8 sm:px-8" markSize={12}>
        {visual}
      </RegisteredFrame>
      <figcaption className="mt-3 max-w-[68ch] font-mono text-note text-ink-2">
        <span className="mr-2 text-accent">FIG. {String(number).padStart(2, '0')} —</span>
        {figure.caption}
      </figcaption>
    </figure>
  );
}

export default DocumentFigure;
