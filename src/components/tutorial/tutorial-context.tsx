"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const STORAGE_KEY = "dynastywire-tutorial-seen";

interface TutorialContextValue {
  isTutorialOpen: boolean;
  showTutorial: () => void;
  hideTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx)
    throw new Error("useTutorial must be used within TutorialProvider");
  return ctx;
}

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setIsTutorialOpen(true);
    }
  }, []);

  const showTutorial = useCallback(() => setIsTutorialOpen(true), []);

  const hideTutorial = useCallback(() => {
    setIsTutorialOpen(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  return (
    <TutorialContext.Provider
      value={{ isTutorialOpen, showTutorial, hideTutorial }}
    >
      {children}
    </TutorialContext.Provider>
  );
}
