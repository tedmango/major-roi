/**
 * Server-side helpers for the U.S. Department of Education
 * College Scorecard API. Only import this from API routes,
 * because it reads the secret API key.
 *
 * Field names match the ones the official collegescorecard.ed.gov
 * site uses. Docs: https://collegescorecard.ed.gov/data/api-documentation/
 */
import type { IncomeBracket, Program, SchoolDetail, SchoolSummary } from "@/lib/types";

const BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools";
const BACHELORS_LEVEL = 3;
const INCOME_KEYS: Exclude<IncomeBracket, "unknown">[] = [
  "0-30000",
  "30001-48000",
  "48001-75000",
  "75001-110000",
  "110001-plus",
];

export class ScorecardError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function hasApiKey(): boolean {
  return Boolean(process.env.SCORECARD_API_KEY);
}

async function scorecardGet(params: Record<string, string>) {
  const url = new URL(BASE_URL);
  url.searchParams.set("api_key", process.env.SCORECARD_API_KEY ?? "");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  // Cache each identical request for a day to stay well under the 1,000/hour limit
  const res = await fetch(url, { next: { revalidate: 86400 } });

  if (res.status === 429) {
    throw new ScorecardError("College Scorecard rate limit reached. Wait a few minutes and try again.", 429);
  }
  if (res.status === 403) {
    throw new ScorecardError("College Scorecard rejected the API key. Check SCORECARD_API_KEY in .env.local.", 502);
  }
  if (!res.ok) {
    throw new ScorecardError(`College Scorecard request failed (status ${res.status}).`, 502);
  }
  const data = (await res.json()) as { results?: unknown[] };
  return Array.isArray(data.results) ? data.results : [];
}

/**
 * Reads a dotted path like "earnings.4_yr.overall_median_earnings".
 * The API sometimes returns flat dotted keys and sometimes nested
 * objects, so this handles both.
 */
export function getPath(obj: unknown, path: string): unknown {
  if (obj === null || typeof obj !== "object") return undefined;
  const record = obj as Record<string, unknown>;
  if (path in record) return record[path];
  const parts = path.split(".");
  for (let i = parts.length - 1; i > 0; i--) {
    const head = parts.slice(0, i).join(".");
    if (head in record) return getPath(record[head], parts.slice(i).join("."));
  }
  return undefined;
}

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function searchSchools(query: string): Promise<SchoolSummary[]> {
  const fields = "id,school.name,school.city,school.state";
  // Try the most precise search first, then simpler ones if the API rejects it or finds nothing
  const attempts: Record<string, string>[] = [
    {
      "school.search": query,
      // Mostly bachelor's-granting (3) or graduate (4) schools
      "school.degrees_awarded.predominant": "3,4",
      sort: "latest.student.size:desc",
      fields,
      per_page: "8",
    },
    { "school.search": query, fields, per_page: "8" },
    { "school.name": query, fields, per_page: "8" },
  ];

  let lastError: unknown = null;
  for (const params of attempts) {
    try {
      const results = await scorecardGet(params);
      const schools = results
        .map((r) => ({
          id: num(getPath(r, "id")) ?? 0,
          name: str(getPath(r, "school.name")),
          city: str(getPath(r, "school.city")),
          state: str(getPath(r, "school.state")),
        }))
        .filter((s) => s.id > 0 && s.name);
      if (schools.length > 0) return schools;
    } catch (err) {
      // A bad key or rate limit won't be fixed by retrying, so stop right away
      if (err instanceof ScorecardError && (err.status === 429 || err.message.includes("API key"))) throw err;
      lastError = err;
    }
  }
  if (lastError) throw lastError;
  return [];
}

export function parseProgram(raw: unknown): Program | null {
  if (num(getPath(raw, "credential.level")) !== BACHELORS_LEVEL) return null;

  // Prefer earnings 4 years after graduating (what the Scorecard site shows),
  // then fall back to the other measurements.
  const candidates: [string, number][] = [
    ["earnings.4_yr.overall_median_earnings", 4],
    ["earnings.5_yr.overall_median_earnings", 5],
    ["earnings.highest.3_yr.overall_median_earnings", 3],
  ];
  let earnings: number | null = null;
  let earningsYearsAfter = 4;
  for (const [path, years] of candidates) {
    const value = num(getPath(raw, path));
    if (value !== null && value > 0) {
      earnings = value;
      earningsYearsAfter = years;
      break;
    }
  }

  const title = str(getPath(raw, "title")).replace(/\.\s*$/, "").trim();
  const code = str(getPath(raw, "code")) || String(num(getPath(raw, "code")) ?? "");
  if (!title || !code || earnings === null) return null;

  return {
    code,
    title,
    earnings,
    earningsYearsAfter,
    medianDebt: num(getPath(raw, "debt.staff_grad_plus.all.eval_inst.median")),
    graduates: num(getPath(raw, "counts.ipeds_awards2")),
  };
}

export function parseSchool(raw: unknown): SchoolDetail {
  const ownership = num(getPath(raw, "school.ownership"));
  const isPublic = ownership === 1;

  const netPriceObj = getPath(raw, "latest.cost.net_price");
  const byIncome = getPath(getPath(netPriceObj, isPublic ? "public" : "private"), "by_income_level");
  const netPriceByIncome: SchoolDetail["netPriceByIncome"] = {};
  for (const key of INCOME_KEYS) {
    const value = num(getPath(byIncome, key));
    if (value !== null) netPriceByIncome[key] = Math.max(0, value);
  }

  const rawPrograms = getPath(raw, "latest.programs.cip_4_digit");
  const list = Array.isArray(rawPrograms) ? rawPrograms : [];
  const bachelors = list.filter((p) => num(getPath(p, "credential.level")) === BACHELORS_LEVEL);

  const seen = new Set<string>();
  const programs: Program[] = [];
  for (const p of bachelors) {
    const parsed = parseProgram(p);
    if (parsed && !seen.has(parsed.code)) {
      seen.add(parsed.code);
      programs.push(parsed);
    }
  }
  programs.sort((a, b) => a.title.localeCompare(b.title));

  const completion = num(getPath(raw, "latest.completion.consumer_rate"));

  return {
    id: num(getPath(raw, "id")) ?? 0,
    name: str(getPath(raw, "school.name")),
    city: str(getPath(raw, "school.city")),
    state: str(getPath(raw, "school.state")),
    isPublic,
    tuitionInState: num(getPath(raw, "latest.cost.tuition.in_state")),
    tuitionOutOfState: num(getPath(raw, "latest.cost.tuition.out_of_state")),
    avgNetPrice: num(getPath(raw, "latest.cost.avg_net_price.overall")),
    netPriceByIncome,
    completionRate: completion !== null && completion <= 1 ? completion : null,
    programs,
    programsWithoutEarnings: Math.max(0, new Set(bachelors.map((p) => str(getPath(p, "code")))).size - programs.length),
  };
}

export async function getSchool(id: number): Promise<SchoolDetail | null> {
  const results = await scorecardGet({
    id: String(id),
    fields: [
      "id",
      "school.name",
      "school.city",
      "school.state",
      "school.ownership",
      "latest.cost.tuition.in_state",
      "latest.cost.tuition.out_of_state",
      "latest.cost.avg_net_price.overall",
      "latest.cost.net_price",
      "latest.completion.consumer_rate",
      "latest.programs.cip_4_digit",
    ].join(","),
    all_programs_nested: "true",
  });
  return results.length ? parseSchool(results[0]) : null;
}