"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Sparkles,
  Award,
  TrendingUp,
} from "lucide-react";

// =============================================================================
// CareerShapeCard
// Visual summary of the candidate's skill profile from accepted evidence.
// =============================================================================

interface CareerShapeData {
  topCategories: Array<{
    category: string;
    evidenceCount: number;
    avgQuality: number;
  }>;
  strongestSkills: Array<{
    skillId: string;
    skillName: string;
    maxQuality: number;
    claimCount: number;
  }>;
  qualityDistribution: { high: number; medium: number; low: number };
  totalAcceptedClaims: number;
  totalEvidencedSkills: number;
}

interface CareerShapeCardProps {
  shape: CareerShapeData;
  candidateName: string;
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Data: "bg-blue-500",
  Product: "bg-violet-500",
  Communication: "bg-emerald-500",
  Technical: "bg-orange-500",
  Business: "bg-cyan-500",
  Security: "bg-red-500",
  Operations: "bg-slate-500",
};

export function CareerShapeCard({
  shape,
  candidateName,
  className,
}: CareerShapeCardProps) {
  const maxCount = Math.max(
    ...shape.topCategories.map((c) => c.evidenceCount),
    1
  );

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-purple-500/10 p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
            <BarChart3 className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Career Shape
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {candidateName}&apos;s evidence profile
            </p>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {shape.totalAcceptedClaims}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">
              Claims
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {shape.totalEvidencedSkills}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">
              Skills
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {shape.qualityDistribution.high}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">
              High Quality
            </p>
          </div>
        </div>

        {/* Category breakdown with horizontal bars */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Skill Categories
          </h4>
          <div className="space-y-2">
            {shape.topCategories.map((cat) => (
              <div key={cat.category} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-300 w-24 truncate">
                  {cat.category}
                </span>
                <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      CATEGORY_COLORS[cat.category] ?? "bg-gray-400"
                    )}
                    style={{
                      width: `${(cat.evidenceCount / maxCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 tabular-nums w-6 text-right">
                  {cat.evidenceCount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Strongest skills */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Strongest Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {shape.strongestSkills.slice(0, 8).map((skill) => (
              <Badge
                key={skill.skillId}
                variant="secondary"
                className={cn(
                  "text-xs gap-1",
                  skill.maxQuality >= 4
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : skill.maxQuality >= 3
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      : ""
                )}
              >
                {skill.maxQuality >= 4 && <Award className="h-3 w-3" />}
                {skill.skillName}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quality distribution mini-bar */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
            Evidence Quality
          </h4>
          <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
            {shape.qualityDistribution.high > 0 && (
              <div
                className="bg-emerald-500 transition-all"
                style={{
                  width: `${(shape.qualityDistribution.high / shape.totalAcceptedClaims) * 100}%`,
                }}
                title={`High (4-5): ${shape.qualityDistribution.high}`}
              />
            )}
            {shape.qualityDistribution.medium > 0 && (
              <div
                className="bg-amber-400 transition-all"
                style={{
                  width: `${(shape.qualityDistribution.medium / shape.totalAcceptedClaims) * 100}%`,
                }}
                title={`Medium (2-3): ${shape.qualityDistribution.medium}`}
              />
            )}
            {shape.qualityDistribution.low > 0 && (
              <div
                className="bg-red-400 transition-all"
                style={{
                  width: `${(shape.qualityDistribution.low / shape.totalAcceptedClaims) * 100}%`,
                }}
                title={`Low (0-1): ${shape.qualityDistribution.low}`}
              />
            )}
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-gray-400">
            <span>High ({shape.qualityDistribution.high})</span>
            <span>Medium ({shape.qualityDistribution.medium})</span>
            <span>Low ({shape.qualityDistribution.low})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
