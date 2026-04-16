import { AuthForm } from "@/components/auth/auth-form";

export default function NetworkSignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <AuthForm
        mode="signup"
        role="professional"
        showGoogle={true}
        title="Join the network"
        subtitle="Create your profile and find practice rooms"
        switchHref="/_network/auth/login"
        switchLabel="Already have an account? Sign in"
      />
    </main>
  );
}
