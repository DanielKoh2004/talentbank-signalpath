"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePersona } from "@/providers/PersonaProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import type { Persona } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const { addLocalPersona } = usePersona();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
    educationLevel: "",
    institution: "",
    preferredRoles: "",
    targetLocations: "",
    salaryExpectationMin: "",
    salaryExpectationMax: "",
  });

  function update(field: keyof typeof form, value: string) {
    setError(null);
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    if (!trimmedName) {
      setError("Full name is required.");
      return;
    }
    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }
    if (
      form.salaryExpectationMin.trim() &&
      Number.isNaN(Number(form.salaryExpectationMin))
    ) {
      setError("Salary min must be a valid number.");
      return;
    }
    if (
      form.salaryExpectationMax.trim() &&
      Number.isNaN(Number(form.salaryExpectationMax))
    ) {
      setError("Salary max must be a valid number.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          name: trimmedName,
          email: trimmedEmail,
          preferredRoles: form.preferredRoles
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          targetLocations: form.targetLocations
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create profile");
      addLocalPersona(data.persona as Persona);
      router.push("/portfolio");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to SignalPath
          </Link>
          <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/60">
            Demo Register
          </span>
        </header>

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Create your evidence-backed job profile.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/70">
              This demo creates a candidate profile, then guides you to upload a
              resume and proof artifacts. No passwords, no production auth, just
              the jobsite flow judges expect to see.
            </p>
          </div>

          <Card className="border-white/10 bg-white text-slate-950 shadow-2xl">
            <CardContent className="p-6">
              <form onSubmit={submit} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black">Sign up and register</h2>
                    <p className="text-sm text-slate-500">
                      Build a profile first, then add proof.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    required
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                  <Input
                    required
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                  <Input
                    placeholder="Location"
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                  />
                  <Input
                    placeholder="Education level"
                    value={form.educationLevel}
                    onChange={(e) => update("educationLevel", e.target.value)}
                  />
                  <Input
                    className="sm:col-span-2"
                    placeholder="Institution"
                    value={form.institution}
                    onChange={(e) => update("institution", e.target.value)}
                  />
                  <Textarea
                    className="sm:col-span-2"
                    placeholder="Preferred roles, comma separated"
                    value={form.preferredRoles}
                    onChange={(e) => update("preferredRoles", e.target.value)}
                    rows={3}
                  />
                  <Input
                    className="sm:col-span-2"
                    placeholder="Target locations, comma separated"
                    value={form.targetLocations}
                    onChange={(e) => update("targetLocations", e.target.value)}
                  />
                  <Input
                    inputMode="numeric"
                    placeholder="Salary min"
                    value={form.salaryExpectationMin}
                    onChange={(e) => update("salaryExpectationMin", e.target.value)}
                  />
                  <Input
                    inputMode="numeric"
                    placeholder="Salary max"
                    value={form.salaryExpectationMax}
                    onChange={(e) => update("salaryExpectationMax", e.target.value)}
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                    {error}
                  </p>
                )}

                <Button type="submit" disabled={saving} className="w-full gap-2">
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  Create Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
