import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseJsonArray, stringifyArray } from "@/lib/utils";

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

function formatCandidate(profile: {
  id: string;
  userId: string;
  location: string | null;
  educationLevel: string | null;
  institution: string | null;
  targetLocations: string | null;
  preferredRoles: string | null;
  salaryExpectationMin: number | null;
  salaryExpectationMax: number | null;
  visibilityStatus: string;
  resumeDraftJson: string | null;
  user: { id: string; name: string; email: string; role: string };
}) {
  return {
    id: profile.id,
    userId: profile.userId,
    name: profile.user.name,
    email: profile.user.email,
    role: profile.user.role,
    location: profile.location,
    educationLevel: profile.educationLevel,
    institution: profile.institution,
    targetLocations: parseJsonArray<string>(profile.targetLocations),
    preferredRoles: parseJsonArray<string>(profile.preferredRoles),
    salaryExpectationMin: profile.salaryExpectationMin,
    salaryExpectationMax: profile.salaryExpectationMax,
    visibilityStatus: profile.visibilityStatus,
    resumeDraft: profile.resumeDraftJson
      ? JSON.parse(profile.resumeDraftJson)
      : null,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const candidateId = searchParams.get("candidateId");

  if (!candidateId) {
    return NextResponse.json(
      { error: "candidateId is required" },
      { status: 400 },
    );
  }

  const profile = await prisma.candidateProfile.findUnique({
    where: { id: candidateId },
    include: { user: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  return NextResponse.json({ candidate: formatCandidate(profile) });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      location,
      educationLevel,
      institution,
      targetLocations,
      preferredRoles,
      salaryExpectationMin,
      salaryExpectationMax,
    } = body;

    const trimmedName = typeof name === "string" ? name.trim() : "";
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!trimmedName) {
      return NextResponse.json(
        { error: "name is required", field: "name" },
        { status: 400 },
      );
    }

    if (!trimmedEmail) {
      return NextResponse.json(
        { error: "email is required", field: "email" },
        { status: 400 },
      );
    }

    const minSalary = parseOptionalNumber(salaryExpectationMin, "salaryExpectationMin");
    if ("error" in minSalary) {
      return NextResponse.json(
        { error: minSalary.error, field: "salaryExpectationMin" },
        { status: 400 },
      );
    }

    const maxSalary = parseOptionalNumber(salaryExpectationMax, "salaryExpectationMax");
    if ("error" in maxSalary) {
      return NextResponse.json(
        { error: maxSalary.error, field: "salaryExpectationMax" },
        { status: 400 },
      );
    }

    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        role: "candidate",
        candidateProfile: {
          create: {
            location: location?.trim() || null,
            educationLevel: educationLevel?.trim() || null,
            institution: institution?.trim() || null,
            targetLocations: stringifyArray(targetLocations ?? []),
            preferredRoles: stringifyArray(preferredRoles ?? []),
            salaryExpectationMin: minSalary.value,
            salaryExpectationMax: maxSalary.value,
            visibilityStatus: "private",
          },
        },
      },
      include: { candidateProfile: true },
    });

    return NextResponse.json(
      {
        persona: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: "candidate",
          avatarInitials: user.name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "SP",
          description:
            preferredRoles?.length > 0
              ? `Candidate exploring ${preferredRoles[0]} roles`
              : "Candidate building an evidence-backed career profile",
          candidateProfileId: user.candidateProfile?.id,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create candidate:", error);
    return NextResponse.json(
      { error: "Failed to create candidate" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      candidateId,
      name,
      location,
      educationLevel,
      institution,
      targetLocations,
      preferredRoles,
      salaryExpectationMin,
      salaryExpectationMax,
      visibilityStatus,
      resumeDraft,
    } = body;

    const trimmedCandidateId =
      typeof candidateId === "string" ? candidateId.trim() : "";
    const trimmedName =
      typeof name === "string" ? name.trim() : name == null ? undefined : "";

    if (!trimmedCandidateId) {
      return NextResponse.json(
        { error: "candidateId is required", field: "candidateId" },
        { status: 400 },
      );
    }

    if (trimmedName !== undefined && !trimmedName) {
      return NextResponse.json(
        { error: "Full name is required", field: "name" },
        { status: 400 },
      );
    }

    const minSalary = parseOptionalNumber(salaryExpectationMin, "salaryExpectationMin");
    if ("error" in minSalary) {
      return NextResponse.json(
        { error: minSalary.error, field: "salaryExpectationMin" },
        { status: 400 },
      );
    }

    const maxSalary = parseOptionalNumber(salaryExpectationMax, "salaryExpectationMax");
    if ("error" in maxSalary) {
      return NextResponse.json(
        { error: maxSalary.error, field: "salaryExpectationMax" },
        { status: 400 },
      );
    }

    const updated = await prisma.candidateProfile.update({
      where: { id: trimmedCandidateId },
      data: {
        location: location?.trim() || null,
        educationLevel: educationLevel?.trim() || null,
        institution: institution?.trim() || null,
        targetLocations: stringifyArray(targetLocations ?? []),
        preferredRoles: stringifyArray(preferredRoles ?? []),
        salaryExpectationMin: minSalary.value,
        salaryExpectationMax: maxSalary.value,
        visibilityStatus: visibilityStatus ?? "private",
        resumeDraftJson:
          resumeDraft === undefined ? undefined : JSON.stringify(resumeDraft),
        ...(trimmedName
          ? {
              user: {
                update: { name: trimmedName },
              },
            }
          : {}),
      },
      include: { user: true },
    });

    return NextResponse.json({ candidate: formatCandidate(updated) });
  } catch (error) {
    console.error("Failed to update candidate:", error);
    return NextResponse.json(
      { error: "Failed to update candidate" },
      { status: 500 },
    );
  }
}
