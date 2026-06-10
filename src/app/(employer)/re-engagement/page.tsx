"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePersona } from "@/providers/PersonaProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserSearch,
  XCircle,
} from "lucide-react";

interface DeltaSummary {
  baselineScore: number;
  liveScore: number;
  scoreDelta: number;
  closedSkillIds: string[];
  stillMissingSkillIds: string[];
  newEvidenceClaimIds: string[];
  triggerReasons: string[];
  generatedAt: string;
}

interface ReEngagementEvent {
  id: string;
  candidateId: string;
  candidateName: string;
  roleBriefId: string;
  roleTitle: string;
  roleFamilyName: string | null;
  previousScore: number;
  currentScore: number;
  deltaExplanation: string | null;
  deltaSummary: DeltaSummary | null;
  triggerType: string;
  status: "pending" | "reviewed" | "contacted" | "dismissed";
  draftMessage: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

const STATUS_META: Record<
  ReEngagementEvent["status"],
  { label: string; className: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending Review",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
    icon: Clock3,
  },
  reviewed: {
    label: "Reviewed",
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
    icon: ShieldCheck,
  },
  contacted: {
    label: "Contacted",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
    icon: Mail,
  },
  dismissed: {
    label: "Dismissed",
    className:
      "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    icon: XCircle,
  },
};

