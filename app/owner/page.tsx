"use client";

import { useActionState, useState, useRef } from "react";
import Link from "next/link";
import { ownerLoginAction } from "@/actions/auth.actions";
import type { AuthFormState } from "@/actions/auth.actions";
import { Mail, Lock, Store, Eye, EyeOff, Loader2, ShieldAlert, Shield, ArrowRight } from "lucide-react";

export default function OwnerPortalPage() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    ownerLoginAction,
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Branding Panel (Vibrant Red & Purple Gradient) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-red-600 via-red-700 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="text-3xl font-extrabold tracking-tight text-white">
            T-Bites
          </Link>
          <span className="text-xs px-3 py-1 rounded-full bg-white/15 border border-white/20 font-bold uppercase tracking-wider">
            Partner & Admin Portal
          </span>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider text-white border border-white/30">
            <Store className="w-4 h-4" /> Restaurant Owners & Platform Admins
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            Partner & Admin Portal
          </h1>
          <p className="text-white/90 text-lg leading-relaxed font-normal">
            Single portal for Restaurant Owners to manage kitchen orders and Super Admins to manage platform operations.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-white/70 font-medium">
          © {new Date().getFullYear()} T-Bites. All rights reserved.
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 max-w-xl mx-auto w-full space-y-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">
            Sign In to Partner Portal
          </h2>
          <p className="text-sm font-medium text-foreground-muted mt-1.5">
            Enter your <strong>Restaurant Owner</strong> or <strong>Super Admin</strong> credentials below.
          </p>
        </div>

        {/* Error Notification */}
        {state?.message && (
          <div className="p-4 rounded-2xl bg-error/10 border border-error/20 text-xs font-bold text-error flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{typeof state.message === "string" ? state.message : "Invalid credentials."}</span>
          </div>
        )}

        <form ref={formRef} action={action} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">
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
                placeholder="owner@restaurant.com or admin@tbites.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-medium text-sm"
              />
            </div>
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
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-medium text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={pending}
            className="w-full py-3.5 rounded-xl bg-primary text-white font-extrabold text-base shadow-lg shadow-primary/25 hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {pending && <Loader2 className="w-5 h-5 animate-spin" />}
            {pending ? "Authenticating..." : "Sign In to Portal"}
          </button>
        </form>

        {/* Quick Demo Accounts for Owner & Admin */}
        <div className="pt-4 border-t border-border space-y-3">
          <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider text-center">
            ⚡ Quick 1-Click Role Login
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDemoPreset("owner@restaurant.com", "OwnerSecret123!")}
              className="p-3 rounded-xl bg-surface border border-border hover:border-orange-500/50 text-foreground transition-all flex flex-col items-center gap-1 group text-center"
            >
              <Store className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-extrabold block">Restaurant Owner</span>
              <span className="text-[10px] text-foreground-muted">Goes to Kitchen Dashboard (/dashboard)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoPreset("superadmin@tbites.com", "SuperAdminSecret123!")}
              className="p-3 rounded-xl bg-surface border border-border hover:border-purple-500/50 text-foreground transition-all flex flex-col items-center gap-1 group text-center"
            >
              <Shield className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-extrabold block">Super Admin</span>
              <span className="text-[10px] text-foreground-muted">Goes to Admin Portal (/admin)</span>
            </button>
          </div>
        </div>

        {/* Switch to Customer Login */}
        <div className="p-4 rounded-2xl bg-surface border border-border text-xs text-foreground-muted flex items-center justify-between">
          <span>Looking to order food as a Customer?</span>
          <Link href="/login" className="font-extrabold text-primary hover:underline flex items-center gap-1 shrink-0">
            Customer Login <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
