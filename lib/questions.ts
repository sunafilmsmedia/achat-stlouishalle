import type { Answers, MustHave } from "./types";

export type QuestionId =
  | "financingStatus"
  | "budget" // approvedBudget OU targetBudget selon financingStatus
  | "downPayment"
  | "buyingWith"
  | "region"
  | "propertyType"
  | "bedrooms"
  | "mustHaves"
  | "purchaseTimeline"
  | "currentHousing"
  | "ownerStrategy"
  | "salePreparation"
  | "brokerStatus";

export type QuestionKind =
  | "choice"
  | "currency"
  | "region"
  | "multichoice"
  | "bedrooms";

export interface Choice<V extends string = string> {
  value: V;
  label: string;
  hint?: string;
}

export interface QuestionDef {
  id: QuestionId;
  kind: QuestionKind;
  title: string;
  subtitle?: string;
  note?: string; // petit texte rassurant sous la question
  choices?: Choice[];
  autoAdvance?: boolean;
  showIf?: (a: Answers) => boolean;
}

export const MUST_HAVE_CHOICES: Choice<MustHave>[] = [
  { value: "garage", label: "Garage" },
  { value: "terrain", label: "Terrain" },
  { value: "stationnement", label: "Stationnement" },
  { value: "sous_sol", label: "Sous-sol" },
  { value: "construction_recente", label: "Construction récente" },
  { value: "transport", label: "Transport en commun" },
  { value: "ecoles", label: "Proximité des écoles" },
  { value: "renover", label: "Possibilité de rénover" },
  { value: "faibles_frais", label: "Faibles frais de condo" },
  { value: "intergeneration", label: "Intergénération" },
  { value: "aucun", label: "Aucun critère indispensable" },
];

