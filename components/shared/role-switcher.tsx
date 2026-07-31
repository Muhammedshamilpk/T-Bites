"use client";

import { useTransition } from "react";
import { switchRoleAction } from "@/actions/auth.actions";
import { User, Store, Shield, Loader2 } from "lucide-react";

interface Props {
  currentRole?: string;
}

export function RoleSwitcher({ currentRole = "customer" }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleRoleSwitch = (role: "customer" | "restaurant_owner" | "admin") => {
    startTransition(async () => {
      await switchRoleAction(role);
    });
  };

  const roles = [
    {
      key: "customer" as const,
      label: "Customer View",
      icon: <User className="w-3.5 h-3.5" />,
      activeClass: "bg-primary text-white shadow-xs",
    },
    {
      key: "restaurant_owner" as const,
      label: "Owner Dashboard",
      icon: <Store className="w-3.5 h-3.5" />,
      activeClass: "bg-emerald-600 text-white shadow-xs",
    },
    {
      key: "admin" as const,
      label: "Admin Portal",
      icon: <Shield className="w-3.5 h-3.5" />,
      activeClass: "bg-purple-600 text-white shadow-xs",
    },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-background/95 backdrop-blur-xl border border-border p-1.5 rounded-full shadow-2xl flex items-center gap-1.5">
      <span className="text-[11px] font-bold text-foreground-muted px-2.5 uppercase tracking-wider hidden sm:inline">
        RBAC Switch:
      </span>

      {isPending ? (
        <div className="px-4 py-1.5 flex items-center gap-2 text-xs font-semibold text-foreground-muted">
          <Loader2 className="w-4 h-4 animate-spin text-primary" /> Switching view...
        </div>
      ) : (
        roles.map((r) => (
          <button
            key={r.key}
            onClick={() => handleRoleSwitch(r.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
              currentRole === r.key
                ? r.activeClass
                : "text-foreground-muted hover:text-foreground hover:bg-surface"
            }`}
          >
            {r.icon}
            <span>{r.label}</span>
          </button>
        ))
      )}
    </div>
  );
}
