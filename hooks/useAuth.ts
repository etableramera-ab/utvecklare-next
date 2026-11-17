'use client'
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User, Session, AuthError } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    setSession(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setSession(session);
        setUser(session?.user ?? null);
        setError(null);
      } else if (event === 'SIGNED_OUT') {
        clearSession();
        setError(null);
      }

      setLoading(false);
    });

    // Initial session check with error handling
    const initSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (!mounted) return;

        if (sessionError) {
          console.warn('Session error:', sessionError.message);
          // Clear invalid session
          if (sessionError.message.includes('refresh') || sessionError.message.includes('expired') || sessionError.message.includes('invalid')) {
            await supabase.auth.signOut();
            clearSession();
          }
          setError(sessionError.message);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (err) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : 'Unknown auth error';
        console.warn('Auth init error:', message);
        setError(message);
        clearSession();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [clearSession]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      clearSession();
    } catch (err) {
      console.warn('Sign out error:', err);
      clearSession();
    }
  };

  return { user, session, loading, error, signOut };
};
