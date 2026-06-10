"use client";

import { useState, useEffect } from "react";
import { usePersona } from "@/providers/PersonaProvider";
import { PathCard } from "@/components/paths/PathCard";
import { CareerShapeCard } from "@/components/paths/CareerShapeCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Compass,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// =============================================================================
// Career Path Navigator Page
// Shows career shape, 3-5 path cards with readiness, gaps, and suggested actions.
// Server-fetched (no React Query — data computed once from accepted claims).
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PathsData = any;

export default function PathsPage() {
  const { persona } = usePersona();
  const candidateId = persona.role === "candidate" ? "profile_aisha" : null;

  const [data, setData] = useState<PathsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch paths data
  useEffect(() => {
    if (!candidateId) return;
    loadPaths();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  function loadPaths() {
    if (!candidateId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/paths?candidateId=${candidateId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load paths");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }

  if (!candidateId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
        <p className="text-gray-500">
          Switch to a candidate persona to view Career Paths.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-sm text-gray-500">Analyzing your evidence and generating paths...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <p className="text-sm text-gray-500">{error}</p>
        <Button onClick={loadPaths} variant="outline" size="sm" className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  if (!data || !data.paths) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Map className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm text-gray-500">
          Upload and accept evidence claims in your Portfolio to see career paths.
        </p>
      </div>
    );
  }

  const { careerShape, paths } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Compass className="h-6 w-6 text-indigo-500" />
            Career Path Navigator
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Realistic career directions based on your evidence. Paths update as you add new claims.
          </p>
        </div>
        <Button
          onClick={loadPaths}
          variant="outline"
          size="sm"
          className="gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Paths Found"
          value={paths.length.toString()}
          icon={Compass}
          color="indigo"
        />
        <StatCard
          label="Evidence Claims"
          value={careerShape.totalAcceptedClaims.toString()}
          icon={Map}
          color="violet"
        />
        <StatCard
          label="Skills Mapped"
          value={careerShape.totalEvidencedSkills.toString()}
          icon={Map}
          color="emerald"
        />
        <StatCard
          label="High Quality"
          value={careerShape.qualityDistribution.high.toString()}
          icon={Map}
          color="amber"
        />
      </div>

      {/* Main layout: Career Shape sidebar + Path Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Career Shape */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <CareerShapeCard
              shape={careerShape}
              candidateName={persona.name}
            />
          </div>
        </div>

        {/* Right: Path Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5" />
            Your Career Paths
            <Badge variant="secondary" className="text-[10px] ml-1">
              {paths.length} paths
            </Badge>
          </h2>

          {paths.map((path: PathsData) => (
            <PathCard
              key={path.id}
              path={path}
            />
          ))}

          {paths.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Map className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500">
                  No paths could be generated. Upload more evidence to your Portfolio.
                </p>
              </CardContent>
            </Card>
          )}
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
