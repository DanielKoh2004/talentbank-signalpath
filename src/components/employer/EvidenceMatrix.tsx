"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DisabledTooltipButton } from "@/components/shared/DisabledTooltipButton";
import { ProofViewerSheet } from "@/components/employer/ProofViewerSheet";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { SkillBadge } from "@/components/shared/SkillBadge";
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
  artifactId: string;
  claimText: string;
  provenanceStatus: string;
  evidenceQualityScore: number;
  confidence?: number | null;
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

interface ProofSelection {
  claimId: string;
  artifactId: string;
  claimText: string;
  confidence?: number | null;
}

const STATUS = {
  met: {
    icon: CheckCircle2,
    label: "Covered",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50/80 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-900/60",
  },
  partial: {
    icon: Minus,
    label: "Partial",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50/80 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-900/60",
  },
  gap: {
    icon: XCircle,
    label: "Gap",
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-50/80 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-900/60",
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
  const [proofOpen, setProofOpen] = useState(false);
  const [selectedProof, setSelectedProof] = useState<ProofSelection | null>(null);

  function openProofViewer(claim: EvidenceMatrixClaim) {
    if (!claim.artifactId) return;
    setSelectedProof({
      claimId: claim.id,
      artifactId: claim.artifactId,
      claimText: claim.claimText,
      confidence: claim.confidence,
    });
    setProofOpen(true);
  }

  return (
    <>
      <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800">
        <CardContent className="p-0">
          <div className="border-b border-slate-200 bg-slate-950 px-4 py-3 text-white dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-200">
                  <Shield className="h-3.5 w-3.5" />
                  Evidence Matrix
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Requirement-by-requirement proof trail for this match score.
                </p>
              </div>
              <Badge className="border-teal-400/30 bg-teal-400/10 text-teal-100 hover:bg-teal-400/10">
                {rows.length} signals
              </Badge>
            </div>
          </div>

          <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_10rem] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:border-slate-800 dark:bg-slate-950/60 md:grid">
            <span>Requirement</span>
            <span>Match Status</span>
            <span className="text-right">Proof</span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((row) => {
              const config = STATUS[row.status];
              const Icon = config.icon;
              const isOpen = openSkillId === row.skillId;
              const strongestClaim = row.matchingClaims[0];
              const proofClaim = row.matchingClaims.find(
                (claim) =>
                  claim.provenanceStatus === "artifact_backed" && claim.artifactId,
              );
              const matchLabel =
                row.status === "gap"
                  ? "Evidence gap"
                  : strongestClaim
                    ? row.displayLabel || row.skillName
                    : "Needs review";

              return (
                <div key={row.skillId} className="bg-white dark:bg-slate-950">
                  <div
                    className={cn(
                      "grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_10rem]",
                      config.bg,
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenSkillId(isOpen ? null : row.skillId)}
                      className="flex min-w-0 items-start gap-3 text-left"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border bg-white dark:bg-slate-900",
                          config.border,
                          config.color,
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                            {row.displayLabel || row.skillName}
                          </span>
                          <Badge variant="secondary" className="h-5 text-[10px]">
                            {row.importance === "required" ? "Required" : "Nice to Have"}
                          </Badge>
                        </span>
                        <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">
                          Strength {row.evidenceStrength}/{row.minimumRequired} min
                          {strongestClaim
                            ? ` - ${strongestClaim.artifactTitle ?? "evidence"}`
                            : " - no accepted claim"}
                        </span>
                      </span>
                    </button>

                    <div className="flex min-w-0 flex-col justify-center gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <SkillBadge
                          skillName={matchLabel}
                          provenance_status={
                            strongestClaim?.provenanceStatus ?? "self_claimed"
                          }
                        />
                        <Badge variant="outline" className={cn("h-6 text-[10px]", config.color)}>
                          {config.label}
                        </Badge>
                      </div>
                      {row.relationNote && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-300">
                          {row.relationNote}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 md:justify-end">
                      {proofClaim ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => openProofViewer(proofClaim)}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View Proof
                        </Button>
                      ) : (
                        <DisabledTooltipButton
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          disabledReason="No artifact-backed claim supports this requirement yet."
                        >
                          No Proof
                        </DisabledTooltipButton>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setOpenSkillId(isOpen ? null : row.skillId)}
                        aria-label={isOpen ? "Collapse evidence row" : "Expand evidence row"}
                      >
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                      {row.matchingClaims.length === 0 ? (
                        <p className="text-xs text-slate-500">
                          No accepted claim currently supports this requirement.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {row.matchingClaims.map((claim) => (
                            <div
                              key={claim.id}
                              className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50"
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
                                  <span className="text-[11px] text-slate-400">
                                    {claim.artifactTitle}
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                                {claim.claimText}
                              </p>
                              {claim.sourceSpan && (
                                <p className="mt-2 border-l-2 border-primary/40 pl-2 text-xs italic text-slate-500 dark:text-slate-400">
                                  {claim.sourceSpan}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <ProofViewerSheet
        open={proofOpen}
        onOpenChange={setProofOpen}
        proof={selectedProof}
      />
    </>
  );
}
