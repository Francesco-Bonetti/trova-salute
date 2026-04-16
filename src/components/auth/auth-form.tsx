"use client";

import { useState } from "react";
import { signIn, signUp, signInWithGoogle, type AuthResult } from "@/lib/auth/actions";
import { SubmitButton } from "./submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AuthMode = "login" | "signup";
type UserRole = "patient" | "professional" | "studio_admin";

interface AuthFormProps {
  mode: AuthMode;
  role: UserRole;
  nextPath?: string;
  showGoogle?: boolean;
  showStudioFields?: boolean;
  title: string;
  subtitle?: string;
  switchHref: string;
  switchLabel: string;
}

export function AuthForm({
  mode,
  role,
  nextPath,
  showGoogle = false,
  showStudioFields = false,
  title,
  subtitle,
  switchHref,
  switchLabel,
}: AuthFormProps) {
  const [error, setError] = useState<string | undefined>();
  const action = mode === "login" ? signIn : signUp;

  async function handleSubmit(formData: FormData) {
    setError(undefined);
    const result = await action(formData);
    if (result?.error) setError(result.error);
  }

  async function handleGoogleSubmit(formData: FormData) {
    setError(undefined);
    const result = await signInWithGoogle(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error messages */}
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Google OAuth */}
        {showGoogle && (
          <>
            <form action={handleGoogleSubmit}>
              <input type="hidden" name="role" value={role} />
              {nextPath && <input type="hidden" name="next" value={nextPath} />}
              <Button type="submit" variant="outline" className="w-full gap-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>
          </>
        )}

        {/* Email + Password form */}
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="role" value={role} />
          {nextPath && <input type="hidden" name="next" value={nextPath} />}

          {mode === "signup" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First name</Label>
                  <Input id="first_name" name="first_name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last name</Label>
                  <Input id="last_name" name="last_name" required />
                </div>
              </div>

              {showStudioFields && (
                <div className="space-y-2">
                  <Label htmlFor="studio_name">Studio name</Label>
                  <Input
                    id="studio_name"
                    name="studio_name"
                    required
                    placeholder="e.g. Studio Medico Rossi"
                  />
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          <SubmitButton
            label={mode === "login" ? "Sign in" : "Create account"}
            pendingLabel={mode === "login" ? "Signing in..." : "Creating account..."}
          />
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <a href={switchHref} className="font-medium text-primary hover:underline">
            {switchLabel}
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
