import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import type { RoiResult } from "@/lib/finance";
import { currency } from "@/lib/format";
import { PayoffChart } from "@/components/PayoffChart";

interface RoiSummaryProps {
  roi: RoiResult;
  majorName: string;
  cityName: string;
  /** Hide the single-major chart when a comparison chart is shown elsewhere */
  showChart?: boolean;
}

export function RoiSummary({ roi, majorName, cityName, showChart = true }: RoiSummaryProps) {
  const years = roi.breakEvenYear;
  const paysOff = years !== null;

  return (
    <section className="rounded-card border border-line bg-surface" aria-label="Return on investment">
      <div className={`grid gap-8 p-6 ${showChart ? "border-b border-line" : ""} lg:grid-cols-[minmax(0,1fr)_260px] lg:p-8`}>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Time to break even
          </h2>
          <p className="mt-3 flex items-baseline gap-2">
            <span
              className={`font-mono text-6xl font-semibold leading-none tracking-tight ${
                paysOff ? "text-accent" : "text-negative"
              }`}
            >
              {paysOff ? years.toFixed(1) : "20+"}
            </span>
            <span className="text-lg text-muted">years after graduation</span>
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
            A {majorName} graduate in {cityName} covers {currency(roi.upfrontCost)} of tuition paid
            in cash plus wages given up while enrolled, then repays the loan, and still comes out
            ahead of a same-age worker with no degree{" "}
            {paysOff ? `by year ${Math.ceil(years)}` : "only beyond a 20-year horizon"}.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-4 lg:border-l lg:border-line lg:pl-8">
          <PositionStat label="Net position, year 10" value={roi.positionAt10} />
          <PositionStat label="Net position, year 20" value={roi.positionAt20} />
        </div>
      </div>

      {showChart && (
      <div className="p-6 lg:p-8">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h3 className="text-sm font-semibold text-ink">Cumulative gain over skipping the degree</h3>
          <p className="text-xs text-muted">After tax, after loan payments</p>
        </div>
        <PayoffChart points={roi.points} breakEvenYear={roi.breakEvenYear} />
      </div>
      )}
    </section>
  );
}

function PositionStat({ label, value }: { label: string; value: number }) {
  const positive = value >= 0;
  const Icon = positive ? TrendingUpIcon : TrendingDownIcon;
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p
        className={`mt-1 flex items-center gap-2 font-mono text-2xl font-medium ${
          positive ? "text-ink" : "text-negative"
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {currency(value)}
      </p>
    </div>
  );
}
