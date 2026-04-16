import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function SaasDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/_saas/auth/login");
  }

  const displayName =
    user.user_metadata?.first_name && user.user_metadata?.last_name
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
      : user.email;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Studio Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome, {displayName}
        </p>
        <div className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          Rooms, calendar, and collaborations — coming in Phase 4
        </div>
        <div className="pt-4">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
