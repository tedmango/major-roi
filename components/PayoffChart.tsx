"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProjectionPoint } from "@/lib/finance";
import { compactCurrency, currency } from "@/lib/format";

interface PayoffChartProps {
  points: ProjectionPoint[];
  breakEvenYear: number | null;
}

export function PayoffChart({ points, breakEvenYear }: PayoffChartProps) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="positionFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1f4d3a" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#1f4d3a" stopOpacity={0.02} />
            </linearGradient>
          </defs>
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
            width={56}
            tick={{ fill: "#6d6d78", fontSize: 11 }}
            tickFormatter={(v: number) => compactCurrency(v)}
          />
          <Tooltip
            cursor={{ stroke: "#6d6d78", strokeDasharray: "3 3" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e4e2dc",
              fontSize: 12,
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            }}
            labelFormatter={(label) => `Year ${label} after graduation`}
            formatter={(value, _name, item) => {
              const point = item.payload as ProjectionPoint;
              return [
                `${currency(Number(value))} (salary ${currency(point.gradSalary)})`,
                "Net position",
              ];
            }}
          />
          <ReferenceLine y={0} stroke="#17171c" strokeWidth={1} />
          {breakEvenYear !== null && (
            <ReferenceLine
              x={Math.max(1, Math.round(breakEvenYear))}
              stroke="#a8802b"
              strokeDasharray="4 4"
              label={{ value: "Break-even", position: "insideTopLeft", fill: "#a8802b", fontSize: 11 }}
            />
          )}
          <Area
            type="monotone"
            dataKey="position"
            stroke="#1f4d3a"
            strokeWidth={2}
            fill="url(#positionFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
