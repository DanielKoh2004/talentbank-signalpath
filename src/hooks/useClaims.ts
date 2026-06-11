"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// =============================================================================
// useClaims — Query + mutations for evidence claims
// =============================================================================

export interface ClaimFromAPI {
  id: string;
  candidateId: string;
  artifactId: string;
  claimText: string;
  normalizedSkillIds: string[];
  suggestedSkillNames: string[];
  roleFamilyTags: string[];
  provenanceStatus: string;
  evidenceQualityScore: number;
  sourceSpan: string | null;
  confidence: number | null;
  candidateStatus: "pending" | "accepted" | "edited" | "rejected";
  visibility: string;
  createdAt: string;
  lastVerifiedAt: string | null;
  artifact: {
    id: string;
    title: string;
    type: string;
  };
}

interface ClaimsResponse {
  claims: ClaimFromAPI[];
}

async function fetchClaims(
  candidateId: string,
  status?: string
): Promise<ClaimFromAPI[]> {
  const params = new URLSearchParams({ candidateId });
  if (status) params.set("status", status);

  const res = await fetch(`/api/claims?${params}`);
  if (!res.ok) throw new Error("Failed to fetch claims");
  const data: ClaimsResponse = await res.json();
  return data.claims;
}

async function updateClaim(body: {
  claimId: string;
  action: "accept" | "edit" | "reject";
  editedText?: string;
  editedSkillIds?: string[];
  visibility?: string;
}): Promise<ClaimFromAPI> {
  const res = await fetch("/api/claims", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update claim");
  const data = await res.json();
  return data.claim;
}

export function useClaims(candidateId: string | null, status?: string) {
  const queryClient = useQueryClient();
  type ClaimsSnapshot = Array<[readonly unknown[], ClaimFromAPI[] | undefined]>;

  function claimStatusForAction(
    action: "accept" | "edit" | "reject"
  ): ClaimFromAPI["candidateStatus"] {
    if (action === "reject") return "rejected";
    if (action === "edit") return "edited";
    return "accepted";
  }

  async function optimisticallyUpdateClaims(input: {
    claimIds: string[];
    action: "accept" | "edit" | "reject";
    editedText?: string;
    editedSkillIds?: string[];
  }) {
    if (!candidateId) return { previousClaims: [] as ClaimsSnapshot };

    await queryClient.cancelQueries({ queryKey: ["claims", candidateId] });
    const previousClaims = queryClient.getQueriesData<ClaimFromAPI[]>({
      queryKey: ["claims", candidateId],
    });
    const claimIdSet = new Set(input.claimIds);

    queryClient.setQueriesData<ClaimFromAPI[]>(
      { queryKey: ["claims", candidateId] },
      (oldClaims) => {
        if (!oldClaims) return oldClaims;
        return oldClaims.map((claim) => {
          if (!claimIdSet.has(claim.id)) return claim;
          return {
            ...claim,
            claimText: input.editedText ?? claim.claimText,
            normalizedSkillIds: input.editedSkillIds ?? claim.normalizedSkillIds,
            candidateStatus: claimStatusForAction(input.action),
            provenanceStatus:
              input.action === "edit" && input.editedText
                ? "self_claimed"
                : claim.provenanceStatus,
            confidence:
              input.action === "edit" && input.editedText ? null : claim.confidence,
          };
        });
      },
    );

    return { previousClaims };
  }

  function rollbackClaims(context?: { previousClaims: ClaimsSnapshot }) {
    for (const [queryKey, data] of context?.previousClaims ?? []) {
      queryClient.setQueryData(queryKey, data);
    }
  }

  const query = useQuery({
    queryKey: ["claims", candidateId, status],
    queryFn: () => fetchClaims(candidateId!, status),
    enabled: !!candidateId,
  });

  const acceptMutation = useMutation({
    mutationFn: (claimId: string) =>
      updateClaim({ claimId, action: "accept" }),
    onMutate: (claimId) =>
      optimisticallyUpdateClaims({ claimIds: [claimId], action: "accept" }),
    onError: (_error, _claimId, context) => rollbackClaims(context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["claims", candidateId] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (claimId: string) =>
      updateClaim({ claimId, action: "reject" }),
    onMutate: (claimId) =>
      optimisticallyUpdateClaims({ claimIds: [claimId], action: "reject" }),
    onError: (_error, _claimId, context) => rollbackClaims(context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["claims", candidateId] });
    },
  });

  const editMutation = useMutation({
    mutationFn: ({
      claimId,
      editedText,
      editedSkillIds,
    }: {
      claimId: string;
      editedText?: string;
      editedSkillIds?: string[];
    }) =>
      updateClaim({ claimId, action: "edit", editedText, editedSkillIds }),
    onMutate: ({ claimId, editedText, editedSkillIds }) =>
      optimisticallyUpdateClaims({
        claimIds: [claimId],
        action: "edit",
        editedText,
        editedSkillIds,
      }),
    onError: (_error, _variables, context) => rollbackClaims(context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["claims", candidateId] });
    },
  });

  const acceptAllMutation = useMutation({
    mutationFn: async (claimIds: string[]) => {
      const results = await Promise.all(
        claimIds.map((id) => updateClaim({ claimId: id, action: "accept" }))
      );
      return results;
    },
    onMutate: (claimIds) =>
      optimisticallyUpdateClaims({ claimIds, action: "accept" }),
    onError: (_error, _claimIds, context) => rollbackClaims(context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["claims", candidateId] });
    },
  });

  return {
    claims: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    accept: acceptMutation.mutate,
    reject: rejectMutation.mutate,
    edit: editMutation.mutate,
    acceptAll: acceptAllMutation.mutate,
    isUpdating:
      acceptMutation.isPending ||
      rejectMutation.isPending ||
      editMutation.isPending ||
      acceptAllMutation.isPending,
  };
}
