/**
 * Field-level assumptions keyed by the first two digits of a CIP code
 * (the federal classification of majors). These are rough estimates,
 * meant to be directional. Adjust them if you find better data.
 */

/** Approximate yearly pay growth after the first few years, by field. */
const GROWTH_BY_FIELD: Record<string, number> = {
  "11": 0.03, // Computer and information sciences
  "14": 0.03, // Engineering
  "15": 0.025, // Engineering technologies
  "27": 0.035, // Mathematics and statistics
  "40": 0.035, // Physical sciences
  "26": 0.035, // Biological sciences
  "51": 0.02, // Health professions (nursing, etc.)
  "52": 0.032, // Business
  "45": 0.038, // Social sciences (economics, political science)
  "42": 0.03, // Psychology
  "43": 0.025, // Criminal justice and protective services
  "13": 0.015, // Education
  "09": 0.03, // Communication and journalism
  "23": 0.035, // English
  "54": 0.035, // History
  "38": 0.035, // Philosophy and religious studies
  "50": 0.028, // Visual and performing arts
  "24": 0.032, // Liberal arts and general studies
  "31": 0.025, // Parks, recreation, fitness
  "44": 0.02, // Public administration and social work
};
const DEFAULT_GROWTH = 0.03;

/** Fields where many graduates go on to graduate or professional school. */
const GRAD_SCHOOL_FIELDS = new Set(["26", "27", "38", "40", "42", "54"]);
const GRAD_SCHOOL_CODES = new Set(["4510"]); // Political science (often pre-law)

export function fieldGrowth(code: string): number {
  return GROWTH_BY_FIELD[code.padStart(4, "0").slice(0, 2)] ?? DEFAULT_GROWTH;
}

export function oftenLeadsToGradSchool(code: string): boolean {
  const padded = code.padStart(4, "0");
  return GRAD_SCHOOL_FIELDS.has(padded.slice(0, 2)) || GRAD_SCHOOL_CODES.has(padded);
}
