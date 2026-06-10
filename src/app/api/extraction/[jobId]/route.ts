import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// =============================================================================
// GET /api/extraction/[jobId] — Poll extraction job status
// POST /api/extraction/[jobId] — Trigger extraction run
//
// Note: This uses bounded fallback polling (client polls with intervals).
// Future: upgrade to SSE for realtime push.
// =============================================================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const job = await prisma.extractionJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      status: true,
      extractionSource: true,
      progressLabel: true,
      errorMessage: true,
      createdClaimCount: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ job });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const job = await prisma.extractionJob.findUnique({
    where: { id: jobId },
    include: { artifact: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.status !== "queued") {
    return NextResponse.json(
      { error: `Job is already ${job.status}` },
      { status: 409 }
    );
  }

  // Dynamic import to avoid circular deps during build
  try {
    const { runExtraction } = await import("@/lib/extraction/extractor");
    const result = await runExtraction(jobId);

    return NextResponse.json({
      success: result.success,
      claimCount: result.claimCount,
      error: result.error,
    });
  } catch (error) {
    console.error("Extraction failed:", error);

    await prisma.extractionJob.update({
      where: { id: jobId },
      data: {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return NextResponse.json(
      { error: "Extraction failed" },
      { status: 500 }
    );
  }
}
