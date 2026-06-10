import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function maskDatabaseUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.username ? "***" : ""}${url.password ? ":***" : ""}${url.username ? "@" : ""}${url.host}${url.pathname}`;
  } catch {
    return "invalid-url";
  }
}

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;

  const env = {
    hasDatabaseUrl: Boolean(databaseUrl),
    databaseUrlPreview: maskDatabaseUrl(databaseUrl),
    isPostgres:
      databaseUrl?.startsWith("postgresql://") ||
      databaseUrl?.startsWith("postgres://") ||
      false,
    looksLikeNeon: databaseUrl?.includes("neon.tech") ?? false,
    hasSslMode: databaseUrl?.includes("sslmode=require") ?? false,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV ?? null,
  };

  try {
    const [users, roles, skills, aggregates] = await Promise.all([
      prisma.user.count(),
      prisma.roleBrief.count(),
      prisma.skill.count(),
      prisma.cohortAggregate.count(),
    ]);

    return NextResponse.json({
      status: "ok",
      env,
      database: {
        connected: true,
        users,
        roles,
        skills,
        aggregates,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        env,
        database: {
          connected: false,
          errorName: error instanceof Error ? error.name : "UnknownError",
          errorMessage:
            error instanceof Error ? error.message.slice(0, 600) : String(error),
        },
      },
      { status: 500 },
    );
  }
}
