"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { PortalEntry, PortalDrama } from "@/lib/nil/types";

interface PortalTrackerProps {
  entries: PortalEntry[];
  drama: PortalDrama | null;
}

const DRAMA_TYPE_LABELS: Record<PortalDrama["type"], string> = {
  unexpected_departure: "Unexpected Departure",
  bidding_war: "Bidding War",
  tampering_rumor: "Tampering Rumor",
  last_minute_flip: "Last-Minute Flip",
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

function PlayerCard({ entry }: { entry: PortalEntry }) {
  const isEntering = entry.direction === "entering";

  return (
    <motion.div
      variants={itemVariants}
      className="rounded border border-dw-border bg-paper2 p-4"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded font-headline text-sm font-bold",
            isEntering
              ? "bg-dw-red/10 text-dw-red"
              : "bg-dw-green/10 text-dw-green"
          )}
        >
          {isEntering ? "\u2192" : "\u2190"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-headline text-sm text-ink">
              {entry.playerName}
            </span>
            <span className="font-sans text-xs text-ink3">
              {entry.position}
            </span>
          </div>
          <p className="mt-0.5 font-sans text-xs text-ink3">{entry.reason}</p>
          {entry.destination && (
            <p className="mt-1 font-sans text-xs">
              <span className="text-ink3">Destination: </span>
              <span className="text-dw-accent">{entry.destination}</span>
            </p>
          )}
          <p className="mt-2 font-serif text-sm text-ink2">{entry.narrative}</p>
          {entry.drama && (
            <p className="mt-1 font-serif text-xs italic text-dw-yellow">
              {entry.drama}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function PortalTracker({ entries, drama }: PortalTrackerProps) {
  const entering = entries.filter((e) => e.direction === "entering");
  const exiting = entries.filter((e) => e.direction === "exiting");

  return (
    <div>
      <h3 className="font-headline text-sm uppercase tracking-wider text-ink2">
        Portal Tracker
      </h3>
      <div className="mt-1 h-px w-full bg-dw-border" />

      {drama && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mt-4 rounded border-l-4 border-dw-red bg-paper2 p-4"
        >
          <div className="flex items-center gap-2">
            <span className="font-headline text-[10px] uppercase tracking-widest text-dw-red">
              Breaking
            </span>
            <span className="font-sans text-[10px] uppercase tracking-wider text-ink3">
              {DRAMA_TYPE_LABELS[drama.type]}
            </span>
          </div>
          <p className="mt-1 font-headline text-sm text-ink">{drama.headline}</p>
          <p className="mt-1 font-serif text-sm text-ink2">{drama.body}</p>
        </motion.div>
      )}

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-dw-red" />
            <h4 className="font-headline text-xs uppercase tracking-wider text-dw-red">
              Entering Portal
            </h4>
          </div>

          {entering.length > 0 ? (
            <motion.div
              className="mt-3 space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {entering.map((entry) => (
                <PlayerCard key={entry.id} entry={entry} />
              ))}
            </motion.div>
          ) : (
            <div className="mt-3 rounded border border-dw-border bg-paper2 px-4 py-6 text-center">
              <p className="font-serif text-xs text-ink3">
                No players currently in the portal.
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-dw-green" />
            <h4 className="font-headline text-xs uppercase tracking-wider text-dw-green">
              Arriving
            </h4>
          </div>

          {exiting.length > 0 ? (
            <motion.div
              className="mt-3 space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {exiting.map((entry) => (
                <PlayerCard key={entry.id} entry={entry} />
              ))}
            </motion.div>
          ) : (
            <div className="mt-3 rounded border border-dw-border bg-paper2 px-4 py-6 text-center">
              <p className="font-serif text-xs text-ink3">
                No incoming transfers to report.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
