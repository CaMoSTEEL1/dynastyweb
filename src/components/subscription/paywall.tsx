"use client";

import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import Link from "next/link";

interface PaywallProps {
  feature: string;
  children: React.ReactNode;
}

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  social:
    "Fan reactions, hot takes, and social media buzz that follows every game and decision in your dynasty.",
  "press-conference":
    "Step to the podium and answer tough questions from the media after every game.",
  shows:
    "Watch broadcast analysts debate your team on studio shows and podcasts.",
  recruiting:
    "Follow dynamic recruit storylines with AI-generated twists, visits, and commitments.",
  offseason:
    "Experience the full offseason cycle with portal transfers, coaching changes, and award ceremonies.",
  nil:
    "Navigate the NIL landscape with endorsement deals and brand storylines for your players.",
  carousel:
    "The full front-page carousel with editorial layout and rotating headline stories.",
};

export default function Paywall({ feature, children }: PaywallProps) {
  const description =
    FEATURE_DESCRIPTIONS[feature] ??
    "This premium feature brings your dynasty to life with AI-generated content.";

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm" aria-hidden>
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-paper/60 backdrop-blur-[2px]">
        <div
          className={cn(
            "mx-4 w-full max-w-md rounded border border-dw-border bg-paper p-8",
            "text-center shadow-lg"
          )}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-dw-border bg-paper2">
            <Lock className="h-5 w-5 text-dw-accent" />
          </div>

          <h2 className="mt-4 font-headline text-xl uppercase tracking-wider text-ink">
            Premium Feature
          </h2>

          <div className="rule-diamond my-4 w-full max-w-[120px] mx-auto">
            <span className="diamond" />
          </div>

          <p className="font-serif text-sm leading-relaxed text-ink2">
            {description}
          </p>

          <p className="mt-3 font-serif text-xs italic text-ink3">
            Your free season has ended. Unlock the full DynastyWire experience.
          </p>

          <Link
            href="/pricing"
            className={cn(
              "mt-6 inline-block rounded bg-dw-accent px-6 py-2.5",
              "font-sans text-sm font-semibold uppercase tracking-wider text-white",
              "transition-colors hover:bg-dw-accent2"
            )}
          >
            Upgrade to Premium
          </Link>
        </div>
      </div>
    </div>
  );
}
