import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { supabase, hasSupabase } from '../lib/supabase';

const AuthContext = createContext(null);

function fallbackProfile(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.user_metadata?.username || user.email?.split('@')[0] || 'usuário',
    email: user.email || '',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(hasSupabase);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }

    let alive = true;

    const syncProfile = async (session) => {
      if (!session?.user) {
        if (alive) {
          setUser(null);
          setChecking(false);
        }
        return;
      }

      try {
        const profile = await api.getCurrentProfile();
        if (!alive) return;
        setUser(profile || fallbackProfile(session.user));
      } catch {
        if (!alive) return;
        setUser(fallbackProfile(session.user));
      } finally {
        if (alive) setChecking(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      syncProfile(data.session);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      syncProfile(session);
    });

    return () => {
      alive = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  // =========================
  // LOGIN
  // =========================
  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const profile = await api.getCurrentProfile();
    if (profile) setUser(profile);

    return true;
  }

  // =========================
  // REGISTER (CORRIGIDO)
  // =========================
  async function register(email, password, username) {
    // cria usuário
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (signUpError) throw signUpError;

    // 🔥 FORÇA LOGIN (ESSA É A CORREÇÃO PRINCIPAL)
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) throw loginError;

    // agora sim pode buscar perfil
    const profile = await api.getCurrentProfile();
    if (profile) {
      setUser(profile);
    }

    return true;
  }

  // =========================
  // LOGOUT
  // =========================
  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      checking,
      isLoggedIn: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, checking]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}