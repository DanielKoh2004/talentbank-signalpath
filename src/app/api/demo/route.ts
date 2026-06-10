import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const IDS = {
  candidateUser: "user_aisha",
  candidateProfile: "profile_aisha",
  employerUser: "user_dataco_hr",
  universityUser: "user_um_admin",
  roleBrief: "rb_junior_product_analyst",
  matchScore: "ms_aisha_jpa",
  interaction: "oi_aisha_jpa",
  rejectedContext: "rcc_aisha_jpa",
  reEngagementEvent: "ree_aisha_jpa",
  cohort: "cohort_um_cs_2025",
  abAggregate: "ca_missing_ab",
  abDemandAggregate: "ca_demand_ab",
};

const DEMO_DELTA_SUMMARY = {
  baselineScore: 62,
  liveScore: 79,
  scoreDelta: 17,
  closedSkillIds: ["ab_testing", "product_analytics"],
  stillMissingSkillIds: [],
  newEvidenceClaimIds: ["ec_ab_02", "ec_ab_01", "ec_ab_03"],
  triggerReasons: ["score_delta_threshold"],
  generatedAt: "2026-06-10T00:00:00.000Z",
};

type DemoCheck = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
};

async function collectDemoHealth() {
  const [
    aishaUser,
    aishaProfile,
    dataCoUser,
    umUser,
    roleBrief,
    acceptedClaimCount,
    matchScore,
    interaction,
    rejectedContext,
    reEngagementEvent,
    cohort,
    aggregateCount,
    abAggregate,
    abDemandAggregate,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: IDS.candidateUser } }),
    prisma.candidateProfile.findUnique({ where: { id: IDS.candidateProfile } }),
    prisma.user.findUnique({ where: { id: IDS.employerUser } }),
    prisma.user.findUnique({ where: { id: IDS.universityUser } }),
    prisma.roleBrief.findUnique({ where: { id: IDS.roleBrief } }),
    prisma.evidenceClaim.count({
      where: {
        candidateId: IDS.candidateProfile,
        candidateStatus: { in: ["accepted", "edited"] },
      },
    }),
    prisma.matchScore.findUnique({ where: { id: IDS.matchScore } }),
    prisma.opportunityInteraction.findUnique({ where: { id: IDS.interaction } }),
    prisma.rejectedCandidateContext.findUnique({
      where: { id: IDS.rejectedContext },
    }),
    prisma.reEngagementEvent.findUnique({
      where: { id: IDS.reEngagementEvent },
    }),
    prisma.universityCohort.findUnique({ where: { id: IDS.cohort } }),
    prisma.cohortAggregate.count({ where: { cohortId: IDS.cohort } }),
    prisma.cohortAggregate.findUnique({ where: { id: IDS.abAggregate } }),
    prisma.cohortAggregate.findUnique({ where: { id: IDS.abDemandAggregate } }),
  ]);

  const checks: DemoCheck[] = [
    {
      id: "aisha_user",
      label: "Aisha candidate user exists",
      ok: !!aishaUser && !!aishaProfile,
      detail: aishaProfile ? IDS.candidateProfile : "Missing profile_aisha",
    },
    {
      id: "dataco_user",
      label: "DataCo employer persona exists",
      ok: !!dataCoUser,
      detail: dataCoUser ? IDS.employerUser : "Missing user_dataco_hr",
    },
    {
      id: "um_user",
      label: "UM admin persona exists",
      ok: !!umUser,
      detail: umUser ? IDS.universityUser : "Missing user_um_admin",
    },
    {
      id: "role_brief",
      label: "Junior Product Analyst role exists",
      ok: !!roleBrief,
      detail: roleBrief?.title ?? "Missing role brief",
    },
    {
      id: "accepted_claims",
      label: "Aisha has accepted evidence claims",
      ok: acceptedClaimCount >= 1,
      detail: `${acceptedClaimCount} accepted or edited claims`,
    },
    {
      id: "match_score",
      label: "DataCo match score exists",
      ok: !!matchScore,
      detail: matchScore
        ? `${Math.round(matchScore.totalScore * 100)}% stored score`
        : "Missing ms_aisha_jpa",
    },
    {
      id: "interaction",
      label: "Marketplace interaction exists",
      ok: !!interaction,
      detail: interaction
        ? `${interaction.candidateStatus} / ${interaction.employerStatus}`
        : "Missing oi_aisha_jpa",
    },
    {
      id: "baseline",
      label: "Re-engagement baseline is 62%",
      ok: rejectedContext?.baselineScore === 62,
      detail: rejectedContext
        ? `${rejectedContext.baselineScore ?? "missing"}% baseline`
        : "Missing rcc_aisha_jpa",
    },
    {
      id: "re_engagement_event",
      label: "Re-engagement event is pending",
      ok: reEngagementEvent?.status === "pending",
      detail: reEngagementEvent
        ? `${reEngagementEvent.status}, ${Math.round(reEngagementEvent.currentScore * 100)}% live`
        : "Missing ree_aisha_jpa",
    },
    {
      id: "um_cohort",
      label: "UM 2025 cohort exists",
      ok: !!cohort && cohort.studentCount === 75,
      detail: cohort
        ? `${cohort.studentCount} students`
        : "Missing cohort_um_cs_2025",
    },
    {
      id: "aggregate_count",
      label: "UM aggregate rows are present",
      ok: aggregateCount >= 14,
      detail: `${aggregateCount} aggregate rows`,
    },
    {
      id: "experimentation_gap",
      label: "Experimentation gap is 0% coverage",
      ok: abAggregate?.metricValue === 0,
      detail: abAggregate
        ? `${Math.round(abAggregate.metricValue * 100)}% artifact-backed A/B testing evidence`
        : "Missing ca_missing_ab",
    },
    {
      id: "experimentation_demand",
      label: "Experimentation demand signal is 61%",
      ok: abDemandAggregate?.metricValue === 0.61,
      detail: abDemandAggregate
        ? `${Math.round(abDemandAggregate.metricValue * 100)}% Product Analytics demand`
        : "Missing ca_demand_ab",
    },
  ];

  return {
    status: checks.every((check) => check.ok) ? "ready" : "needs_repair",
    checks,
    snapshot: {
      ids: IDS,
      scores: {
        matchScore: matchScore ? Math.round(matchScore.totalScore * 100) : null,
        baselineScore: rejectedContext?.baselineScore ?? null,
        reEngagementLiveScore: reEngagementEvent
          ? Math.round(reEngagementEvent.currentScore * 100)
          : null,
      },
      eventStatus: reEngagementEvent?.status ?? null,
      aggregateSource: "precomputed_cohort_aggregates",
      aggregateCount,
      privacyBoundary:
        "Demo control reads known aggregate IDs and seeded scenario rows only.",
    },
  };
}

