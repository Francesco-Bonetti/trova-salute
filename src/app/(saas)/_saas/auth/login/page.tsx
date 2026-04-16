import { AuthForm } from "@/components/auth/auth-form";

interface Props {
  searchParams: { next?: string };
}

export default function SaasLoginPage({ searchParams }: Props) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <AuthForm
        mode="login"
        role="studio_admin"
        nextPath={searchParams.next}
        showGoogle={false}
        title="Studio sign in"
        subtitle="Access your studio management dashboard"
        switchHref="/_saas/auth/signup"
        switchLabel="Don't have an account? Create your studio"
      />
    </main>
  );
}
