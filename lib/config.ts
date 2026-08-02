// ============================================================================
// Règles de qualification du courtier — St Louis Hallé
// ----------------------------------------------------------------------------
// Ces valeurs contrôlent QUELS profils sont transmis au CRM. Le brief client
// (Partie 1 · Section H) n'a pas été rempli : ce sont les valeurs par défaut
// recommandées. À ajuster avec le courtier avant la mise en production.
// ============================================================================

// Budget minimal souhaité (null = aucun minimum).
export const MIN_BUDGET: number | null = null;

// Fenêtre « prioritaire » en jours (indicatif — le scoring utilise le timeline).
export const PRIORITY_TIMELINE_DAYS = 90;

// Transmettre au CRM les personnes NON préqualifiées (financement pas commencé) ?
// Défaut : false — on les oriente plutôt vers une préqualification.
export const STORE_NOT_PREAPPROVED = false;

// Transmettre au CRM les personnes déjà sous contrat avec un autre courtier ?
// Défaut : false (recommandé) — on respecte la relation existante.
export const STORE_ALREADY_REPRESENTED = false;

// Transmettre au CRM les projets peu avancés (segment early_stage) ?
// Défaut : true — conservés en nurturing (recommandé par le kit).
export const STORE_LOW_FIT = true;
