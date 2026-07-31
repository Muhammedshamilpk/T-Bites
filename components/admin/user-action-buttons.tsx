"use client";

import { useTransition } from "react";
import {
  deactivateUserAction,
  reactivateUserAction,
} from "@/actions/admin.actions";
import { Loader2, UserX, UserCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  userId: string;
  isActive: boolean;
}

export function UserActionButtons({ userId, isActive }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = isActive
        ? await deactivateUserAction(userId)
        : await reactivateUserAction(userId);

      if (res.success) {
        toast.success(isActive ? "User deactivated successfully" : "User reactivated successfully");
      } else {
        toast.error(res.error || "Failed to update user status");
      }
    });
  };

  if (isPending) {
    return (
      <Loader2 className="w-4 h-4 animate-spin text-foreground-muted" />
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
        isActive
          ? "border border-error/30 text-error hover:bg-error/10"
          : "border border-success/30 text-success hover:bg-success/10"
      }`}
    >
      {isActive ? (
        <>
          <UserX className="w-3.5 h-3.5" /> Deactivate
        </>
      ) : (
        <>
          <UserCheck className="w-3.5 h-3.5" /> Reactivate
        </>
      )}
    </button>
  );
}
