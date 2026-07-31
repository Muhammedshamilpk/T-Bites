"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Bell, ShoppingBag, ArrowRight } from "lucide-react";

interface Props {
  restaurantId: string;
}

export function LiveOwnerOrderNotifier({ restaurantId }: Props) {
  const router = useRouter();
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play audio chime alert when a new order arrives
  const playAlertSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Play 2-tone pleasant chime (880Hz -> 1046Hz)
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.setValueAtTime(1046, now + 0.15);

      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.6);
    } catch (err) {
      console.warn("Audio chime play error:", err);
    }
  };

  useEffect(() => {
    if (!restaurantId) return;

    const supabase = createClient();

    // Subscribe to realtime orders table for this restaurant
    const channel = supabase
      .channel(`owner-orders-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          const newOrder = payload.new as any;

          // Play sound
          playAlertSound();

          // Display visual order notification toast
          toast.success(`🔔 NEW ORDER RECEIVED! Order #${(newOrder.id || "").slice(0, 8)} • Total: ₹${newOrder.total || 0}`);

          // Refresh current page data live
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, router]);

  return null;
}
