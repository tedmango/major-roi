"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import type { Major } from "@/lib/types";
import { compactCurrency } from "@/lib/format";

interface MajorListProps {
  majors: Major[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function MajorList({ majors, selectedId, onSelect }: MajorListProps) {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? majors.filter(
          (m) => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q),
        )
      : majors;
    const map = new Map<string, Major[]>();
    filtered.forEach((m) => {
      const list = map.get(m.category) ?? [];
      list.push(m);
      map.set(m.category, list);
    });
    return Array.from(map.entries());
  }, [majors, query]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-sm font-semibold text-ink">Choose a major</h2>
        <p className="mt-1 text-xs text-muted">{majors.length} bachelor&rsquo;s programs</p>
        <div className="relative mt-3">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search majors"
            aria-label="Search majors"
            className="w-full rounded-md border border-line bg-canvas py-2 pl-9 pr-3 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-muted focus:border-accent focus:bg-surface"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {grouped.length === 0 && (
          <p className="px-5 py-8 text-sm text-muted">
            No majors match &ldquo;{query}&rdquo;. Try a broader word like &ldquo;engineering&rdquo;.
          </p>
        )}
        {grouped.map(([category, list]) => (
          <section key={category}>
            <h3 className="sticky top-0 z-10 bg-canvas/95 px-5 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted backdrop-blur">
              {category}
            </h3>
            <ul>
              {list.map((major) => {
                const selected = major.id === selectedId;
                return (
                  <li key={major.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(major.id)}
                      aria-current={selected ? "true" : undefined}
                      className={`flex w-full items-baseline justify-between gap-3 border-l-2 px-5 py-2.5 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
                        selected ? "border-accent bg-accent-soft" : "border-transparent hover:bg-canvas"
                      }`}
                    >
                      <span
                        className={`text-sm leading-snug ${selected ? "font-semibold text-accent" : "text-ink"}`}
                      >
                        {major.name}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-muted">
                        {compactCurrency(major.earlySalary)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
