"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePersona } from "@/providers/PersonaProvider";
import { getCandidateProfileId } from "@/lib/candidate-profile";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  FileUp,
  MessageSquare,
  XCircle,
} from "lucide-react";

interface ApplicationInteraction {
  id: string;
  roleBriefId: string;
  roleTitle: string;
  roleLocation: string | null;
  roleFamilyName: string | null;
  workMode: string | null;
  candidateStatus: string;
  employerStatus: string;
  readinessPercent: number | null;
  gapCount: number | null;
  applicationNote: string | null;
  applicationAnswers: Record<string, unknown> | null;
  appliedAt: string | null;
  updatedAt: string;
}

function getWhyThisRole(applicationAnswers: Record<string, unknown> | null) {
  const answer = applicationAnswers?.whyThisRole;
  return typeof answer === "string" ? answer.trim() : "";
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: typeof Clock; tone: string; next: string }
> = {
  not_reviewed: {
    label: "Waiting for review",
    icon: Clock,
    tone: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    next: "Keep improving your proof while HR reviews your application.",
  },
  shortlisted: {
    label: "Shortlisted",
    icon: CheckCircle2,
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    next: "Prepare proof stories for the interview.",
  },
  contacted: {
    label: "Contacted",
    icon: MessageSquare,
    tone: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    next: "Check your email and respond with your proof profile.",
  },
  rejected: {
    label: "Not ready yet",
    icon: XCircle,
    tone: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    next: "Add proof for missing skills so the re-engagement loop can resurface you.",
  },
};

export default function ApplicationsPage() {
  const router = useRouter();
  const { persona } = usePersona();
  const candidateId =
    persona.role === "candidate"
      ? getCandidateProfileId(persona.id, persona.candidateProfileId)
      : null;
  const [applications, setApplications] = useState<ApplicationInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/interactions?candidateId=${candidateId}`);
        const data = res.ok ? await res.json() : { interactions: [] };
        if (!cancelled) {
          setApplications(
            (data.interactions ?? []).filter(
              (item: ApplicationInteraction) => item.candidateStatus === "applied",
            ),
          );
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

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-slate-500">
        Loading your applications...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white">
            Applications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track where your evidence-backed profile has been sent.
          </p>
        </div>
        <Button onClick={() => router.push("/marketplace")} className="gap-2">
          <Briefcase className="h-4 w-4" />
          Find Jobs
        </Button>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          description="Apply to your first role from Marketplace once your proof crosses the shortlist threshold."
          actionLabel="Find Jobs"
          onAction={() => router.push("/marketplace")}
        />
      ) : (
        <div className="grid gap-4">
          {applications.map((application) => {
            const config =
              STATUS_CONFIG[application.employerStatus] ?? STATUS_CONFIG.not_reviewed;
            const Icon = config.icon;
            return (
              <Card key={application.id}>
                <CardContent className="space-y-4 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">
                          {application.roleFamilyName ?? "Open role"}
                        </Badge>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${config.tone}`}
                        >
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </div>
                      <h2 className="mt-2 text-lg font-black text-slate-950 dark:text-white">
                        {application.roleTitle}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {application.roleLocation ?? "Location flexible"}
                        {application.workMode ? ` - ${application.workMode}` : ""}
                      </p>
                    </div>
                    <div className="min-w-28 rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-900">
                      <p className="text-2xl font-black tabular-nums text-slate-950 dark:text-white">
                        {application.readinessPercent ?? "--"}%
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        Applied Fit
                      </p>
                    </div>
                  </div>

                  {application.readinessPercent != null && (
                    <Progress value={application.readinessPercent} className="h-2" />
                  )}

                  {application.applicationNote && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                      “{application.applicationNote}”
                    </div>
                  )}

                  {getWhyThisRole(application.applicationAnswers) && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        Why this role
                      </p>
                      <p className="mt-1">
                        &quot;{getWhyThisRole(application.applicationAnswers)}&quot;
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">{config.next}</p>
                    {application.gapCount && application.gapCount > 0 ? (
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => router.push("/portfolio")}
                      >
                        <FileUp className="h-4 w-4" />
                        Add Proof
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => router.push("/portfolio")}
                      >
                        Review Profile
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
