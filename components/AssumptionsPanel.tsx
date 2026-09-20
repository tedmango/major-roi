"use client";

import type { ReactNode } from "react";
import { RotateCcwIcon } from "lucide-react";
import type { Assumptions } from "@/lib/types";
import { currency } from "@/lib/format";
import { FEDERAL_UNDERGRAD_LIMIT } from "@/lib/finance";

interface AssumptionsPanelProps {
  assumptions: Assumptions;
  /** Debt estimated from the answers on the first page */
  estimatedDebt: number;
  /** How much more (+) or less (-) this major's grads borrow than the school average */
  majorAdjustment: number;
  majorName: string;
  /** Debt used for this major after the adjustment */
  majorDebt: number;
  monthlyPayment: number;
  totalInterest: number;
  onChange: (next: Partial<Assumptions>) => void;
  onReset: () => void;
}

export function AssumptionsPanel({
  assumptions,
  estimatedDebt,
  majorAdjustment,
  majorName,
  majorDebt,
  monthlyPayment,
  totalInterest,
  onChange,
  onReset,
}: AssumptionsPanelProps) {
  const usingEstimate = Math.round(assumptions.debt) === Math.round(estimatedDebt);
  const overLimit = majorDebt > FEDERAL_UNDERGRAD_LIMIT;
  const adjusted = Math.abs(majorAdjustment) >= 500;

  return (
    <section className="rounded-card border border-line bg-surface p-6" aria-label="Your numbers">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold text-ink">Your numbers</h2>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-muted transition-colors duration-150 hover:text-accent"
        >
          <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Reset to your answers
        </button>
      </div>

      <div className="mt-5 space-y-5">
        <Field
          label="Your borrowing estimate"
          hint={
            overLimit
              ? `Above the ${currency(FEDERAL_UNDERGRAD_LIMIT)} federal limit for most dependent students; the rest would need private or parent loans.`
              : usingEstimate
                ? "Estimated from your answers"
                : `Your answers suggested ${currency(estimatedDebt)}`
          }
          value={currency(assumptions.debt)}
        >
          <input
            type="range"
            min={0}
            max={120000}
            step={1000}
            value={assumptions.debt}
            onChange={(e) => onChange({ debt: Number(e.target.value) })}
            aria-label="Your borrowing estimate"
            className="w-full"
          />
          {adjusted && (
            <p className="mt-1.5 text-xs text-ink">
              {majorName} grads here borrow {currency(Math.abs(majorAdjustment))}{" "}
              {majorAdjustment > 0 ? "more" : "less"} than the school average, so this major uses{" "}
              <span className="font-mono">{currency(majorDebt)}</span>.
            </p>
          )}
        </Field>

        <Field
          label="Tuition paid in cash"
          hint="Savings, family help, scholarships and work over four years"
          value={currency(assumptions.outOfPocket)}
        >
          <input
            type="range"
            min={0}
            max={200000}
            step={2500}
            value={assumptions.outOfPocket}
            onChange={(e) => onChange({ outOfPocket: Number(e.target.value) })}
            aria-label="Tuition paid in cash"
            className="w-full"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Interest rate" value={`${assumptions.interestRate.toFixed(2)}%`}>
            <input
              type="range"
              min={0}
              max={12}
              step={0.05}
              value={assumptions.interestRate}
              onChange={(e) => onChange({ interestRate: Number(e.target.value) })}
              aria-label="Loan interest rate"
              className="w-full"
            />
          </Field>
          <Field label="Repayment term" value={`${assumptions.termYears} yrs`}>
            <input
              type="range"
              min={5}
              max={25}
              step={1}
              value={assumptions.termYears}
              onChange={(e) => onChange({ termYears: Number(e.target.value) })}
              aria-label="Repayment term in years"
              className="w-full"
            />
          </Field>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-4">
        <div>
          <dt className="text-xs text-muted">Monthly payment</dt>
          <dd className="mt-1 font-mono text-lg font-medium text-ink">{currency(monthlyPayment)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Interest paid over term</dt>
          <dd className="mt-1 font-mono text-lg font-medium text-ink">{currency(totalInterest)}</dd>
        </div>
      </dl>
    </section>
  );
}

interface FieldProps {
  label: string;
  value: string;
  hint?: string;
  children: ReactNode;
}

function Field({ label, value, hint, children }: FieldProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-ink">{label}</span>
        <span className="font-mono text-sm font-medium text-ink">{value}</span>
      </div>
      <div className="mt-2.5">{children}</div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}
