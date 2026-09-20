"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { AssumptionsPanel } from "@/components/AssumptionsPanel";
import { ComparisonChart } from "@/components/ComparisonChart";
import { BudgetBreakdown } from "@/components/BudgetBreakdown";
import { ProgramStats } from "@/components/ProgramStats";
import { RankingList, type RankedRow } from "@/components/RankingList";
import { RoiSummary } from "@/components/RoiSummary";
import { SampleBanner, SiteBar } from "@/components/SiteBar";
import { cities } from "@/lib/data/cities";
import { calculateBudget, calculateRoi, costPlan, debtAdjustment, schoolAverageDebt } from "@/lib/finance";
import { currency } from "@/lib/format";
import { isIncomeBracket } from "@/lib/income";
import type { Assumptions, SchoolDetail, SchoolDetailResponse } from "@/lib/types";

/** Average federal undergraduate loan rate; adjust with the slider. */
const DEFAULT_INTEREST_RATE = 6.39;

export default function ResultsPage() {
  return (
    <Suspense>
      <Results />
    </Suspense>
  );
}

function Results() {
  const params = useSearchParams();
  const schoolId = Number(params.get("school"));
  const incomeParam = params.get("income");
  const income = isIncomeBracket(incomeParam) ? incomeParam : "unknown";
  const residency = params.get("residency") === "out" ? "out" : "in";
  const payPerYear = Math.max(0, Number(params.get("pay")) || 0);
  const majorCodes = useMemo(() => params.get("majors")?.split(",").filter(Boolean) ?? [], [params]);

  const [school, setSchool] = useState<SchoolDetail | null>(null);
  const [sample, setSample] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [cityId, setCityId] = useState(() => params.get("city") ?? "national");
  const [assumptions, setAssumptions] = useState<Assumptions | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  function selectMajor(code: string) {
    setSelectedCode(code);
    detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (!schoolId) throw new Error("No school was chosen.");
        const res = await fetch(`/api/school?id=${schoolId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load this school.");
        if (cancelled) return;
        const body = data as SchoolDetailResponse;
        const plan = costPlan(body.school, income, residency, payPerYear);
        setSchool(body.school);
        setSample(body.sample);
        setAssumptions({
          debt: plan.debt,
          outOfPocket: plan.cash,
          interestRate: DEFAULT_INTEREST_RATE,
          termYears: 10,
        });
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load this school.");
        setStatus("error");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [schoolId, income, residency, payPerYear]);

  const city = cities.find((c) => c.id === cityId) ?? cities[0];
  const plan = school ? costPlan(school, income, residency, payPerYear) : null;

  const rows: RankedRow[] = useMemo(() => {
    if (!school || !assumptions) return [];
    const avgDebt = schoolAverageDebt(school.programs);
    return school.programs
      .filter((p) => majorCodes.includes(p.code))
      .map((program) => {
        const adjustment = debtAdjustment(program, avgDebt);
        return { program, adjustment, roi: calculateRoi(program, city, assumptions, adjustment) };
      })
      .sort((a, b) => b.roi.positionAt10 - a.roi.positionAt10);
  }, [school, assumptions, majorCodes, city]);

  const selected = rows.find((r) => r.program.code === selectedCode) ?? rows[0];
  const best = rows[0];
  const budget = selected ? calculateBudget(selected.roi.startingSalary, city, selected.roi.monthlyPayment) : null;
  const editHref = `/?${params.toString()}`;

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SiteBar>
        <Link
          href={editHref}
          className="flex items-center gap-1.5 rounded-md text-sm text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Edit answers
        </Link>
      </SiteBar>
      {sample && <SampleBanner />}

      {status === "loading" && <p className="px-6 py-12 text-sm text-muted lg:px-10">Loading your results…</p>}

      {status === "error" && (
        <div className="px-6 py-12 lg:px-10">
          <p className="font-semibold text-negative">{error}</p>
          <p className="mt-2 text-sm text-muted">
            <Link href="/" className="text-accent underline underline-offset-2">
              Start over
            </Link>{" "}
            and choose your school again.
          </p>
        </div>
      )}

      {status === "ready" && school && plan && assumptions && rows.length === 0 && (
        <div className="px-6 py-12 lg:px-10">
          <p className="font-semibold text-ink">None of the chosen majors have earnings data at {school.name}.</p>
          <p className="mt-2 text-sm text-muted">
            <Link href={editHref} className="text-accent underline underline-offset-2">
              Pick different majors
            </Link>{" "}
            to see results.
          </p>
        </div>
      )}

      {status === "ready" && school && plan && assumptions && selected && best && budget && (
        <main className="mx-auto max-w-6xl space-y-6 px-6 py-10 lg:px-10 lg:py-12">
          <section aria-label="Best major">
            <p className="text-sm text-muted">
              {rows.length > 1
                ? `Best return of the ${rows.length} majors you picked at ${school.name}`
                : `Your major at ${school.name}`}
            </p>
            <h1 className="mt-2 max-w-4xl text-4xl font-semibold leading-[1.1] tracking-tight text-accent sm:text-5xl">
              {best.program.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
              {best.roi.breakEvenYear !== null
                ? `Pays for itself about ${best.roi.breakEvenYear.toFixed(1)} years after graduating, and leaves you ${currency(best.roi.positionAt10)} ahead of skipping college by year 10.`
                : `Doesn't pay for itself within 20 years at these costs. Try borrowing less or paying more up front.`}
              {rows.length > 1 &&
                ` That's ${currency(best.roi.positionAt10 - rows[1].roi.positionAt10)} more than ${rows[1].program.title} at the same point.`}
            </p>
          </section>

          <RankingList rows={rows} selectedCode={selected.program.code} onSelect={selectMajor} />

          {rows.length > 1 && (
            <ComparisonChart rows={rows} selectedCode={selected.program.code} onSelect={setSelectedCode} />
          )}

          <p className="text-sm text-muted">
            Money isn&rsquo;t the only reason to choose a major. Use this to weigh cost and pay
            alongside what you enjoy and are good at. Select any major above for its full breakdown.
          </p>

          <div ref={detailRef} className="scroll-mt-6" />
          <ProgramStats
            program={selected.program}
            school={school}
            plan={plan}
            roi={selected.roi}
            city={city}
            cities={cities}
            onCityChange={setCityId}
          />

          <RoiSummary
            roi={selected.roi}
            majorName={selected.program.title}
            cityName={city.id === "national" ? "an average U.S. city" : city.name}
            showChart={rows.length === 1}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <BudgetBreakdown budget={budget} city={city} />
            <AssumptionsPanel
              assumptions={assumptions}
              estimatedDebt={plan.debt}
              majorAdjustment={selected.adjustment}
              majorName={selected.program.title}
              majorDebt={selected.roi.debt}
              monthlyPayment={selected.roi.monthlyPayment}
              totalInterest={selected.roi.totalInterest}
              onChange={(next) => setAssumptions((prev) => (prev ? { ...prev, ...next } : prev))}
              onReset={() =>
                setAssumptions({
                  debt: plan.debt,
                  outOfPocket: plan.cash,
                  interestRate: DEFAULT_INTEREST_RATE,
                  termYears: 10,
                })
              }
            />
          </div>

          <details className="rounded-card border border-line bg-surface px-6 py-4 text-sm">
            <summary className="cursor-pointer font-medium text-ink">How these numbers are calculated</summary>
            <div className="mt-3 max-w-3xl space-y-2 text-sm leading-relaxed text-muted">
              <p>
                Earnings and typical debt come from the U.S. Department of Education&rsquo;s College
                Scorecard: median earnings of this school&rsquo;s graduates in each major, measured a
                few years after graduating. After that, pay grows at an estimated rate for each field
                (about {Math.round(selected.roi.growth * 1000) / 10}% a year for {selected.program.title}).
              </p>
              <p>
                Your cost is the school&rsquo;s net price for your family&rsquo;s income (tuition,
                housing and fees minus grants), times four years. What you can pay covers part of it,
                and the rest is treated as a loan. Each major&rsquo;s loan is then nudged up or down by
                how much its graduates typically borrow compared with the school average, since some
                programs take longer or cost more.
              </p>
              <p>
                Break-even compares your after-tax pay against a same-age worker with a high-school
                diploma starting at <span className="font-mono">$38,000</span>, counting cash you pay,
                wages given up while enrolled, and loan payments. Rent and living costs use the city
                you pick. Estimates are directional, not financial advice.
              </p>
            </div>
          </details>
        </main>
      )}
    </div>
  );
}
