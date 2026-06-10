import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function parseJsonObject<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? (parsed as T) : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const employerId = request.nextUrl.searchParams.get("employerId");
    const status = request.nextUrl.searchParams.get("status");

    const events = await prisma.reEngagementEvent.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(employerId ? { roleBrief: { employerId } } : {}),
      },
      include: {
        candidate: { include: { user: true } },
        roleBrief: {
          include: {
            roleFamily: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      events: events.map((event) => ({
        id: event.id,
        candidateId: event.candidateId,
        candidateName: event.candidate.user.name,
        roleBriefId: event.roleBriefId,
        roleTitle: event.roleBrief.title,
        roleFamilyName: event.roleBrief.roleFamily?.name ?? null,
        previousScore: event.previousScore,
        currentScore: event.currentScore,
        deltaExplanation: event.deltaExplanation,
        deltaSummary: parseJsonObject(event.deltaSummaryJson),
        triggerType: event.triggerType,
        status: event.status,
        draftMessage: event.draftMessage,
        createdAt: event.createdAt,
        reviewedAt: event.reviewedAt,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch re-engagement events:", error);
    return NextResponse.json(
      { error: "Failed to fetch re-engagement events" },
      { status: 500 },
    );
  }
}