function prettifySkillId(skillId: string) {
  return skillId
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function ReEngagementPage() {
  const { persona } = usePersona();
  const [events, setEvents] = useState<ReEngagementEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setError(null);
    const res = await fetch(`/api/re-engagement?employerId=${persona.id}`);
    if (!res.ok) throw new Error("Failed to load re-engagement events");
    const data = await res.json();
    setEvents(data.events ?? []);
  }, [persona.id]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      fetchEvents()
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : "Failed to load events");
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [fetchEvents]);

  const stats = useMemo(() => {
    const pending = events.filter((event) => event.status === "pending").length;
    const contacted = events.filter((event) => event.status === "contacted").length;
    const avgDelta =
      events.length > 0
        ? Math.round(
            events.reduce(
              (sum, event) =>
                sum +
                (event.deltaSummary?.scoreDelta ??
                  Math.round((event.currentScore - event.previousScore) * 100)),
              0,
            ) / events.length,
          )
        : 0;

    return { pending, contacted, avgDelta };
  }, [events]);

  const scan = async () => {
    setScanning(true);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch("/api/re-engagement/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employerId: persona.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to scan re-engagement events");
      }
      const data = await res.json();
      await fetchEvents();
      setNotice(
        data.scannedCount > 0
          ? `${data.scannedCount} candidate update${data.scannedCount === 1 ? "" : "s"} met the re-engagement threshold.`
          : "No new candidates crossed the 10-point threshold.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan events");
    } finally {
      setScanning(false);
    }
  };

  const updateStatus = async (
    eventId: string,
    status: ReEngagementEvent["status"],
  ) => {
    setUpdatingId(eventId);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/re-engagement/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to update event");
      }
      await fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              Module 6
            </Badge>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Talent Re-Engagement
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reconnect When the Evidence Changes
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Candidates marked not ready are only surfaced again when a live score
            improves by at least 10 points against the stored rejection snapshot.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => fetchEvents().catch(() => setError("Failed to refresh events"))}
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={loading || scanning}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button
            onClick={scan}
            size="sm"
            className="gap-1.5"
            disabled={scanning}
          >
            {scanning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Scan Updates
          </Button>
        </div>
      </div>

      {(error || notice) && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-3 text-sm",
            error
              ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
          )}
        >
          {error ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {error ?? notice}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Pending Review"
          value={stats.pending.toString()}
          icon={Clock3}
          color="amber"
        />
        <SummaryCard
          label="Avg. Improvement"
          value={events.length > 0 ? `+${stats.avgDelta} pts` : "0 pts"}
          icon={ArrowUpRight}
          color="emerald"
        />
        <SummaryCard
          label="Contacted"
          value={stats.contacted.toString()}
          icon={Mail}
          color="blue"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm text-gray-500">Loading re-engagement events...</p>
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <UserSearch className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              No candidates are ready to re-engage yet.
            </p>
            <p className="mt-1 max-w-md text-xs text-gray-500 dark:text-gray-400">
              Mark a candidate as Not Ready from a role workspace, then scan after
              their accepted evidence changes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <ReEngagementCard
              key={event.id}
              event={event}
              isUpdating={updatingId === event.id}
              onStatusChange={(status) => updateStatus(event.id, status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: "amber" | "emerald" | "blue";
}) {
  const colors = {
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colors[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums text-gray-900 dark:text-gray-100">
            {value}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ReEngagementCard({
  event,
  isUpdating,
  onStatusChange,
}: {
  event: ReEngagementEvent;
  isUpdating: boolean;
  onStatusChange: (status: ReEngagementEvent["status"]) => void;
}) {
  const meta = STATUS_META[event.status];
  const StatusIcon = meta.icon;
  const summary = event.deltaSummary;
  const baselineScore = summary?.baselineScore ?? Math.round(event.previousScore * 100);
  const liveScore = summary?.liveScore ?? Math.round(event.currentScore * 100);
  const scoreDelta = summary?.scoreDelta ?? liveScore - baselineScore;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className={cn("gap-1", meta.className)}>
                <StatusIcon className="h-3 w-3" />
                {meta.label}
              </Badge>
              {event.roleFamilyName && (
                <Badge variant="secondary" className="text-[10px]">
                  {event.roleFamilyName}
                </Badge>
              )}
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
              {event.candidateName}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {event.roleTitle}
            </p>
          </div>

          <div className="w-full max-w-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-500">Baseline</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                +{scoreDelta} pts
              </span>
              <span className="font-medium text-gray-500">Live</span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <span className="w-12 text-sm font-bold tabular-nums text-gray-700 dark:text-gray-200">
                {baselineScore}%
              </span>
              <Progress
                value={liveScore}
                className="h-2 flex-1 bg-gray-100 [&>div]:bg-emerald-500 dark:bg-gray-800"
              />
              <span className="w-12 text-right text-sm font-bold tabular-nums text-gray-900 dark:text-gray-100">
                {liveScore}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/30 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Why This Surfaced
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {event.deltaExplanation ??
                `${event.candidateName} crossed the re-engagement threshold for ${event.roleTitle}.`}
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <SkillList
                title="Closed Gaps"
                values={summary?.closedSkillIds ?? []}
                empty="No prior gaps closed"
                tone="emerald"
              />
              <SkillList
                title="Still Missing"
                values={summary?.stillMissingSkillIds ?? []}
                empty="No remaining missing skills"
                tone="amber"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              HR Draft
            </p>
            <div className="mt-2 rounded-lg border border-gray-200 bg-white p-3 text-xs leading-relaxed text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
              {event.draftMessage ?? "No draft message generated yet."}
            </div>
            <p className="mt-2 text-[10px] text-gray-400">
              Drafts require HR review before contact.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-5 py-3 dark:border-gray-800">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            disabled={isUpdating || event.status === "reviewed"}
            onClick={() => onStatusChange("reviewed")}
          >
            {isUpdating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" />
            )}
            Mark Reviewed
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs"
            disabled={isUpdating || event.status === "contacted"}
            onClick={() => onStatusChange("contacted")}
          >
            <Mail className="h-3.5 w-3.5" />
            Mark Contacted
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 text-xs text-gray-500"
            disabled={isUpdating || event.status === "dismissed"}
            onClick={() => onStatusChange("dismissed")}
          >
            <XCircle className="h-3.5 w-3.5" />
            Dismiss
          </Button>
          <span className="ml-auto text-[10px] text-gray-400">
            Created {new Date(event.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function SkillList({
  title,
  values,
  empty,
  tone,
}: {
  title: string;
  values: string[];
  empty: string;
  tone: "emerald" | "amber";
}) {
  const color =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
      : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300";

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {title}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {values.length > 0 ? (
          values.map((skillId) => (
            <Badge key={skillId} className={cn("text-[10px]", color)}>
              {prettifySkillId(skillId)}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-gray-400">{empty}</span>
        )}
      </div>
    </div>
  );
}
