"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePersona } from "@/providers/PersonaProvider";
import { OpportunityCard } from "@/components/marketplace/OpportunityCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterPill } from "@/components/shared/FilterPill";
import { NextStepPanel } from "@/components/shared/NextStepPanel";
import { SearchBand } from "@/components/shared/SearchBand";
import { SplitPaneLayout } from "@/components/shared/SplitPaneLayout";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getCandidateProfileId } from "@/lib/candidate-profile";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  EyeOff,
  Heart,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface RoleRequirement {
  id?: string;
  skillId: string;
  skillName: string;
  skillCategory?: string;
  importance: string;
  minimumEvidenceStrength: number;
  displayLabel: string | null;
}

interface RoleData {
  id: string;
  title: string;
  employerId: string;
  roleFamilyId: string | null;
  roleFamilyName: string | null;
  location: string | null;
  workMode: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salarySource: string | null;
  description: string | null;
  status: string;
  requirements: RoleRequirement[];
  interactionCount: number;
  matchCount: number;
}

interface InteractionData {
  id: string;
  candidateStatus: string;
  readinessScore: number;
  readinessPercent: number;
  gapCount: number;
}

interface EnrichedRole extends RoleData {
  readinessPercent?: number;
  gapCount?: number;
  candidateStatus?: string;
}

type FilterTab = "all" | "interested" | "high_readiness" | "has_gaps";

const FILTERS: Array<{ id: FilterTab; label: string }> = [
  { id: "all", label: "All roles" },
  { id: "interested", label: "Interested" },
  { id: "high_readiness", label: "Strong matches" },
  { id: "has_gaps", label: "Has skill gaps" },
];

