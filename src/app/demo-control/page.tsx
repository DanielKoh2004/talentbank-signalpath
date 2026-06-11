"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePersona } from "@/providers/PersonaProvider";
import { DisabledTooltipButton } from "@/components/shared/DisabledTooltipButton";
import { PersonaSwitcher } from "@/components/shared/PersonaSwitcher";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Compass,
  Database,
  GraduationCap,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User,
  Wrench,
  XCircle,
} from "lucide-react";

interface DemoCheck {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
}

interface DemoHealth {
  status: "ready" | "needs_repair";
  checks: DemoCheck[];
  snapshot: {
    ids: Record<string, string>;
    scores: {
      matchScore: number | null;
      baselineScore: number | null;
      reEngagementLiveScore: number | null;
    };
    eventStatus: string | null;
    aggregateSource: string;
    aggregateCount: number;
    privacyBoundary: string;
  };
}

const SCENE_LINKS = [
  {
    title: "Aisha Portfolio",
    detail: "Candidate evidence and Living CV",
    href: "/portfolio",
    personaId: "user_aisha",
    icon: User,
    color: "indigo",
  },
  {
    title: "DataCo Match Matrix",
    detail: "Deterministic employer scoring",
    href: "/roles/rb_junior_product_analyst",
    personaId: "user_dataco_hr",
    icon: Briefcase,
    color: "emerald",
  },
  {
    title: "Re-Engagement Delta",
    detail: "62% baseline to live score",
    href: "/re-engagement",
    personaId: "user_dataco_hr",
    icon: Sparkles,
    color: "blue",
  },
  {
    title: "UM Experimentation Gap",
    detail: "0% evidence, 61% demand",
    href: "/readiness",
    personaId: "user_um_admin",
    icon: GraduationCap,
    color: "amber",
  },
];

