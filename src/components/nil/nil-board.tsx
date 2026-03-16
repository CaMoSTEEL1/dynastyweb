"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { NILOffer, NILDrama } from "@/lib/nil/types";

interface NILBoardProps {
  offers: NILOffer[];
  drama: NILDrama | null;
}

const STATUS_CONFIG: Record<
  NILOffer["status"],
  { label: string; color: string; bg: string }
> = {
  pending: {
    label: "Pending",
    color: "text-dw-yellow",
    bg: "bg-dw-yellow/10 border-dw-yellow/30",
  },
  accepted: {
    label: "Accepted",
    color: "text-dw-green",
    bg: "bg-dw-green/10 border-dw-green/30",
  },
  declined: {
    label: "Declined",
    color: "text-dw-red",
    bg: "bg-dw-red/10 border-dw-red/30",
  },
  controversy: {
    label: "Controversy",
    color: "text-dw-red",
    bg: "bg-dw-red/10 border-dw-red/30",
  },
};

const SEVERITY_CONFIG: Record<
  NILDrama["severity"],
  { label: string; borderColor: string }
> = {
  minor: { label: "Developing", borderColor: "border-dw-yellow" },
  moderate: { label: "Breaking", borderColor: "border-dw-accent" },
  major: { label: "Major Story", borderColor: "border-dw-red" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

export function NILBoard({ offers, drama }: NILBoardProps) {
  return (
    <div>
      <h3 className="font-headline text-sm uppercase tracking-wider text-ink2">
        NIL Tracker
      </h3>
      <div className="mt-1 h-px w-full bg-dw-border" />

      {drama && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={cn(
            "mt-4 rounded border-l-4 bg-paper2 p-4",
            SEVERITY_CONFIG[drama.severity].borderColor
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-headline text-[10px] uppercase tracking-widest",
                drama.severity === "major"
                  ? "text-dw-red"
                  : drama.severity === "moderate"
                    ? "text-dw-accent"
                    : "text-dw-yellow"
              )}
            >
              {SEVERITY_CONFIG[drama.severity].label}
            </span>
            <span className="font-sans text-[10px] uppercase tracking-wider text-ink3">
              {drama.type.replace(/_/g, " ")}
            </span>
          </div>
          <p className="mt-1 font-headline text-sm text-ink">{drama.headline}</p>
          <p className="mt-1 font-serif text-sm text-ink2">{drama.body}</p>
        </motion.div>
      )}

      <motion.div
        className="mt-4 space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {offers.map((offer) => {
          const statusCfg = STATUS_CONFIG[offer.status];
          return (
            <motion.div
              key={offer.id}
              variants={itemVariants}
              className="rounded border border-dw-border bg-paper2 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-headline text-sm text-ink">
                      {offer.playerName}
                    </span>
                    <span className="font-sans text-xs text-ink3">
                      {offer.position}
                    </span>
                  </div>
                  <p className="mt-1 font-headline text-base font-bold text-dw-accent2">
                    {offer.offerAmount}
                  </p>
                  <p className="mt-0.5 font-sans text-xs text-ink3">
                    via {offer.source}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded border px-2 py-0.5 font-sans text-[10px] uppercase tracking-wider",
                    statusCfg.bg,
                    statusCfg.color
                  )}
                >
                  {statusCfg.label}
                </span>
              </div>
              <p className="mt-2 font-serif text-sm text-ink2">
                {offer.narrative}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {offers.length === 0 && (
        <div className="mt-4 rounded border border-dw-border bg-paper2 px-6 py-8 text-center">
          <p className="font-serif text-sm text-ink3">
            No NIL offers to report at this time.
          </p>
        </div>
      )}
    </div>
  );
}
