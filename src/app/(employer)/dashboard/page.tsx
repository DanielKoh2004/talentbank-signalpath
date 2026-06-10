"use client";

import { useState, useEffect } from "react";
import { usePersona } from "@/providers/PersonaProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  TrendingUp,
  ChevronRight,
  Loader2,
  AlertTriangle,
  BarChart3,
  Heart,
  Eye,
} from "lucide-react";
import Link from "next/link";

// =============================================================================
// Employer Dashboard
// Overview of roles, interactions, and matching activity.
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RoleData = any;

export default function DashboardPage() {
  const { persona } = usePersona();
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (persona.role !== "employer") return;
    fetch(`/api/roles?employerId=${persona.id}`)
      .then((res) => res.json())
      .then((d) => {
        setRoles(d.roles ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [persona]);

  if (persona.role !== "employer") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
        <p className="text-gray-500">Switch to an employer persona to view this dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  const totalInteractions = roles.reduce(
    (sum: number, r: RoleData) => sum + (r.interactionCount ?? 0),
    0
  );
  const totalMatches = roles.reduce(
    (sum: number, r: RoleData) => sum + (r.matchCount ?? 0),
    0
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-indigo-500" />
          Employer Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of your roles, candidate interest, and matching activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Roles"
          value={roles.length.toString()}
          icon={Briefcase}
          color="indigo"
        />
        <StatCard
          label="Candidate Interests"
          value={totalInteractions.toString()}
          icon={Heart}
          color="rose"
        />
        <StatCard
          label="Match Scores"
          value={totalMatches.toString()}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          label="Pending Review"
          value={totalInteractions.toString()}
          icon={Eye}
          color="amber"
        />
      </div>

      {/* Roles overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Your Roles
          </h2>
          <Link href="/roles">
            <Button variant="outline" size="sm" className="text-xs gap-1">
              Manage All
              <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        {roles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Briefcase className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-500">
                No roles created yet. Create a role brief to start receiving candidate interest.
              </p>
              <Link href="/roles" className="mt-3">
                <Button size="sm" className="text-xs">
                  Create Your First Role
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {roles.map((role: RoleData) => (
              <Link key={role.id} href={`/roles/${role.id}`}>
                <Card className="overflow-hidden transition-all duration-200 hover:shadow-md group cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {role.roleFamilyName && (
                            <Badge variant="secondary" className="text-[10px]">
                              {role.roleFamilyName}
                            </Badge>
                          )}
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px]",
                              role.status === "active"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                                : "bg-gray-50 text-gray-500"
                            )}
                          >
                            {role.status}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {role.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                          {role.location && <span>{role.location}</span>}
                          {role.workMode && <span>· {role.workMode}</span>}
                          <span>· {role.requirements?.length ?? 0} requirements</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                            <Users className="h-4 w-4 text-indigo-500" />
                            {role.interactionCount ?? 0}
                          </div>
                          <p className="text-[9px] text-gray-400 uppercase">Interested</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Stat Card ---

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: "indigo" | "rose" | "emerald" | "amber";
}) {
  const colorMap = {
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
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
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
