/* Contient l'état global de l'application : 
figurines, sessions de peinture, dépenses,
objectifs.
*/

export const state = {
  units: [],
  transactions: [],
  wishlist: [],
  hobbySessions: [],
  goals: [],
  events: [],

  filters: {
    game: "all",
    status: "all",
  },
};
