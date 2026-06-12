"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { usePersona } from "@/providers/PersonaProvider";
import { getCandidateProfileId } from "@/lib/candidate-profile";
import { DisabledTooltipButton } from "@/components/shared/DisabledTooltipButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clipboard,
  Download,
  FileSearch,
  Loader2,
  Save,
  UserRound,
} from "lucide-react";

interface ResumeDraft {
  headline: string;
  summary: string;
  experience: string;
  projects: string;
  education: string;
  skills: string;
  certifications: string;
}

interface CandidateProfileForm {
  name: string;
  location: string;
  educationLevel: string;
  institution: string;
  preferredRoles: string;
  targetLocations: string;
  salaryExpectationMin: string;
  salaryExpectationMax: string;
  visibilityStatus: string;
  resumeDraft: ResumeDraft;
}

const EMPTY_RESUME_DRAFT: ResumeDraft = {
  headline: "",
  summary: "",
  experience: "",
  projects: "",
  education: "",
  skills: "",
  certifications: "",
};

const EMPTY_FORM: CandidateProfileForm = {
  name: "",
  location: "",
  educationLevel: "",
  institution: "",
  preferredRoles: "",
  targetLocations: "",
  salaryExpectationMin: "",
  salaryExpectationMax: "",
  visibilityStatus: "private",
  resumeDraft: EMPTY_RESUME_DRAFT,
};

