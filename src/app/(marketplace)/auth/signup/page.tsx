import { AuthForm } from "@/components/auth/auth-form";

export default function MarketplaceSignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <AuthForm
        mode="signup"
        role="patient"
        showGoogle={true}
        title="Create an account"
        subtitle="Sign up to book appointments with healthcare professionals"
        switchHref="/auth/login"
        switchLabel="Already have an account? Sign in"
      />
    </main>
  );
}
