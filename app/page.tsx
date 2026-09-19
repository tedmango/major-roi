"use client";

import { useEffect, useMemo, useState } from "react";
import { GraduationCapIcon } from "lucide-react";
import { AssumptionsPanel } from "@/components/AssumptionsPanel";
import { BudgetBreakdown } from "@/components/BudgetBreakdown";
import { MajorHeader } from "@/components/MajorHeader";
import { MajorList } from "@/components/MajorList";
import { RoiSummary } from "@/components/RoiSummary";
import { cities } from "@/lib/data/cities";
import { calculateBudget, calculateRoi } from "@/lib/finance";
import type { Assumptions, Major, MajorsResponse } from "@/lib/types";

const DEFAULT_MAJOR_ID = "nursing";
const DEFAULT_CITY_ID = "national";

function defaultAssumptions(debt: number): Assumptions {
  return { debt, interestRate: 6.53, termYears: 10, outOfPocket: 24000 };
}

export default function Home() {
  const [majors, setMajors] = useState<Major[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [majorId, setMajorId] = useState(DEFAULT_MAJOR_ID);
  const [cityId, setCityId] = useState(DEFAULT_CITY_ID);
  const [assumptions, setAssumptions] = useState<Assumptions>(defaultAssumptions(0));

  // Load majors from the backend route (app/api/majors/route.ts)
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/majors");
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data: MajorsResponse = await res.json();
        setMajors(data.majors);
        const first = data.majors.find((m) => m.id === DEFAULT_MAJOR_ID) ?? data.majors[0];
        if (first) {
          setMajorId(first.id);
          setAssumptions(defaultAssumptions(first.avgDebt));
        }
        setStatus("ready");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }
    load();
  }, []);

  const major = majors.find((m) => m.id === majorId) ?? majors[0];
  const city = cities.find((c) => c.id === cityId) ?? cities[0];

  const roi = useMemo(
    () => (major ? calculateRoi(major, city, assumptions) : null),
    [major, city, assumptions],
  );
  const budget = useMemo(
    () => (roi ? calculateBudget(roi.startingSalary, city, roi.monthlyPayment) : null),
    [roi, city],
  );

  function handleSelectMajor(id: string) {
    const next = majors.find((m) => m.id === id);
    if (!next) return;
    setMajorId(id);
    setAssumptions((prev) => ({ ...prev, debt: next.avgDebt }));
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas font-sans text-ink">
      <div className="flex items-center gap-3 border-b border-line bg-surface px-6 py-3 lg:px-10">
        <GraduationCapIcon className="h-5 w-5 text-accent" aria-hidden="true" />
        <p className="text-sm font-semibold tracking-tight">Degree Payback</p>
        <p className="hidden text-sm text-muted sm:block">
          What a major earns, what it costs, and when it pays for itself
        </p>
      </div>

      {status === "loading" && (
        <p className="px-6 py-10 text-sm text-muted lg:px-10">Loading majors…</p>
      )}

      {status === "error" && (
        <div className="px-6 py-10 lg:px-10">
          <p className="text-sm font-semibold text-negative">Couldn&rsquo;t load majors.</p>
          <p className="mt-1 text-sm text-muted">
            The request to /api/majors failed. Check that the dev server is running and that
            app/api/majors/route.ts exists, then refresh the page.
          </p>
        </div>
      )}

      {status === "ready" && major && roi && budget && (
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <aside className="border-b border-line bg-surface lg:h-[calc(100vh-49px)] lg:w-[340px] lg:shrink-0 lg:border-b-0 lg:border-r">
            <div className="h-[420px] lg:h-full">
              <MajorList majors={majors} selectedId={major.id} onSelect={handleSelectMajor} />
            </div>
          </aside>

          <main className="min-w-0 flex-1 overflow-y-auto lg:h-[calc(100vh-49px)]">
            <MajorHeader
              major={major}
              city={city}
              cities={cities}
              roi={roi}
              onCityChange={setCityId}
            />

            <div className="space-y-6 px-6 py-6 lg:px-10 lg:py-8">
              <RoiSummary
                roi={roi}
                majorName={major.name}
                cityName={city.id === "national" ? "an average U.S. city" : city.name}
              />

              <div className="grid gap-6 xl:grid-cols-2">
                <BudgetBreakdown budget={budget} city={city} />
                <AssumptionsPanel
                  assumptions={assumptions}
                  averageDebt={major.avgDebt}
                  monthlyPayment={roi.monthlyPayment}
                  totalInterest={roi.totalInterest}
                  onChange={(next) => setAssumptions((prev) => ({ ...prev, ...next }))}
                  onReset={() => setAssumptions(defaultAssumptions(major.avgDebt))}
                />
              </div>

              <details className="rounded-card border border-line bg-surface px-6 py-4 text-sm">
                <summary className="cursor-pointer font-medium text-ink">
                  How these numbers are calculated
                </summary>
                <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                  <p>
                    Salaries are median full-time wages by major for ages 22&ndash;27 and
                    35&ndash;45, then adjusted for the local wage level of the city you pick
                    (local pay moves with local costs, but only partly).
                  </p>
                  <p>
                    Break-even compares after-tax pay against a same-age worker with a
                    high-school diploma, starting at <span className="font-mono">$38,000</span>.
                    The degree is charged for tuition paid in cash plus four years of wages given
                    up while enrolled, with loan payments subtracted each year of the repayment
                    term.
                  </p>
                  <p>
                    Cost of living uses a national index of 100 with median one-bedroom rent,
                    applied to the first-year budget. Estimates are directional, not financial
                    advice.
                  </p>
                </div>
              </details>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
