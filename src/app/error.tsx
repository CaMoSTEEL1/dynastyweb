"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
      <AlertTriangle className="h-10 w-10 text-dw-red" />

      <h1
        className={cn(
          "mt-4 font-headline text-3xl uppercase tracking-[0.2em] text-ink",
          "sm:text-4xl"
        )}
      >
        Technical Difficulties
      </h1>

      <div className="rule-diamond my-6 w-full max-w-xs">
        <span className="diamond" />
      </div>

      <p className="max-w-md font-serif text-base italic text-ink2">
        We&apos;re experiencing an unexpected issue. Our editorial team is on
        it.
      </p>

      <p className="mt-2 max-w-sm font-serif text-sm text-ink3">
        {error.message || "An unknown error occurred."}
      </p>

      {error.digest && (
        <p className="mt-1 font-sans text-xs text-ink3/60">
          Reference: {error.digest}
        </p>
      )}

      <button
        onClick={reset}
        className={cn(
          "mt-8 inline-block rounded bg-dw-accent px-6 py-2.5",
          "font-sans text-sm font-semibold uppercase tracking-wider text-white",
          "transition-colors hover:bg-dw-accent2"
        )}
      >
        Try Again
      </button>
    </div>
  );
}
