import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

interface CheckEmailProps {
  backHref: string;
}

export function CheckEmail({ backHref }: CheckEmailProps) {
  return (
    <Card className="mx-auto w-full max-w-md text-center">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
          <Mail className="h-6 w-6 text-teal-600" />
        </div>
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription>
          We sent you a confirmation link. Click it to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <a
          href={backHref}
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to sign in
        </a>
      </CardContent>
    </Card>
  );
}
