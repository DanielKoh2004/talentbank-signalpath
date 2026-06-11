"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  FolderOpen,
  Gauge,
  LayoutDashboard,
  Map,
  RefreshCcw,
  Users,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

const COMMAND_ROUTES = [
  {
    label: "Go to Candidate Portfolio",
    href: "/portfolio",
    icon: FolderOpen,
    shortcut: "C P",
  },
  {
    label: "View Career Paths",
    href: "/paths",
    icon: Map,
    shortcut: "C R",
  },
  {
    label: "Browse Marketplace",
    href: "/marketplace",
    icon: BriefcaseBusiness,
    shortcut: "C M",
  },
  {
    label: "Go to Employer Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    shortcut: "E D",
  },
  {
    label: "Manage Role Briefs",
    href: "/roles",
    icon: Users,
    shortcut: "E R",
  },
  {
    label: "Open Re-Engagement Pool",
    href: "/re-engagement",
    icon: RefreshCcw,
    shortcut: "E G",
  },
  {
    label: "View Readiness Profile",
    href: "/readiness",
    icon: BarChart3,
    shortcut: "U R",
  },
  {
    label: "Open Demo Control",
    href: "/demo-control",
    icon: Gauge,
    shortcut: "D C",
  },
];

export function GlobalCommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="TalentVault Command Menu"
      description="Jump to a workflow or demo surface."
      className="max-w-xl"
    >
      <Command>
        <CommandInput placeholder="Search TalentVault..." />
        <CommandList>
          <CommandEmpty>No matching workflow found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {COMMAND_ROUTES.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.href}
                  value={item.label}
                  onSelect={() => navigate(item.href)}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                  <CommandShortcut>{item.shortcut}</CommandShortcut>
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Tip">
            <CommandItem disabled>
              <span className="text-muted-foreground">
                Use Ctrl+K or Cmd+K from any screen.
              </span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
