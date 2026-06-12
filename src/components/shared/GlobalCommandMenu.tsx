"use client";

import { useCallback, useEffect, useState } from "react";
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

  const openCommandMenu = useCallback(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        event.stopPropagation();
        setOpen(true);
      }
    }

    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("signalpath:open-command", openCommandMenu);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("signalpath:open-command", openCommandMenu);
    };
  }, [openCommandMenu]);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="SignalPath Command Menu"
      description="Jump to a workflow or demo surface."
      className="max-w-xl"
      showCloseButton
    >
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-600">
          Command Menu
        </p>
        <h2 className="mt-1 text-lg font-black text-slate-950 dark:text-white">
          Jump to a SignalPath workflow
        </h2>
      </div>
      <Command>
        <CommandInput autoFocus placeholder="Search SignalPath..." />
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
