import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  buildUniversityReadiness,
  type UniversityAggregateRow,
} from "@/lib/university/aggregate-readiness";

export async function GET(request: NextRequest) {
  try {
    const requestedCohortId = request.nextUrl.searchParams.get("cohortId");

    const cohorts = await prisma.universityCohort.findMany({
      orderBy: [{ year: "desc" }, { universityName: "asc" }],
      select: {
        id: true,
        universityName: true,
        facultyName: true,
        programName: true,
        year: true,
        studentCount: true,
        createdAt: true,
      },
    });

    if (cohorts.length === 0) {
      return NextResponse.json({ cohorts: [], dashboard: null });
    }

    const selectedCohort =
      cohorts.find((cohort) => cohort.id === requestedCohortId) ?? cohorts[0];

    const aggregates = await prisma.cohortAggregate.findMany({
      where: { cohortId: selectedCohort.id },
      include: {
        roleFamily: { select: { id: true, name: true } },
        skill: { select: { id: true, name: true } },
      },
      orderBy: [{ metricType: "asc" }, { metricValue: "asc" }],
    });

    const rows: UniversityAggregateRow[] = aggregates.map((aggregate) => ({
      id: aggregate.id,
      roleFamilyId: aggregate.roleFamilyId,
      roleFamilyName: aggregate.roleFamily?.name ?? null,
      skillId: aggregate.skillId,
      skillName: aggregate.skill?.name ?? null,
      metricType: aggregate.metricType,
      metricValue: aggregate.metricValue,
      metricLabel: aggregate.metricLabel,
      denominator: aggregate.denominator,
      computedAt: aggregate.computedAt,
    }));

    const dashboard = buildUniversityReadiness(rows);
    const latestComputedAt =
      aggregates
        .map((aggregate) => aggregate.computedAt)
        .sort((a, b) => b.getTime() - a.getTime())[0] ?? selectedCohort.createdAt;

    return NextResponse.json({
      cohorts,
      selectedCohort,
      dashboard: {
        ...dashboard,
        lastComputedAt: latestComputedAt,
        source: "precomputed_cohort_aggregates",
        privacyBoundary:
          "Aggregate-only. No candidate names, emails, artifacts, or individual scores are returned.",
      },
    });
  } catch (error) {
    console.error("Failed to fetch university dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch university dashboard" },
      { status: 500 },
    );
  }
}
