/* Gère uniquement le stockage des données.
Pour l'instant en localStorage, plus tard
à revoir pour un accès sur plusieurs appareils.
*/

import { state } from "./state.js";
import { supabase } from "./supabase.js";

const STORAGE_KEY = "sprue-manager-state";

let cloudSaveQueue = Promise.resolve();

export function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  cloudSaveQueue = cloudSaveQueue
    .catch((error) => {
      console.error("Erreur de sauvegarde précédente :", error);
    })
    .then(() => saveStateToCloud());
}

export function loadState() {
  const savedState = localStorage.getItem(STORAGE_KEY);

  if (!savedState) return;

  const parsedState = JSON.parse(savedState);

  state.units = parsedState.units ?? [];
  state.purchases = parsedState.purchases ?? [];
  state.wishlist = parsedState.wishlist ?? [];
  state.hobbySessions = parsedState.hobbySessions ?? [];
  state.goals = parsedState.goals ?? [];
  state.events = parsedState.events ?? [];

  state.filters = parsedState.filters ?? {
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
    units: state.units,
    purchases: state.purchases,
    wishlist: state.wishlist,
    hobbySessions: state.hobbySessions,
    goals: state.goals,
    events: state.events,
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

  state.units = cloudState.units ?? [];
  state.purchases = cloudState.purchases ?? [];
  state.wishlist = cloudState.wishlist ?? [];
  state.hobbySessions = cloudState.hobbySessions ?? [];
  state.goals = cloudState.goals ?? [];
  state.events = cloudState.events ?? [];

  // On met aussi à jour la sauvegarde locale.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  return "loaded";
}

export function clearLocalState() {
  localStorage.removeItem(STORAGE_KEY);

  state.units = [];
  state.purchases = [];
  state.wishlist = [];
  state.hobbySessions = [];
  state.goals = [];
  state.events = [];
}
