"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Persona, UserRole, DEMO_PERSONAS } from "@/types";

// =============================================================================
// Persona Context
// Manages the currently active demo persona across all routes.
// =============================================================================

interface PersonaContextValue {
  /** The currently active persona */
  persona: Persona;

  /** All available demo personas */
  personas: Persona[];

  /** Switch to a different persona */
  switchPersona: (personaId: string) => void;

  /** Check if the current persona has a specific role */
  isRole: (role: UserRole) => boolean;
}

const PersonaContext = createContext<PersonaContextValue | undefined>(undefined);

const PERSONA_STORAGE_KEY = "signalpath-active-persona";

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [activePersonaId, setActivePersonaId] = useState<string>(DEMO_PERSONAS[0].id);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = localStorage.getItem(PERSONA_STORAGE_KEY);
      if (stored && DEMO_PERSONAS.some((p) => p.id === stored)) {
        setActivePersonaId(stored);
      }
      setIsHydrated(true);
    });
  }, []);

  const switchPersona = useCallback((personaId: string) => {
    const target = DEMO_PERSONAS.find((p) => p.id === personaId);
    if (target) {
      setActivePersonaId(personaId);
      localStorage.setItem(PERSONA_STORAGE_KEY, personaId);
    }
  }, []);

  const persona =
    DEMO_PERSONAS.find((p) => p.id === activePersonaId) ?? DEMO_PERSONAS[0];

  const isRole = useCallback(
    (role: UserRole) => persona.role === role,
    [persona.role]
  );

  if (!isHydrated) {
    return null;
  }

  return (
    <PersonaContext.Provider
      value={{
        persona,
        personas: DEMO_PERSONAS,
        switchPersona,
        isRole,
      }}
    >
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona(): PersonaContextValue {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error("usePersona must be used within a PersonaProvider");
  }
  return context;
}
