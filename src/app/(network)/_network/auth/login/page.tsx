import { AuthForm } from "@/components/auth/auth-form";

interface Props {
  searchParams: { next?: string };
}

export default function NetworkLoginPage({ searchParams }: Props) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <AuthForm
        mode="login"
        role="professional"
        nextPath={searchParams.next}
        showGoogle={true}
        title="Professional sign in"
        subtitle="Access your professional dashboard"
        switchHref="/_network/auth/signup"
        switchLabel="New here? Create your professional profile"
      />
    </main>
  );
}
