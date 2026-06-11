"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DisabledTooltipButton } from "@/components/shared/DisabledTooltipButton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileText,
  Globe,
  Code,
  Award,
  Image,
  FolderOpen,
  Brain,
  ScanLine,
  ShieldCheck,
} from "lucide-react";

// =============================================================================
// ArtifactUpload
// Upload zone for career artifacts. Supports seeded demo artifacts
// and pasted text/URL for real extraction.
// =============================================================================

const ARTIFACT_TYPES = [
  { value: "project", label: "Project", icon: Code },
  { value: "certificate", label: "Certificate", icon: Award },
  { value: "cv", label: "CV / Resume", icon: FileText },
  { value: "repo_link", label: "Repository Link", icon: Globe },
  { value: "portfolio_link", label: "Portfolio Link", icon: Globe },
  { value: "case_study", label: "Case Study", icon: FolderOpen },
  { value: "screenshot", label: "Screenshot", icon: Image },
  { value: "other", label: "Other", icon: FileText },
];

// Demo artifacts that can be "uploaded" from the seeded data
const DEMO_ARTIFACTS = [
  {
    id: "cert_google_analytics",
    title: "Google Data Analytics Professional Certificate",
    type: "certificate",
    description: "Coursera certification covering SQL, visualization, and data analysis fundamentals.",
  },
  {
    id: "project_retail_dashboard",
    title: "Retail Analytics Dashboard",
    type: "project",
    description: "Interactive dashboard tracking sales, inventory, and customer segments with SQL and Python.",
  },
  {
    id: "project_ab_testing",
    title: "A/B Testing: Checkout Flow Optimization",
    type: "project",
    description: "Designed and executed an A/B test measuring conversion rate impact on a retail checkout flow.",
  },
];

const AI_STATUS_SEQUENCE = [
  "Parsing PDF artifact...",
  "Mapping to canonical taxonomy...",
  "Scoring provenance...",
  "Updating Living Portfolio.",
];

interface ArtifactUploadProps {
  onUpload: (data: {
    title: string;
    type: string;
    sourceUrl?: string;
    extractedText?: string;
    demoManifestId?: string;
  }) => void;
  isUploading: boolean;
  className?: string;
}

export function ArtifactUpload({
  onUpload,
  isUploading,
  className,
}: ArtifactUploadProps) {
  const [mode, setMode] = useState<"demo" | "custom">("demo");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("project");
  const [sourceUrl, setSourceUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    if (!isUploading) {
      return;
    }

    const interval = window.setInterval(() => {
      setStatusIndex((current) => (current + 1) % AI_STATUS_SEQUENCE.length);
    }, 800);

    return () => window.clearInterval(interval);
  }, [isUploading]);

  function handleDemoUpload(demo: (typeof DEMO_ARTIFACTS)[0]) {
    setStatusIndex(0);
    onUpload({
      title: demo.title,
      type: demo.type,
      demoManifestId: demo.id,
    });
  }

  function handleCustomUpload() {
    if (!title.trim()) return;
    setStatusIndex(0);
    onUpload({
      title: title.trim(),
      type,
      sourceUrl: sourceUrl.trim() || undefined,
      extractedText: pastedText.trim() || undefined,
    });
    setTitle("");
    setSourceUrl("");
    setPastedText("");
  }

  if (isUploading) {
    return (
      <Card className={cn("overflow-hidden border-primary/20 shadow-sm", className)}>
        <CardContent className="p-0">
          <div className="border-b border-primary/10 bg-primary/5 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Brain className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-950 dark:text-gray-100">
                  Evidence engine is reading your artifact
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-primary">
                  <ScanLine className="h-3.5 w-3.5 animate-pulse" />
                  {AI_STATUS_SEQUENCE[statusIndex]}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-9 rounded-sm" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <Skeleton className="h-2.5 w-full" />
                <Skeleton className="h-2.5 w-11/12" />
                <Skeleton className="h-2.5 w-10/12" />
                <Skeleton className="h-2.5 w-8/12" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <Skeleton className="h-7 rounded-full" />
                <Skeleton className="h-7 rounded-full" />
                <Skeleton className="h-7 rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px]">
              {[
                ["Extract", "text-primary"],
                ["Normalize", statusIndex >= 1 ? "text-primary" : "text-gray-400"],
                ["Verify", statusIndex >= 2 ? "text-primary" : "text-gray-400"],
              ].map(([label, color]) => (
                <div
                  key={label}
                  className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className={cn("flex items-center gap-1.5 font-semibold", color)}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setMode("demo")}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium transition-colors",
              mode === "demo"
                ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-400"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:hover:text-gray-300"
            )}
          >
            <Upload className="inline h-4 w-4 mr-1.5 -mt-0.5" />
            Demo Artifacts
          </button>
          <button
            onClick={() => setMode("custom")}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium transition-colors",
              mode === "custom"
                ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-400"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:hover:text-gray-300"
            )}
          >
            <FileText className="inline h-4 w-4 mr-1.5 -mt-0.5" />
            Custom Upload
          </button>
        </div>

        {/* Demo artifacts */}
        {mode === "demo" && (
          <div className="p-4 space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Upload seeded demo artifacts to see extraction in action.
            </p>
            {DEMO_ARTIFACTS.map((demo) => (
              <button
                key={demo.id}
                onClick={() => handleDemoUpload(demo)}
                className={cn(
                  "w-full flex items-start gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all",
                  "hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm",
                  "dark:border-gray-700 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/10",
                )}
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  {demo.type === "certificate" ? (
                    <Award className="h-4.5 w-4.5" />
                  ) : (
                    <Code className="h-4.5 w-4.5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {demo.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {demo.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Custom upload */}
        {mode === "custom" && (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Artifact Title
              </label>
              <Input
                placeholder="e.g., Sales Dashboard Project"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Type
              </label>
              <Select value={type} onValueChange={(v) => { if (v) setType(v); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ARTIFACT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Source URL (optional)
              </label>
              <Input
                placeholder="https://github.com/..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Paste Content (optional — for AI extraction)
              </label>
              <Textarea
                placeholder="Paste project README, certificate details, or any text describing your work..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={4}
              />
            </div>

            {!title.trim() ? (
              <DisabledTooltipButton
                className="w-full gap-2"
                disabledReason="Enter an artifact title before uploading."
              >
                <Upload className="h-4 w-4" />
                Upload Artifact
              </DisabledTooltipButton>
            ) : (
              <Button onClick={handleCustomUpload} className="w-full gap-2">
                <Upload className="h-4 w-4" />
                Upload Artifact
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
