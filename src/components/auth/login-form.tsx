"use client";

import { cn } from "@/lib/utils";
import { signIn } from "@/lib/auth/actions";
import Link from "next/link";
import { useActionState } from "react";

interface LoginState {
  error?: string;
}

const initialState: LoginState = {};

async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const result = await signIn(formData);
  return result;
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <>
      {state.error && (
        <div
          className={cn(
            "rounded border border-red-400/30 bg-red-500/10 px-4 py-3",
            "font-sans text-sm text-red-400"
          )}
        >
          {state.error}
        </div>
      )}

      <form action={formAction} className="mt-8 space-y-5">
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

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "w-full rounded bg-dw-accent px-4 py-2.5",
            "font-sans text-sm font-semibold uppercase tracking-wider text-white",
            "transition-opacity hover:opacity-90",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center font-serif text-sm text-ink3">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-dw-accent hover:underline">
          Sign up
        </Link>
      </p>
    </>
  );
}
