import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseJsonArray } from "@/lib/utils";

// =============================================================================
// GET /api/skills — List canonical skill taxonomy
// =============================================================================

export async function GET() {
  const skills = await prisma.skill.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      category: true,
      aliases: true,
      parentSkillId: true,
      level: true,
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const parsed = skills.map((skill) => ({
    ...skill,
    aliases: parseJsonArray(skill.aliases),
  }));

  return NextResponse.json({ skills: parsed });
}
