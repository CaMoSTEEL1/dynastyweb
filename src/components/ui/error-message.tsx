"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "rounded border border-dw-red/30 bg-dw-red/5 px-6 py-5",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-dw-red" />
        <div className="flex-1">
          <h3 className="font-headline text-sm uppercase tracking-wider text-dw-red">
            {title}
          </h3>
          <p className="mt-1 font-serif text-sm leading-relaxed text-ink2">
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className={cn(
                "mt-3 rounded bg-paper3 px-4 py-1.5",
                "font-sans text-xs font-medium uppercase tracking-wider text-ink",
                "border border-dw-border transition-colors hover:bg-paper4"
              )}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
