import { AuthForm } from "@/components/auth/auth-form";

interface Props {
  searchParams: { next?: string };
}

export default function MarketplaceLoginPage({ searchParams }: Props) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <AuthForm
        mode="login"
        role="patient"
        nextPath={searchParams.next}
        showGoogle={true}
        title="Sign in"
        subtitle="Sign in to book appointments"
        switchHref="/auth/signup"
        switchLabel="Don't have an account? Sign up"
      />
    </main>
  );
}
