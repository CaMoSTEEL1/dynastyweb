"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface AuthResult {
  error?: string;
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Auto sign-in after signup (works when email confirmation is disabled in Supabase)
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    // Email confirmation is required — send to confirm page
    redirect(`/confirm-email?email=${encodeURIComponent(email)}`);
  }

  redirect("/create-dynasty");
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