export const QUESTIONS: QuestionDef[] = [
  {
    id: "financingStatus",
    kind: "choice",
    title: "Où en es-tu avec ton financement ?",
    note: "On ne recalculera pas ta capacité d'emprunt. Cette information sert seulement à évaluer où tu en es dans ton projet.",
    autoAdvance: true,
    choices: [
      { value: "preapproved", label: "Je suis préapprouvé" },
      { value: "prequalified", label: "Je suis préqualifié" },
      { value: "in_process", label: "Je suis en processus" },
      { value: "not_started", label: "Je n'ai pas encore commencé" },
    ],
  },
  {
    id: "budget",
    kind: "currency",
    title: "Pour quel montant es-tu préapprouvé ou préqualifié ?",
    subtitle: "Ce montant sera validé avec le professionnel concerné avant toute transaction.",
    showIf: (a) => a.financingStatus === "preapproved" || a.financingStatus === "prequalified",
  },
  {
    id: "budget",
    kind: "currency",
    title: "Quel budget approximatif es-tu en train de faire valider ?",
    subtitle: "Budget souhaité, à valider — ce n'est pas un montant confirmé.",
    showIf: (a) => a.financingStatus === "in_process" || a.financingStatus === "not_started",
  },
  {
    id: "downPayment",
    kind: "currency",
    title: "Quelle mise de fonds as-tu actuellement disponible ?",
    subtitle: "Ça nous aide à comprendre où en est ton projet — aucun calcul hypothécaire.",
  },
  {
    id: "buyingWith",
    kind: "choice",
    title: "Achètes-tu seul ou à plusieurs ?",
    subtitle: "Ça change ce qui est réaliste avec ta mise de fonds actuelle.",
    autoAdvance: true,
    showIf: (a) => typeof a.downPayment === "number" && a.downPayment < 20000,
    choices: [
      { value: "alone", label: "J'achète seul" },
      { value: "cobuyer", label: "J'achète à plusieurs", hint: "Conjoint, famille, associé…" },
    ],
  },
  {
    id: "region",
    kind: "region",
    title: "Dans quel secteur aimerais-tu acheter ?",
    subtitle: "Touche la carte. Tu peux ajouter jusqu'à 2 secteurs alternatifs.",
  },
  {
    id: "propertyType",
    kind: "choice",
    title: "Quel type de propriété recherches-tu ?",
    autoAdvance: true,
    choices: [
      { value: "house", label: "Maison unifamiliale" },
      { value: "condo", label: "Condo" },
      { value: "townhouse", label: "Maison de ville" },
      { value: "plex", label: "Duplex ou plex" },
      { value: "open", label: "Je suis ouvert" },
    ],
  },
  {
    id: "bedrooms",
    kind: "bedrooms",
    title: "De combien de chambres as-tu besoin ?",
    autoAdvance: true,
  },
  {
    id: "mustHaves",
    kind: "multichoice",
    title: "Quels sont tes trois critères les plus importants ?",
    subtitle: "Choisis-en jusqu'à 3.",
    choices: MUST_HAVE_CHOICES,
  },
  {
    id: "purchaseTimeline",
    kind: "choice",
    title: "À quel moment aimerais-tu acheter ?",
    autoAdvance: true,
    choices: [
      { value: "asap", label: "Dès que je trouve la bonne propriété" },
      { value: "0_3_months", label: "Dans les 3 prochains mois" },
      { value: "3_6_months", label: "Dans 3 à 6 mois" },
      { value: "6_12_months", label: "Dans 6 à 12 mois" },
      { value: "exploring", label: "Je veux simplement explorer mes options" },
    ],
  },
  {
    id: "currentHousing",
    kind: "choice",
    title: "Quelle est ta situation actuellement ?",
    autoAdvance: true,
    choices: [
      { value: "renter", label: "Je suis locataire" },
      { value: "owner", label: "Je suis propriétaire" },
      { value: "with_family", label: "J'habite avec ma famille" },
      { value: "other", label: "Autre" },
    ],
  },
  {
    id: "ownerStrategy",
    kind: "choice",
    title: "Pour acheter, où en es-tu avec ta propriété actuelle ?",
    autoAdvance: true,
    showIf: (a) => a.currentHousing === "owner",
    choices: [
      { value: "must_sell", label: "Je dois vendre avant d'acheter" },
      { value: "no_sale_needed", label: "Je peux acheter sans vendre" },
    ],
  },
  {
    id: "salePreparation",
    kind: "choice",
    title: "Où en es-tu avec la vente de ta propriété actuelle ?",
    autoAdvance: true,
    showIf: (a) => a.currentHousing === "owner" && a.ownerStrategy === "must_sell",
    choices: [
      { value: "not_started", label: "Je n'ai encore rien commencé" },
      { value: "valuation_done", label: "J'ai déjà obtenu une évaluation" },
      { value: "preparing", label: "Je prépare la mise en vente" },
      { value: "already_listed", label: "Elle est déjà sur le marché" },
      { value: "accepted_offer", label: "J'ai une promesse d'achat acceptée" },
    ],
  },
  {
    id: "brokerStatus",
    kind: "choice",
    title: "Travailles-tu déjà avec un courtier immobilier pour ton achat ?",
    autoAdvance: true,
    choices: [
      { value: "none", label: "Non" },
      { value: "talking_unsigned", label: "J'en consulte un, mais je n'ai rien signé" },
      { value: "under_contract", label: "Oui, j'ai déjà signé un contrat" },
    ],
  },
];

export function getVisibleQuestions(answers: Answers): QuestionDef[] {
  return QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
}

export function isAnswered(q: QuestionDef, a: Answers): boolean {
  switch (q.id) {
    case "financingStatus":
      return !!a.financingStatus;
    case "budget":
      // Le budget « pas commencé » est facultatif : on peut avancer sans.
      if (a.financingStatus === "not_started") return true;
      return typeof a.approvedBudget === "number" || typeof a.targetBudget === "number";
    case "downPayment":
      return typeof a.downPayment === "number" && a.downPayment >= 0;
    case "buyingWith":
      return !!a.buyingWith;
    case "region":
      return !!a.region;
    case "propertyType":
      return !!a.propertyType;
    case "bedrooms":
      return typeof a.bedrooms === "number" && a.bedrooms >= 1;
    case "mustHaves":
      return Array.isArray(a.mustHaves) && a.mustHaves.length >= 1;
    case "purchaseTimeline":
      return !!a.purchaseTimeline;
    case "currentHousing":
      return !!a.currentHousing;
    case "ownerStrategy":
      return !!a.ownerStrategy;
    case "salePreparation":
      return !!a.salePreparation;
    case "brokerStatus":
      return !!a.brokerStatus;
  }
}
