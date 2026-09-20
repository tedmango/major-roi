import { getSchool, hasApiKey, ScorecardError } from "@/lib/scorecard";
import { sampleSchools } from "@/lib/sample";
import type { ApiError, SchoolDetailResponse } from "@/lib/types";

/** GET /api/school?id=132903 — one school's costs and bachelor's programs */
export async function GET(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "Missing or invalid school id." } satisfies ApiError, { status: 400 });
  }

  if (!hasApiKey()) {
    const school = sampleSchools.find((s) => s.id === id);
    if (!school) {
      return Response.json({ error: "School not found in sample data." } satisfies ApiError, { status: 404 });
    }
    const body: SchoolDetailResponse = { school, sample: true };
    return Response.json(body);
  }

  try {
    const school = await getSchool(id);
    if (!school) {
      return Response.json({ error: "No school found with that id." } satisfies ApiError, { status: 404 });
    }
    const body: SchoolDetailResponse = { school, sample: false };
    return Response.json(body);
  } catch (err) {
    const status = err instanceof ScorecardError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Could not load school.";
    return Response.json({ error: message } satisfies ApiError, { status });
  }
}