export default function DemoControlPage() {
  const router = useRouter();
  const { persona, switchPersona } = usePersona();
  const [health, setHealth] = useState<DemoHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [repairing, setRepairing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/demo");
    if (!res.ok) throw new Error("Failed to load demo health");
    setHealth((await res.json()) as DemoHealth);
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      fetchHealth()
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : "Failed to load health");
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [fetchHealth]);

  const failedChecks = useMemo(
    () => health?.checks.filter((check) => !check.ok) ?? [],
    [health?.checks],
  );

  const refresh = async () => {
    setLoading(true);
    try {
      await fetchHealth();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh health");
    } finally {
      setLoading(false);
    }
  };

  const repair = async () => {
    const confirmed = window.confirm(
      "Restore known demo rows only? This does not run a full database reset.",
    );
    if (!confirmed) return;

    setRepairing(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/demo", { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Demo repair failed");
      setMessage(data.message ?? "Demo scenario restored.");
      setHealth(data.health);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo repair failed");
    } finally {
      setRepairing(false);
    }
  };

  const launchScene = (personaId: string, href: string) => {
    switchPersona(personaId);
    router.push(href);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 shadow-sm">
                <Compass className="h-5 w-5 text-white" />
              </div>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Demo Stability Control
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Bounded recovery tools for the live SignalPath demo
              </p>
            </div>
          </div>
          <PersonaSwitcher />
        </div>

        {(message || error) && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-3 text-sm",
              error
                ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
            )}
          >
            {error ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {error ?? message}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-4">
          <StatusCard
            label="Demo Health"
            value={
              loading ? "Checking" : health?.status === "ready" ? "Ready" : "Repair"
            }
            detail={
              loading
                ? "Loading known-row checks"
                : `${failedChecks.length} failing check${failedChecks.length === 1 ? "" : "s"}`
            }
            icon={ShieldCheck}
            tone={health?.status === "ready" ? "emerald" : "amber"}
          />
          <StatusCard
            label="Active Persona"
            value={persona.name}
            detail={persona.role.replace("_", " ")}
            icon={User}
            tone="blue"
          />
          <StatusCard
            label="Baseline"
            value={
              health?.snapshot.scores.baselineScore != null
                ? `${health.snapshot.scores.baselineScore}%`
                : "N/A"
            }
            detail="Rejected snapshot"
            icon={Database}
            tone="amber"
          />
          <StatusCard
            label="UM Aggregates"
            value={health ? health.snapshot.aggregateCount.toString() : "N/A"}
            detail="Precomputed rows"
            icon={GraduationCap}
            tone="emerald"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4" />
                Demo Health Checklist
              </CardTitle>
              <CardDescription>
                Uses known seeded IDs and small reads. No full database reset or broad scans.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && !health ? (
                <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking demo state...
                </div>
              ) : (
                <div className="space-y-2">
                  {(health?.checks ?? []).map((check) => (
                    <DemoCheckRow key={check.id} check={check} />
                  ))}
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                {repairing ? (
                  <DisabledTooltipButton
                    className="gap-1.5"
                    disabledReason="Demo repair is already running."
                  >
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Restore Demo Scenario
                  </DisabledTooltipButton>
                ) : (
                  <Button onClick={repair} className="gap-1.5">
                    <Wrench className="h-3.5 w-3.5" />
                    Restore Demo Scenario
                  </Button>
                )}
                {loading || repairing ? (
                  <DisabledTooltipButton
                    variant="outline"
                    className="gap-1.5"
                    disabledReason={
                      loading
                        ? "Demo health checks are already loading."
                        : "Wait for demo repair to finish before refreshing."
                    }
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh Checks
                  </DisabledTooltipButton>
                ) : (
                  <Button
                    onClick={refresh}
                    variant="outline"
                    className="gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh Checks
                  </Button>
                )}
                <p className="text-xs text-gray-400">
                  Repair only patches known rows; run local seed before the demo if base rows are missing.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowRight className="h-4 w-4" />
                Launch Exact Scenes
              </CardTitle>
              <CardDescription>
                Switches persona and opens the stage-ready route.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {SCENE_LINKS.map((scene) => (
                <SceneButton
                  key={scene.title}
                  scene={scene}
                  onLaunch={() => launchScene(scene.personaId, scene.href)}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4" />
              Debug Snapshot
            </CardTitle>
            <CardDescription>
              Read-only scenario IDs and scores for fast recovery checks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <DebugBlock
                title="Scores"
                rows={[
                  ["Match score", formatScore(health?.snapshot.scores.matchScore)],
                  ["Baseline", formatScore(health?.snapshot.scores.baselineScore)],
                  [
                    "Live re-engagement",
                    formatScore(health?.snapshot.scores.reEngagementLiveScore),
                  ],
                  ["Event status", health?.snapshot.eventStatus ?? "N/A"],
                ]}
              />
              <DebugBlock
                title="Core IDs"
                rows={[
                  ["Candidate", health?.snapshot.ids.candidateProfile ?? "N/A"],
                  ["Role", health?.snapshot.ids.roleBrief ?? "N/A"],
                  ["Baseline", health?.snapshot.ids.rejectedContext ?? "N/A"],
                  ["Event", health?.snapshot.ids.reEngagementEvent ?? "N/A"],
                ]}
              />
              <DebugBlock
                title="Safety"
                rows={[
                  ["Aggregate source", health?.snapshot.aggregateSource ?? "N/A"],
                  ["Aggregate rows", String(health?.snapshot.aggregateCount ?? "N/A")],
                  ["HTTP reset", "Disabled"],
                  ["AI in upload", "Disabled"],
                ]}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatScore(score: number | null | undefined) {
  return score == null ? "N/A" : `${score}%`;
}

function StatusCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  tone: "amber" | "emerald" | "blue";
}) {
  const color = {
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  }[tone];

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="truncate text-[10px] text-gray-400">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DemoCheckRow({ check }: { check: DemoCheck }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
      {check.ok ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 text-red-500" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
          {check.label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{check.detail}</p>
      </div>
      <Badge
        className={cn(
          "text-[10px]",
          check.ok
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
            : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
        )}
      >
        {check.ok ? "OK" : "Fix"}
      </Badge>
    </div>
  );
}

function SceneButton({
  scene,
  onLaunch,
}: {
  scene: (typeof SCENE_LINKS)[number];
  onLaunch: () => void;
}) {
  const color = {
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  }[scene.color];
  const Icon = scene.icon;

  return (
    <button
      type="button"
      onClick={onLaunch}
      className="flex w-full items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 text-left transition-colors hover:border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-900"
    >
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", color)}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {scene.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{scene.detail}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-400" />
    </button>
  );
}

function DebugBlock({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, string]>;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
        {title}
      </p>
      <div className="space-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="text-xs text-gray-500">{label}</span>
            <span className="truncate text-right font-mono text-[11px] text-gray-700 dark:text-gray-300">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
