export type IncomeBracket =
  | "0-30000"
  | "30001-48000"
  | "48001-75000"
  | "75001-110000"
  | "110001-plus"
  | "unknown";

export type Residency = "in" | "out";

/** One row in the school search dropdown */
export interface SchoolSummary {
  id: number;
  name: string;
  city: string;
  state: string;
}

/** A bachelor's program (4-digit CIP field of study) at one school */
export interface Program {
  code: string;
  title: string;
  /** Median annual earnings of graduates, from College Scorecard */
  earnings: number;
  /** How many years after graduating the earnings were measured */
  earningsYearsAfter: number;
  /** Median federal loan debt of graduates who borrowed (null if suppressed) */
  medianDebt: number | null;
  /** Number of graduates in the cohort (null if not reported) */
  graduates: number | null;
}

export interface SchoolDetail extends SchoolSummary {
  isPublic: boolean;
  tuitionInState: number | null;
  tuitionOutOfState: number | null;
  /** Average yearly net price across all incomes */
  avgNetPrice: number | null;
  /** Yearly net price by family income bracket */
  netPriceByIncome: Partial<Record<Exclude<IncomeBracket, "unknown">, number>>;
  /** Share of students who graduate, 0–1 (null if not reported) */
  completionRate: number | null;
  /** Bachelor's programs that have earnings data */
  programs: Program[];
  /** Bachelor's programs listed without earnings data */
  programsWithoutEarnings: number;
}

export interface SchoolSearchResponse {
  schools: SchoolSummary[];
  sample: boolean;
}

export interface SchoolDetailResponse {
  school: SchoolDetail;
  sample: boolean;
}

export interface ApiError {
  error: string;
}

export interface City {
  id: string;
  name: string;
  /** 100 = national average cost of living */
  costIndex: number;
  /** Median monthly rent, one bedroom */
  medianRent: number;
}

export interface Assumptions {
  debt: number;
  interestRate: number;
  termYears: number;
  outOfPocket: number;
}
