"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

// ─── Types ───────────────────────────────────────────────────────────
export type AuthResult = {
  error?: string;
};

type UserRole = "patient" | "professional" | "studio_admin";

// ─── Helpers ─────────────────────────────────────────────────────────

/** Build the absolute callback URL for OAuth / email confirmation */
function getCallbackUrl(authPath: string): string {
  const headersList = headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}${authPath}/callback`;
}

/** Map role → post-login dashboard path */
function getDashboardPath(role: UserRole): string {
  switch (role) {
    case "studio_admin":
      return "/_saas/dashboard";
    case "professional":
      return "/_network/dashboard";
    case "patient":
    default:
      return "/";
  }
}

/** Map role → auth base path */
function getAuthBasePath(role: UserRole): string {
  switch (role) {
    case "studio_admin":
      return "/_saas/auth";
    case "professional":
      return "/_network/auth";
    case "patient":
    default:
      return "/auth";
  }
}

// ─── Sign Up ─────────────────────────────────────────────────────────

export async function signUp(formData: FormData): Promise<AuthResult> {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as UserRole;
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;

  // Role-specific metadata
  const metadata: Record<string, string> = {
    role,
    first_name: firstName || "",
    last_name: lastName || "",
  };

  // Studio admin may also provide studio name
  const studioName = formData.get("studio_name") as string | null;
  if (studioName) {
    metadata.studio_name = studioName;
  }

  const callbackUrl = getCallbackUrl(getAuthBasePath(role));

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: callbackUrl,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Supabase sends a confirmation email — redirect to a "check email" page
  const authBase = getAuthBasePath(role);
  redirect(`${authBase}/check-email`);
}

// ─── Sign In (email + password) ──────────────────────────────────────

export async function signIn(formData: FormData): Promise<AuthResult> {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nextPath = formData.get("next") as string | null;
  const role = formData.get("role") as UserRole;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(nextPath || getDashboardPath(role));
}

// ─── Sign In with Google OAuth ───────────────────────────────────────

export async function signInWithGoogle(formData: FormData): Promise<AuthResult> {
  const supabase = createClient();

  const role = formData.get("role") as UserRole;
  const nextPath = formData.get("next") as string | null;
  const callbackUrl = getCallbackUrl(getAuthBasePath(role));

  // Pass role in querystring so callback can set it in metadata
  const redirectTo = `${callbackUrl}?role=${role}${nextPath ? `&next=${encodeURIComponent(nextPath)}` : ""}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: "Could not initiate Google sign-in" };
}

// ─── Sign Out ────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}
