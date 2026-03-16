"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "./settings-context";
import SettingsPanel from "./settings-panel";

export default function SettingsDrawer() {
  const { isOpen, close } = useSettings();

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) close();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={close}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed right-0 top-0 z-50 h-full",
              "w-full sm:w-[420px] md:w-[460px]",
              "bg-paper border-l border-dw-border",
              "flex flex-col shadow-2xl"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-dw-border px-6 py-4">
              <h2 className="font-headline text-sm uppercase tracking-[0.2em] text-ink">
                Settings
              </h2>
              <button
                type="button"
                onClick={close}
                className="rounded p-1 text-ink3 transition-colors hover:bg-paper2 hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <SettingsPanel />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
