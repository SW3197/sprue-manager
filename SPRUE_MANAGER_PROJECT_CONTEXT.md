# Sprue Manager — Dossier de contexte pour Codex

**État des connaissances : 26 octobre 2026.**  
**Nature du document :** synthèse des décisions de conception et des échanges ChatGPT. Ce document **n'est pas un audit du code actuel** : en cas de divergence sur les noms de fonctions, fichiers ou comportements, examiner le dépôt et demander confirmation avant de modifier.

## 1. Objet du projet

Sprue Manager est une application web personnelle de gestion du hobby des figurines : collection, dépenses, sessions de peinture et, à terme, wishlist, coffrets, objectifs et statistiques. L'utilisateur développe lui-même l'application pour apprendre et comprendre ses choix techniques. Il n'est pas développeur professionnel.

- Dépôt : https://github.com/SW3197/sprue-manager
- Version publiée : https://sw3197.github.io/sprue-manager/
- Branche `main` : **V1 stable**, publiée via GitHub Pages.
- Tag `v1.0.0` créé le 15 octobre 2026.
- Branche `develop` : **développement de la V2**.
- Le dépôt GitHub constitue la source de vérité pour l'implémentation, pas cette synthèse.

## 2. Stack et contraintes techniques

- HTML, CSS et JavaScript **natif**, avec modules ES.
- Pas de React, framework frontend, Node/npm ou système de build prévu.
- Développement dans VS Code, tests locaux avec Live Server.
- Git/GitHub pour le versionnement ; GitHub Pages pour la publication.
- Supabase pour l'authentification et la persistance distante.
- Application pensée pour plusieurs appareils, y compris mobile.
- Privilégier des modifications localisées, compatibles avec l'architecture existante. **Ne pas proposer une refonte de stack par défaut.**

## 3. Méthode de collaboration obligatoire

1. Avant de coder, reformuler le besoin et identifier les fichiers/fonctions concernés.
2. Expliquer brièvement les choix techniques, leurs effets sur les données et leurs risques.
3. Avancer **une étape à la fois** ; demander la validation de l'utilisateur avant de poursuivre.
4. Éviter les refontes, abstractions ou dépendances inutiles.
5. Ne pas faire de modifications importantes ou destructrices sans accord explicite.
6. Fournir des explications compréhensibles : l'utilisateur veut apprendre, pas seulement obtenir du code.
7. Tester les parcours concernés et signaler ce qui n'a pas pu être vérifié.
8. Distinguer explicitement les décisions **validées**, les **pistes** et les **questions ouvertes**.
9. Ne jamais modifier `main` ni la base de production V1 sans autorisation explicite.
10. Pour toute intervention Codex : commencer par inspecter la branche active et l'état Git, puis proposer un plan limité avant toute édition.

## 4. V1 — Fonctionnalités réalisées

### 4.1 État applicatif

Modèle initial (à confirmer dans le code actuel) :

```js
{
  miniatures: [],
  expenses: [],
  paintingSessions: [],
  filters: { game: "all", status: "all" }
}
```

Les données étaient initialement enregistrées en `localStorage`, puis synchronisées avec Supabase. Le modèle V1 reste volontairement simple.

### 4.2 Collection

- Ajout, consultation et suppression de figurines (CRUD selon les fonctionnalités effectivement exposées).
- Statuts : `boxed`, `assembled`, `primed`, `painted`.
- Filtres par jeu et par statut.
- Formulaire d'ajout dans un drawer.
- Sélecteurs et affichage mis à jour avec l'état.
- Vue Collection distincte de l'accueil.

### 4.3 Budget

- Saisie des dépenses de figurines et de matériel hobby.
- Total cumulé affiché sur une carte de l'accueil.
- Drawer élargi : formulaire, historique et suppression de dépenses.
- Certaines idées de tri avaient été envisagées ; vérifier leur état dans le dépôt.

### 4.4 Ratio de peinture

- Carte de synthèse peintes / possédées.
- Modal de détail.
- Navigation vers la Collection avec filtre des figurines peintes.

### 4.5 Sessions de peinture

- Carte affichant le temps total cumulé.
- Drawer élargi contenant le total, le formulaire de session (date, durée, note), la liste chronologique et la suppression.
- Défilement du drawer géré.
- Des statistiques plus détaillées sont envisagées pour la V2.

### 4.6 Interface

