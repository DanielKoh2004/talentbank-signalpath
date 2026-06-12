"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePersona } from "@/providers/PersonaProvider";
import { OpportunityCard } from "@/components/marketplace/OpportunityCard";
import { DisabledTooltipButton } from "@/components/shared/DisabledTooltipButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterPill } from "@/components/shared/FilterPill";
import { NextStepPanel } from "@/components/shared/NextStepPanel";
import { SearchBand } from "@/components/shared/SearchBand";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Users,
  BarChart3,
  Search,
  X,
} from "lucide-react";

// =============================================================================
// Role Briefs Page (Employer)
// List employer's roles, show interaction counts, navigate to role workspace.
// =============================================================================

interface RoleRequirement {
  id?: string;
  skillId: string;
  skillName: string;
  skillCategory?: string;
  importance: string;
  minimumEvidenceStrength: number;
  displayLabel: string | null;
}

interface RoleData {
  id: string;
  title: string;
  employerId: string;
  roleFamilyId: string | null;
  roleFamilyName: string | null;
  location: string | null;
  workMode: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salarySource: string | null;
  description: string | null;
  status: string;
  requirements: RoleRequirement[];
  interactionCount: number;
  matchCount: number;
}

interface SkillData {
  id: string;
  name: string;
  category: string;
}

interface DraftRequirement {
  skillId: string;
  importance: "required" | "nice_to_have";
  minimumEvidenceStrength: number;
}

