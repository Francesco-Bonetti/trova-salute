import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Auth callback handler for Network (Professional) site.
 * Handles email confirmation and Google OAuth redirects.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/_network/dashboard";
  const role = searchParams.get("role");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // For Google OAuth: if this is a new user, update their metadata with the role
      // The trigger handle_new_user reads role from raw_user_meta_data
      if (role) {
        await supabase.auth.updateUser({
          data: { role },
        });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/_network/auth/login?error=auth_callback_failed`);
}
