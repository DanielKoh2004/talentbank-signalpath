"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// =============================================================================
// useArtifacts — Query + upload mutation for artifacts
// =============================================================================

export interface ArtifactFromAPI {
  id: string;
  candidateId: string;
  title: string;
  type: string;
  sourceUrl: string | null;
  extractionSource: string | null;
  demoManifestId: string | null;
  uploadedAt: string;
  shareable: boolean;
  extractionJobs: {
    id: string;
    status: string;
    createdClaimCount: number;
    progressLabel: string | null;
  }[];
}

async function fetchArtifacts(candidateId: string): Promise<ArtifactFromAPI[]> {
  const res = await fetch(`/api/artifacts?candidateId=${candidateId}`);
  if (!res.ok) throw new Error("Failed to fetch artifacts");
  const data = await res.json();
  return data.artifacts;
}

interface UploadArtifactInput {
  candidateId: string;
  title: string;
  type: string;
  sourceUrl?: string;
  extractedText?: string;
  demoManifestId?: string;
}

async function uploadArtifact(input: UploadArtifactInput) {
  const res = await fetch("/api/artifacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to upload artifact");
  return res.json();
}

async function provideArtifactContent(input: { artifactId: string; extractedText: string }) {
  const res = await fetch(`/api/artifacts/${input.artifactId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ extractedText: input.extractedText }),
  });
  if (!res.ok) throw new Error("Failed to provide content");
  return res.json();
}

async function uploadResume(input: {
  candidateId: string;
  resumeText?: string;
  file?: File | null;
}) {
  const formData = new FormData();
  formData.set("candidateId", input.candidateId);
  if (input.resumeText) formData.set("resumeText", input.resumeText);
  if (input.file) formData.set("file", input.file);

  const res = await fetch("/api/resume", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload resume");
  return res.json();
}

export function useArtifacts(candidateId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["artifacts", candidateId],
    queryFn: () => fetchArtifacts(candidateId!),
    enabled: !!candidateId,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadArtifact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artifacts", candidateId] });
    },
  });

  const provideContentMutation = useMutation({
    mutationFn: provideArtifactContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artifacts", candidateId] });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: uploadResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artifacts", candidateId] });
    },
  });

  return {
    artifacts: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    upload: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    lastUpload: uploadMutation.data ?? null,
    uploadResume: resumeMutation.mutate,
    isUploadingResume: resumeMutation.isPending,
    lastResumeUpload: resumeMutation.data ?? null,
    provideContent: provideContentMutation.mutate,
    isProviding: provideContentMutation.isPending,
    lastProvide: provideContentMutation.data ?? null,
  };
}
