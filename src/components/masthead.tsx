"use client";

import { cn } from "@/lib/utils";
import { DateTime } from "luxon";

export default function Masthead() {
  const now = DateTime.now();
  const formattedDate = now.toFormat("EEEE, MMMM d, yyyy");

  return (
    <header className={cn("w-full bg-paper py-6 md:py-10 text-center")}>
      <h1
        className={cn(
          "font-headline text-ink uppercase tracking-[0.3em]",
          "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
          "leading-tight"
        )}
      >
        DynastyWire
      </h1>

      <div className="rule-diamond my-4 md:my-6">
        <span className="diamond" />
      </div>

      <p
        className={cn(
          "font-serif italic text-ink2",
          "text-sm sm:text-base md:text-lg"
        )}
      >
        Your Dynasty. Your Story.
      </p>

      <p
        className={cn(
          "font-serif text-ink3 mt-2",
          "text-xs sm:text-sm"
        )}
      >
        {formattedDate}
      </p>
    </header>
  );
}
