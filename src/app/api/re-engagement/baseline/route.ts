import { NextRequest, NextResponse } from "next/server";
import { snapshotRejectedCandidate } from "@/lib/re-engagement/engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const candidateId = body.candidateId as string | undefined;
    const roleBriefId = body.roleBriefId as string | undefined;
    const rejectionReason = body.rejectionReason as string | undefined;

    if (!candidateId?.trim() || !roleBriefId?.trim()) {
      return NextResponse.json(
        { error: "candidateId and roleBriefId are required", field: "candidateId" },
        { status: 400 },
      );
    }

    if (!rejectionReason?.trim()) {
      return NextResponse.json(
        { error: "Rejection reason is required", field: "rejectionReason" },
        { status: 400 },
      );
    }

    const snapshot = await snapshotRejectedCandidate({
      candidateId: candidateId.trim(),
      roleBriefId: roleBriefId.trim(),
      rejectionReason: rejectionReason.trim(),
    });

    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error("Failed to snapshot rejected candidate:", error);
    return NextResponse.json(
      { error: "Failed to snapshot rejected candidate" },
      { status: 500 },
    );
  }
}
