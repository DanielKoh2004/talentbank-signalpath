import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function parseOptionalNumber(value: unknown, field: string) {
  if (value === "" || value == null) {
    return { value: null as number | null };
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return { error: `${field} must be a valid number` };
  }

  return { value: numeric };
}

// =============================================================================
// GET /api/roles — List active role briefs with requirements
// POST /api/roles — Create a new role brief (employer)
// =============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employerId = searchParams.get("employerId");
  const status = searchParams.get("status") ?? "active";

  try {
    const where: Record<string, unknown> = { status };
    if (employerId) where.employerId = employerId;

    const roles = await prisma.roleBrief.findMany({
      where,
      include: {
        roleRequirements: {
          include: { skill: true },
        },
        roleFamily: true,
        opportunityInteractions: {
          select: {
            candidateStatus: true,
            employerStatus: true,
          },
        },
        _count: {
          select: {
            opportunityInteractions: true,
            matchScores: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = roles.map((role) => ({
      id: role.id,
      title: role.title,
      employerId: role.employerId,
      roleFamilyId: role.roleFamilyId,
      roleFamilyName: role.roleFamily?.name ?? null,
      location: role.location,
      workMode: role.workMode,
      salaryMin: role.salaryMin,
      salaryMax: role.salaryMax,
      salaryCurrency: role.salaryCurrency,
      salarySource: role.salarySource,
      description: role.description,
      status: role.status,
      createdAt: role.createdAt,
      requirements: role.roleRequirements.map((rr) => ({
        id: rr.id,
        skillId: rr.skillId,
        skillName: rr.skill.name,
        skillCategory: rr.skill.category,
        importance: rr.importance,
        minimumEvidenceStrength: rr.minimumEvidenceStrength,
        displayLabel: rr.displayLabel,
      })),
      interactionCount: role._count.opportunityInteractions,
      applicationCount: role.opportunityInteractions.filter(
        (interaction) => interaction.candidateStatus === "applied"
      ).length,
      pendingReviewCount: role.opportunityInteractions.filter(
        (interaction) => interaction.employerStatus === "not_reviewed"
      ).length,
      shortlistedCount: role.opportunityInteractions.filter(
        (interaction) => interaction.employerStatus === "shortlisted"
      ).length,
      matchCount: role._count.matchScores,
    }));

    return NextResponse.json({ roles: formatted });
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    const details =
      process.env.NODE_ENV === "production"
        ? undefined
        : error instanceof Error
          ? error.message
          : String(error);
    return NextResponse.json(
      { error: "Failed to fetch roles", details },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employerId,
      title,
      roleFamilyId,
      location,
      workMode,
      salaryMin,
      salaryMax,
      salaryCurrency,
      salarySource,
      description,
      requirements,
    } = body;

    const trimmedEmployerId = typeof employerId === "string" ? employerId.trim() : "";
    const trimmedTitle = typeof title === "string" ? title.trim() : "";
    const trimmedLocation = typeof location === "string" ? location.trim() : "";
    const trimmedWorkMode = typeof workMode === "string" ? workMode.trim() : "";
    const trimmedDescription =
      typeof description === "string" ? description.trim() : "";

    if (!trimmedEmployerId) {
      return NextResponse.json(
        { error: "employerId is required", field: "employerId" },
        { status: 400 }
      );
    }

    if (!trimmedTitle) {
      return NextResponse.json(
        { error: "Role title is required", field: "title" },
        { status: 400 }
      );
    }

    if (!trimmedLocation) {
      return NextResponse.json(
        { error: "Location is required", field: "location" },
        { status: 400 }
      );
    }

    if (!trimmedWorkMode) {
      return NextResponse.json(
        { error: "Work mode is required", field: "workMode" },
        { status: 400 }
      );
    }

    if (!trimmedDescription) {
      return NextResponse.json(
        { error: "Role description is required", field: "description" },
        { status: 400 }
      );
    }

    if (!Array.isArray(requirements) || requirements.length === 0) {
      return NextResponse.json(
        { error: "Add at least one taxonomy skill requirement", field: "requirements" },
        { status: 400 }
      );
    }

    const parsedSalaryMin = parseOptionalNumber(salaryMin, "salaryMin");
    if ("error" in parsedSalaryMin) {
      return NextResponse.json(
        { error: parsedSalaryMin.error, field: "salaryMin" },
        { status: 400 }
      );
    }

    const parsedSalaryMax = parseOptionalNumber(salaryMax, "salaryMax");
    if ("error" in parsedSalaryMax) {
      return NextResponse.json(
        { error: parsedSalaryMax.error, field: "salaryMax" },
        { status: 400 }
      );
    }

    const invalidRequirement = requirements.find(
      (req) =>
        !req ||
        typeof req.skillId !== "string" ||
        !req.skillId.trim() ||
        !["required", "nice_to_have"].includes(req.importance ?? "required")
    );
    if (invalidRequirement) {
      return NextResponse.json(
        { error: "Each requirement needs a valid taxonomy skill", field: "requirements" },
        { status: 400 }
      );
    }

    const role = await prisma.roleBrief.create({
      data: {
        employerId: trimmedEmployerId,
        title: trimmedTitle,
        roleFamilyId: roleFamilyId ?? null,
        location: trimmedLocation,
        workMode: trimmedWorkMode,
        salaryMin: parsedSalaryMin.value,
        salaryMax: parsedSalaryMax.value,
        salaryCurrency: salaryCurrency ?? "MYR",
        salarySource: salarySource ?? null,
        description: trimmedDescription,
        status: "active",
      },
    });

    for (const req of requirements) {
      await prisma.roleRequirement.create({
        data: {
          roleBriefId: role.id,
          skillId: String(req.skillId).trim(),
          importance: req.importance ?? "required",
          minimumEvidenceStrength: req.minimumEvidenceStrength ?? 2,
          displayLabel:
            typeof req.displayLabel === "string" && req.displayLabel.trim()
              ? req.displayLabel.trim()
              : null,
        },
      });
    }

    return NextResponse.json({ role: { id: role.id, title: role.title } }, { status: 201 });
  } catch (error) {
    console.error("Failed to create role:", error);
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    );
  }
}
