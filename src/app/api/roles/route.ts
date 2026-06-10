import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

    if (!employerId || !title) {
      return NextResponse.json(
        { error: "employerId and title are required" },
        { status: 400 }
      );
    }

    const role = await prisma.roleBrief.create({
      data: {
        employerId,
        title,
        roleFamilyId: roleFamilyId ?? null,
        location: location ?? null,
        workMode: workMode ?? null,
        salaryMin: salaryMin ?? null,
        salaryMax: salaryMax ?? null,
        salaryCurrency: salaryCurrency ?? "MYR",
        salarySource: salarySource ?? null,
        description: description ?? null,
        status: "active",
      },
    });

    // Create requirements if provided
    if (Array.isArray(requirements)) {
      for (const req of requirements) {
        await prisma.roleRequirement.create({
          data: {
            roleBriefId: role.id,
            skillId: req.skillId,
            importance: req.importance ?? "required",
            minimumEvidenceStrength: req.minimumEvidenceStrength ?? 2,
            displayLabel: req.displayLabel ?? null,
          },
        });
      }
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
