"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RankedRow } from "@/components/RankingList";
import { compactCurrency, currency } from "@/lib/format";

/** Line colors by rank: best first. */
export const RANK_COLORS = ["#1f4d3a", "#a8802b", "#4f6d8f", "#8a6f9e"];

interface ComparisonChartProps {
  rows: RankedRow[];
  selectedCode: string;
  onSelect: (code: string) => void;
}

export function ComparisonChart({ rows, selectedCode, onSelect }: ComparisonChartProps) {
  const years = rows[0]?.roi.points.map((p) => p.year) ?? [];
  const data = years.map((year, i) => {
    const point: Record<string, number> = { year };
    rows.forEach((row) => {
      point[row.program.code] = row.roi.points[i].position;
    });
    return point;
  });
  const names = Object.fromEntries(rows.map((r) => [r.program.code, r.program.title]));

  return (
    <section className="rounded-card border border-line bg-surface p-6 lg:p-8" aria-label="Majors compared over time">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold text-ink">How far ahead each major puts you</h2>
        <p className="text-xs text-muted">Compared with skipping college, after tax and loan payments</p>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2" aria-label="Legend">
        {rows.map((row, i) => {
          const selected = row.program.code === selectedCode;
          return (
            <li key={row.program.code}>
              <button
                type="button"
                onClick={() => onSelect(row.program.code)}
                aria-pressed={selected}
                className={`flex items-center gap-2 rounded text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  selected ? "font-semibold text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-[3px] w-5 rounded-full"
                  style={{ backgroundColor: RANK_COLORS[i % RANK_COLORS.length] }}
                />
                {row.program.title}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#e4e2dc" vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={{ stroke: "#e4e2dc" }}
              tick={{ fill: "#6d6d78", fontSize: 11 }}
              tickFormatter={(v: number) => `Yr ${v}`}
              interval={3}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={60}
              tick={{ fill: "#6d6d78", fontSize: 11 }}
              tickFormatter={(v: number) => compactCurrency(v)}
            />
            <Tooltip
              cursor={{ stroke: "#6d6d78", strokeDasharray: "3 3" }}
              contentStyle={{ borderRadius: 8, border: "1px solid #e4e2dc", fontSize: 12 }}
              labelFormatter={(label) => `Year ${label} after graduation`}
              formatter={(value, name) => [currency(Number(value)), names[String(name)] ?? String(name)]}
              itemSorter={(item) => -Number(item.value)}
            />
            <ReferenceLine y={0} stroke="#17171c" strokeWidth={1} />
            {rows.map((row, i) => {
              const selected = row.program.code === selectedCode;
              return (
                <Line
                  key={row.program.code}
                  type="monotone"
                  dataKey={row.program.code}
                  name={row.program.code}
                  stroke={RANK_COLORS[i % RANK_COLORS.length]}
                  strokeWidth={selected ? 3 : 1.75}
                  strokeOpacity={selected ? 1 : 0.7}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                  onClick={() => onSelect(row.program.code)}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-muted">
        Where a line crosses $0 is when that major has paid for itself.
      </p>
    </section>
  );
}