export default function RolesPage() {
  const { persona } = usePersona();
  const router = useRouter();
  const employerId = persona.role === "employer" ? persona.id : null;

  const [roles, setRoles] = useState<RoleData[]>([]);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">(
    "all"
  );

  const loadRoles = useCallback(async () => {
    if (!employerId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/roles?employerId=${employerId}`);
      if (!res.ok) throw new Error("Failed to load roles");
      const data = await res.json();
      setRoles(data.roles ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, [employerId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    fetch("/api/skills")
      .then((res) => res.json())
      .then((data) => setSkills(data.skills ?? []))
      .catch(() => setSkills([]));
  }, []);

  const handleView = useCallback(
    (roleId: string) => {
      router.push(`/roles/${roleId}`);
    },
    [router]
  );

  const handleCreated = useCallback(
    async (roleId: string) => {
      setCreateOpen(false);
      await loadRoles();
      router.push(`/roles/${roleId}`);
    },
    [loadRoles, router]
  );

  // Stats
  const totalInteractions = roles.reduce(
    (sum, r) => sum + (r.interactionCount ?? 0),
    0
  );
  const activeRoles = roles.filter((r) => r.status === "active");
  const totalRequirements = roles.reduce(
    (sum, r) => sum + r.requirements.length,
    0
  );
  const filteredRoles = roles.filter((role) => {
    if (statusFilter !== "all" && role.status !== statusFilter) return false;
    const normalizedKeyword = keyword.trim().toLowerCase();
    const normalizedLocation = locationQuery.trim().toLowerCase();
    const haystack = [
      role.title,
      role.roleFamilyName,
      role.description,
      role.workMode,
      ...role.requirements.map((req) => req.displayLabel ?? req.skillName),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (normalizedKeyword && !haystack.includes(normalizedKeyword)) {
      return false;
    }

    if (
      normalizedLocation &&
      !(role.location ?? "").toLowerCase().includes(normalizedLocation)
    ) {
      return false;
    }

    return true;
  });

  // Not-employer guard
  if (!employerId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
        <p className="text-gray-500">
          Switch to an employer persona to manage Role Briefs.
        </p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-sm text-gray-500">Loading role briefs...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <p className="text-sm text-gray-500">{error}</p>
        <Button
          onClick={loadRoles}
          variant="outline"
          size="sm"
          className="gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-indigo-500" />
            Role Briefs
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create and manage role opportunities with taxonomy-constrained
            requirements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={loadRoles}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            variant="default"
            className="gap-1.5"
            onClick={() => setCreateOpen(true)}
            data-help-id="employer-create-role"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Role
          </Button>
        </div>
      </div>

      <div data-help-id="employer-roles-search">
      <SearchBand
        title="Manage role briefs"
        description="Search roles by title, location, work mode, or taxonomy skill before reviewing candidates."
        keyword={keyword}
        onKeywordChange={setKeyword}
        location={locationQuery}
        onLocationChange={setLocationQuery}
        keywordPlaceholder="Search role, family, skill..."
        locationPlaceholder="Location"
        showAction={false}
      >
        {(["all", "active", "draft"] as const).map((item) => (
          <FilterPill
            key={item}
            active={statusFilter === item}
            onClick={() => setStatusFilter(item)}
          >
            {item === "all" ? "All roles" : item}
          </FilterPill>
        ))}
      </SearchBand>
      </div>

      <NextStepPanel
        steps={[
          "Create a role brief.",
          "Open its workspace.",
          "Compute matches and review proof.",
        ]}
        icon={Briefcase}
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Active Roles"
          value={activeRoles.length.toString()}
          icon={Briefcase}
          color="indigo"
        />
        <StatCard
          label="Total Candidates"
          value={totalInteractions.toString()}
          icon={Users}
          color="violet"
        />
        <StatCard
          label="Requirements"
          value={totalRequirements.toString()}
          icon={BarChart3}
          color="emerald"
        />
      </div>

      {/* Role cards */}
      {roles.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No role briefs yet"
          description="Create a taxonomy-constrained role brief to start receiving auditable candidate matches."
          actionLabel="Create Role"
          onAction={() => setCreateOpen(true)}
        />
      ) : filteredRoles.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No roles match these filters"
          description="Clear the search fields or switch back to all roles."
          actionLabel="Show All Roles"
          onAction={() => {
            setKeyword("");
            setLocationQuery("");
            setStatusFilter("all");
          }}
          actionVariant="outline"
        />
      ) : (
        <div className="space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            Your Roles
            <Badge variant="secondary" className="text-[10px] ml-1">
              {filteredRoles.length} role{filteredRoles.length !== 1 ? "s" : ""}
            </Badge>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {filteredRoles.map((role) => (
              <OpportunityCard
                key={role.id}
                role={role}
                variant="employer"
                onView={handleView}
              />
            ))}
          </div>
        </div>
      )}

      <CreateRoleDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        employerId={employerId}
        skills={skills}
        onCreated={handleCreated}
      />
    </div>
  );
}

function CreateRoleDialog({
  open,
  onOpenChange,
  employerId,
  skills,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employerId: string;
  skills: SkillData[];
  onCreated: (roleId: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("hybrid");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [requirements, setRequirements] = useState<DraftRequirement[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedSkillIds = new Set(requirements.map((req) => req.skillId));
  const skillsById = new Map(skills.map((skill) => [skill.id, skill]));

  function resetForm() {
    setTitle("");
    setLocation("");
    setWorkMode("hybrid");
    setSalaryMin("");
    setSalaryMax("");
    setDescription("");
    setSelectedSkillId("");
    setRequirements([]);
    setFormError(null);
  }

  function addRequirement() {
    if (!selectedSkillId || selectedSkillIds.has(selectedSkillId)) return;
    setRequirements((current) => [
      ...current,
      {
        skillId: selectedSkillId,
        importance: "required",
        minimumEvidenceStrength: 2,
      },
    ]);
    setSelectedSkillId("");
  }

  function updateRequirement(
    skillId: string,
    patch: Partial<DraftRequirement>
  ) {
    setRequirements((current) =>
      current.map((req) =>
        req.skillId === skillId ? { ...req, ...patch } : req
      )
    );
  }

  function removeRequirement(skillId: string) {
    setRequirements((current) =>
      current.filter((req) => req.skillId !== skillId)
    );
  }

  async function submitRole() {
    setFormError(null);

    if (!title.trim()) {
      setFormError("Role title is required.");
      return;
    }

    if (!location.trim()) {
      setFormError("Location is required.");
      return;
    }

    if (!workMode.trim()) {
      setFormError("Work mode is required.");
      return;
    }

    if (!description.trim()) {
      setFormError("Role description is required.");
      return;
    }

    if (requirements.length === 0) {
      setFormError("Add at least one taxonomy skill requirement.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employerId,
          title: title.trim(),
          location: location.trim() || null,
          workMode,
          salaryMin: salaryMin ? Number(salaryMin) : null,
          salaryMax: salaryMax ? Number(salaryMax) : null,
          salaryCurrency: "MYR",
          salarySource: salaryMin || salaryMax ? "employer_provided" : null,
          description: description.trim() || null,
          requirements: requirements.map((req) => ({
            ...req,
            displayLabel: skillsById.get(req.skillId)?.name ?? req.skillId,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to create role");
      }

      resetForm();
      onCreated(data.role.id);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create role");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Role Brief</DialogTitle>
          <DialogDescription>
            Define a role with taxonomy-constrained requirements so matching stays auditable.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Role Title
                <span className="text-red-500"> *</span>
              </label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Junior Product Analyst"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Location
                <span className="text-red-500"> *</span>
              </label>
              <Input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Kuala Lumpur"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Work Mode
                <span className="text-red-500"> *</span>
              </label>
              <Select value={workMode} onValueChange={(value) => value && setWorkMode(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Salary Min
              </label>
              <Input
                value={salaryMin}
                type="number"
                min="0"
                onChange={(event) => setSalaryMin(event.target.value)}
                placeholder="4000"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Salary Max
              </label>
              <Input
                value={salaryMax}
                type="number"
                min="0"
                onChange={(event) => setSalaryMax(event.target.value)}
                placeholder="6000"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Description
                <span className="text-red-500"> *</span>
              </label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the role, responsibilities, and evidence you want to see."
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Requirements
                <span className="text-red-500"> *</span>
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Add canonical skills from the shared taxonomy.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                value={selectedSkillId}
                onValueChange={(value) => value && setSelectedSkillId(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent>
                  {skills
                    .filter((skill) => !selectedSkillIds.has(skill.id))
                    .map((skill) => (
                      <SelectItem key={skill.id} value={skill.id}>
                        {skill.name} · {skill.category}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {!selectedSkillId ? (
                <DisabledTooltipButton
                  type="button"
                  variant="outline"
                  className="gap-1.5"
                  disabledReason="Select a taxonomy skill before adding a requirement."
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </DisabledTooltipButton>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5"
                  onClick={addRequirement}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              )}
            </div>

            {requirements.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-300 p-4 text-center text-xs text-gray-500 dark:border-gray-700">
                No requirements yet.
              </div>
            ) : (
              <div className="space-y-2">
                {requirements.map((req) => {
                  const skill = skillsById.get(req.skillId);
                  return (
                    <div
                      key={req.skillId}
                      className="grid gap-2 rounded-md bg-gray-50 p-2 dark:bg-gray-900 sm:grid-cols-[1fr_150px_120px_auto]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                          {skill?.name ?? req.skillId}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {skill?.category ?? "Taxonomy"}
                        </p>
                      </div>

                      <Select
                        value={req.importance}
                        onValueChange={(value) =>
                          updateRequirement(req.skillId, {
                            importance: value as DraftRequirement["importance"],
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="required">Required</SelectItem>
                          <SelectItem value="nice_to_have">Nice to Have</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={String(req.minimumEvidenceStrength)}
                        onValueChange={(value) =>
                          updateRequirement(req.skillId, {
                            minimumEvidenceStrength: Number(value),
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Min 1</SelectItem>
                          <SelectItem value="2">Min 2</SelectItem>
                          <SelectItem value="3">Min 3</SelectItem>
                          <SelectItem value="4">Min 4</SelectItem>
                          <SelectItem value="5">Min 5</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeRequirement(req.skillId)}
                      >
                        <X className="h-3.5 w-3.5" />
                        <span className="sr-only">Remove requirement</span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {formError && (
            <div className="rounded-md bg-red-50 p-2 text-xs text-red-700 dark:bg-red-900/10 dark:text-red-300">
              {formError}
            </div>
          )}
        </div>

        <DialogFooter>
          {submitting ? (
            <DisabledTooltipButton
              type="button"
              variant="outline"
              disabledReason="Role creation is already in progress."
            >
              Cancel
            </DisabledTooltipButton>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          )}
          {submitting ? (
            <DisabledTooltipButton
              type="button"
              disabledReason="Role creation is already in progress."
            >
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Create Role
            </DisabledTooltipButton>
          ) : (
            <Button type="button" onClick={submitRole}>
              Create Role
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
