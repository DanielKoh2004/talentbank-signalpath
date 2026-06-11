"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePersona } from "@/providers/PersonaProvider";
import { useArtifacts } from "@/hooks/useArtifacts";
import { useClaims } from "@/hooks/useClaims";
import { useExtractionJob } from "@/hooks/useExtractionJob";
import { ArtifactUpload } from "@/components/portfolio/ArtifactUpload";
import { ArtifactCard } from "@/components/portfolio/ArtifactCard";
import { ClaimCard } from "@/components/portfolio/ClaimCard";
import { DisabledTooltipButton } from "@/components/shared/DisabledTooltipButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { LivingCV } from "@/components/portfolio/LivingCV";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  FolderOpen,
  Inbox,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  FileUp,
  Sparkles,
} from "lucide-react";

// =============================================================================
// Portfolio Page
// Split view: Evidence management (artifacts + claims) + Living CV preview.
// =============================================================================

interface SkillInfo {
  name: string;
  category: string;
}

export default function PortfolioPage() {
  const { persona } = usePersona();
  const candidateId = persona.role === "candidate" ? "profile_aisha" : null;

  const { artifacts, upload, isUploading, lastUpload, provideContent, isProviding, lastProvide } = useArtifacts(candidateId);
  const { claims, accept, reject, edit, acceptAll, isUpdating } = useClaims(candidateId);

  // Track the latest extraction job for polling
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const { job, trigger, isTriggering } = useExtractionJob(activeJobId);
  const [activeTab, setActiveTab] = useState("inbox");

  // Skill map for display (loaded from API)
  const [skillMap, setSkillMap] = useState<Record<string, SkillInfo>>({});

  // Load skill taxonomy on mount
  useEffect(() => {
    fetch("/api/skills")
      .then((res) => res.json())
      .then((data) => {
        const map: Record<string, SkillInfo> = {};
        for (const skill of data.skills ?? []) {
          map[skill.id] = { name: skill.name, category: skill.category };
        }
        setSkillMap(map);
      })
      .catch(() => {
        // Non-critical — skills just won't have labels
      });
  }, []);

  // When upload completes, trigger extraction
  const prevUploadRef = useRef<string | null>(null);
  useEffect(() => {
    const newJobId = lastUpload?.extractionJob?.id;
    if (newJobId && newJobId !== prevUploadRef.current) {
      prevUploadRef.current = newJobId;
      setActiveJobId(newJobId);
      setTimeout(() => trigger(), 500);
    }
  }, [lastUpload, trigger]);

  // When provide-content completes, trigger extraction on the new job
  const prevProvideRef = useRef<string | null>(null);
  useEffect(() => {
    const newJobId = lastProvide?.extractionJob?.id;
    if (newJobId && newJobId !== prevProvideRef.current) {
      prevProvideRef.current = newJobId;
      setActiveJobId(newJobId);
      setTimeout(() => trigger(), 500);
    }
  }, [lastProvide, trigger]);

  const handleProvideContent = useCallback(
    (artifactId: string, text: string) => {
      provideContent({ artifactId, extractedText: text });
    },
    [provideContent]
  );

  const handleUpload = useCallback(
    (data: {
      title: string;
      type: string;
      sourceUrl?: string;
      extractedText?: string;
      demoManifestId?: string;
    }) => {
      if (!candidateId) return;
      upload({ candidateId, ...data });
    },
    [candidateId, upload]
  );

  const isExtractionActive =
    isUploading ||
    isTriggering ||
    job?.status === "queued" ||
    job?.status === "processing";

  // Compute stats
  const pendingClaims = claims.filter((c) => c.candidateStatus === "pending");
  const acceptedClaims = claims.filter(
    (c) => c.candidateStatus === "accepted" || c.candidateStatus === "edited"
  );
  const rejectedClaims = claims.filter((c) => c.candidateStatus === "rejected");

  // Evidence coverage: unique skills with accepted claims
  const coveredSkills = new Set<string>();
  for (const claim of acceptedClaims) {
    for (const skillId of claim.normalizedSkillIds) {
      coveredSkills.add(skillId);
    }
  }

  // Average evidence quality of accepted claims
  const avgQuality =
    acceptedClaims.length > 0
      ? acceptedClaims.reduce((sum, c) => sum + c.evidenceQualityScore, 0) /
        acceptedClaims.length
      : 0;

  if (!candidateId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
        <p className="text-gray-500">
          Switch to a candidate persona to view the Living Portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-indigo-500" />
            Living Portfolio
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Upload career artifacts, review extracted claims, and build your evidence-backed CV.
          </p>
        </div>
        {pendingClaims.length > 0 && (
          isUpdating ? (
            <DisabledTooltipButton
              variant="outline"
              className="gap-1.5"
              size="sm"
              disabledReason="Claim updates are already in progress."
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Accept All ({pendingClaims.length})
            </DisabledTooltipButton>
          ) : (
            <Button
              onClick={() => acceptAll(pendingClaims.map((c) => c.id))}
              variant="outline"
              className="gap-1.5"
              size="sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Accept All ({pendingClaims.length})
            </Button>
          )
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Artifacts"
          value={artifacts.length.toString()}
          icon={FolderOpen}
          color="indigo"
        />
        <StatCard
          label="Pending Claims"
          value={pendingClaims.length.toString()}
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="Skills Evidenced"
          value={coveredSkills.size.toString()}
          icon={Sparkles}
          color="violet"
        />
        <StatCard
          label="Avg. Quality"
          value={`${avgQuality.toFixed(1)}/5`}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Main content: two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Evidence management */}
        <div className="flex flex-col gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="inbox" className="flex-1 gap-1.5">
                <Inbox className="h-3.5 w-3.5" />
                Inbox
                {pendingClaims.length > 0 && (
                  <Badge variant="destructive" className="ml-1 text-[10px] px-1.5 py-0">
                    {pendingClaims.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="artifacts" className="flex-1 gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1 gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                All Claims
              </TabsTrigger>
            </TabsList>

            {/* Evidence Inbox */}
            <TabsContent value="inbox" className="mt-4 space-y-3">
              {pendingClaims.length === 0 ? (
                <EmptyState
                  icon={FileUp}
                  title="No claims awaiting review"
                  description="Upload evidence so TalentVault can extract claims for your Living Portfolio."
                  actionLabel="Upload Evidence"
                  onAction={() => setActiveTab("artifacts")}
                />
              ) : (
                pendingClaims.map((claim) => (
                  <ClaimCard
                    key={claim.id}
                    claim={claim}
                    onAccept={accept}
                    onReject={reject}
                    onEdit={edit}
                    isUpdating={isUpdating}
                    skillMap={skillMap}
                  />
                ))
              )}
            </TabsContent>

            {/* Upload */}
            <TabsContent value="artifacts" className="mt-4 space-y-4">
              <ArtifactUpload
                onUpload={handleUpload}
                isUploading={Boolean(isExtractionActive)}
              />

              {/* Artifact list */}
              {artifacts.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Uploaded Artifacts
                  </h3>
                  {artifacts.map((artifact) => (
                    <ArtifactCard
                      key={artifact.id}
                      artifact={artifact}
                      onProvideContent={handleProvideContent}
                      isSubmitting={isProviding}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* All claims */}
            <TabsContent value="all" className="mt-4 space-y-3">
              {claims.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No evidence claims yet"
                  description="Start with a certificate, project, case study, or pasted project summary."
                  actionLabel="Upload Evidence"
                  onAction={() => setActiveTab("artifacts")}
                />
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {acceptedClaims.length} accepted
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {pendingClaims.length} pending
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {rejectedClaims.length} rejected
                    </Badge>
                  </div>
                  {claims.map((claim) => (
                    <ClaimCard
                      key={claim.id}
                      claim={claim}
                      onAccept={accept}
                      onReject={reject}
                      onEdit={edit}
                      isUpdating={isUpdating}
                      skillMap={skillMap}
                    />
                  ))}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column: Living CV */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <LivingCV
            claims={claims}
            candidateName={persona.name}
            candidateDescription={persona.description}
            skillMap={skillMap}
            onAddEvidence={() => setActiveTab("artifacts")}
          />
        </div>
      </div>
    </div>
  );
}

// --- Stat Card sub-component ---

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: "indigo" | "amber" | "violet" | "emerald";
}) {
  const colorMap = {
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            colorMap[color]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
            {value}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
