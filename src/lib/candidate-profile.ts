export const CANDIDATE_PROFILE_BY_USER_ID: Record<string, string> = {
  user_aisha: "profile_aisha",
  user_farid: "profile_farid",
  user_mei_lin: "profile_mei_lin",
  user_arjun: "profile_arjun",
};

export function getCandidateProfileId(userId: string, candidateProfileId?: string) {
  if (candidateProfileId) return candidateProfileId;
  return CANDIDATE_PROFILE_BY_USER_ID[userId] ?? "profile_aisha";
}
