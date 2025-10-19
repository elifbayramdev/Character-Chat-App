'use client';
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthProvider";

export default function EnsureUserInDb() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    async function upsertUser() {
      const { error } = await supabase.from("users").upsert({
        id: user.id,       // match auth user ID
        email: user.email, // optional: store email
      });
      if (error) console.error("Error inserting user:", error);
    }

    upsertUser();
  }, [user]);

  return null;
}