- Accueil / Collection, cartes interactives, drawers et modals.
- Overlay, fermeture par clic extérieur lorsque prévue, touche Échap.
- Mise en forme responsive et tests sur viewport mobile.
- CSS réorganisé en fichiers thématiques (notamment `auth.css`, `drawers.css`, `modals.css`, et feuilles de base/composants/layout) ; vérifier l'arborescence exacte.
- Nettoyage des logs de développement, conservation de `console.error`.
- README ajouté avant la publication V1.

## 5. Supabase, authentification et synchronisation V1

### 5.1 Stockage

Table `app_state` :

- `user_id` : UUID, clé primaire et clé étrangère vers l'utilisateur authentifié.
- `data` : `jsonb` contenant l'état applicatif.
- `updated_at` : `timestamptz`.
- RLS : l'utilisateur authentifié ne peut sélectionner, insérer et mettre à jour que son propre état.
- Permissions `SELECT`, `INSERT`, `UPDATE` accordées au rôle `authenticated` selon la configuration réalisée.

Fonctions connues : `saveStateToCloud`, `loadStateFromCloud`, `clearLocalState` (vérifier signatures et emplacements).

Stratégie de première connexion : si le cloud ne contient pas encore d'état, envoyer les données locales. La synchronisation entre appareils a été testée avec succès. À la déconnexion, les données locales utilisateur sont nettoyées.

### 5.2 Authentification

Parcours V1 réalisés :

- Mode visiteur avec avertissement.
- Connexion et déconnexion.
- Inscription email / mot de passe et confirmation par email.
- Mot de passe oublié et email de réinitialisation.
- Lien de réinitialisation menant à une modal de nouveau mot de passe non fermable pendant l'opération ; vérification de confirmation et gestion d'erreurs.
- Événements Supabase `onAuthStateChange`, dont `INITIAL_SESSION`, `SIGNED_IN` et `SIGNED_OUT`.
- SMTP Gmail configuré pour l'envoi des emails d'authentification.

**Déjà traité en V2 :** l'écran « confirmation email en attente » a été harmonisé avec les autres écrans d'authentification. **Ne pas le remettre dans les tâches en attente.**

**À investiguer :** ouverture du lien de confirmation d'inscription sur un autre appareil que celui utilisé pour s'inscrire : session, redirection et onboarding.

## 6. Organisation Git et déploiement

- `main` reste la référence stable V1 ; GitHub Pages publie la version stable.
- `develop` accueille les travaux V2.
- L'utilisateur travaille depuis plusieurs ordinateurs et synchronise fréquemment.
- Début de session habituel : `git status`, `git fetch`, `git pull` (en vérifiant la branche).
- Fin de session : `git add .`, `git commit -m "..."`, `git push`.
- Ne pas fusionner `develop` vers `main`, changer la configuration Pages, pousser ou créer de tag sans demande explicite.

## 7. V2 — Principes de conception

- Clarifier le **modèle métier** avant de modifier profondément le `state` ou la base de données.
- Conserver la V1 stable et ses données.
- L'utilisation d'un environnement / d'une base Supabase distincte pour V2 a été retenue comme principe de protection ; **vérifier si elle a effectivement été créée et configurée**.
- Ne pas présumer que le modèle V2 a déjà été implémenté.
- Séparer les objets conceptuels : produit souhaité, achat/dépense, coffret, figurine possédée, session hobby, objectif.
- Le développement de la **vue Wishlist** a commencé ou est en préparation sur `develop` : inspecter le dépôt pour déterminer exactement l'avancement.

## 8. V2 — Wishlist, coffrets, collection et budget

### 8.1 Décisions validées

**Wishlist : produits que l'on souhaite acheter.**

- Vue **distincte** de la Collection.
- Accueille figurines et matériel hobby.
- Filtres envisagés/validés au niveau fonctionnel : « Tous les souhaits », « Figurines souhaitées », « Matériel souhaité ».
- Une carte par **produit / coffret** dans la Wishlist, et non une carte par figurine contenue dans le coffret.
- Formulaire d'ajout commun distinguant **figurine seule** et **coffret**.
- La composition d'un coffret est **facultative dans la Wishlist**.

**Collection : figurines réellement possédées.**

- Une carte par **figurine**, y compris lorsque plusieurs figurines proviennent d'un même coffret.
- Les factions sont propres à chaque jeu ; permettre à l'utilisateur d'en créer librement.
- Une fiche de détail de figurine est envisagée : date d'achat, historique hobby, photos.

**Budget : achats et dépenses.**

- Un coffret acheté doit produire **une seule dépense**, correspondant au produit acheté, même s'il contient plusieurs figurines.
- Le Budget représente l'achat du coffret ; la Collection représente ses figurines individuelles.