async function repairDemoScenario() {
  const now = new Date();

  await prisma.$transaction([
    prisma.rejectedCandidateContext.update({
      where: { id: IDS.rejectedContext },
      data: {
        rejectionReason:
          "Insufficient evidence of A/B testing / experimentation skills. Strong in data analysis fundamentals but missing key product analytics competencies.",
        missingSkills: JSON.stringify(["ab_testing", "product_analytics"]),
        scoreAtRejection: 0.62,
        baselineScore: 62,
        baselineMissingSkillIds: JSON.stringify([
          "ab_testing",
          "product_analytics",
        ]),
        rejectedAt: now,
      },
    }),
    prisma.reEngagementEvent.update({
      where: { id: IDS.reEngagementEvent },
      data: {
        previousScore: 0.62,
        currentScore: 0.79,
        deltaExplanation:
          "Aisha Razak improved from 62% to 79% for Junior Product Analyst.",
        deltaSummaryJson: JSON.stringify(DEMO_DELTA_SUMMARY),
        triggerType: "new_evidence",
        status: "pending",
        reviewedAt: null,
        draftMessage:
          "Hi Aisha Razak,\n\nWe reviewed your profile again for Junior Product Analyst. Your evidence-backed match has improved from 62% to 79%. Closed gaps: ab_testing, product_analytics.\n\nWould you be open to reconnecting about this role?",
      },
    }),
    prisma.opportunityInteraction.update({
      where: { id: IDS.interaction },
      data: {
        candidateStatus: "interested",
        employerStatus: "rejected",
        lastReadinessScore: 0.79,
        lastGapCount: 0,
      },
    }),
    prisma.cohortAggregate.update({
      where: { id: IDS.abAggregate },
      data: {
        metricValue: 0,
        metricLabel: "Students with artifact-backed A/B Testing evidence",
        denominator: 75,
        computedAt: now,
      },
    }),
    prisma.cohortAggregate.update({
      where: { id: IDS.abDemandAggregate },
      data: {
        metricValue: 0.61,
        metricLabel:
          "Product Analyst role briefs requiring experimentation evidence",
        denominator: 18,
        computedAt: now,
      },
    }),
  ]);
}

export async function GET() {
  return NextResponse.json(await collectDemoHealth());
}

export async function PATCH() {
  try {
    await repairDemoScenario();
    return NextResponse.json({
      message: "Demo scenario restored with bounded known-row repair.",
      repairedAt: new Date().toISOString(),
      health: await collectDemoHealth(),
    });
  } catch (error) {
    console.error("Demo repair failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Demo repair failed. Run local seed if base rows are missing.",
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Full demo resets are disabled in HTTP routes. Use PATCH /api/demo for bounded repair, or run npx prisma db seed locally before the presentation.",
    },
    { status: 405 },
  );
}
