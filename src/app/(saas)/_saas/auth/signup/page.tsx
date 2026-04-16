import { AuthForm } from "@/components/auth/auth-form";

export default function SaasSignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <AuthForm
        mode="signup"
        role="studio_admin"
        showGoogle={false}
        showStudioFields={true}
        title="Register your studio"
        subtitle="Create an account to manage your medical practice"
        switchHref="/_saas/auth/login"
        switchLabel="Already have an account? Sign in"
      />
    </main>
  );
}
