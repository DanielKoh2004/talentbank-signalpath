"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkillTag } from "@/components/shared/SkillTag";
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
import type { ProvenanceStatus, SkillCategory } from "@/types";

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
}> {
  const skillStats: Record<
    string,
    { name: string; category: string; bestQuality: number; claimCount: number }
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
        };
      } else {
        skillStats[skillId].bestQuality = Math.max(
          skillStats[skillId].bestQuality,
          claim.evidenceQualityScore
        );
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
  className,
}: LivingCVProps) {
  const acceptedClaims = claims.filter(
    (c) => c.candidateStatus === "accepted" || c.candidateStatus === "edited"
  );

  const skillSummary = getSkillSummary(acceptedClaims, skillMap);
  const groupedClaims = groupClaimsByCategory(acceptedClaims, skillMap);
  const categoryOrder = Object.keys(groupedClaims).sort();

  if (acceptedClaims.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
            <GraduationCap className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Living CV Preview
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            Accept evidence claims from your artifacts to build your Living CV. Each accepted claim becomes a verified entry with proof.
          </p>
        </CardContent>
      </Card>
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
            {skillSummary.map((skill) => (
              <div key={skill.skillId} className="flex items-center gap-1">
                <SkillTag
                  name={skill.name}
                  category={skill.category as SkillCategory}
                  size="sm"
                />
                <EvidenceQualityBadge
                  score={skill.bestQuality}
                  showLabel={false}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Claims by category */}
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
      </CardContent>
    </Card>
  );
}
