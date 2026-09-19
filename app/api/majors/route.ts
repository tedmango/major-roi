export type MajorResult = {
  major: string;
  debt: number;
  salary: number;
  monthlyPayment: number;
  yearsToPayoff: number;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const school = searchParams.get("school");

  const results: MajorResult[] = [
    { major: "Nursing", debt: 21000, salary: 62000, monthlyPayment: 230, yearsToPayoff: 3.4 },
    { major: "Psychology", debt: 24000, salary: 41000, monthlyPayment: 265, yearsToPayoff: 7.1 },
  ];

  return Response.json({ school, results });
}