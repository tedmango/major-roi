/**
 * FICTIONAL sample data, used only when SCORECARD_API_KEY is missing
 * so the app can still be demoed. None of these numbers are real.
 */
import type { SchoolDetail, SchoolSummary } from "@/lib/types";

export const sampleSchools: SchoolDetail[] = [
  {
    id: 900001,
    name: "Sample State University",
    city: "Springfield",
    state: "ST",
    isPublic: true,
    tuitionInState: 6400,
    tuitionOutOfState: 22500,
    avgNetPrice: 14200,
    netPriceByIncome: {
      "0-30000": 9800,
      "30001-48000": 11200,
      "48001-75000": 14500,
      "75001-110000": 18300,
      "110001-plus": 20100,
    },
    completionRate: 0.72,
    programsWithoutEarnings: 3,
    programs: [
      { code: "1107", title: "Computer Science", earnings: 78000, earningsYearsAfter: 4, medianDebt: 21500, graduates: 540 },
      { code: "1407", title: "Chemical Engineering", earnings: 82000, earningsYearsAfter: 4, medianDebt: 22800, graduates: 90 },
      { code: "5138", title: "Registered Nursing", earnings: 74000, earningsYearsAfter: 4, medianDebt: 20100, graduates: 310 },
      { code: "5208", title: "Finance and Financial Management", earnings: 64000, earningsYearsAfter: 4, medianDebt: 21000, graduates: 260 },
      { code: "5203", title: "Accounting", earnings: 60000, earningsYearsAfter: 4, medianDebt: 20400, graduates: 220 },
      { code: "2601", title: "Biology, General", earnings: 43000, earningsYearsAfter: 4, medianDebt: 22200, graduates: 410 },
      { code: "4201", title: "Psychology, General", earnings: 41000, earningsYearsAfter: 4, medianDebt: 23300, graduates: 480 },
      { code: "0901", title: "Communication and Media Studies", earnings: 45000, earningsYearsAfter: 4, medianDebt: 22900, graduates: 230 },
      { code: "5007", title: "Fine and Studio Arts", earnings: 34000, earningsYearsAfter: 4, medianDebt: 24100, graduates: 70 },
    ],
  },
  {
    id: 900002,
    name: "Example Private College",
    city: "Riverton",
    state: "ST",
    isPublic: false,
    tuitionInState: 48000,
    tuitionOutOfState: 48000,
    avgNetPrice: 27500,
    netPriceByIncome: {
      "0-30000": 15100,
      "30001-48000": 17800,
      "48001-75000": 22400,
      "75001-110000": 29900,
      "110001-plus": 41200,
    },
    completionRate: 0.81,
    programsWithoutEarnings: 5,
    programs: [
      { code: "1107", title: "Computer Science", earnings: 86000, earningsYearsAfter: 4, medianDebt: 25000, graduates: 120 },
      { code: "4506", title: "Economics", earnings: 68000, earningsYearsAfter: 4, medianDebt: 24500, graduates: 95 },
      { code: "4201", title: "Psychology, General", earnings: 44000, earningsYearsAfter: 4, medianDebt: 25600, graduates: 110 },
      { code: "2301", title: "English Language and Literature, General", earnings: 42000, earningsYearsAfter: 4, medianDebt: 25900, graduates: 60 },
    ],
  },
];

for (const school of sampleSchools) school.programs.sort((a, b) => a.title.localeCompare(b.title));

export function searchSampleSchools(query: string): SchoolSummary[] {
  const q = query.trim().toLowerCase();
  return sampleSchools
    .filter((s) => !q || s.name.toLowerCase().includes(q) || "sample example".includes(q))
    .map(({ id, name, city, state }) => ({ id, name, city, state }));
}
