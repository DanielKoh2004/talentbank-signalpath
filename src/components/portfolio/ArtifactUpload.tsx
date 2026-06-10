"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Loader2,
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

  function handleDemoUpload(demo: (typeof DEMO_ARTIFACTS)[0]) {
    onUpload({
      title: demo.title,
      type: demo.type,
      demoManifestId: demo.id,
    });
  }

  function handleCustomUpload() {
    if (!title.trim()) return;
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
                disabled={isUploading}
                className={cn(
                  "w-full flex items-start gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all",
                  "hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm",
                  "dark:border-gray-700 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/10",
                  "disabled:opacity-50 disabled:pointer-events-none"
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
                {isUploading && <Loader2 className="h-4 w-4 animate-spin text-gray-400 mt-1" />}
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

            <Button
              onClick={handleCustomUpload}
              disabled={isUploading || !title.trim()}
              className="w-full gap-2"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload Artifact
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
