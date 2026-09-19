import type { City } from "@/lib/types";
import type { MonthlyBudget } from "@/lib/finance";
import { currency } from "@/lib/format";

interface BudgetBreakdownProps {
  budget: MonthlyBudget;
  city: City;
}

const BAR_COLORS = ["bg-accent", "bg-accent/55", "bg-gold"];

export function BudgetBreakdown({ budget, city }: BudgetBreakdownProps) {
  const rows = [
    { label: "Rent, median 1-bedroom", value: budget.rent },
    { label: "Everything else (food, transit, health)", value: budget.otherLiving },
    { label: "Student loan payment", value: budget.loanPayment },
  ];
  const outflow = rows.reduce((sum, r) => sum + r.value, 0);
  const tight = budget.leftover < 250;

  return (
    <section className="rounded-card border border-line bg-surface p-6" aria-label="Monthly budget">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold text-ink">First-year month in {city.name}</h2>
        <p className="font-mono text-xs text-muted">Cost index {city.costIndex}</p>
      </div>

      <div className="mt-5 flex items-baseline justify-between border-b border-line pb-3">
        <p className="text-sm text-muted">Take-home pay</p>
        <p className="font-mono text-lg font-medium text-ink">{currency(budget.takeHome)}</p>
      </div>

      <ul className="mt-3 space-y-2.5">
        {rows.map((row) => (
          <li key={row.label} className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-muted">{row.label}</span>
            <span className="font-mono text-sm text-ink">&minus;{currency(row.value)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-canvas" aria-hidden="true">
        <div className="flex h-full w-full">
          {rows.map((row, i) => (
            <div
              key={row.label}
              style={{ width: `${Math.min(100, (row.value / budget.takeHome) * 100)}%` }}
              className={BAR_COLORS[i]}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
        <div>
          <p className="text-sm font-semibold text-ink">Left over each month</p>
          <p className="mt-0.5 text-xs text-muted">
            {tight
              ? "Little room for saving, emergencies or moving costs."
              : `${Math.round((budget.leftover / budget.takeHome) * 100)}% of take-home pay stays free.`}
          </p>
        </div>
        <p
          className={`font-mono text-2xl font-semibold ${
            budget.leftover < 0 ? "text-negative" : "text-accent"
          }`}
        >
          {currency(budget.leftover)}
        </p>
      </div>

      <p className="mt-4 text-xs text-muted">
        Outflow of {currency(outflow)} against {currency(budget.gross)} gross pay before tax.
      </p>
    </section>
  );
}
