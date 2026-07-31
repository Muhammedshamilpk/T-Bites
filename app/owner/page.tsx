"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ownerLoginAction } from "@/actions/auth.actions";
import type { AuthFormState } from "@/actions/auth.actions";
import { Mail, Lock, Store, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";

export default function OwnerPortalPage() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    ownerLoginAction,
    undefined
  );

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Branding Panel (Vibrant Red) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-red-600 via-red-600 to-red-700 text-white relative overflow-hidden">
        {/* Decorative ambient lighting */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-black/10 blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10">
          <Link href="/" className="text-3xl font-extrabold tracking-tight text-white">
            T-Bites
          </Link>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider text-white border border-white/30">
            <Store className="w-4 h-4" /> Partner Kitchen Portal
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            Store Owner Sign In
          </h1>
          <p className="text-white/90 text-lg leading-relaxed font-normal">
            Log in to manage your digital menu, accept instant customer orders, and track your kitchen business live.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-white/70 font-medium">
          © {new Date().getFullYear()} T-Bites. All rights reserved.
        </div>
      </div>

      {/* Right Column: Owner Sign In Form & Sanity.io CMS Feed */}
      <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 max-w-xl mx-auto w-full space-y-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">
            Sign In to your Account
          </h2>
          <p className="text-sm font-medium text-foreground-muted mt-1.5">
            Enter your store owner credentials below to access your kitchen dashboard.
          </p>
        </div>

        {/* Message / Error */}
        {state?.message && (
          <div className="p-4 rounded-2xl bg-error/10 border border-error/20 text-xs font-bold text-error flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{typeof state.message === "string" ? state.message : "Invalid credentials."}</span>
          </div>
        )}

        <form action={action} className="space-y-4">
          <input type="hidden" name="owner_portal" value="true" />

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">
              Owner Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                suppressHydrationWarning
                placeholder="owner@restaurant.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-medium text-sm"
              />
            </div>
            {state?.errors?.email && (
              <p className="mt-1.5 text-xs font-semibold text-error">{state.errors.email[0]}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">
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
                suppressHydrationWarning
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-medium text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                suppressHydrationWarning
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {state?.errors?.password && (
              <p className="mt-1.5 text-xs font-semibold text-error">{state.errors.password[0]}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={pending}
            className="w-full py-3.5 rounded-xl bg-primary text-white font-extrabold text-base shadow-lg shadow-primary/25 hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {pending && <Loader2 className="w-5 h-5 animate-spin" />}
            {pending ? "Signing in..." : "Sign In to Owner Dashboard"}
          </button>
        </form>

        {/* Notice Info Box: Registration is restricted to Main Admin */}
        <div className="p-4 rounded-2xl bg-surface border border-border text-xs text-foreground-muted leading-relaxed flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-foreground block mb-0.5">Need a new restaurant listed?</span>
            New restaurant onboarding and owner accounts are created exclusively by the <strong className="text-foreground">Main Admin</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}
