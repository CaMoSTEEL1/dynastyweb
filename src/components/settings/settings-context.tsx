"use client";

import { createContext, useContext, useState, useCallback } from "react";

export interface DynastyInfo {
  id: string;
  school: string;
  conference: string;
  coachName: string;
  prestige: string;
}

export interface SeasonInfo {
  id: string;
  year: number;
  currentWeek: number;
  record: { wins: number; losses: number };
}

interface SettingsContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  dynasty: DynastyInfo;
  season: SeasonInfo | null;
  setSeason: (s: SeasonInfo | null) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

export function SettingsProvider({
  children,
  dynasty,
  initialSeason,
}: {
  children: React.ReactNode;
  dynasty: DynastyInfo;
  initialSeason: SeasonInfo | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [season, setSeason] = useState<SeasonInfo | null>(initialSeason);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  return (
    <SettingsContext.Provider
      value={{ isOpen, open, close, toggle, dynasty, season, setSeason }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