**Transfert Wishlist → Collection :**

- Parcours rapide de validation de l'achat.
- Demander si le prix effectivement payé correspond au prix prévu, avec possibilité de correction.
- Demander si la date d'achat est aujourd'hui ou une autre date.
- Pour un coffret, **composition obligatoire au moment de l'intégration à la Collection** (afin de générer les figurines individuelles).
- Créer les entrées correspondantes sans dupliquer la dépense.

### 8.2 Points à arbitrer avant implémentation profonde

- Structure précise des identifiants et relations entre produit/coffret, dépense et figurines.
- Gestion de la suppression d'une figurine issue d'un coffret : ne pas présumer que cela supprime ou modifie la dépense historique.
- Gestion des quantités, doublons et éventuelles figurines identiques dans un coffret.
- Répartition éventuelle d'un coût de coffret entre figurines : **non décidée**.
- Comportement exact pour l'achat de matériel hobby depuis la Wishlist.
- Modèle de données définitif et migration V1 → V2.

## 9. V2 — Sessions hobby

Évolution de la notion V1 « session de peinture » vers des **sessions hobby** :

- Catégories envisagées : assemblage, sous-couche, peinture.
- Association possible d'une session à une ou plusieurs figurines (cardinalité exacte à décider).
- Suivi du temps cumulé par activité, avec récapitulatif hebdomadaire.
- Possibilité d'objectifs de temps par activité.
- Lorsqu'une session correspond à une progression, proposer une mise à jour du statut de la figurine, sans présumer qu'une session implique automatiquement un changement de statut.
- Besoin d'affiner la conception : ne pas implémenter mécaniquement tous ces points sans valider les parcours utilisateurs.

## 10. V2 — Objectifs et tableau de bord

Types d'objectifs discutés :

- Assembler ou peindre un nombre défini de figurines.
- Peindre pendant X jours consécutifs.
- Respecter un plafond de dépenses sur une période.
- Atteindre un volume de temps hobby ou un rythme hebdomadaire.
- Présenter visuellement la progression et rendre les cartes de dashboard interactives.

**Événements :** possibilité d'enregistrer un événement futur (date et détails éventuels) et de proposer de lui associer un objectif hobby, par exemple finir certaines figurines avant cet événement. Afficher progression et temps restant selon la conception retenue.

Le catalogue final des objectifs, leur calcul et leurs relations au `state` ne sont pas encore définitivement arbitrés.

## 11. Autres idées et backlog

- Mode visiteur potentiellement limité avant création d'un compte : règles exactes à définir.
- Statistiques hobby / peinture plus riches.
- Photos et historique des figurines.
- Gestion de factions par jeu, avec créations personnalisées.
- Multi-utilisateurs / fonctionnalités partagées : **plus tard**, pas une priorité immédiate.
- Confirmation d'inscription sur un autre appareil : scénario à tester et corriger si nécessaire.
- Écran d'attente de confirmation email : **terminé**, ne pas replanifier.

## 12. Ce que Codex doit vérifier dans le dépôt

Avant toute proposition de code :

1. Branche active, état Git, derniers commits pertinents.
2. Arborescence des fichiers et points d'entrée JS.
3. Structure réelle du `state`, stockage local et cloud, mécanismes de rendu.
4. Composants de formulaire, modals, drawers et navigation existants.
5. État réel de la Wishlist sur `develop` : ce qui fonctionne déjà, ce qui manque.
6. Configuration Supabase V2 et séparation effective avec la production.
7. Éventuels tests ou procédures manuelles existantes.

Ne pas déduire l'état du code à partir des seules conversations.

## 13. Consigne de démarrage recommandée pour Codex

> Lis `SPRUE_MANAGER_PROJECT_CONTEXT.md` et examine le dépôt sur la branche `develop`. Pour l'instant, ne modifie aucun fichier. Présente-moi : (1) l'architecture constatée, (2) les fonctionnalités Wishlist déjà présentes, (3) les écarts entre le code et les décisions du document, (4) la plus petite prochaine étape de développement. Explique tes constats simplement et attends mon accord avant de coder. Ne touche pas à `main` ni à la production Supabase.

---

**Limite de cette synthèse :** elle reconstitue les décisions importantes accessibles dans les échanges et le contexte du projet. Elle n'atteste ni de l'état actuel du dépôt ni de la présence de tous les fichiers, et ne remplace pas la lecture du code. Les idées discutées sans arbitrage final sont explicitement signalées.
