"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, Loader2, Lock, ShieldCheck } from "lucide-react";
import { DisabledTooltipButton } from "@/components/shared/DisabledTooltipButton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface ProofSelection {
  claimId: string;
  artifactId: string;
  claimText: string;
  confidence?: number | null;
}

interface ArtifactDetails {
  id: string;
  title: string;
  type: string;
  url: string;
  sourceUrl: string | null;
  storagePath: string | null;
  extractionSource: string | null;
  demoManifestId: string | null;
  uploadedAt: string;
  isShareable: boolean;
}

interface ArtifactSuccessResponse {
  artifact: ArtifactDetails;
}

interface ArtifactErrorResponse {
  error: string;
  access?: "denied";
}

interface ProofViewerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proof: ProofSelection | null;
}

class ArtifactFetchError extends Error {
  status: number;
  access?: "denied";

  constructor(message: string, status: number, access?: "denied") {
    super(message);
    this.name = "ArtifactFetchError";
    this.status = status;
    this.access = access;
  }
}

async function fetchArtifact(artifactId: string): Promise<ArtifactSuccessResponse> {
  const response = await fetch(`/api/artifacts/${artifactId}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({
      error: "Failed to load artifact",
    }))) as ArtifactErrorResponse;
    throw new ArtifactFetchError(
      payload.error || "Failed to load artifact",
      response.status,
      payload.access,
    );
  }

  return (await response.json()) as ArtifactSuccessResponse;
}

function formatConfidence(confidence?: number | null) {
  if (confidence == null) return "Not available";
  return `${Math.round(confidence * 100)}%`;
}

function isLockedError(error: unknown) {
  return error instanceof ArtifactFetchError && error.status === 403;
}

export function ProofViewerSheet({
  open,
  onOpenChange,
  proof,
}: ProofViewerSheetProps) {
  const artifactQuery = useQuery({
    queryKey: ["proof-artifact", proof?.artifactId],
    queryFn: () => fetchArtifact(proof?.artifactId ?? ""),
    enabled: open && Boolean(proof?.artifactId),
    retry: false,
  });

  const artifact = artifactQuery.data?.artifact;
  const locked = isLockedError(artifactQuery.error);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <SheetHeader className="border-b border-gray-200 px-6 py-5 text-left dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="rounded-md border border-blue-100 bg-blue-50 p-2 text-blue-600 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <SheetTitle>View Proof</SheetTitle>
              <SheetDescription>
                Cross-check the matched claim against the candidate&apos;s source artifact.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {artifactQuery.isLoading && (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading proof...
            </div>
          </div>
        )}

        {locked && (
          <div className="flex flex-1 items-center justify-center px-8">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-300">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Locked artifact
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                This candidate has verified evidence for this skill, but the underlying
                artifact is marked as private.
              </p>
              <DisabledTooltipButton
                variant="secondary"
                className="mt-5"
                disabledReason="Candidate has not granted employer access to this private artifact."
              >
                Request Access (Coming Soon)
              </DisabledTooltipButton>
            </div>
          </div>
        )}

        {artifactQuery.isError && !locked && (
          <div className="flex flex-1 items-center justify-center px-8">
            <div className="max-w-md text-center">
              <FileText className="mx-auto h-8 w-8 text-gray-400" />
              <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Proof could not be loaded
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                The artifact endpoint did not return a viewable document.
              </p>
            </div>
          </div>
        )}

        {artifact && proof && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Extracted Claim
                  </p>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-800 dark:text-gray-100">
                    {proof.claimText}
                  </p>
                </div>
                <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-right dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    AI Confidence
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatConfidence(proof.confidence)}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <FileText className="h-3.5 w-3.5" />
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {artifact.title}
                </span>
                <span>·</span>
                <span>{artifact.type}</span>
              </div>
            </div>

            <iframe
              title={`Proof artifact: ${artifact.title}`}
              src={artifact.url}
              className="min-h-0 flex-1 border-0 bg-white"
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
