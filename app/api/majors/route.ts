import { majors } from "@/lib/data/majors";
import type { MajorsResponse } from "@/lib/types";

/**
 * GET /api/majors
 * Returns every major with salary, unemployment and debt data.
 * Right now this reads placeholder data; in step 8 it will pull
 * real numbers from the College Scorecard API instead.
 */
export async function GET() {
  const body: MajorsResponse = { majors };
  return Response.json(body);
}
