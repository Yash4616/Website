import { siteConfig } from '@/data/config';
import { range } from '@/lib/utils';

export function Background() {
  return (
    <div className="col-measure mt-8">
      <table className="spec-table background-table" aria-label="Education and background">
        <thead>
          <tr>
            <th>Qualification</th>
            <th>Institution</th>
            <th>Dates</th>
          </tr>
        </thead>
        <tbody>
          {siteConfig.background.map((entry) => (
            <tr key={entry.qualification}>
              <td>{entry.qualification}{entry.note ? ` — ${entry.note}` : ''}</td>
              <td>{entry.institution}</td>
              <td className="whitespace-nowrap">{range(entry.from, entry.to)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Background;
