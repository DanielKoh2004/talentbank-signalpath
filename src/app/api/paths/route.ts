import { NextRequest, NextResponse } from "next/server";
import { generatePaths } from "@/lib/paths/path-engine";

// =============================================================================
// GET /api/paths — Generate career paths for a candidate
// Server-computed from accepted evidence. No React Query needed.
// =============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const candidateId = searchParams.get("candidateId");

  if (!candidateId) {
    return NextResponse.json(
      { error: "candidateId is required" },
      { status: 400 }
    );
  }

  try {
    const result = await generatePaths(candidateId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Path generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate career paths" },
      { status: 500 }
    );
  }
}
