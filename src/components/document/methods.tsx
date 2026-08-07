import { siteConfig } from '@/data/config';

export function Methods() {
  return (
    <div className="col-measure mt-8">
      <dl className="border-t border-rule">
        {siteConfig.methods.map((group) => (
          <div key={group.label} className="grid grid-cols-[minmax(8rem,11rem)_1fr] gap-x-5 border-b border-rule py-4 max-sm:grid-cols-1 max-sm:gap-y-2">
            <dt className="label">{group.label}</dt>
            <dd className="font-mono text-data text-ink-2">
              {group.items.map((item) => item.name).join(' · ')}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default Methods;
