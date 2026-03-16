"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resent) return;
    const timer = setTimeout(() => setResent(false), 5000);
    return () => clearTimeout(timer);
  }, [resent]);

  async function handleResend() {
    if (!email || resending) return;
    setResending(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Failed to resend email");
      }

      setResent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md rounded border border-dw-border bg-paper2 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-dw-border bg-paper3">
          <Mail className="h-8 w-8 text-dw-accent" />
        </div>

        <h1 className="mt-6 font-headline text-xl uppercase tracking-[0.2em] text-ink">
          Check Your Email
        </h1>

        <div className="rule-diamond my-4 mx-auto w-full max-w-[200px]">
          <span className="diamond" />
        </div>

        <p className="font-serif text-sm leading-relaxed text-ink2">
          We&apos;ve sent a confirmation link to
        </p>

        {email && (
          <p className="mt-2 font-sans text-sm font-semibold text-ink">
            {email}
          </p>
        )}

        <p className="mt-4 font-serif text-sm leading-relaxed text-ink3">
          Click the link in the email to verify your account and start building
          your dynasty. The link will expire in 24 hours.
        </p>

        <div className="mt-8 space-y-3">
          {resent && (
            <div className="flex items-center justify-center gap-2 rounded border border-green-500/30 bg-green-500/10 px-4 py-2.5">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <p className="font-sans text-xs text-green-400">
                Confirmation email resent
              </p>
            </div>
          )}

          {error && (
            <div className="rounded border border-red-400/30 bg-red-500/10 px-4 py-2.5">
              <p className="font-sans text-xs text-red-400">{error}</p>
            </div>
          )}

          {email && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || resent}
              className={cn(
                "inline-flex items-center gap-2 rounded border border-dw-border bg-paper3 px-5 py-2.5",
                "font-sans text-xs font-medium uppercase tracking-wider text-ink2",
                "transition-colors hover:bg-paper hover:text-ink",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", resending && "animate-spin")}
              />
              {resending ? "Sending..." : "Resend Email"}
            </button>
          )}
        </div>

        <div className="mt-8 border-t border-dw-border pt-6">
          <p className="font-serif text-xs text-ink3">
            Wrong email?{" "}
            <Link href="/signup" className="text-dw-accent hover:underline">
              Sign up again
            </Link>
          </p>
          <p className="mt-2 font-serif text-xs text-ink3">
            Already confirmed?{" "}
            <Link href="/login" className="text-dw-accent hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
