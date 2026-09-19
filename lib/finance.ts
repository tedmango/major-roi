import { baseNonHousingSpend } from "@/lib/data/cities";
import type { Assumptions, City, Major } from "@/lib/types";

export const HORIZON_YEARS = 20;

/** Median earnings for a full-time worker with only a high-school diploma. */
const BASELINE_START = 38000;
const BASELINE_AT_15 = 52000;
/** Share of baseline wages a student still earns while enrolled. */
const IN_SCHOOL_EARNINGS_SHARE = 0.4;
const YEARS_ENROLLED = 4;

export interface ProjectionPoint {
  year: number;
  gradSalary: number;
  baselineSalary: number;
  /** Cumulative cash position vs. skipping the degree, after tax and loan payments. */
  position: number;
}

export interface RoiResult {
  points: ProjectionPoint[];
  breakEvenYear: number | null;
  upfrontCost: number;
  forgoneEarnings: number;
  monthlyPayment: number;
  totalInterest: number;
  positionAt10: number;
  positionAt20: number;
  startingSalary: number;
  midSalary: number;
  /** Starting salary in national-average purchasing power. */
  adjustedStartingSalary: number;
}

export interface MonthlyBudget {
  gross: number;
  takeHome: number;
  rent: number;
  otherLiving: number;
  loanPayment: number;
  leftover: number;
}

/** Smooth approximation of combined federal, FICA and state effective tax rate. */
export function effectiveTaxRate(gross: number): number {
  return 0.12 + 0.25 * (1 - Math.exp(-gross / 120000));
}

export function afterTax(gross: number): number {
  return gross * (1 - effectiveTaxRate(gross));
}

export function monthlyLoanPayment(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

/** Local wages move with local costs, but only partially. */
export function wageMultiplier(city: City): number {
  return 1 + 0.35 * ((city.costIndex - 100) / 100);
}

function salaryAtYear(start: number, midpoint: number, year: number): number {
  const growth = Math.pow(midpoint / start, 1 / 14);
  return start * Math.pow(growth, Math.max(0, year - 1));
}

export function calculateRoi(major: Major, city: City, assumptions: Assumptions): RoiResult {
  const multiplier = wageMultiplier(city);
  const startingSalary = major.earlySalary * multiplier;
  const midSalary = major.midSalary * multiplier;

  const forgoneEarnings =
    YEARS_ENROLLED * afterTax(BASELINE_START) * (1 - IN_SCHOOL_EARNINGS_SHARE);
  const upfrontCost = assumptions.outOfPocket + forgoneEarnings;

  const monthlyPayment = monthlyLoanPayment(
    assumptions.debt,
    assumptions.interestRate,
    assumptions.termYears,
  );
  const totalInterest = Math.max(
    0,
    monthlyPayment * assumptions.termYears * 12 - assumptions.debt,
  );

  const points: ProjectionPoint[] = [];
  let cumulative = -upfrontCost;
  let breakEvenYear: number | null = null;

  for (let year = 1; year <= HORIZON_YEARS; year++) {
    const gradSalary = salaryAtYear(startingSalary, midSalary, year);
    const baselineSalary = salaryAtYear(BASELINE_START, BASELINE_AT_15, year);
    const loanThisYear = year <= assumptions.termYears ? monthlyPayment * 12 : 0;

    const previous = cumulative;
    cumulative += afterTax(gradSalary) - afterTax(baselineSalary) - loanThisYear;

    if (breakEvenYear === null && previous < 0 && cumulative >= 0) {
      const fraction = cumulative === previous ? 0 : -previous / (cumulative - previous);
      breakEvenYear = year - 1 + fraction;
    }

    points.push({
      year,
      gradSalary: Math.round(gradSalary),
      baselineSalary: Math.round(baselineSalary),
      position: Math.round(cumulative),
    });
  }

  return {
    points,
    breakEvenYear,
    upfrontCost,
    forgoneEarnings,
    monthlyPayment,
    totalInterest,
    positionAt10: points[9].position,
    positionAt20: points[HORIZON_YEARS - 1].position,
    startingSalary,
    midSalary,
    adjustedStartingSalary: startingSalary * (100 / city.costIndex),
  };
}

export function calculateBudget(
  startingSalary: number,
  city: City,
  monthlyPayment: number,
): MonthlyBudget {
  const takeHome = afterTax(startingSalary) / 12;
  const rent = city.medianRent;
  const otherLiving = (baseNonHousingSpend * (city.costIndex / 100)) / 12;
  return {
    gross: startingSalary / 12,
    takeHome,
    rent,
    otherLiving,
    loanPayment: monthlyPayment,
    leftover: takeHome - rent - otherLiving - monthlyPayment,
  };
}
