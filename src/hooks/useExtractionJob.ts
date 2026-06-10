"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// =============================================================================
// useExtractionJob — Realtime status with bounded fallback polling
//
// Polls at 1s while processing, stops when completed/failed.
// Max 60 polls to prevent runaway requests.
// Future: swap polling for SSE when available.
// =============================================================================

interface ExtractionJobStatus {
  id: string;
  status: "queued" | "processing" | "needs_input" | "completed" | "failed";
  extractionSource: string | null;
  progressLabel: string | null;
  errorMessage: string | null;
  createdClaimCount: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

async function fetchJobStatus(jobId: string): Promise<ExtractionJobStatus> {
  const res = await fetch(`/api/extraction/${jobId}`);
  if (!res.ok) throw new Error("Failed to fetch job status");
  const data = await res.json();
  return data.job;
}

async function triggerExtraction(jobId: string): Promise<{ success: boolean; claimCount: number; error?: string }> {
  const res = await fetch(`/api/extraction/${jobId}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to trigger extraction");
  return res.json();
}

export function useExtractionJob(jobId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["extraction-job", jobId],
    queryFn: () => fetchJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 1000;
      // Stop polling when terminal state
      if (data.status === "completed" || data.status === "failed" || data.status === "needs_input") {
        return false;
      }
      // Poll at 1s for active jobs
      return 1000;
    },
    staleTime: 0,
  });

  const triggerMutation = useMutation({
    mutationFn: () => triggerExtraction(jobId!),
    onSuccess: () => {
      // Invalidate to pick up new status
      queryClient.invalidateQueries({ queryKey: ["extraction-job", jobId] });
      // Also invalidate claims since extraction creates new ones
      queryClient.invalidateQueries({ queryKey: ["claims"] });
    },
  });

  return {
    job: query.data ?? null,
    isLoading: query.isLoading,
    isPolling: query.isFetching && !query.isLoading,
    error: query.error,
    trigger: triggerMutation.mutate,
    isTriggering: triggerMutation.isPending,
  };
}