export default function MarketplacePage() {
  const { persona } = usePersona();
  const router = useRouter();
  const candidateId =
    persona.role === "candidate" ? getCandidateProfileId(persona.id) : null;

  const [roles, setRoles] = useState<EnrichedRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interestLoading, setInterestLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!candidateId) return;
    setLoading(true);
    setError(null);

    try {
      const rolesRes = await fetch("/api/roles");
      if (!rolesRes.ok) throw new Error("Failed to load roles");
      const rolesData = await rolesRes.json();
      const allRoles: RoleData[] = rolesData.roles ?? [];

      const interactionMap = new Map<string, InteractionData>();
      await Promise.all(
        allRoles.map(async (role) => {
          try {
            const res = await fetch(`/api/roles/${role.id}/interest`);
            if (!res.ok) return;
            const data = await res.json();
            const mine = (data.interactions ?? []).find(
              (interaction: { candidateId: string }) =>
                interaction.candidateId === candidateId
            );
            if (mine) {
              interactionMap.set(role.id, {
                id: mine.id,
                candidateStatus: mine.candidateStatus,
                readinessScore: mine.readinessScore,
                readinessPercent: Math.round((mine.readinessScore ?? 0) * 100),
                gapCount: mine.gapCount ?? 0,
              });
            }
          } catch {
            // Interest status is secondary to loading the role board.
          }
        })
      );

      const enriched = allRoles
        .filter((role) => role.status === "active")
        .map((role) => {
          const interaction = interactionMap.get(role.id);
          return {
            ...role,
            readinessPercent: interaction?.readinessPercent,
            gapCount: interaction?.gapCount,
            candidateStatus: interaction?.candidateStatus,
          };
        });

      setRoles(enriched);
      setSelectedRoleId((current) => current ?? enriched[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load marketplace");
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleInterest = useCallback(
    async (roleId: string) => {
      if (!candidateId) return;
      setInterestLoading(roleId);
      try {
        const res = await fetch(`/api/roles/${roleId}/interest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateId, action: "interest" }),
        });
        if (!res.ok) throw new Error("Failed to express interest");
        const data = await res.json();
        const interaction = data.interaction;

        setRoles((prev) =>
          prev.map((role) =>
            role.id === roleId
              ? {
                  ...role,
                  candidateStatus: interaction.candidateStatus,
                  readinessPercent: interaction.readinessPercent,
                  gapCount: interaction.gapCount,
                }
              : role
          )
        );
      } catch (err) {
        console.error("Interest error:", err);
      } finally {
        setInterestLoading(null);
      }
    },
    [candidateId]
  );

  const handleHide = useCallback(
    async (roleId: string) => {
      if (!candidateId) return;
      try {
        const res = await fetch(`/api/roles/${roleId}/interest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateId, action: "hide" }),
        });
        if (!res.ok) throw new Error("Failed to hide role");
        setRoles((prev) => prev.filter((role) => role.id !== roleId));
        setSelectedRoleId((current) => {
          if (current !== roleId) return current;
          return roles.find((role) => role.id !== roleId)?.id ?? null;
        });
      } catch (err) {
        console.error("Hide error:", err);
      }
    },
    [candidateId, roles]
  );

  const filteredRoles = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const normalizedLocation = location.trim().toLowerCase();

    return roles.filter((role) => {
      if (filter === "interested" && role.candidateStatus !== "interested") {
        return false;
      }
      if (filter === "high_readiness" && (role.readinessPercent ?? 0) < 70) {
        return false;
      }
      if (filter === "has_gaps" && (role.gapCount ?? 0) <= 0) {
        return false;
      }

      const haystack = [
        role.title,
        role.roleFamilyName,
        role.description,
        role.workMode,
        ...role.requirements.map((req) => req.displayLabel ?? req.skillName),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (normalizedKeyword && !haystack.includes(normalizedKeyword)) {
        return false;
      }

      if (
        normalizedLocation &&
        !(role.location ?? "").toLowerCase().includes(normalizedLocation)
      ) {
        return false;
      }

      return true;
    });
  }, [filter, keyword, location, roles]);

  const selectedRole =
    filteredRoles.find((role) => role.id === selectedRoleId) ??
    filteredRoles[0] ??
    null;

  const interestedRoles = roles.filter(
    (role) => role.candidateStatus === "interested"
  );

  if (!candidateId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="mb-3 h-10 w-10 text-amber-500" />
        <p className="text-slate-500">
          Switch to a candidate persona to view the Career Marketplace.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#071f5c]" />
        <p className="text-sm text-slate-500">
          Loading opportunities and readiness signals...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <p className="text-sm text-slate-500">{error}</p>
        <Button onClick={loadData} variant="outline" size="sm" className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SearchBand
        title="Find roles that match your proof"
        description="Search opportunities by role, industry, skill, or location. SignalPath shows how ready you are and what proof is missing."
        keyword={keyword}
        onKeywordChange={setKeyword}
        location={location}
        onLocationChange={setLocation}
        actionLabel="Seek"
      >
        {FILTERS.map((item) => (
          <FilterPill
            key={item.id}
            active={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px]">
              {item.id === "all"
                ? roles.length
                : item.id === "interested"
                  ? interestedRoles.length
                  : item.id === "high_readiness"
                    ? roles.filter((role) => (role.readinessPercent ?? 0) >= 70)
                        .length
                    : roles.filter((role) => (role.gapCount ?? 0) > 0).length}
            </span>
          </FilterPill>
        ))}
      </SearchBand>

      <NextStepPanel
        steps={[
          "Pick a role from the left.",
          "Check why you match on the right.",
          "Express interest or add proof to close gaps.",
        ]}
        actionLabel="Open Portfolio"
        onAction={() => router.push("/portfolio")}
        icon={Sparkles}
      />

      {filteredRoles.length === 0 ? (
        <EmptyState
          icon={filter === "high_readiness" ? TrendingUp : Search}
          title="No roles match these filters"
          description="Clear the search or upload more proof in your Living Portfolio to improve readiness."
          actionLabel="Show All Roles"
          onAction={() => {
            setKeyword("");
            setLocation("");
            setFilter("all");
          }}
        />
      ) : (
        <SplitPaneLayout
          list={
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-950 dark:text-white">
                    {filteredRoles.length} role
                    {filteredRoles.length !== 1 ? "s" : ""} found
                  </h2>
                  <p className="text-xs text-slate-500">
                    Select a card to inspect the evidence fit.
                  </p>
                </div>
                <Button
                  onClick={loadData}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
              </div>
              {filteredRoles.map((role) => (
                <OpportunityCard
                  key={role.id}
                  role={role}
                  variant="candidate"
                  onInterest={handleInterest}
                  onHide={handleHide}
                  onView={setSelectedRoleId}
                  interestLoading={interestLoading === role.id}
                  className={cn(
                    selectedRole?.id === role.id &&
                      "ring-2 ring-[#071f5c] dark:ring-blue-300"
                  )}
                />
              ))}
            </>
          }
          detail={
            selectedRole ? (
              <RoleDetailPanel
                role={selectedRole}
                interestLoading={interestLoading === selectedRole.id}
                onInterest={() => handleInterest(selectedRole.id)}
                onHide={() => handleHide(selectedRole.id)}
              />
            ) : null
          }
        />
      )}
    </div>
  );
}

