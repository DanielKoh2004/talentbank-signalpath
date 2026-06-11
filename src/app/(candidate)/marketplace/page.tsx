"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePersona } from "@/providers/PersonaProvider";
import { OpportunityCard } from "@/components/marketplace/OpportunityCard";
import { ReadinessMatrix } from "@/components/shared/ReadinessMatrix";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Store,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Heart,
  TrendingUp,
  Briefcase,
  Search,
} from "lucide-react";

// =============================================================================
// Career Marketplace Page (Candidate)
// Browse active roles, express interest, and track readiness per role.
// =============================================================================

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

type FilterTab = "all" | "interested" | "high_readiness";

export default function MarketplacePage() {
  const { persona } = usePersona();
  const router = useRouter();
  const candidateId = persona.role === "candidate" ? "profile_aisha" : null;

  const [roles, setRoles] = useState<EnrichedRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interestLoading, setInterestLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");

  // Readiness detail dialog
  const [selectedRole, setSelectedRole] = useState<EnrichedRole | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRequirements, setDetailRequirements] = useState<
    Array<{
      skillId: string;
      skillName: string;
      displayLabel: string;
      importance: string;
      status: "met" | "partial" | "gap";
      evidenceStrength: number;
      minimumRequired: number;
    }>
  >([]);

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
      const interactionPromises = allRoles.map(async (role) => {
        try {
          const res = await fetch(`/api/roles/${role.id}/interest`);
          if (res.ok) {
            const data = await res.json();
            const interactions = data.interactions ?? [];
            const mine = interactions.find(
              (i: { candidateId: string }) => i.candidateId === candidateId
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
          }
        } catch {
          // Non-critical
        }
      });
      await Promise.all(interactionPromises);

      const enriched: EnrichedRole[] = allRoles
        .filter((r) => r.status === "active")
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

  // Express interest handler
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

        // Update the role in state
        setRoles((prev) =>
          prev.map((r) =>
            r.id === roleId
              ? {
                  ...r,
                  candidateStatus: interaction.candidateStatus,
                  readinessPercent: interaction.readinessPercent,
                  gapCount: interaction.gapCount,
                }
              : r
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

  // Hide role handler
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

        // Remove from visible list
        setRoles((prev) => prev.filter((r) => r.id !== roleId));
      } catch (err) {
        console.error("Hide error:", err);
      }
    },
    [candidateId]
  );

  // View role readiness detail
  const handleView = useCallback(
    (roleId: string) => {
      const role = roles.find((r) => r.id === roleId);
      if (!role) return;
      setSelectedRole(role);

      // Build requirements for ReadinessMatrix with mock status based on readiness %
      const reqs = role.requirements.map((req, idx) => {
        const totalReqs = role.requirements.length;
        const metCount = Math.round(
          ((role.readinessPercent ?? 0) / 100) * totalReqs
        );
        const status: "met" | "partial" | "gap" =
          idx < metCount ? "met" : idx < metCount + 1 ? "partial" : "gap";

        return {
          skillId: req.skillId,
          skillName: req.skillName,
          displayLabel: req.displayLabel ?? req.skillName,
          importance: req.importance,
          status,
          evidenceStrength: status === "met" ? req.minimumEvidenceStrength : status === "partial" ? Math.max(1, req.minimumEvidenceStrength - 1) : 0,
          minimumRequired: req.minimumEvidenceStrength,
        };
      });

      setDetailRequirements(reqs);
      setDetailOpen(true);
    },
    [roles]
  );

  // Compute stats
  const interestedRoles = roles.filter((r) => r.candidateStatus === "interested");
  const rolesWithReadiness = roles.filter((r) => r.readinessPercent !== undefined);
  const avgReadiness =
    rolesWithReadiness.length > 0
      ? Math.round(
          rolesWithReadiness.reduce((sum, r) => sum + (r.readinessPercent ?? 0), 0) /
            rolesWithReadiness.length
        )
      : 0;

  // Filtered roles
  const filteredRoles = roles.filter((role) => {
    if (filter === "interested") return role.candidateStatus === "interested";
    if (filter === "high_readiness") return (role.readinessPercent ?? 0) >= 70;
    return true;
  });

  // Not-candidate guard
  if (!candidateId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
        <p className="text-gray-500">
          Switch to a candidate persona to view the Career Marketplace.
        </p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-sm text-gray-500">Loading marketplace opportunities...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <p className="text-sm text-gray-500">{error}</p>
        <Button onClick={loadData} variant="outline" size="sm" className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Store className="h-6 w-6 text-indigo-500" />
            Career Marketplace
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Browse opportunities and see your evidence-based readiness for each role.
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm" className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Active Roles"
          value={roles.length.toString()}
          icon={Briefcase}
          color="indigo"
        />
        <StatCard
          label="Interested"
          value={interestedRoles.length.toString()}
          icon={Heart}
          color="violet"
        />
        <StatCard
          label="Avg. Readiness"
          value={rolesWithReadiness.length > 0 ? `${avgReadiness}%` : "—"}
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Filter tabs */}
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as FilterTab)}
      >
        <TabsList>
          <TabsTrigger value="all" className="gap-1.5">
            All
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-0.5">
              {roles.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="interested" className="gap-1.5">
            <Heart className="h-3 w-3" />
            Interested
            {interestedRoles.length > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-0.5">
                {interestedRoles.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="high_readiness" className="gap-1.5">
            <TrendingUp className="h-3 w-3" />
            High Readiness
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Role cards */}
      {filteredRoles.length === 0 ? (
        <EmptyState
          icon={filter === "high_readiness" ? TrendingUp : Search}
          title={
            filter === "interested"
              ? "No roles saved yet"
              : filter === "high_readiness"
                ? "No high-readiness roles yet"
                : "No active roles in the marketplace"
          }
          description={
            filter === "interested"
              ? "Browse all roles and express interest when a match looks worth exploring."
              : filter === "high_readiness"
                ? "Add more evidence to your Living Portfolio to improve role readiness."
                : "Refresh the marketplace or ask an employer persona to create a role."
          }
          actionLabel={filter === "high_readiness" ? "Open Portfolio" : "Show All Roles"}
          onAction={() =>
            filter === "high_readiness" ? router.push("/portfolio") : setFilter("all")
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRoles.map((role) => (
            <OpportunityCard
              key={role.id}
              role={role}
              variant="candidate"
              onInterest={handleInterest}
              onHide={handleHide}
              onView={handleView}
              interestLoading={interestLoading === role.id}
            />
          ))}
        </div>
      )}

      {/* Readiness detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5 text-indigo-500" />
              {selectedRole?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedRole && (
            <div className="space-y-4">
              {/* Role description */}
              {selectedRole.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedRole.description}
                </p>
              )}

              {/* Readiness matrix */}
              {selectedRole.readinessPercent !== undefined ? (
                <ReadinessMatrix
                  requirements={detailRequirements}
                  readinessPercent={selectedRole.readinessPercent}
                  gapCount={selectedRole.gapCount ?? 0}
                  metCount={
                    detailRequirements.filter((r) => r.status === "met").length
                  }
                  variant="candidate"
                />
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
                  <p className="text-sm text-gray-500">
                    Express interest to compute your readiness for this role.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3 gap-1.5"
                    onClick={() => {
                      setDetailOpen(false);
                      handleInterest(selectedRole.id);
                    }}
                  >
                    <Heart className="h-3.5 w-3.5" />
                    Express Interest
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Stat Card sub-component ---

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: "indigo" | "amber" | "violet" | "emerald";
}) {
  const colorMap = {
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            colorMap[color]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
            {value}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
