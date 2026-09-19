import type { City, Major } from "@/lib/types";
import type { RoiResult } from "@/lib/finance";
import { currency, percent } from "@/lib/format";

interface MajorHeaderProps {
  major: Major;
  city: City;
  cities: City[];
  roi: RoiResult;
  onCityChange: (id: string) => void;
}

export function MajorHeader({ major, city, cities, roi, onCityChange }: MajorHeaderProps) {
  const stats = [
    { label: "Median pay, age 22–27", value: currency(roi.startingSalary) },
    { label: "Median pay, age 35–45", value: currency(roi.midSalary) },
    { label: "Adjusted for local costs", value: currency(roi.adjustedStartingSalary) },
    { label: "Recent-grad unemployment", value: percent(major.unemployment) },
    { label: "Average debt at graduation", value: currency(major.avgDebt) },
  ];

  return (
    <header className="border-b border-line bg-surface px-6 py-6 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {major.category}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink lg:text-4xl">
            {major.name}
          </h1>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <span>Living in</span>
          <select
            value={city.id}
            onChange={(e) => onCityChange(e.target.value)}
            className="rounded-md border border-line bg-canvas px-3 py-2 text-sm font-medium text-ink outline-none transition-colors duration-150 focus:border-accent"
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="border-l border-line pl-3">
            <dt className="text-xs leading-snug text-muted">{stat.label}</dt>
            <dd className="mt-1 font-mono text-lg font-medium text-ink">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
