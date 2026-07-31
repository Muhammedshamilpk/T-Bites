"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { login } from "@/actions/auth.actions";
import type { AuthFormState } from "@/actions/auth.actions";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    login,
    undefined
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Mobile branding */}
      <div className="lg:hidden mb-6">
        <Link href="/" className="text-2xl font-black tracking-tight text-primary">
          T-Bites
        </Link>
      </div>

      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Customer Sign In</h1>
        <p className="text-sm text-foreground-muted leading-relaxed">
          Sign in to your account to browse gourmet menus, place orders, and track deliveries in real time.
        </p>
      </div>

      {/* Error message */}
      {state?.message && !state?.errors && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-medium">
          {typeof state.message === "string" && state.message !== "{}"
            ? state.message
            : "Invalid email or password."}
        </div>
      )}

      {/* Customer Login Form */}
      <form action={action} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
            Customer Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface text-foreground text-sm font-medium placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          {state?.errors?.email && (
            <p className="mt-1.5 text-xs text-error font-medium">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-border bg-surface text-foreground text-sm font-medium placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {state?.errors?.password && (
            <p className="mt-1.5 text-xs text-error font-medium">{state.errors.password[0]}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={pending}
          className="w-full py-3.5 rounded-xl bg-primary text-white font-extrabold text-sm shadow-lg shadow-primary/25 hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {pending && <Loader2 className="w-4 h-4 animate-spin" />}
          {pending ? "Signing in..." : "Sign In to Customer Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-foreground-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-bold text-primary hover:underline transition-all">
          Create Customer Account
        </Link>
      </p>
    </div>
  );
}
