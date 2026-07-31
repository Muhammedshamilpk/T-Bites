"use client";

import { useTransition } from "react";
import { deleteRestaurantSanityAction } from "@/actions/admin.actions";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  restaurantId: string;
  restaurantName: string;
}

export function AdminDeleteRestaurantButton({ restaurantId, restaurantName }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete "${restaurantName}"? This action will remove the restaurant and its owner account from Sanity CMS.`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteRestaurantSanityAction(restaurantId);
      if (res.success) {
        toast.success(`"${restaurantName}" deleted successfully!`);
      } else {
        toast.error(res.error || "Failed to delete restaurant.");
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-xs font-extrabold flex items-center gap-1.5 disabled:opacity-50"
      title="Delete Restaurant"
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
      <span>Delete</span>
    </button>
  );
}
