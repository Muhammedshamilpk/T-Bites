"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/actions/auth.actions";
import type { AuthFormState } from "@/actions/auth.actions";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    login,
    undefined
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {/* Mobile branding */}
      <div className="lg:hidden mb-8">
        <Link
          href="/"
          className="text-2xl font-bold text-primary"
        >
          T-Bites
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
        <p className="text-foreground-muted mt-2">
          Sign in to your account to continue
        </p>
      </div>

      {/* Error message */}
      {state?.message && !state?.errors && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
          {typeof state.message === "string" && state.message !== "{}"
            ? state.message
            : "Invalid email or password."}
        </div>
      )}

      <form action={action} className="space-y-5">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          {state?.errors?.email && (
            <p className="mt-1.5 text-sm text-error">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full pl-11 pr-12 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {state?.errors?.password && (
            <p className="mt-1.5 text-sm text-error">
              {state.errors.password[0]}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={pending}
          className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-base shadow-lg shadow-primary/25 hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {pending && <Loader2 className="w-5 h-5 animate-spin" />}
          {pending ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-foreground-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
