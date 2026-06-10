"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { cn } from "@/lib/utils";
import type { ProvenanceStatus } from "@/types";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Minus,
  Shield,
  XCircle,
} from "lucide-react";

export interface EvidenceMatrixClaim {
  id: string;
  claimText: string;
  provenanceStatus: string;
  evidenceQualityScore: number;
  artifactTitle?: string | null;
  sourceUrl?: string | null;
  sourceSpan?: string | null;
}

export interface EvidenceMatrixRow {
  skillId: string;
  skillName: string;
  displayLabel: string;
  importance: "required" | "nice_to_have";
  status: "met" | "partial" | "gap";
  evidenceStrength: number;
  minimumRequired: number;
  matchingClaims: EvidenceMatrixClaim[];
  relationNote?: string;
}

const STATUS = {
  met: {
    icon: CheckCircle2,
    label: "Covered",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/10",
  },
  partial: {
    icon: Minus,
    label: "Partial",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/10",
  },
  gap: {
    icon: XCircle,
    label: "Gap",
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/10",
  },
};

function isProvenanceStatus(value: string): value is ProvenanceStatus {
  return [
    "repo_backed",
    "artifact_backed",
    "document_backed",
    "reviewer_confirmed",
    "self_claimed",
    "unmapped",
  ].includes(value);
}

export function EvidenceMatrix({
  rows,
}: {
  rows: EvidenceMatrixRow[];
}) {
  const [openSkillId, setOpenSkillId] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5" />
          Evidence Matrix
        </h3>

        <div className="space-y-2">
          {rows.map((row) => {
            const config = STATUS[row.status];
            const Icon = config.icon;
            const isOpen = openSkillId === row.skillId;
            const strongestClaim = row.matchingClaims[0];

            return (
              <div
                key={row.skillId}
                className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
              >
                <button
                  type="button"
                  onClick={() => setOpenSkillId(isOpen ? null : row.skillId)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 p-3 text-left transition-colors",
                    config.bg,
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon className={cn("h-4 w-4 flex-shrink-0", config.color)} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {row.displayLabel || row.skillName}
                        </span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {row.importance === "required" ? "Required" : "Nice to Have"}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                        Strength {row.evidenceStrength}/{row.minimumRequired} min
                        {strongestClaim ? ` from ${strongestClaim.artifactTitle ?? "evidence"}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={cn("text-[10px]", config.color)}>
                      {config.label}
                    </Badge>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="space-y-3 border-t border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
                    {row.relationNote && (
                      <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-700 dark:bg-amber-900/10 dark:text-amber-300">
                        {row.relationNote}
                      </p>
                    )}

                    {row.matchingClaims.length === 0 ? (
                      <p className="text-xs text-gray-500">
                        No accepted claim currently supports this requirement.
                      </p>
                    ) : (
                      row.matchingClaims.map((claim) => (
                        <div
                          key={claim.id}
                          className="rounded-md border border-gray-100 p-3 dark:border-gray-800"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <ProvenanceBadge
                              status={
                                isProvenanceStatus(claim.provenanceStatus)
                                  ? claim.provenanceStatus
                                  : "unmapped"
                              }
                              size="sm"
                            />
                            <Badge variant="secondary" className="text-[10px]">
                              Quality {claim.evidenceQualityScore}/5
                            </Badge>
                            {claim.artifactTitle && (
                              <span className="text-[11px] text-gray-400">
                                {claim.artifactTitle}
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                            {claim.claimText}
                          </p>
                          {claim.sourceSpan && (
                            <p className="mt-2 border-l-2 border-gray-200 pl-2 text-xs italic text-gray-500 dark:border-gray-700">
                              {claim.sourceSpan}
                            </p>
                          )}
                          {claim.sourceUrl && (
                            <a
                              href={claim.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex"
                            >
                              <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
                                <ExternalLink className="h-3 w-3" />
                                View Proof
                              </Button>
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
