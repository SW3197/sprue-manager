/* Contient l'état global de l'application : 
figurines, sessions de peinture, dépenses,
objectifs.
*/

export const state = {
    miniatures: [],
    expenses: [],
    paintingSessions: [],
    filters: {
        game: "all",
        status: "all"
    }
};