import { NextRequest, NextResponse } from "next/server";
import { scanReEngagement } from "@/lib/re-engagement/engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const employerId = body.employerId as string | undefined;
    const roleBriefId = body.roleBriefId as string | undefined;

    const events = await scanReEngagement({
      employerId,
      roleBriefId,
    });

    return NextResponse.json({
      events,
      scannedCount: events.length,
    });
  } catch (error) {
    console.error("Failed to scan re-engagement events:", error);
    return NextResponse.json(
      { error: "Failed to scan re-engagement events" },
      { status: 500 },
    );
  }
}
