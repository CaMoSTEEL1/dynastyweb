"use client";

import { cn } from "@/lib/utils";
import { signUp } from "@/lib/auth/actions";
import Link from "next/link";
import { useActionState } from "react";
import { useState } from "react";

interface SignupState {
  error?: string;
}

const initialState: SignupState = {};

async function signupAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const result = await signUp(formData);
  return result;
}

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialState
  );
  const [clientError, setClientError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (password !== confirmPassword) {
      setClientError("Passwords do not match.");
      return;
    }

    setClientError(null);
    formAction(formData);
  }

  const displayError = clientError ?? state.error;

  return (
    <>
      {displayError && (
        <div
          className={cn(
            "rounded border border-red-400/30 bg-red-500/10 px-4 py-3",
            "font-sans text-sm text-red-400"
          )}
        >
          {displayError}
        </div>
      )}

      <form action={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block font-sans text-xs uppercase tracking-wider text-ink3"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={cn(
              "mt-1 w-full rounded border border-dw-border bg-paper3 px-3 py-2",
              "font-sans text-sm text-ink",
              "placeholder:text-ink3 focus:outline-none focus:ring-1 focus:ring-dw-accent"
            )}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block font-sans text-xs uppercase tracking-wider text-ink3"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className={cn(
              "mt-1 w-full rounded border border-dw-border bg-paper3 px-3 py-2",
              "font-sans text-sm text-ink",
              "placeholder:text-ink3 focus:outline-none focus:ring-1 focus:ring-dw-accent"
            )}
            placeholder="••••••••"
          />
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block font-sans text-xs uppercase tracking-wider text-ink3"
          >
            Confirm Password
          </label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            required
            className={cn(
              "mt-1 w-full rounded border border-dw-border bg-paper3 px-3 py-2",
              "font-sans text-sm text-ink",
              "placeholder:text-ink3 focus:outline-none focus:ring-1 focus:ring-dw-accent"
            )}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "w-full rounded bg-dw-accent px-4 py-2.5",
            "font-sans text-sm font-semibold uppercase tracking-wider text-white",
            "transition-colors hover:bg-dw-accent2",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isPending ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center font-serif text-sm text-ink3">
        Already have an account?{" "}
        <Link href="/login" className="text-dw-accent hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
