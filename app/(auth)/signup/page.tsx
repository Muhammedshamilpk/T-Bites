"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/actions/auth.actions";
import type { AuthFormState } from "@/actions/auth.actions";
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, Store, ShoppingBag } from "lucide-react";
import { useState } from "react";

export default function SignupPage() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    signup,
    undefined
  );
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("customer");

  return (
    <div>
      {/* Mobile branding */}
      <div className="lg:hidden mb-8">
        <Link href="/" className="text-2xl font-bold text-primary">
          T-Bites
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create an account</h1>
        <p className="text-foreground-muted mt-2">
          Join T-Bites to start ordering food from top local kitchens
        </p>
      </div>

      {/* Message / Error */}
      {state?.message && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm border ${
            state.message.includes("Account created")
              ? "bg-success/10 border-success/20 text-success"
              : "bg-error/10 border-error/20 text-error"
          }`}
        >
          {typeof state.message === "string" && state.message !== "{}"
            ? state.message
            : "Please check your input details and try again."}
        </div>
      )}

      <form action={action} className="space-y-5">
        <input type="hidden" name="role" value="customer" />

        {/* Full Name */}
        <div>
          <label
            htmlFor="full_name"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Full name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              required
              placeholder="John Doe"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-medium"
            />
          </div>
          {state?.errors?.full_name && (
            <p className="mt-1.5 text-sm text-error">
              {state.errors.full_name[0]}
            </p>
          )}
        </div>

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
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-medium"
            />
          </div>
          {state?.errors?.email && (
            <p className="mt-1.5 text-sm text-error">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Phone number
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              placeholder="9876543210"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-medium"
            />
          </div>
          {state?.errors?.phone && (
            <p className="mt-1.5 text-sm text-error">{state.errors.phone[0]}</p>
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
              autoComplete="new-password"
              required
              placeholder="At least 6 characters"
              className="w-full pl-11 pr-12 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-medium"
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
          {pending ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-foreground-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
