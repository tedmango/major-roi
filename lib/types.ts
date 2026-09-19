export interface Major {
  id: string;
  name: string;
  category: string;
  /** Median annual wage, ages 22–27 (recent grads) */
  earlySalary: number;
  /** Median annual wage, ages 35–45 (mid-career) */
  midSalary: number;
  /** Unemployment rate for recent grads, percent */
  unemployment: number;
  /** Share of degree holders who go on to grad school, percent */
  gradSchoolShare: number;
  /** Average debt at graduation for borrowers */
  avgDebt: number;
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

/** Shape of the JSON returned by GET /api/majors */
export interface MajorsResponse {
  majors: Major[];
}
