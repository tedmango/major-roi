"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProgramPicker, MAX_MAJORS } from "@/components/ProgramPicker";
import { SampleBanner, SiteBar } from "@/components/SiteBar";
import { SchoolSearch } from "@/components/SchoolSearch";
import { cities } from "@/lib/data/cities";
import { costPlan } from "@/lib/finance";
import { currency } from "@/lib/format";
import { INCOME_BRACKETS, isIncomeBracket } from "@/lib/income";
import type {
  IncomeBracket,
  Residency,
  SchoolDetail,
  SchoolDetailResponse,
  SchoolSummary,
} from "@/lib/types";

/** Pre-filled demo answers. 132903 is the University of Central Florida's federal ID. */
const EXAMPLES = {
  real: { schoolId: 132903, majors: ["5138", "1107", "4201", "5202"] },
  sample: { schoolId: 900001, majors: ["1107", "5138", "4201", "5007"] },
};

export default function IntakePage() {
  return (
    <Suspense>
      <IntakeForm />
    </Suspense>
  );
}

function IntakeForm() {
  const router = useRouter();
  const params = useSearchParams();

  // Pre-fill from the URL when coming back via "Edit answers"
  const [school, setSchool] = useState<SchoolSummary | null>(null);
  const [detail, setDetail] = useState<SchoolDetail | null>(null);
  const [detailStatus, setDetailStatus] = useState<"idle" | "loading" | "error">("idle");
  const [detailError, setDetailError] = useState("");
  const [sample, setSample] = useState(false);
  const [income, setIncome] = useState<IncomeBracket>(() => {
    const v = params.get("income");
    return isIncomeBracket(v) ? v : "48001-75000";
  });
  const [residency, setResidency] = useState<Residency>(params.get("residency") === "out" ? "out" : "in");
  const [payPerYear, setPayPerYear] = useState(() => Number(params.get("pay") ?? 5000) || 0);
  const [majors, setMajors] = useState<string[]>(() => params.get("majors")?.split(",").filter(Boolean) ?? []);
  const [cityId, setCityId] = useState(() => params.get("city") ?? "national");
  const [schoolId, setSchoolId] = useState<number | null>(() => Number(params.get("school")) || null);
  const [showErrors, setShowErrors] = useState(false);

  // Load the chosen school's costs and majors
  useEffect(() => {
    if (!schoolId) return;
    let cancelled = false;
    async function load() {
      setDetailStatus("loading");
      try {
        const res = await fetch(`/api/school?id=${schoolId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load this school.");
        if (cancelled) return;
        const body = data as SchoolDetailResponse;
        setDetail(body.school);
        setSample(body.sample);
        setSchool({ id: body.school.id, name: body.school.name, city: body.school.city, state: body.school.state });
        const valid = new Set(body.school.programs.map((p) => p.code));
        setMajors((prev) => prev.filter((code) => valid.has(code)));
        setDetailStatus("idle");
      } catch (err) {
        if (cancelled) return;
        setDetailError(err instanceof Error ? err.message : "Could not load this school.");
        setDetailStatus("error");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [schoolId]);

  const handleSampleMode = useCallback((value: boolean) => setSample(value), []);

  function handleSchool(next: SchoolSummary | null) {
    setSchool(next);
    setDetail(null);
    setMajors([]);
    setSchoolId(next?.id ?? null);
  }

  function fillExample() {
    const example = sample ? EXAMPLES.sample : EXAMPLES.real;
    setIncome("48001-75000");
    setResidency("in");
    setPayPerYear(6000);
    setShowErrors(false);
    if (schoolId === example.schoolId && detail) {
      const valid = new Set(detail.programs.map((p) => p.code));
      setMajors(example.majors.filter((code) => valid.has(code)));
    } else {
      setSchool(null);
      setDetail(null);
      setMajors(example.majors);
      setSchoolId(example.schoolId);
    }
  }

  function toggleMajor(code: string) {
    setMajors((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : prev.length >= MAX_MAJORS ? prev : [...prev, code],
    );
  }

  const plan = detail ? costPlan(detail, income, residency, payPerYear) : null;
  const ready = Boolean(detail) && majors.length > 0;

  function submit() {
    if (!ready || !detail) {
      setShowErrors(true);
      return;
    }
    const query = new URLSearchParams({
      school: String(detail.id),
      income,
      residency: detail.isPublic ? residency : "in",
      pay: String(payPerYear),
      majors: majors.join(","),
      city: cityId,
    });
    router.push(`/results?${query}`);
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SiteBar />
      {sample && <SampleBanner />}

      <main className="mx-auto max-w-2xl px-6 pb-24 pt-12 lg:pt-16">
        <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
          Which major pays off at your school?
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
          Tell us where you&rsquo;re going and what you can afford. We&rsquo;ll use federal data on
          what that school&rsquo;s graduates actually earn to show which major pays you back fastest.
        </p>
        <button
          type="button"
          onClick={fillExample}
          className="mt-5 rounded-md text-sm font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Not sure yet? Try an example
        </button>

        <div className="mt-12 space-y-12">
          <Step number={1} title="Where are you going to college?">
            <SchoolSearch selected={school} onSelect={handleSchool} onSampleMode={handleSampleMode} />
            {detailStatus === "loading" && <p className="mt-3 text-sm text-muted">Loading costs and majors…</p>}
            {detailStatus === "error" && <p className="mt-3 text-sm text-negative">{detailError}</p>}
            {showErrors && !school && <p className="mt-3 text-sm text-negative">Choose a school to continue.</p>}
          </Step>

          <Step number={2} title="What will it cost you?">
            <fieldset>
              <legend className="text-sm font-medium text-ink">Family income per year</legend>
              <p className="mt-1 text-xs text-muted">
                Colleges charge different net prices depending on income, after grants.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {INCOME_BRACKETS.map((b) => (
                  <Pill key={b.value} name="income" checked={income === b.value} onChange={() => setIncome(b.value)}>
                    {b.label}
                  </Pill>
                ))}
              </div>
            </fieldset>

            {detail?.isPublic && (
              <fieldset className="mt-8">
                <legend className="text-sm font-medium text-ink">Do you live in {detail.state}?</legend>
                <p className="mt-1 text-xs text-muted">Public schools charge more to out-of-state students.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill name="residency" checked={residency === "in"} onChange={() => setResidency("in")}>
                    Yes, in-state
                  </Pill>
                  <Pill name="residency" checked={residency === "out"} onChange={() => setResidency("out")}>
                    No, out-of-state
                  </Pill>
                </div>
              </fieldset>
            )}

            <div className="mt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label htmlFor="pay-amount" className="text-sm font-medium text-ink">
                  What you and your family can pay each year
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted">
                    $
                  </span>
                  <input
                    id="pay-amount"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={100}
                    value={payPerYear}
                    onChange={(e) => setPayPerYear(Math.max(0, Math.round(Number(e.target.value) || 0)))}
                    className="w-32 rounded-md border border-line bg-surface py-1.5 pl-7 pr-2 text-right font-mono text-sm text-ink outline-none focus:border-accent"
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-muted">Savings, family help, outside scholarships and work. The rest is borrowed.</p>
              <input
                type="range"
                aria-label="What you and your family can pay each year"
                min={0}
                max={60000}
                step={500}
                value={Math.min(payPerYear, 60000)}
                onChange={(e) => setPayPerYear(Number(e.target.value))}
                className="mt-4 w-full"
              />
            </div>

            {plan && (
              <p className="mt-6 border-l-2 border-accent pl-4 text-sm leading-relaxed text-muted">
                At {detail?.name}, families like yours pay about{" "}
                <span className="font-mono text-ink">{currency(plan.netPricePerYear)}</span> a year.
                Over four years that&rsquo;s <span className="font-mono text-ink">{currency(plan.totalCost)}</span>,
                so you&rsquo;d borrow around <span className="font-mono text-ink">{currency(plan.debt)}</span>.
              </p>
            )}
          </Step>

          <Step number={3} title="Which majors are you considering?">
            {!detail ? (
              <p className="rounded-md border border-dashed border-line px-4 py-6 text-sm text-muted">
                Choose a school first to see its majors.
              </p>
            ) : (
              <>
                <p className="mb-3 text-sm text-muted">
                  Pick up to {MAX_MAJORS}. {majors.length} of {MAX_MAJORS} chosen.
                </p>
                <ProgramPicker
                  programs={detail.programs}
                  selected={majors}
                  onToggle={toggleMajor}
                  hiddenCount={detail.programsWithoutEarnings}
                />
              </>
            )}
            {showErrors && detail && majors.length === 0 && (
              <p className="mt-3 text-sm text-negative">Pick at least one major to compare.</p>
            )}
          </Step>

          <Step number={4} title="Where might you live after graduating?">
            <p className="mb-3 text-sm text-muted">Used for rent and living costs in your first-year budget.</p>
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              aria-label="City after graduation"
              className="w-full rounded-md border border-line bg-surface px-3 py-3 text-base text-ink outline-none focus:border-accent sm:w-80"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Step>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-line pt-8">
          <button
            type="button"
            onClick={submit}
            className="rounded-md bg-accent px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Compare majors
          </button>
          {!ready && (
            <p className="text-sm text-muted">
              {!detail ? "Choose a school and at least one major." : "Pick at least one major."}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 sm:grid-cols-[2.5rem_1fr]">
      <span className="font-mono text-sm text-muted sm:pt-1">{number}</span>
      <div>
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-ink">{title}</h2>
        {children}
      </div>
    </section>
  );
}

function Pill({
  name,
  checked,
  onChange,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={`inline-block rounded-md border px-3.5 py-2 text-sm transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
          checked ? "border-accent bg-accent-soft font-semibold text-accent" : "border-line bg-surface text-ink hover:border-muted/50"
        }`}
      >
        {children}
      </span>
    </label>
  );
}
