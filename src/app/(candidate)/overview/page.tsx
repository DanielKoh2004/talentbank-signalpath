"use client";

import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import { useRouter } from "next/navigation";
import { usePersona } from "@/providers/PersonaProvider";
import { getCandidateProfileId } from "@/lib/candidate-profile";
import { EmptyState } from "@/components/shared/EmptyState";
import { NextStepPanel } from "@/components/shared/NextStepPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";

interface MarketplaceRole {
  id: string;
  title: string;
  roleFamilyName: string | null;
  readinessPercent: number;
  pointsToThreshold: number;
  candidateStatus: string;
  topGapSkill: { skillId: string; skillName: string } | null;
}

interface Interaction {
  id: string;
  roleTitle: string;
  candidateStatus: string;
  employerStatus: string;
  readinessPercent: number | null;
  appliedAt: string | null;
}

interface CandidateProfile {
  location: string | null;
  educationLevel: string | null;
  institution: string | null;
  preferredRoles: string[];
  targetLocations: string[];
  salaryExpectationMin: number | null;
  salaryExpectationMax: number | null;
}

export default function CandidateOverviewPage() {
  const router = useRouter();
  const { persona } = usePersona();
  const candidateId =
    persona.role === "candidate"
      ? getCandidateProfileId(persona.id, persona.candidateProfileId)
      : null;

  const [roles, setRoles] = useState<MarketplaceRole[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [marketplaceRes, interactionsRes, profileRes] = await Promise.all([
          fetch(`/api/marketplace?candidateId=${candidateId}`),
          fetch(`/api/interactions?candidateId=${candidateId}`),
          fetch(`/api/candidates?candidateId=${candidateId}`),
        ]);
        const marketplaceData = marketplaceRes.ok
          ? await marketplaceRes.json()
          : { roles: [] };
        const interactionsData = interactionsRes.ok
          ? await interactionsRes.json()
          : { interactions: [] };
        const profileData = profileRes.ok ? await profileRes.json() : null;
        if (!cancelled) {
          setRoles(marketplaceData.roles ?? []);
          setInteractions(interactionsData.interactions ?? []);
          setProfile(profileData?.candidate ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [candidateId]);

  const applied = interactions.filter((item) => item.candidateStatus === "applied");
  const readyRoles = roles
    .filter((role) => role.readinessPercent >= 75)
    .sort((a, b) => b.readinessPercent - a.readinessPercent)
    .slice(0, 3);
  const bestGap = roles
    .filter((role) => role.topGapSkill)
    .sort((a, b) => a.pointsToThreshold - b.pointsToThreshold)[0];

  const profileCompleteness = useMemo(() => {
    if (!profile) return 0;
    const checks = [
      profile.location,
      profile.educationLevel,
      profile.institution,
      profile.preferredRoles.length > 0,
      profile.targetLocations.length > 0,
      profile.salaryExpectationMin && profile.salaryExpectationMax,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile]);

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-slate-500">
        Loading your jobsite dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950 dark:text-white">
          Your job search dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Find roles, add the proof that moves you forward, and track what happens next.
        </p>
      </div>

      <NextStepPanel
        steps={[
          bestGap?.topGapSkill
            ? `Add proof for ${bestGap.topGapSkill.skillName}.`
            : "Review roles you can apply to now.",
          "Apply with your evidence-backed profile.",
          "Track employer responses in Applications.",
        ]}
        actionLabel={bestGap?.topGapSkill ? "Upload Proof" : "Browse Jobs"}
        onAction={() =>
          bestGap?.topGapSkill
            ? router.push(
                `/portfolio?intent=prove-skill&skillId=${bestGap.topGapSkill.skillId}&roleId=${bestGap.id}&returnTo=/overview`,
              )
            : router.push("/marketplace")
        }
        icon={Sparkles}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Profile strength"
          value={`${profileCompleteness}%`}
          icon={UserRound}
          detail="Complete profile fields so roles can rank logistics fit."
        />
        <MetricCard
          title="Ready to apply"
          value={readyRoles.length.toString()}
          icon={CheckCircle2}
          detail="Roles above the 75% shortlist threshold."
        />
        <MetricCard
          title="Applications"
          value={applied.length.toString()}
          icon={ClipboardList}
          detail="Applications sent with your proof profile."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jobs you can act on now</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {roles.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No roles loaded"
                description="Open Marketplace to load active roles and see where your proof fits."
                actionLabel="Open Marketplace"
                onAction={() => router.push("/marketplace")}
                actionVariant="outline"
              />
            ) : (
              roles
                .sort((a, b) => b.readinessPercent - a.readinessPercent)
                .slice(0, 3)
                .map((role) => (
                  <button
                    key={role.id}
                    onClick={() => router.push("/marketplace")}
                    className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-primary/40 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-950 dark:text-white">
                          {role.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {role.roleFamilyName ?? "Open role"}
                        </p>
                      </div>
                      <Badge
                        variant={role.readinessPercent >= 75 ? "default" : "secondary"}
                      >
                        {role.readinessPercent}% ready
                      </Badge>
                    </div>
                    <Progress value={role.readinessPercent} className="mt-3 h-1.5" />
                    {role.topGapSkill && role.readinessPercent < 75 && (
                      <p className="mt-2 text-xs text-amber-600">
                        Proof to add: {role.topGapSkill.skillName}
                      </p>
                    )}
                  </button>
                ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What happened to my applications?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {applied.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No applications yet"
                description="Apply to your first role once you cross the shortlist threshold."
                actionLabel="Find Jobs"
                onAction={() => router.push("/marketplace")}
                actionVariant="outline"
              />
            ) : (
              applied.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950 dark:text-white">
                        {item.roleTitle}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Employer status: {item.employerStatus.replaceAll("_", " ")}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {item.readinessPercent ?? "--"}% ready
                    </Badge>
                  </div>
                </div>
              ))
            )}
            {applied.length > 0 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/applications")}
              >
                View All Applications
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: ElementType;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-black tabular-nums text-slate-950 dark:text-white">
            {value}
          </p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {title}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}
