"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import type { SchoolSearchResponse, SchoolSummary } from "@/lib/types";

interface SchoolSearchProps {
  selected: SchoolSummary | null;
  onSelect: (school: SchoolSummary | null) => void;
  onSampleMode?: (sample: boolean) => void;
}

export function SchoolSearch({ selected, onSelect, onSampleMode }: SchoolSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SchoolSummary[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const listId = useId();

  useEffect(() => {
    if (selected) return;
    const q = query.trim();
    const timer = setTimeout(async () => {
      const id = ++requestId.current;
      setStatus("loading");
      try {
        const res = await fetch(`/api/schools?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "School search failed.");
        if (id !== requestId.current) return;
        const body = data as SchoolSearchResponse;
        setResults(body.schools);
        onSampleMode?.(body.sample);
        setActive(0);
        setStatus("idle");
      } catch (err) {
        if (id !== requestId.current) return;
        setError(err instanceof Error ? err.message : "School search failed.");
        setStatus("error");
      }
    }, q.length < 2 ? 0 : 300);
    return () => clearTimeout(timer);
  }, [query, selected, onSampleMode]);

  function choose(school: SchoolSummary) {
    onSelect(school);
    setOpen(false);
    setQuery("");
  }

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-md border border-accent bg-accent-soft px-4 py-3">
        <div>
          <p className="font-semibold text-accent">{selected.name}</p>
          <p className="text-sm text-muted">
            {selected.city}, {selected.state}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          <XIcon className="h-4 w-4" aria-hidden="true" />
          Change school
        </button>
      </div>
    );
  }

  const showList = open && (results.length > 0 || query.trim().length >= 2);

  return (
    <div className="relative">
      <SearchIcon
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label="Search for a college"
        value={query}
        placeholder="Start typing a college name"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => Math.min(results.length - 1, i + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(0, i - 1));
          } else if (e.key === "Enter" && results[active]) {
            e.preventDefault();
            choose(results[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className="w-full rounded-md border border-line bg-surface py-3 pl-10 pr-3 text-base text-ink outline-none transition-colors placeholder:text-muted focus:border-accent"
      />

      {status === "error" && <p className="mt-2 text-sm text-negative">{error}</p>}

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-80 w-full overflow-y-auto rounded-md border border-line bg-surface py-1 shadow-[0_8px_24px_rgba(23,23,28,0.08)]"
        >
          {results.length === 0 && (
            <li className="px-4 py-3 text-sm text-muted">
              {status === "loading" ? "Searching…" : "No colleges match. Try the full name, like “University of Central Florida”."}
            </li>
          )}
          {results.map((school, i) => (
            <li key={school.id} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(school)}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full flex-col px-4 py-2.5 text-left ${i === active ? "bg-accent-soft" : ""}`}
              >
                <span className="text-sm font-medium text-ink">{school.name}</span>
                <span className="text-xs text-muted">
                  {school.city}, {school.state}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
