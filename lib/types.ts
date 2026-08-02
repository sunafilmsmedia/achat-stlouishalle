// ============================================================================
// Types — Logiciel Acheteur IA (St Louis Hallé)
// ----------------------------------------------------------------------------
// Ce produit qualifie des ACHETEURS déjà préapprouvés / préqualifiés.
// Il ne calcule JAMAIS une capacité d'emprunt. Le budget « confirmé » sert
// uniquement à évaluer la cohérence du projet — jamais comme une approbation.
// ============================================================================

export type FinancingStatus =
  | "preapproved"
  | "prequalified"
  | "in_process"
  | "not_started";

export type PropertyType = "house" | "condo" | "townhouse" | "plex" | "open";

export type PurchaseTimeline =
  | "asap"
  | "0_3_months"
  | "3_6_months"
  | "6_12_months"
  | "exploring";

export type CurrentHousing =
  | "renter"
  | "owner_must_sell"
  | "owner_no_sale_needed"
  | "with_family"
  | "other";

export type SalePreparation =
  | "not_started"
  | "valuation_done"
  | "preparing"
  | "already_listed"
  | "accepted_offer";

export type BrokerStatus = "none" | "talking_unsigned" | "under_contract";

// Critères indispensables (multisélection, max 3)
export type MustHave =
  | "garage"
  | "terrain"
  | "stationnement"
  | "sous_sol"
  | "construction_recente"
  | "transport"
  | "ecoles"
  | "renover"
  | "faibles_frais"
  | "intergeneration"
  | "aucun";

export type Region = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export interface Answers {
  financingStatus?: FinancingStatus;
  // Budget CONFIRMÉ (préapprouvé / préqualifié) — jamais présenté comme approuvé.
  approvedBudget?: number;
  // Budget en cours de validation ou simplement souhaité (in_process / not_started).
  targetBudget?: number;
  downPayment?: number;
  region?: string;
  // Jusqu'à 2 secteurs alternatifs, facultatifs.
  alternateRegions?: string[];
  propertyType?: PropertyType;
  bedrooms?: number;
  mustHaves?: MustHave[];
  purchaseTimeline?: PurchaseTimeline;
  currentHousing?: CurrentHousing;
  salePreparation?: SalePreparation;
  brokerStatus?: BrokerStatus;
}

// ── Scoring interne ─────────────────────────────────────────────────────────
// Le score numérique est RÉSERVÉ au CRM. Jamais affiché au visiteur.

export type LeadSegment =
  | "priority"
  | "qualified"
  | "nurture"
  | "early_stage"
  | "represented";

export type ProjectFit = "strong" | "possible" | "tight" | "unknown";

export type SecondaryTag = "seller_buyer_opportunity";

export interface ScoringFactor {
  label: string;
  delta: number;
  tone: "positive" | "negative" | "neutral";
}

export interface ScoringResult {
  score: number; // 0-100, interne
  segment: LeadSegment;
  projectFit: ProjectFit;
  secondaryTags: SecondaryTag[];
  factors: ScoringFactor[];
  breakdown: {
    financing: number;
    timeline: number;
    representation: number;
    residentialPrep: number;
    projectFit: number;
  };
}

// ── Rapport (IA ou fallback déterministe) ───────────────────────────────────

export interface Report {
  headline: string;
  summary: string;
  projectProfile: string;
  fitLevel: ProjectFit;
  strengths: string[];
  considerations: string[];
  recommendedAdjustments: string[];
  nextSteps: string[];
  disclaimer: string;
}

export interface AnalyzeResponse {
  scoring: ScoringResult;
  report: Report;
  generatedBy: "claude" | "fallback";
}

// ── Lead ────────────────────────────────────────────────────────────────────

export type LeadType = "buyer_analysis";

export interface LeadPayload {
  name: string;
  phone: string;
  email: string;
  consent: boolean;
  answers: Answers;
  leadType?: LeadType;
}
