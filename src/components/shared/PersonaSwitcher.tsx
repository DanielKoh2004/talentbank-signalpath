"use client";

import { usePersona } from "@/providers/PersonaProvider";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// =============================================================================
// PersonaSwitcher
// Persistent component in root layout for switching between demo personas.
// =============================================================================



const ROLE_COLORS: Record<UserRole, string> = {
  candidate: "from-indigo-500 to-violet-600",
  employer: "from-emerald-500 to-teal-600",
  university_admin: "from-amber-500 to-orange-600",
};

const ROLE_BORDER: Record<UserRole, string> = {
  candidate: "border-indigo-500/30",
  employer: "border-emerald-500/30",
  university_admin: "border-amber-500/30",
};

export function PersonaSwitcher() {
  const { persona, personas, switchPersona } = usePersona();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-all duration-200",
          "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
          "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
          ROLE_BORDER[persona.role]
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white text-xs font-bold shadow-sm",
            ROLE_COLORS[persona.role]
          )}
        >
          {persona.avatarInitials}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {persona.name}
          </span>
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {persona.role.replace("_", " ")}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white/95 p-2 shadow-xl backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/95">
          <div className="mb-2 px-2 py-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Switch Persona
            </span>
          </div>
          {personas.map((p) => {
              const isActive = p.id === persona.id;

            return (
              <button
                key={p.id}
                onClick={() => {
                  switchPersona(p.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-all duration-150",
                  isActive
                    ? "bg-gray-100 dark:bg-gray-700/50"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white text-sm font-bold shadow-sm",
                    ROLE_COLORS[p.role]
                  )}
                >
                  {p.avatarInitials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {p.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {p.description}
                  </span>
                </div>
                {isActive && (
                  <div className="ml-auto flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
