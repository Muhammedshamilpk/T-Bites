"use client";

import { useActionState, useState, useRef } from "react";
import Link from "next/link";
import { login } from "@/actions/auth.actions";
import type { AuthFormState } from "@/actions/auth.actions";
import { Mail, Lock, Eye, EyeOff, Loader2, UserCheck, Store, Shield, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    login,
    undefined
  );
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  const handleDemoPreset = (email: string, pass: string) => {
    setEmailInput(email);
    setPasswordInput(pass);
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    }, 50);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Mobile branding */}
      <div className="lg:hidden mb-6">
        <Link href="/" className="text-2xl font-black tracking-tight text-primary">
          T-Bites
        </Link>
      </div>

      <div className="mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Unified Login Portal
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Sign In to T-Bites</h1>
        <p className="text-sm text-foreground-muted leading-relaxed">
          Sign in below. Customers are routed to the <strong>Storefront</strong>, Restaurant Owners to the <strong>Kitchen Dashboard</strong>, and Super Admins to the <strong>Admin Portal</strong>.
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

      {/* Main Login Form */}
      <form ref={formRef} action={action} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
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
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
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
          {pending ? "Authenticating..." : "Sign In"}
        </button>
      </form>

      {/* Quick Demo Logins Section */}
      <div className="mt-8 pt-6 border-t border-border space-y-3">
        <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider text-center">
          ⚡ Quick 1-Click Role Login Demo
        </p>
        <div className="grid grid-cols-3 gap-2">
          {/* Customer */}
          <button
            type="button"
            onClick={() => handleDemoPreset("customer@example.com", "Password123!")}
            className="p-2.5 rounded-xl bg-surface border border-border hover:border-primary/50 text-foreground transition-all flex flex-col items-center gap-1 group text-center"
          >
            <UserCheck className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-extrabold block">Customer</span>
            <span className="text-[9px] text-foreground-muted">Goes to Store</span>
          </button>

          {/* Restaurant Owner */}
          <button
            type="button"
            onClick={() => handleDemoPreset("owner@restaurant.com", "OwnerSecret123!")}
            className="p-2.5 rounded-xl bg-surface border border-border hover:border-orange-500/50 text-foreground transition-all flex flex-col items-center gap-1 group text-center"
          >
            <Store className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-extrabold block">Owner</span>
            <span className="text-[9px] text-foreground-muted">Goes to Kitchen</span>
          </button>

          {/* Super Admin */}
          <button
            type="button"
            onClick={() => handleDemoPreset("superadmin@tbites.com", "SuperAdminSecret123!")}
            className="p-2.5 rounded-xl bg-surface border border-border hover:border-purple-500/50 text-foreground transition-all flex flex-col items-center gap-1 group text-center"
          >
            <Shield className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-extrabold block">Super Admin</span>
            <span className="text-[9px] text-foreground-muted">Goes to Admin</span>
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-foreground-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-bold text-primary hover:underline transition-all">
          Create Customer Account
        </Link>
      </p>
    </div>
  );
}
