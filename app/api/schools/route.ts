import { hasApiKey, ScorecardError, searchSchools } from "@/lib/scorecard";
import { searchSampleSchools } from "@/lib/sample";
import type { ApiError, SchoolSearchResponse } from "@/lib/types";

/** GET /api/schools?q=central florida — search schools by name */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (!hasApiKey()) {
    const body: SchoolSearchResponse = { schools: searchSampleSchools(q), sample: true };
    return Response.json(body);
  }

  if (q.length < 2) {
    const body: SchoolSearchResponse = { schools: [], sample: false };
    return Response.json(body);
  }

  try {
    const body: SchoolSearchResponse = { schools: await searchSchools(q), sample: false };
    return Response.json(body);
  } catch (err) {
    const status = err instanceof ScorecardError ? err.status : 500;
    const message = err instanceof Error ? err.message : "School search failed.";
    return Response.json({ error: message } satisfies ApiError, { status });
  }
}
