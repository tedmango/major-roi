"use client";

import { useMemo, useState } from "react";
import { CheckIcon, SearchIcon } from "lucide-react";
import type { Program } from "@/lib/types";
import { compactCurrency } from "@/lib/format";

export const MAX_MAJORS = 4;

interface ProgramPickerProps {
  programs: Program[];
  selected: string[];
  onToggle: (code: string) => void;
  hiddenCount: number;
}

export function ProgramPicker({ programs, selected, onToggle, hiddenCount }: ProgramPickerProps) {
  const [query, setQuery] = useState("");
  const full = selected.length >= MAX_MAJORS;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? programs.filter((p) => p.title.toLowerCase().includes(q)) : programs;
  }, [programs, query]);

  if (programs.length === 0) {
    return (
      <p className="rounded-md border border-line bg-surface px-4 py-3 text-sm text-muted">
        College Scorecard doesn&rsquo;t have earnings for any bachelor&rsquo;s programs at this
        school yet. Try another school.
      </p>
    );
  }

  return (
    <div className="rounded-md border border-line bg-surface">
      <div className="border-b border-line p-3">
        <div className="relative">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${programs.length} majors`}
            aria-label="Search majors"
            className="w-full rounded-md border border-line bg-canvas py-2 pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent focus:bg-surface"
          />
        </div>
      </div>

      <ul className="max-h-80 overflow-y-auto py-1" aria-label="Majors">
        {filtered.length === 0 && (
          <li className="px-4 py-3 text-sm text-muted">No majors match &ldquo;{query}&rdquo;.</li>
        )}
        {filtered.map((program) => {
          const checked = selected.includes(program.code);
          const disabled = !checked && full;
          return (
            <li key={program.code}>
              <label
                className={`flex items-center gap-3 px-4 py-2.5 ${
                  disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:bg-canvas"
                } ${checked ? "bg-accent-soft" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggle(program.code)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                    checked ? "border-accent bg-accent text-white" : "border-muted/50 bg-surface"
                  }`}
                >
                  {checked && <CheckIcon className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span className={`flex-1 text-sm ${checked ? "font-semibold text-accent" : "text-ink"}`}>
                  {program.title}
                </span>
                <span className="shrink-0 font-mono text-xs text-muted">
                  {compactCurrency(program.earnings)}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-line px-4 py-2.5 text-xs text-muted">
        Amounts are what graduates typically earn a few years out.
        {hiddenCount > 0 &&
          ` ${hiddenCount} more ${hiddenCount === 1 ? "major isn't" : "majors aren't"} listed because earnings data isn't published for ${hiddenCount === 1 ? "it" : "them"}.`}
      </p>
    </div>
  );
}
