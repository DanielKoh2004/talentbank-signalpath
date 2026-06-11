"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePersona } from "@/providers/PersonaProvider";
import { DisabledTooltipButton } from "@/components/shared/DisabledTooltipButton";
import { PersonaSwitcher } from "@/components/shared/PersonaSwitcher";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Compass,
  Database,
  GraduationCap,
  Loader2,
  MonitorCog,
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
    title: "Candidate Story",
    detail: "Open Aisha's proof-backed Living Portfolio",
    href: "/portfolio",
    personaId: "user_aisha",
    icon: User,
  },
  {
    title: "Employer Match",
    detail: "Review DataCo's auditable match matrix",
    href: "/roles/rb_junior_product_analyst",
    personaId: "user_dataco_hr",
    icon: Briefcase,
  },
  {
    title: "Ready to Reconnect",
    detail: "Show the baseline-to-live score delta",
    href: "/re-engagement",
    personaId: "user_dataco_hr",
    icon: Sparkles,
  },
  {
    title: "University Gap",
    detail: "Reveal the experimentation gap at cohort level",
    href: "/readiness",
    personaId: "user_um_admin",
    icon: GraduationCap,
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
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#071f5c] text-white shadow-sm">
              <Compass className="h-4.5 w-4.5" />
            </span>
            <span className="leading-none">
              <span className="block text-lg font-black tracking-tight">
                SignalPath
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Demo Control
              </span>
            </span>
          </Link>
          <Badge className="hidden rounded-full bg-[#071f5c]/10 px-3 py-1 text-[#071f5c] hover:bg-[#071f5c]/10 dark:bg-blue-300/10 dark:text-blue-200 sm:inline-flex">
            Operator-only stage panel
          </Badge>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/portfolio"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Link>
            <PersonaSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[1.4rem] bg-[#071f5c] text-white shadow-sm">
          <div className="relative grid gap-6 p-6 lg:grid-cols-[1fr_360px] lg:items-center">
            <div className="pointer-events-none absolute -left-14 -top-24 h-64 w-64 rounded-full bg-[#123a8c]/70" />
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#0d2b75]/80" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-50">
                <MonitorCog className="h-4 w-4 text-[#ec006d]" />
                Backstage controls for the live presentation
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Demo Control
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
                Restore the known Aisha/DataCo/UM scenario, check demo health,
                and jump to exact scenes. This is intentionally separated from
                the public home page.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {repairing ? (
                  <DisabledTooltipButton
                    className="h-10 gap-2 bg-[#ec006d] px-4 text-white"
                    disabledReason="Demo repair is already running."
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Restore Demo Scenario
                  </DisabledTooltipButton>
                ) : (
                  <Button
                    onClick={repair}
                    className="h-10 gap-2 bg-[#ec006d] px-4 font-black hover:bg-[#d10062]"
                  >
                    <Wrench className="h-4 w-4" />
                    Restore Demo Scenario
                  </Button>
                )}
                {loading || repairing ? (
                  <DisabledTooltipButton
                    variant="outline"
                    className="h-10 gap-2 border-white/50 bg-transparent px-4 text-white"
                    disabledReason={
                      loading
                        ? "Demo health checks are already loading."
                        : "Wait for demo repair to finish before refreshing."
                    }
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Checks
                  </DisabledTooltipButton>
                ) : (
                  <Button
                    onClick={refresh}
                    variant="outline"
                    className="h-10 gap-2 border-white/50 bg-transparent px-4 text-white hover:bg-white hover:text-[#071f5c]"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Checks
                  </Button>
                )}
              </div>
            </div>

            <div className="relative rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-blue-100">
                  Scenario status
                </span>
                <Badge
                  className={cn(
                    "rounded-full",
                    health?.status === "ready"
                      ? "bg-emerald-400 text-emerald-950 hover:bg-emerald-400"
                      : "bg-amber-300 text-amber-950 hover:bg-amber-300"
                  )}
                >
                  {loading
                    ? "Checking"
                    : health?.status === "ready"
                      ? "Ready"
                      : "Needs repair"}
                </Badge>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <HeroMetric
                  label="Baseline"
                  value={formatScore(health?.snapshot.scores.baselineScore)}
                />
                <HeroMetric
                  label="Live score"
                  value={formatScore(health?.snapshot.scores.reEngagementLiveScore)}
                />
                <HeroMetric
                  label="Aggregates"
                  value={String(health?.snapshot.aggregateCount ?? "--")}
                />
                <HeroMetric
                  label="Issues"
                  value={loading ? "--" : String(failedChecks.length)}
                />
              </div>
            </div>
          </div>
        </section>

        {(message || error) && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm",
              error
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300",
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatusCard
            label="Demo Health"
            value={
              loading ? "Checking" : health?.status === "ready" ? "Ready" : "Repair"
            }
            detail={`${failedChecks.length} failing check${failedChecks.length === 1 ? "" : "s"}`}
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
            label="Stored Snapshot"
            value={formatScore(health?.snapshot.scores.baselineScore)}
            detail="Rejected candidate baseline"
            icon={Database}
            tone="navy"
          />
          <StatusCard
            label="UM Aggregates"
            value={health ? health.snapshot.aggregateCount.toString() : "N/A"}
            detail="Precomputed dashboard rows"
            icon={BarChart3}
            tone="pink"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-[#071f5c] dark:text-blue-200" />
                Demo Health Checklist
              </CardTitle>
              <CardDescription>
                Known seeded IDs and small reads only. No broad reset or database
                rebuild happens from this page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && !health ? (
                <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
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
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowRight className="h-4 w-4 text-[#071f5c] dark:text-blue-200" />
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

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4 text-[#071f5c] dark:text-blue-200" />
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
      </main>
    </div>
  );
}

function formatScore(score: number | null | undefined) {
  return score == null ? "N/A" : `${score}%`;
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <p className="text-2xl font-black tabular-nums text-white">{value}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-100">
        {label}
      </p>
    </div>
  );
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
  tone: "amber" | "emerald" | "blue" | "navy" | "pink";
}) {
  const color = {
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    navy: "bg-[#071f5c]/10 text-[#071f5c] dark:bg-blue-300/10 dark:text-blue-200",
    pink: "bg-[#ec006d]/10 text-[#ec006d] dark:bg-pink-300/10 dark:text-pink-200",
  }[tone];

  return (
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-black text-slate-950 dark:text-white">
            {value}
          </p>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {detail}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function DemoCheckRow({ check }: { check: DemoCheck }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
      {check.ok ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 text-red-500" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {check.label}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {check.detail}
        </p>
      </div>
      <Badge
        className={cn(
          "rounded-full text-[10px]",
          check.ok
            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300"
            : "bg-red-50 text-red-700 hover:bg-red-50 dark:bg-red-950/30 dark:text-red-300",
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
  const Icon = scene.icon;

  return (
    <button
      type="button"
      onClick={onLaunch}
      className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-colors hover:border-[#071f5c]/30 hover:bg-[#071f5c]/5 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-blue-300/5"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#071f5c] text-white">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-slate-950 dark:text-white">
          {scene.title}
        </p>
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          {scene.detail}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#ec006d]" />
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
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>
      <div className="space-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">{label}</span>
            <span className="truncate text-right font-mono text-[11px] text-slate-700 dark:text-slate-300">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
