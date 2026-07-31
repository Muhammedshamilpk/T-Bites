"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/domain.types";

/**
 * Hook to get the current user's profile with reactive auth state.
 * Uses the browser Supabase client — for Client Components only.
 */
export function useCurrentProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setLoading(false);
    }

    fetchProfile();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          setProfile(null);
        } else {
          fetchProfile();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { profile, loading };
}
