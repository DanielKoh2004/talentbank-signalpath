import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const allowedStatuses = new Set(["pending", "reviewed", "contacted", "dismissed"]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const { eventId } = await params;
    const body = await request.json();
    const status = body.status as string | undefined;

    if (!status || !allowedStatuses.has(status)) {
      return NextResponse.json(
        { error: "status must be pending, reviewed, contacted, or dismissed" },
        { status: 400 },
      );
    }

    const event = await prisma.$transaction(async (tx) => {
      const updatedEvent = await tx.reEngagementEvent.update({
        where: { id: eventId },
        data: {
          status,
          reviewedAt: status === "pending" ? null : new Date(),
        },
      });

      if (status === "contacted") {
        await tx.opportunityInteraction.updateMany({
          where: {
            roleBriefId: updatedEvent.roleBriefId,
            candidateId: updatedEvent.candidateId,
          },
          data: { employerStatus: "contacted" },
        });
      }

      return updatedEvent;
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Failed to update re-engagement event:", error);
    return NextResponse.json(
      { error: "Failed to update re-engagement event" },
      { status: 500 },
    );
  }
}
