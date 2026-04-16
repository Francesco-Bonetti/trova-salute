import { CheckEmail } from "@/components/auth/check-email";

export default function MarketplaceCheckEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <CheckEmail backHref="/auth/login" />
    </main>
  );
}
