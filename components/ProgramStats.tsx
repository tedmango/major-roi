import type { City, Program, SchoolDetail } from "@/lib/types";
import type { CostPlan, RoiResult } from "@/lib/finance";
import { currency, percent } from "@/lib/format";
import { oftenLeadsToGradSchool } from "@/lib/fields";

interface ProgramStatsProps {
  program: Program;
  school: SchoolDetail;
  plan: CostPlan;
  roi: RoiResult;
  city: City;
  cities: City[];
  onCityChange: (id: string) => void;
}

export function ProgramStats({ program, school, plan, roi, city, cities, onCityChange }: ProgramStatsProps) {
  const stats = [
    {
      label: `Grads earn, ${program.earningsYearsAfter} yrs out`,
      value: currency(program.earnings),
    },
    { label: "Worth in U.S.-average dollars", value: currency(roi.adjustedStartingSalary) },
    {
      label: "Typical grad's debt, this major",
      value: program.medianDebt !== null ? currency(program.medianDebt) : "Not published",
    },
    { label: "Your estimated debt", value: currency(roi.debt) },
    { label: "Your net price per year", value: currency(plan.netPricePerYear) },
    {
      label: "School graduation rate",
      value: school.completionRate !== null ? percent(school.completionRate * 100, 0) : "Not published",
    },
  ];
  const gradSchool = oftenLeadsToGradSchool(program.code);

  return (
    <header className="rounded-card border border-line bg-surface p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted">{school.name}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink lg:text-3xl">{program.title}</h2>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <span>Living in</span>
          <select
            value={city.id}
            onChange={(e) => onCityChange(e.target.value)}
            className="rounded-md border border-line bg-canvas px-3 py-2 text-sm font-medium text-ink outline-none transition-colors focus:border-accent"
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="border-l border-line pl-3">
            <dt className="text-xs leading-snug text-muted">{stat.label}</dt>
            <dd className="mt-1 font-mono text-lg font-medium text-ink">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {gradSchool && (
        <p className="mt-6 border-l-2 border-gold pl-4 text-sm leading-relaxed text-muted">
          Many graduates in this field go on to graduate or professional school. Earnings measured a
          few years after the bachelor&rsquo;s can understate what they earn later, and grad school adds
          its own cost.
        </p>
      )}
    </header>
  );
}
