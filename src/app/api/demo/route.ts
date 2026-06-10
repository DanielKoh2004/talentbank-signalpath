import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";

// =============================================================================
// POST /api/demo — Demo reset endpoint
// Re-seeds the database with known demo data.
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action !== "reset") {
      return NextResponse.json(
        { error: "Unknown action. Use { action: 'reset' }." },
        { status: 400 }
      );
    }

    // Run the Prisma seed script
    execSync("npx prisma db seed", {
      cwd: process.cwd(),
      stdio: "pipe",
      timeout: 30000,
    });

    return NextResponse.json({
      message: "Demo data reset successfully.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Demo reset failed:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: `Reset failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// GET /api/demo — Check demo status
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Demo API is running.",
    personas: ["Aisha Razak (candidate)", "DataCo HR (employer)", "UM Admin (university)"],
    expectedScores: {
      beforeAbProject: "61%",
      afterAbProject: "79%",
    },
  });
}
