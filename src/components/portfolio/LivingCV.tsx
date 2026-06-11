"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { EvidenceQualityBadge } from "@/components/shared/EvidenceQualityBadge";
import { cn } from "@/lib/utils";
import { ClaimFromAPI } from "@/hooks/useClaims";
import {
  User,
  Briefcase,
  GraduationCap,
  Shield,
  FileText,
} from "lucide-react";
import type { ProvenanceStatus } from "@/types";

// =============================================================================
// LivingCV
// Evidence-backed CV generated from accepted claims.
// Groups skills by category and shows provenance for each.
// =============================================================================

interface LivingCVProps {
  claims: ClaimFromAPI[];
  candidateName: string;
  candidateDescription?: string;
  skillMap?: Record<string, { name: string; category: string }>;
  onAddEvidence?: () => void;
  className?: string;
}

// Group claims by skill category
function groupClaimsByCategory(
  claims: ClaimFromAPI[],
  skillMap: Record<string, { name: string; category: string }>
): Record<string, ClaimFromAPI[]> {
  const groups: Record<string, ClaimFromAPI[]> = {};

  for (const claim of claims) {
    const categories = new Set<string>();

    for (const skillId of claim.normalizedSkillIds) {
      const skill = skillMap[skillId];
      if (skill) {
        categories.add(skill.category);
      }
    }

    if (categories.size === 0) {
      categories.add("Other");
    }

    for (const cat of categories) {
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(claim);
    }
  }

  return groups;
}

// Get unique skills with their best evidence quality
function getSkillSummary(
  claims: ClaimFromAPI[],
  skillMap: Record<string, { name: string; category: string }>
): Array<{
  skillId: string;
  name: string;
  category: string;
  bestQuality: number;
  claimCount: number;
  bestProvenanceStatus: string;
}> {
  const skillStats: Record<
    string,
    {
      name: string;
      category: string;
      bestQuality: number;
      claimCount: number;
      bestProvenanceStatus: string;
    }
  > = {};

  for (const claim of claims) {
    for (const skillId of claim.normalizedSkillIds) {
      const skill = skillMap[skillId];
      if (!skill) continue;

      if (!skillStats[skillId]) {
        skillStats[skillId] = {
          name: skill.name,
          category: skill.category,
          bestQuality: claim.evidenceQualityScore,
          claimCount: 1,
          bestProvenanceStatus: claim.provenanceStatus,
        };
      } else {
        if (claim.evidenceQualityScore > skillStats[skillId].bestQuality) {
          skillStats[skillId].bestQuality = claim.evidenceQualityScore;
          skillStats[skillId].bestProvenanceStatus = claim.provenanceStatus;
        }
        skillStats[skillId].claimCount++;
      }
    }
  }

  return Object.entries(skillStats)
    .map(([skillId, stats]) => ({ skillId, ...stats }))
    .sort((a, b) => b.bestQuality - a.bestQuality || b.claimCount - a.claimCount);
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Data: Briefcase,
  Product: Briefcase,
  Communication: User,
  Technical: Shield,
  Business: Briefcase,
  Security: Shield,
  Operations: Briefcase,
  Other: FileText,
};

export function LivingCV({
  claims,
  candidateName,
  candidateDescription,
  skillMap = {},
  onAddEvidence,
  className,
}: LivingCVProps) {
  const acceptedClaims = claims.filter(
    (c) => c.candidateStatus === "accepted" || c.candidateStatus === "edited"
  );

  const skillSummary = getSkillSummary(acceptedClaims, skillMap);
  const visibleSkillSummary =
    skillSummary.length > 5 ? skillSummary.slice(0, 3) : skillSummary;
  const hiddenSkillCount = skillSummary.length - visibleSkillSummary.length;
  const groupedClaims = groupClaimsByCategory(acceptedClaims, skillMap);
  const categoryOrder = Object.keys(groupedClaims).sort();

  if (acceptedClaims.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Living CV preview is empty"
        description="Accept evidence claims from your artifacts to build a verified CV with proof links."
        actionLabel={onAddEvidence ? "Upload Evidence" : undefined}
        onAction={onAddEvidence}
        actionVariant="outline"
        className={className}
      />
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* CV Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 px-6 py-5 text-white">
        <h2 className="text-lg font-bold">{candidateName}</h2>
        {candidateDescription && (
          <p className="text-sm text-indigo-100 mt-0.5">{candidateDescription}</p>
        )}
        <div className="flex items-center gap-3 mt-3">
          <Badge className="bg-white/20 text-white border-white/20 hover:bg-white/30 text-xs">
            {acceptedClaims.length} verified claims
          </Badge>
          <Badge className="bg-white/20 text-white border-white/20 hover:bg-white/30 text-xs">
            {skillSummary.length} skills evidenced
          </Badge>
        </div>
      </div>

      <CardContent className="p-0">
        {/* Skills Overview */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Skills Evidence Map
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {visibleSkillSummary.map((skill) => (
              <div key={skill.skillId} className="flex items-center gap-1">
                <SkillBadge
                  skillName={skill.name}
                  provenance_status={skill.bestProvenanceStatus}
                />
                <EvidenceQualityBadge
                  score={skill.bestQuality}
                  showLabel={false}
                  size="sm"
                />
              </div>
            ))}
            {hiddenSkillCount > 0 && (
              <Badge variant="secondary" className="h-6 text-[11px]">
                +{hiddenSkillCount} more
              </Badge>
            )}
          </div>
        </div>

        {/* Claims by category */}
        <div className="max-h-[min(560px,calc(100vh-22rem))] overflow-y-auto overscroll-contain">
          {categoryOrder.map((category) => {
            const categoryClaims = groupedClaims[category];
            const Icon = CATEGORY_ICONS[category] ?? FileText;

            return (
              <div
                key={category}
                className="px-6 py-4 border-b border-gray-100 last:border-b-0 dark:border-gray-800"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {category}
                  </h3>
                  <Badge variant="secondary" className="text-[10px] ml-auto">
                    {categoryClaims.length} claims
                  </Badge>
                </div>

                <div className="space-y-2.5">
                  {categoryClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className="flex items-start gap-3 rounded-md bg-gray-50 p-3 dark:bg-gray-800/40"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <ProvenanceBadge
                          status={claim.provenanceStatus as ProvenanceStatus}
                          showLabel={false}
                          size="sm"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {claim.claimText}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-gray-400">
                            from {claim.artifact.title}
                          </span>
                          <EvidenceQualityBadge
                            score={claim.evidenceQualityScore}
                            showLabel={false}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