function RoleDetailPanel({
  role,
  interestLoading,
  onInterest,
  onHide,
}: {
  role: EnrichedRole;
  interestLoading: boolean;
  onInterest: () => void;
  onHide: () => void;
}) {
  const isInterested = role.candidateStatus === "interested";
  const readiness = role.readinessPercent;
  const readinessColor =
    readiness == null
      ? "text-slate-400"
      : readiness >= 70
        ? "text-emerald-600"
        : readiness >= 40
          ? "text-amber-600"
          : "text-red-500";

  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="h-3 bg-[#071f5c]" />
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {role.roleFamilyName && (
                <Badge variant="secondary">{role.roleFamilyName}</Badge>
              )}
              {isInterested && (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Interest sent
                </Badge>
              )}
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              {role.title}
            </h2>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
              {role.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {role.location}
                </span>
              )}
              {role.workMode && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  {role.workMode}
                </span>
              )}
              {role.salaryMin != null && role.salaryMax != null && (
                <span>
                  {role.salaryCurrency} {role.salaryMin.toLocaleString()}-
                  {role.salaryMax.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 text-center dark:bg-slate-900">
            <p className={cn("text-3xl font-black tabular-nums", readinessColor)}>
              {readiness != null ? `${readiness}%` : "--"}
            </p>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Readiness
            </p>
          </div>
        </div>

        {readiness != null ? (
          <div className="space-y-2">
            <Progress value={readiness} className="h-2" />
            <p className="text-sm text-slate-500">
              {role.gapCount && role.gapCount > 0
                ? `${role.gapCount} proof gap${role.gapCount !== 1 ? "s" : ""} to close before this becomes a stronger match.`
                : "Your current proof covers the visible requirements for this role."}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">
            Express interest to calculate a readiness snapshot for this role.
          </div>
        )}

        {role.description && (
          <div>
            <h3 className="text-sm font-black text-slate-950 dark:text-white">
              What you would do
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {role.description}
            </p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-black text-slate-950 dark:text-white">
            Skills this role asks for
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {role.requirements.map((requirement) => (
              <Badge
                key={requirement.skillId}
                variant={
                  requirement.importance === "required"
                    ? "default"
                    : "secondary"
                }
                className={cn(
                  "rounded-full",
                  requirement.importance === "required" &&
                    "bg-[#071f5c] text-white hover:bg-[#071f5c]"
                )}
              >
                {requirement.displayLabel ?? requirement.skillName}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row">
          {isInterested ? (
            <Button className="gap-2" disabled>
              <CheckCircle2 className="h-4 w-4" />
              Interest Sent
            </Button>
          ) : (
            <Button
              className="gap-2"
              onClick={onInterest}
              disabled={interestLoading}
            >
              {interestLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className="h-4 w-4" />
              )}
              Express Interest
            </Button>
          )}
          <Button variant="outline" className="gap-2" onClick={onHide}>
            <EyeOff className="h-4 w-4" />
            Hide Role
          </Button>
          <a
            href="/portfolio"
            className={buttonVariants({ variant: "secondary" })}
          >
            Add More Proof
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
