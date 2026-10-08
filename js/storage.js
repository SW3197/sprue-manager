/* Gère uniquement le stockage des données.
Pour l'instant en localStorage, plus tard
à revoir pour un accès sur plusieurs appareils.
*/

import { state } from "./state.js";
import { supabase } from "./supabase.js";

const STORAGE_KEY = "sprue-manager-state";

export function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  saveStateToCloud();
}

export function loadState() {
  const savedState = localStorage.getItem(STORAGE_KEY);

  if (!savedState) return;

  const parsedState = JSON.parse(savedState);

  state.miniatures = parsedState.miniatures || [];

  state.expenses = parsedState.expenses || [];

  state.paintingSessions = parsedState.paintingSessions || [];

  state.filters = parsedState.filters || {
    game: "all",
    status: "all",
  };
}

export async function saveStateToCloud() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return;
  }

  const cloudState = {
    miniatures: state.miniatures,
    expenses: state.expenses,
    paintingSessions: state.paintingSessions,
  };

  const { error } = await supabase.from("app_state").upsert({
    user_id: user.id,
    data: cloudState,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Erreur de sauvegarde cloud :", error);
    return;
  }
}

export async function loadStateFromCloud() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return "error";
  }

  const { data, error } = await supabase
    .from("app_state")
    .select("data, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Erreur de chargement cloud :", error);
    return "error";
  }

  if (!data) {
    return "empty";
  }

  const cloudState = data.data;

  state.miniatures = cloudState.miniatures ?? [];
  state.expenses = cloudState.expenses ?? [];
  state.paintingSessions = cloudState.paintingSessions ?? [];

  // On met aussi à jour la sauvegarde locale.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  return "loaded";
}

export function clearLocalState() {
  localStorage.removeItem(STORAGE_KEY);

  state.miniatures = [];
  state.expenses = [];
  state.paintingSessions = [];
}