"use client";

import { useActionState, useState } from "react";
import { login } from "@/actions/auth.actions";
import type { AuthFormState } from "@/actions/auth.actions";
import { Shield, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    login,
    undefined
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#111116] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#18181f] rounded-3xl border border-white/10 p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center text-2xl mx-auto shadow-inner">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Super Admin Portal</h1>
          <p className="text-xs text-neutral-400 font-medium">
            Platform administration & partner management system
          </p>
        </div>

        {/* Error Notification */}
        {state?.message && !state?.errors && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center">
            {typeof state.message === "string" && state.message !== "{}"
              ? state.message
              : "Invalid Super Admin credentials."}
          </div>
        )}

        {/* Form */}
        <form action={action} className="space-y-4">
          <input type="hidden" name="admin_portal" value="true" />

          {/* Email */}
          <div>
            <label className="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">
              Super Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                name="email"
                type="email"
                required
                suppressHydrationWarning
                defaultValue="superadmin@tbites.com"
                placeholder="superadmin@tbites.com"
                className="w-full pl-10 pr-4 py-3 bg-[#21212a] border border-white/10 rounded-xl text-sm font-semibold text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                suppressHydrationWarning
                defaultValue="SuperAdminSecret123!"
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 bg-[#21212a] border border-white/10 rounded-xl text-sm font-semibold text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                suppressHydrationWarning
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={pending}
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {pending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
              </>
            ) : (
              "Sign In to Admin Portal"
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="pt-2 text-center border-t border-white/5">
          <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
            ← Return to T-Bites Home
          </Link>
        </div>
      </div>
    </div>
  );
}
