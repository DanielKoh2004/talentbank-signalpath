// =============================================================================
// Shared TypeScript types for SignalPath
// These mirror the Prisma schema but are used in client-side code
// where importing Prisma types directly isn't appropriate.
// =============================================================================

// --- User & Persona ---

export type UserRole = "candidate" | "employer" | "university_admin";

export interface Persona {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
  description: string;
  candidateProfileId?: string;
}

// --- Provenance ---

export type ProvenanceStatus =
  | "repo_backed"
  | "artifact_backed"
  | "document_backed"
  | "reviewer_confirmed"
  | "self_claimed"
  | "unmapped";

export const PROVENANCE_CONFIG: Record<
  ProvenanceStatus,
  { label: string; color: string; strength: "strong" | "medium" | "weak" | "none" }
> = {
  repo_backed: {
    label: "Repository Backed",
    color: "emerald",
    strength: "strong",
  },
  artifact_backed: {
    label: "Artifact Backed",
    color: "blue",
    strength: "medium",
  },
  document_backed: {
    label: "Document Backed",
    color: "sky",
    strength: "medium",
  },
  reviewer_confirmed: {
    label: "Reviewer Confirmed",
    color: "emerald",
    strength: "strong",
  },
  self_claimed: {
    label: "Self Claimed",
    color: "amber",
    strength: "weak",
  },
  unmapped: {
    label: "Unmapped",
    color: "gray",
    strength: "none",
  },
};

// --- Extraction ---

export type ExtractionStatus =
  | "queued"
  | "processing"
  | "needs_input"
  | "completed"
  | "failed";

export type ExtractionSource =
  | "manifest"
  | "native_text"
  | "pasted_summary"
  | "manual_entry"
  | "failed";

export const EXTRACTION_STATUS_CONFIG: Record<
  ExtractionStatus,
  { label: string; description: string }
> = {
  queued: { label: "Preparing", description: "Preparing artifact" },
  processing: {
    label: "Reading",
    description: "Reading evidence and drafting claims",
  },
  needs_input: {
    label: "Needs Input",
    description: "We need help reading this file",
  },
  completed: { label: "Ready", description: "Claims ready for review" },
  failed: { label: "Failed", description: "Extraction failed, continue manually" },
};

// --- Claims ---

export type CandidateClaimStatus = "pending" | "accepted" | "edited" | "rejected";

export type ClaimVisibility = "private" | "shareable_summary" | "shareable_artifact";

// --- Evidence Quality ---

export const EVIDENCE_QUALITY_LABELS: Record<number, string> = {
  0: "No Evidence",
  1: "Self-Claimed",
  2: "Weak Evidence",
  3: "Moderate Evidence",
  4: "Strong Evidence",
  5: "Verified Evidence",
};

// --- Readiness ---

export type ReadinessLevel = "not_ready" | "building" | "near_ready" | "ready_to_discuss";

export const READINESS_CONFIG: Record<
  ReadinessLevel,
  { label: string; color: string; minScore: number }
> = {
  not_ready: { label: "Not Ready", color: "red", minScore: 0 },
  building: { label: "Building", color: "amber", minScore: 0.25 },
  near_ready: { label: "Near Ready", color: "blue", minScore: 0.6 },
  ready_to_discuss: { label: "Ready to Discuss", color: "emerald", minScore: 0.8 },
};

export function getReadinessLevel(score: number): ReadinessLevel {
  if (score >= 0.8) return "ready_to_discuss";
  if (score >= 0.6) return "near_ready";
  if (score >= 0.25) return "building";
  return "not_ready";
}

// --- Opportunity ---

export type CandidateInteractionStatus = "viewed" | "interested" | "hidden" | "applied";
export type EmployerInteractionStatus = "not_reviewed" | "shortlisted" | "contacted" | "rejected";

// --- Path Types ---

export type PathType = "nearby" | "stretch" | "pivot" | "higher_pay" | "stability";

export const PATH_TYPE_CONFIG: Record<
  PathType,
  { label: string; description: string; icon: string }
> = {
  nearby: {
    label: "Nearby",
    description: "Lowest-friction next role",
    icon: "ArrowRight",
  },
  stretch: {
    label: "Stretch",
    description: "Plausible but requires gap closure",
    icon: "TrendingUp",
  },
  pivot: {
    label: "Pivot",
    description: "Adjacent field using transferable skills",
    icon: "Shuffle",
  },
  higher_pay: {
    label: "Higher Pay",
    description: "Route optimized for compensation growth",
    icon: "DollarSign",
  },
  stability: {
    label: "Stability",
    description: "Route optimized for lower transition risk",
    icon: "Shield",
  },
};

// --- Score Dimensions ---

export interface MatchScoreBreakdown {
  roleEvidenceCoverage: number; // 35%
  trajectoryFit: number;        // 25%
  adjacentExperience: number;   // 15%
  logisticsFit: number;         // 10%
  growthSignal: number;         // 10%
  preferenceAlignment: number;  // 5%
}

export const SCORE_WEIGHTS: Record<keyof MatchScoreBreakdown, number> = {
  roleEvidenceCoverage: 0.35,
  trajectoryFit: 0.25,
  adjacentExperience: 0.15,
  logisticsFit: 0.1,
  growthSignal: 0.1,
  preferenceAlignment: 0.05,
};

// --- Skill ---

export type SkillCategory =
  | "Data"
  | "Product"
  | "Communication"
  | "Technical"
  | "Business"
  | "Security"
  | "Operations";

export type SkillRelationType = "parent" | "child" | "adjacent" | "prerequisite";

export type SkillLevel = "category" | "family" | "specific";

// --- Re-Engagement ---

export type ConsentStatus = "active" | "revoked" | "expired";
export type ConsentScope = "role_only" | "employer_only" | "marketplace";
export type ReEngagementTrigger = "new_evidence" | "requirement_change";

// --- University ---

export type MetricType =
  | "readiness_distribution"
  | "missing_skill"
  | "evidence_coverage"
  | "internship_readiness";

// --- Demo Personas ---

export const DEMO_PERSONAS: Persona[] = [
  {
    id: "user_aisha",
    name: "Aisha Razak",
    email: "aisha@demo.signalpath.com",
    role: "candidate",
    avatarInitials: "AR",
    description: "Fresh graduate from UM, building a data analytics career",
  },
  {
    id: "user_farid",
    name: "Farid Lim",
    email: "farid@demo.signalpath.com",
    role: "candidate",
    avatarInitials: "FL",
    description: "Frontend and cloud builder with repo-backed engineering proof",
  },
  {
    id: "user_mei_lin",
    name: "Mei Lin Wong",
    email: "mei.lin@demo.signalpath.com",
    role: "candidate",
    avatarInitials: "MW",
    description: "Product research and business operations candidate",
  },
  {
    id: "user_arjun",
    name: "Arjun Menon",
    email: "arjun@demo.signalpath.com",
    role: "candidate",
    avatarInitials: "AM",
    description: "Security and cryptographic infrastructure candidate",
  },
  {
    id: "user_dataco_hr",
    name: "DataCo HR",
    email: "hr@dataco.demo.signalpath.com",
    role: "employer",
    avatarInitials: "DC",
    description: "Hiring manager at DataCo Analytics",
  },
  {
    id: "user_um_admin",
    name: "UM Admin",
    email: "admin@um.demo.signalpath.com",
    role: "university_admin",
    avatarInitials: "UM",
    description: "Faculty admin at UM Faculty of Computing",
  },
];
