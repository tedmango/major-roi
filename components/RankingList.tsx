"use client";

import type { Program } from "@/lib/types";
import type { RoiResult } from "@/lib/finance";
import { currency } from "@/lib/format";
import { oftenLeadsToGradSchool } from "@/lib/fields";
import { RANK_COLORS } from "@/components/ComparisonChart";

export interface RankedRow {
  program: Program;
  roi: RoiResult;
  /** Debt difference vs. the school average for this major */
  adjustment: number;
}

interface RankingListProps {
  rows: RankedRow[];
  selectedCode: string;
  onSelect: (code: string) => void;
}

export function RankingList({ rows, selectedCode, onSelect }: RankingListProps) {
  return (
    <section className="rounded-card border border-line bg-surface" aria-label="Majors ranked">
      <div className="hidden grid-cols-[2.5rem_minmax(0,1fr)_8rem_8rem_9rem] gap-4 border-b border-line px-6 py-3 text-xs text-muted md:grid">
        <span>Rank</span>
        <span>Major</span>
        <span className="text-right">Grads earn</span>
        <span className="text-right">Breaks even</span>
        <span className="text-right">Ahead at year 10</span>
      </div>
      <ol>
        {rows.map((row, i) => {
          const selected = row.program.code === selectedCode;
          const be = row.roi.breakEvenYear;
          return (
            <li key={row.program.code} className="border-b border-line last:border-b-0">
              <button
                type="button"
                onClick={() => onSelect(row.program.code)}
                aria-pressed={selected}
                className={`grid w-full grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-1 border-l-2 px-6 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent md:grid-cols-[2.5rem_minmax(0,1fr)_8rem_8rem_9rem] md:items-baseline ${
                  selected ? "border-accent bg-accent-soft" : "border-transparent hover:bg-canvas"
                }`}
              >
                <span className="flex items-center gap-2 font-mono text-sm text-muted">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: RANK_COLORS[i % RANK_COLORS.length] }}
                  />
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm leading-snug ${selected ? "font-semibold text-accent" : "text-ink"}`}>
                    {row.program.title}
                  </span>
                  {oftenLeadsToGradSchool(row.program.code) && (
                    <span className="mt-0.5 block text-xs text-muted">Often leads to grad school</span>
                  )}
                </span>
                <Cell label="Grads earn">{currency(row.program.earnings)}</Cell>
                <Cell label="Breaks even" negative={be === null}>
                  {be === null ? "20+ yrs" : `${be.toFixed(1)} yrs`}
                </Cell>
                <Cell label="Ahead at year 10" negative={row.roi.positionAt10 < 0}>
                  {currency(row.roi.positionAt10)}
                </Cell>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Cell({ label, negative, children }: { label: string; negative?: boolean; children: React.ReactNode }) {
  return (
    <span className="col-start-2 flex justify-between gap-4 text-sm md:col-start-auto md:block md:text-right">
      <span className="text-muted md:hidden">{label}</span>
      <span className={`font-mono ${negative ? "text-negative" : "text-ink"}`}>{children}</span>
    </span>
  );
}
