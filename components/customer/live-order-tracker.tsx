"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ORDER_STATUS_CONFIG } from "@/lib/utils";

interface Props {
  orderId: string;
}

export function LiveOrderTracker({ orderId }: Props) {
  const router = useRouter();
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playUpdateChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.15); // E5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (err) {
      console.warn("Audio chime error:", err);
    }
  };

  useEffect(() => {
    if (!orderId) return;

    const supabase = createClient();

    // Subscribe to realtime updates for this specific order
    const channel = supabase
      .channel(`order-track-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          const statusKey = updated.status as keyof typeof ORDER_STATUS_CONFIG;
          const statusConfig = ORDER_STATUS_CONFIG[statusKey];

          playUpdateChime();

          if (updated.status === "rejected") {
            toast.error(`🛑 Order Declined: ${updated.rejection_reason || "Item unavailable"}`);
          } else {
            toast.success(`🔔 Order Status Updated: ${statusConfig?.label || updated.status}!`);
          }

          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, router]);

  return null;
}
