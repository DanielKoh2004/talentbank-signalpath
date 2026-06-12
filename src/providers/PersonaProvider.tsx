"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
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

  /** Add a locally registered demo candidate and switch to it */
  addLocalPersona: (persona: Persona) => void;

  /** Check if the current persona has a specific role */
  isRole: (role: UserRole) => boolean;
}

const PersonaContext = createContext<PersonaContextValue | undefined>(undefined);

const PERSONA_STORAGE_KEY = "signalpath-active-persona";
const LOCAL_PERSONAS_STORAGE_KEY = "signalpath-local-personas";

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [activePersonaId, setActivePersonaId] = useState<string>(DEMO_PERSONAS[0].id);
  const [localPersonas, setLocalPersonas] = useState<Persona[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const storedLocal = localStorage.getItem(LOCAL_PERSONAS_STORAGE_KEY);
      let parsedLocal: Persona[] = [];
      if (storedLocal) {
        try {
          parsedLocal = JSON.parse(storedLocal) as Persona[];
          setLocalPersonas(parsedLocal);
        } catch {
          localStorage.removeItem(LOCAL_PERSONAS_STORAGE_KEY);
        }
      }
      const stored = localStorage.getItem(PERSONA_STORAGE_KEY);
      if (
        stored &&
        [...DEMO_PERSONAS, ...parsedLocal].some((p) => p.id === stored)
      ) {
        setActivePersonaId(stored);
      }
      setIsHydrated(true);
    });
  }, []);

  const personas = useMemo(() => [...DEMO_PERSONAS, ...localPersonas], [localPersonas]);

  const switchPersona = useCallback((personaId: string) => {
    const target = personas.find((p) => p.id === personaId);
    if (target) {
      setActivePersonaId(personaId);
      localStorage.setItem(PERSONA_STORAGE_KEY, personaId);
    }
  }, [personas]);

  const addLocalPersona = useCallback((persona: Persona) => {
    setLocalPersonas((current) => {
      const next = [...current.filter((p) => p.id !== persona.id), persona];
      localStorage.setItem(LOCAL_PERSONAS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setActivePersonaId(persona.id);
    localStorage.setItem(PERSONA_STORAGE_KEY, persona.id);
  }, []);

  const persona =
    personas.find((p) => p.id === activePersonaId) ?? DEMO_PERSONAS[0];

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
        personas,
        switchPersona,
        addLocalPersona,
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
