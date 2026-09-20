import { baseNonHousingSpend } from "@/lib/data/cities";
import { fieldGrowth } from "@/lib/fields";
import type { Assumptions, City, IncomeBracket, Program, Residency, SchoolDetail } from "@/lib/types";

export const HORIZON_YEARS = 20;
export const YEARS_ENROLLED = 4;
/** Federal loan limit for most dependent undergraduates over a whole degree. */
export const FEDERAL_UNDERGRAD_LIMIT = 31000;

/** Median earnings for a full-time worker with only a high-school diploma. */
const BASELINE_START = 38000;
const BASELINE_AT_15 = 52000;
/** Share of baseline wages a student still earns while enrolled. */
const IN_SCHOOL_EARNINGS_SHARE = 0.4;

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
  /** Debt used for this major after the per-major adjustment */
  debt: number;
  /** Yearly pay growth assumed for this field */
  growth: number;
}

export interface MonthlyBudget {
  gross: number;
  takeHome: number;
  rent: number;
  otherLiving: number;
  loanPayment: number;
  leftover: number;
}

export interface CostPlan {
  netPricePerYear: number;
  totalCost: number;
  /** Paid in cash over the degree (savings, family help, work) */
  cash: number;
  /** Borrowed to cover the rest */
  debt: number;
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

/** Yearly net price for this family, adding the out-of-state premium at public schools. */
export function netPriceFor(school: SchoolDetail, income: IncomeBracket, residency: Residency): number {
  const byIncome = income === "unknown" ? undefined : school.netPriceByIncome[income];
  let price = byIncome ?? school.avgNetPrice ?? school.tuitionInState ?? 0;
  if (school.isPublic && residency === "out" && school.tuitionOutOfState && school.tuitionInState) {
    price += Math.max(0, school.tuitionOutOfState - school.tuitionInState);
  }
  return price;
}

export function costPlan(
  school: SchoolDetail,
  income: IncomeBracket,
  residency: Residency,
  payPerYear: number,
): CostPlan {
  const netPricePerYear = netPriceFor(school, income, residency);
  const totalCost = netPricePerYear * YEARS_ENROLLED;
  const cash = Math.min(totalCost, Math.max(0, payPerYear) * YEARS_ENROLLED);
  return { netPricePerYear, totalCost, cash, debt: Math.max(0, totalCost - cash) };
}

/** Salary in a given year after graduation, anchored on the measured earnings point. */
function gradSalaryAt(program: Program, year: number): number {
  const growth = fieldGrowth(program.code);
  return program.earnings * Math.pow(1 + growth, year - program.earningsYearsAfter);
}

/** Average of the typical debt across a school's majors (null if none published). */
export function schoolAverageDebt(programs: Program[]): number | null {
  const debts = programs.map((p) => p.medianDebt).filter((d): d is number => d !== null);
  return debts.length ? debts.reduce((a, b) => a + b, 0) / debts.length : null;
}

/**
 * How much more or less this major's graduates borrow than the school average.
 * Positive means this major tends to cost more (longer programs, extra fees).
 */
export function debtAdjustment(program: Program, averageDebt: number | null): number {
  if (program.medianDebt === null || averageDebt === null) return 0;
  return program.medianDebt - averageDebt;
}

function baselineSalaryAt(year: number): number {
  const growth = Math.pow(BASELINE_AT_15 / BASELINE_START, 1 / 14);
  return BASELINE_START * Math.pow(growth, Math.max(0, year - 1));
}

export function calculateRoi(
  program: Program,
  city: City,
  assumptions: Assumptions,
  debtAdjust = 0,
): RoiResult {
  const debt = Math.max(0, assumptions.debt + debtAdjust);
  const forgoneEarnings =
    YEARS_ENROLLED * afterTax(BASELINE_START) * (1 - IN_SCHOOL_EARNINGS_SHARE);
  const upfrontCost = assumptions.outOfPocket + forgoneEarnings;

  const monthlyPayment = monthlyLoanPayment(debt, assumptions.interestRate, assumptions.termYears);
  const totalInterest = Math.max(0, monthlyPayment * assumptions.termYears * 12 - debt);

  const points: ProjectionPoint[] = [];
  let cumulative = -upfrontCost;
  let breakEvenYear: number | null = null;

  for (let year = 1; year <= HORIZON_YEARS; year++) {
    const gradSalary = gradSalaryAt(program, year);
    const baselineSalary = baselineSalaryAt(year);
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

  const startingSalary = gradSalaryAt(program, 1);
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
    midSalary: gradSalaryAt(program, 15),
    adjustedStartingSalary: startingSalary * (100 / city.costIndex),
    debt,
    growth: fieldGrowth(program.code),
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
