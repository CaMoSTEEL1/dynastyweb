"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { OffseasonPhase } from "@/lib/offseason/types";
import type {
  BowlRecapContent,
  AwardsContent,
  PortalContent,
  CarouselContent,
  SigningDayContent,
  SpringPreviewContent,
} from "@/lib/offseason/types";

interface PhaseContentViewerProps {
  phase: OffseasonPhase;
  content: Record<string, unknown>;
  onClose: () => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" as const },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

function BowlRecapView({ data }: { data: BowlRecapContent }) {
  const paragraphs = data.body
    .split(/\n\n|\n/)
    .filter((p) => p.trim().length > 0);

  return (
    <motion.div {...fadeUp} className="space-y-6">
      <h2 className="font-headline text-2xl md:text-3xl font-bold text-ink leading-tight">
        {data.headline}
      </h2>
      <div className="h-px w-full bg-dw-border" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className={cn(
              "font-serif text-base text-ink leading-relaxed",
              i === 0 && "drop-cap"
            )}
          >
            {p}
          </p>
        ))}
      </div>

      <div className="h-px w-full bg-dw-border" />
      <h3 className="font-headline text-sm uppercase tracking-wider text-ink2">
        Social Reactions
      </h3>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-3"
      >
        {data.socialReactions.map((reaction, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="rounded-sm border border-dw-border bg-paper3 px-4 py-3"
          >
            <p className="font-sans text-xs font-medium text-dw-accent">
              {reaction.handle}
              <span className="ml-2 text-ink3">
                {reaction.type}
              </span>
            </p>
            <p className="mt-1 font-serif text-sm text-ink leading-relaxed">
              {reaction.body}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

function AwardsView({ data }: { data: AwardsContent }) {
  return (
    <motion.div {...fadeUp} className="space-y-6">
      <h2 className="font-headline text-2xl font-bold text-ink">
        Season Awards
      </h2>
      <div className="h-px w-full bg-dw-border" />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {data.awards.map((award, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="rounded-sm border border-dw-border bg-paper3 p-4"
          >
            <p className="font-headline text-xs uppercase tracking-wider text-dw-accent">
              {award.name}
            </p>
            <p className="mt-1 font-serif text-lg font-bold text-ink">
              {award.winner}
            </p>
            <p className="mt-2 font-sans text-sm text-ink2 leading-relaxed">
              {award.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <div className="h-px w-full bg-dw-border" />
      <h3 className="font-headline text-sm uppercase tracking-wider text-ink2">
        All-Conference Selections
      </h3>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
      >
        {data.allConference.map((player, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="rounded-sm border border-dw-border bg-paper2 px-3 py-2 text-center"
          >
            <p className="font-sans text-xs uppercase tracking-wider text-dw-accent">
              {player.position}
            </p>
            <p className="mt-0.5 font-serif text-sm font-medium text-ink">
              {player.name}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <div className="h-px w-full bg-dw-border" />
      <p className="font-serif text-base text-ink leading-relaxed italic">
        {data.narrative}
      </p>
    </motion.div>
  );
}

function PortalView({ data }: { data: PortalContent }) {
  const incoming = data.entries.filter((e) => e.direction === "in");
  const outgoing = data.entries.filter((e) => e.direction === "out");

  return (
    <motion.div {...fadeUp} className="space-y-6">
      <h2 className="font-headline text-2xl font-bold text-ink">
        Transfer Portal
      </h2>
      <div className="h-px w-full bg-dw-border" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-headline text-sm uppercase tracking-wider text-dw-green mb-3">
            Incoming Transfers
          </h3>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            {incoming.length === 0 && (
              <p className="font-sans text-sm text-ink3 italic">
                No incoming transfers yet.
              </p>
            )}
            {incoming.map((entry, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="rounded-sm border border-dw-green/30 bg-paper3 px-4 py-3"
              >
                <div className="flex items-baseline justify-between">
                  <p className="font-serif text-sm font-bold text-ink">
                    {entry.name}
                  </p>
                  <span className="font-sans text-xs uppercase text-dw-green">
                    {entry.position}
                  </span>
                </div>
                <p className="mt-1 font-sans text-xs text-ink2">
                  {entry.reason}
                </p>
                <p className="mt-1 font-sans text-xs italic text-ink3">
                  {entry.impact}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div>
          <h3 className="font-headline text-sm uppercase tracking-wider text-dw-red mb-3">
            Outgoing Transfers
          </h3>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            {outgoing.length === 0 && (
              <p className="font-sans text-sm text-ink3 italic">
                No outgoing transfers.
              </p>
            )}
            {outgoing.map((entry, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="rounded-sm border border-dw-red/30 bg-paper3 px-4 py-3"
              >
                <div className="flex items-baseline justify-between">
                  <p className="font-serif text-sm font-bold text-ink">
                    {entry.name}
                  </p>
                  <span className="font-sans text-xs uppercase text-dw-red">
                    {entry.position}
                  </span>
                </div>
                <p className="mt-1 font-sans text-xs text-ink2">
                  {entry.reason}
                </p>
                <p className="mt-1 font-sans text-xs italic text-ink3">
                  {entry.impact}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="h-px w-full bg-dw-border" />
      <p className="font-serif text-base text-ink leading-relaxed italic">
        {data.narrative}
      </p>
    </motion.div>
  );
}

function CarouselView({ data }: { data: CarouselContent }) {
  const likelihoodColor: Record<string, string> = {
    confirmed: "text-dw-green",
    likely: "text-dw-yellow",
    rumored: "text-dw-accent",
    unlikely: "text-ink3",
  };

  return (
    <motion.div {...fadeUp} className="space-y-6">
      <h2 className="font-headline text-2xl font-bold text-ink">
        {data.headline}
      </h2>
      <div className="h-px w-full bg-dw-border" />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-4"
      >
        {data.rumors.map((rumor, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="rounded-sm border border-dw-border bg-paper3 px-5 py-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="font-serif text-base font-bold text-ink">
                  {rumor.staffName}
                </p>
                <p className="font-sans text-xs text-ink2">
                  {rumor.role} &mdash; {rumor.school}
                </p>
              </div>
              <span
                className={cn(
                  "font-sans text-xs uppercase tracking-wider font-medium",
                  likelihoodColor[rumor.likelihood] ?? "text-ink3"
                )}
              >
                {rumor.likelihood}
              </span>
            </div>
            <p className="mt-2 font-serif text-sm text-ink leading-relaxed">
              {rumor.narrative}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

function SigningDayView({ data }: { data: SigningDayContent }) {
  const decisionColor: Record<string, string> = {
    committed: "border-dw-green/40 bg-dw-green/5",
    flipped: "border-dw-red/40 bg-dw-red/5",
    decommitted: "border-dw-red/40 bg-dw-red/5",
    surprise: "border-dw-accent/40 bg-dw-accent/5",
  };

  const decisionLabel: Record<string, string> = {
    committed: "COMMITTED",
    flipped: "FLIPPED",
    decommitted: "DECOMMITTED",
    surprise: "SURPRISE",
  };

  const decisionLabelColor: Record<string, string> = {
    committed: "text-dw-green",
    flipped: "text-dw-red",
    decommitted: "text-dw-red",
    surprise: "text-dw-accent",
  };

  return (
    <motion.div {...fadeUp} className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-headline text-2xl font-bold text-ink">
          Signing Day
        </h2>
        <div className="text-right">
          <p className="font-sans text-xs uppercase tracking-wider text-ink3">
            Class Grade
          </p>
          <p className="font-headline text-2xl font-bold text-dw-accent">
            {data.classGrade}
          </p>
        </div>
      </div>
      <div className="h-px w-full bg-dw-border" />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {data.decisions.map((decision, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className={cn(
              "rounded-sm border px-4 py-3",
              decisionColor[decision.decision] ?? "border-dw-border bg-paper3"
            )}
          >
            <div className="flex items-baseline justify-between">
              <p className="font-serif text-sm font-bold text-ink">
                {decision.name}
              </p>
              <span
                className={cn(
                  "font-sans text-xs uppercase tracking-wider font-medium",
                  decisionLabelColor[decision.decision] ?? "text-ink3"
                )}
              >
                {decisionLabel[decision.decision] ?? decision.decision}
              </span>
            </div>
            <p className="mt-0.5 font-sans text-xs text-ink2">
              {decision.position} &bull;{" "}
              {"★".repeat(decision.stars)}
              {"☆".repeat(5 - decision.stars)}
            </p>
            <p className="mt-2 font-serif text-sm text-ink leading-relaxed">
              {decision.narrative}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <div className="h-px w-full bg-dw-border" />
      <p className="font-serif text-base text-ink leading-relaxed italic">
        {data.summary}
      </p>
    </motion.div>
  );
}

function SpringPreviewView({ data }: { data: SpringPreviewContent }) {
  const paragraphs = data.body
    .split(/\n\n|\n/)
    .filter((p) => p.trim().length > 0);

  return (
    <motion.div {...fadeUp} className="space-y-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-ink leading-tight">
          {data.headline}
        </h2>
        {data.preseasonRanking !== null && (
          <div className="flex-shrink-0 text-right">
            <p className="font-sans text-xs uppercase tracking-wider text-ink3">
              Preseason
            </p>
            <p className="font-headline text-2xl font-bold text-dw-accent">
              #{data.preseasonRanking}
            </p>
          </div>
        )}
      </div>
      <div className="h-px w-full bg-dw-border" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className={cn(
              "font-serif text-base text-ink leading-relaxed",
              i === 0 && "drop-cap"
            )}
          >
            {p}
          </p>
        ))}
      </div>

      <div className="h-px w-full bg-dw-border" />
      <h3 className="font-headline text-sm uppercase tracking-wider text-ink2">
        Key Storylines
      </h3>
      <motion.ol
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-2"
      >
        {data.keyStorylines.map((storyline, i) => (
          <motion.li
            key={i}
            variants={fadeUp}
            className="flex gap-3 items-start"
          >
            <span className="font-headline text-sm font-bold text-dw-accent flex-shrink-0">
              {i + 1}.
            </span>
            <p className="font-serif text-sm text-ink leading-relaxed">
              {storyline}
            </p>
          </motion.li>
        ))}
      </motion.ol>
    </motion.div>
  );
}

export function PhaseContentViewer({
  phase,
  content,
  onClose,
}: PhaseContentViewerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <button
        type="button"
        onClick={onClose}
        className="font-sans text-xs uppercase tracking-wider text-dw-accent hover:text-dw-accent2 transition-colors"
      >
        &larr; Back to Offseason
      </button>

      <div className="rounded-sm border border-dw-border bg-paper2 p-6">
        {phase === "bowl_recap" && (
          <BowlRecapView data={content as unknown as BowlRecapContent} />
        )}
        {phase === "awards" && (
          <AwardsView data={content as unknown as AwardsContent} />
        )}
        {phase === "portal_window" && (
          <PortalView data={content as unknown as PortalContent} />
        )}
        {phase === "coaching_carousel" && (
          <CarouselView data={content as unknown as CarouselContent} />
        )}
        {phase === "signing_day" && (
          <SigningDayView data={content as unknown as SigningDayContent} />
        )}
        {phase === "spring_preview" && (
          <SpringPreviewView
            data={content as unknown as SpringPreviewContent}
          />
        )}
      </div>
    </motion.div>
  );
}
