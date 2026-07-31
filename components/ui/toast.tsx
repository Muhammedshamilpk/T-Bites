"use client";

import React from "react";
import { useToastStore, ToastMessage } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { clsx } from "clsx";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onClose,
}: {
  toast: ToastMessage;
  onClose: () => void;
}) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
  };

  const borderColors = {
    success: "border-emerald-500/30 bg-emerald-500/5",
    error: "border-rose-500/30 bg-rose-500/5",
    info: "border-sky-500/30 bg-sky-500/5",
    warning: "border-amber-500/30 bg-amber-500/5",
  };

  const type = toast.type || "info";

  return (
    <div
      className={clsx(
        "pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5",
        "bg-background/95 text-foreground",
        borderColors[type]
      )}
    >
      {icons[type]}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-sm font-semibold leading-snug">{toast.title}</h4>
        )}
        <p className="text-xs text-foreground/80 leading-relaxed break-words">
          {toast.description}
        </p>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-foreground-muted hover:text-foreground hover:bg-foreground/10 transition-all shrink-0"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
