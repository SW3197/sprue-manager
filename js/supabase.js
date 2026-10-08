import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://xprbfqfeoaczysymrhhs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_h7W2pDuIfIY2qog4n4JBaA_seyD_oCB";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export async function testSupabaseConnection() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Erreur Supabase :", error);
    return;
  }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Erreur de connexion :", error.message);
    return null;
  }

  return data.user;
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.href,
    },
  });

  if (error) {
    console.error("Erreur de création de compte :", error.message);
    return null;
  }

  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Erreur de déconnexion :", error.message);
    return false;
  }

  return true;
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.href,
  });

  if (error) {
    console.error("Erreur lors de la demande de réinitialisation :", error);
    throw error;
  }
}

export async function updatePassword(password) {
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    console.error("Erreur lors de la modification du mot de passe :", error);
    throw error;
  }
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}