export default function ProfilePage() {
  const router = useRouter();
  const { persona } = usePersona();
  const candidateId =
    persona.role === "candidate"
      ? getCandidateProfileId(persona.id, persona.candidateProfileId)
      : null;
  const [form, setForm] = useState<CandidateProfileForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!candidateId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/candidates?candidateId=${candidateId}`);
        const data = res.ok ? await res.json() : null;
        const candidate = data?.candidate;
        if (!cancelled && candidate) {
          setForm({
            name: candidate.name ?? persona.name,
            location: candidate.location ?? "",
            educationLevel: candidate.educationLevel ?? "",
            institution: candidate.institution ?? "",
            preferredRoles: (candidate.preferredRoles ?? []).join(", "),
            targetLocations: (candidate.targetLocations ?? []).join(", "),
            salaryExpectationMin: candidate.salaryExpectationMin?.toString() ?? "",
            salaryExpectationMax: candidate.salaryExpectationMax?.toString() ?? "",
            visibilityStatus: candidate.visibilityStatus ?? "private",
            resumeDraft: {
              ...EMPTY_RESUME_DRAFT,
              ...(candidate.resumeDraft ?? {}),
            },
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [candidateId, persona.name]);

  function updateField<K extends keyof CandidateProfileForm>(
    field: K,
    value: CandidateProfileForm[K],
  ) {
    setSaved(false);
    setFormError(null);
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateResumeField<K extends keyof ResumeDraft>(
    field: K,
    value: ResumeDraft[K],
  ) {
    setSaved(false);
    setFormError(null);
    setForm((current) => ({
      ...current,
      resumeDraft: { ...current.resumeDraft, [field]: value },
    }));
  }

  function buildResumeText() {
    const draft = form.resumeDraft;
    return [
      form.name,
      draft.headline,
      "",
      "Professional Summary",
      draft.summary,
      "",
      "Experience",
      draft.experience,
      "",
      "Projects",
      draft.projects,
      "",
      "Education",
      draft.education || [form.educationLevel, form.institution].filter(Boolean).join(", "),
      "",
      "Skills",
      draft.skills,
      "",
      "Certifications",
      draft.certifications,
    ]
      .filter((line) => line !== undefined && line !== null)
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function hasMeaningfulResumeSection() {
    const draft = form.resumeDraft;
    return [
      draft.headline,
      draft.summary,
      draft.experience,
      draft.projects,
      draft.skills,
    ].some((value) => value.trim().length > 0);
  }

  function validateProfile() {
    if (!form.name.trim()) {
      return "Full name is required.";
    }

    if (
      form.salaryExpectationMin.trim() &&
      Number.isNaN(Number(form.salaryExpectationMin))
    ) {
      return "Salary minimum must be a valid number.";
    }

    if (
      form.salaryExpectationMax.trim() &&
      Number.isNaN(Number(form.salaryExpectationMax))
    ) {
      return "Salary maximum must be a valid number.";
    }

    return null;
  }

  async function saveProfile() {
    if (!candidateId) return;
    const validationError = validateProfile();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/candidates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          name: form.name,
          location: form.location,
          educationLevel: form.educationLevel,
          institution: form.institution,
          preferredRoles: form.preferredRoles
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          targetLocations: form.targetLocations
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          salaryExpectationMin: form.salaryExpectationMin,
          salaryExpectationMax: form.salaryExpectationMax,
          visibilityStatus: form.visibilityStatus,
          resumeDraft: form.resumeDraft,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save profile");
      }
      setSaved(true);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to save profile"
      );
    } finally {
      setSaving(false);
    }
  }

  async function analyzeResumeDraft() {
    if (!candidateId) return;
    const validationError = validateProfile();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (!hasMeaningfulResumeSection()) {
      setFormError(
        "Add a headline, summary, experience, project, or skills before extracting resume skills."
      );
      return;
    }

    const resumeText = buildResumeText();
    if (!resumeText) return;

    setAnalyzingResume(true);
    try {
      await saveProfile();
      const formData = new FormData();
      formData.set("candidateId", candidateId);
      formData.set("resumeText", resumeText);
      const res = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to analyze resume");
      if (data.extractionJob?.id && data.extractionJob.status === "queued") {
        await fetch(`/api/extraction/${data.extractionJob.id}`, { method: "POST" });
      }
      router.push("/portfolio");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to analyze resume"
      );
    } finally {
      setAnalyzingResume(false);
    }
  }

  function copyResumeDraft() {
    navigator.clipboard?.writeText(buildResumeText());
  }

  function downloadResumeDraft() {
    const blob = new Blob([buildResumeText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(form.name || "signalpath-resume")
      .toLowerCase()
      .replace(/\s+/g, "-")}-resume.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-slate-500">
        Loading profile builder...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-slate-950 dark:text-white">
            <UserRound className="h-6 w-6 text-primary" />
            Profile and resume builder
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Keep your basic profile current. Your Living Portfolio handles proof-backed claims.
          </p>
        </div>
        <Button onClick={saveProfile} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Profile
        </Button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Profile saved. Matching will use the latest preferences.
        </div>
      )}

      {formError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {formError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <Card data-help-id="candidate-profile-basic">
          <CardHeader>
            <CardTitle className="text-base">Basic profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} />
            </Field>
            <Field label="Current location">
              <Input
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="Kuala Lumpur"
              />
            </Field>
            <Field label="Education level">
              <Input
                value={form.educationLevel}
                onChange={(e) => updateField("educationLevel", e.target.value)}
                placeholder="Bachelor's degree"
              />
            </Field>
            <Field label="Institution">
              <Input
                value={form.institution}
                onChange={(e) => updateField("institution", e.target.value)}
                placeholder="University of Malaya"
              />
            </Field>
            <Field label="Preferred roles" className="sm:col-span-2">
              <Textarea
                value={form.preferredRoles}
                onChange={(e) => updateField("preferredRoles", e.target.value)}
                placeholder="Product Analyst, Data Analyst"
                rows={3}
              />
            </Field>
            <Field label="Target locations" className="sm:col-span-2">
              <Input
                value={form.targetLocations}
                onChange={(e) => updateField("targetLocations", e.target.value)}
                placeholder="Kuala Lumpur, Singapore, Remote"
              />
            </Field>
            <Field label="Salary minimum">
              <Input
                value={form.salaryExpectationMin}
                onChange={(e) => updateField("salaryExpectationMin", e.target.value)}
                inputMode="numeric"
                placeholder="3500"
              />
            </Field>
            <Field label="Salary maximum">
              <Input
                value={form.salaryExpectationMax}
                onChange={(e) => updateField("salaryExpectationMax", e.target.value)}
                inputMode="numeric"
                placeholder="6500"
              />
            </Field>
          </CardContent>
        </Card>

        <Card data-help-id="candidate-profile-rules">
          <CardHeader>
            <CardTitle className="text-base">Resume builder rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
              <p className="font-bold text-slate-950 dark:text-white">
                Resume claims are not proof yet.
              </p>
              <p className="mt-1 leading-6">
                Uploading a resume helps SignalPath find skills to ask proof for.
                Project files, case studies, certificates, and repositories carry
                stronger proof weight.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Self-claimed</Badge>
              <Badge variant="secondary">Document-backed</Badge>
              <Badge>Artifact-backed</Badge>
            </div>
            <p className="leading-6">
              Your visible CV is generated from accepted claims in Living Portfolio,
              so employers can audit how each statement was created.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <Card data-help-id="candidate-profile-resume-builder">
          <CardHeader>
            <CardTitle className="text-base">Build resume from scratch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Target headline">
              <Input
                value={form.resumeDraft.headline}
                onChange={(e) => updateResumeField("headline", e.target.value)}
                placeholder="Fresh graduate product analyst with SQL and dashboard proof"
              />
            </Field>
            <Field label="Professional summary">
              <Textarea
                value={form.resumeDraft.summary}
                onChange={(e) => updateResumeField("summary", e.target.value)}
                placeholder="Write 2-3 lines about the roles you are targeting and the proof you can show."
                rows={4}
              />
            </Field>
            <Field label="Experience">
              <Textarea
                value={form.resumeDraft.experience}
                onChange={(e) => updateResumeField("experience", e.target.value)}
                placeholder="- Internship or part-time role&#10;- What you did&#10;- Tools used&#10;- Outcome or metric"
                rows={6}
              />
            </Field>
            <Field label="Projects">
              <Textarea
                value={form.resumeDraft.projects}
                onChange={(e) => updateResumeField("projects", e.target.value)}
                placeholder="- Project name&#10;- Problem solved&#10;- Skills used&#10;- Link or proof you can upload later"
                rows={6}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Education">
                <Textarea
                  value={form.resumeDraft.education}
                  onChange={(e) => updateResumeField("education", e.target.value)}
                  placeholder="Degree, institution, graduation year"
                  rows={4}
                />
              </Field>
              <Field label="Certifications">
                <Textarea
                  value={form.resumeDraft.certifications}
                  onChange={(e) => updateResumeField("certifications", e.target.value)}
                  placeholder="Google Data Analytics, AWS Cloud Practitioner..."
                  rows={4}
                />
              </Field>
            </div>
            <Field label="Skills">
              <Textarea
                value={form.resumeDraft.skills}
                onChange={(e) => updateResumeField("skills", e.target.value)}
                placeholder="SQL, Python, A/B Testing, Product Analytics, Stakeholder Communication"
                rows={4}
              />
            </Field>
          </CardContent>
        </Card>

        <Card data-help-id="candidate-profile-extract">
          <CardHeader>
            <CardTitle className="text-base">Resume preview and actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                {form.name || "Your Name"}
              </h2>
              <p className="mt-1 font-semibold text-primary">
                {form.resumeDraft.headline || "Target headline"}
              </p>
              <ResumePreviewSection
                title="Professional Summary"
                content={form.resumeDraft.summary}
              />
              <ResumePreviewSection
                title="Experience"
                content={form.resumeDraft.experience}
              />
              <ResumePreviewSection
                title="Projects"
                content={form.resumeDraft.projects}
              />
              <ResumePreviewSection
                title="Education"
                content={
                  form.resumeDraft.education ||
                  [form.educationLevel, form.institution].filter(Boolean).join(", ")
                }
              />
              <ResumePreviewSection title="Skills" content={form.resumeDraft.skills} />
              <ResumePreviewSection
                title="Certifications"
                content={form.resumeDraft.certifications}
              />
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              <p className="font-bold text-slate-950 dark:text-white">
                Use this to find proof gaps.
              </p>
              <p className="mt-1 leading-6">
                SignalPath can turn this draft into resume-derived claims, then
                ask which project, certificate, or repository proves each skill.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" className="gap-2" onClick={copyResumeDraft}>
                <Clipboard className="h-4 w-4" />
                Copy Resume
              </Button>
              <Button variant="outline" className="gap-2" onClick={downloadResumeDraft}>
                <Download className="h-4 w-4" />
                Download TXT
              </Button>
            </div>
            {analyzingResume || saving || !hasMeaningfulResumeSection() ? (
              <DisabledTooltipButton
                className="w-full gap-2"
                disabledReason={
                  analyzingResume || saving
                    ? "Profile or resume analysis is already in progress."
                    : "Add a headline, summary, experience, project, or skills before extracting."
                }
              >
                {analyzingResume ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSearch className="h-4 w-4" />
                )}
                Extract Skills and Ask for Proof
              </DisabledTooltipButton>
            ) : (
              <Button
                className="w-full gap-2"
                onClick={analyzeResumeDraft}
              >
              {analyzingResume ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSearch className="h-4 w-4" />
              )}
              Extract Skills and Ask for Proof
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResumePreviewSection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  if (!content.trim()) return null;

  return (
    <section className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-800">
      <h3 className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {title}
      </h3>
      <p className="mt-2 whitespace-pre-line leading-6 text-slate-700 dark:text-slate-300">
        {content}
      </p>
    </section>
  );
}

function Field({
  label,
  required = false,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
