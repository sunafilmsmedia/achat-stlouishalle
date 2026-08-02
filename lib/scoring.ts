import type {
  Answers,
  LeadSegment,
  ProjectFit,
  ScoringFactor,
  ScoringResult,
  SecondaryTag,
} from "./types";
import { REGIONS } from "./regions";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// ── Compatibilité budget / secteur / type ───────────────────────────────────
// Déterministe. N'invente aucun prix : utilise UNIQUEMENT les fourchettes
// indicatives configurées dans lib/regions.ts. Retourne "unknown" si aucune
// donnée fiable n'existe. Ne retourne JAMAIS "impossible".
export function evaluateProjectFit(answers: Answers): ProjectFit {
  const budget = answers.approvedBudget ?? answers.targetBudget;
  if (!budget || budget <= 0) return "unknown";

  const region = REGIONS.find((r) => r.id === answers.region);
  if (!region || !region.ranges) return "unknown";

  const type = answers.propertyType;
  // "Ouvert" : on prend la fourchette la plus accessible disponible (souvent condo)
  // pour ne pas pénaliser la flexibilité.
  const candidateRanges =
    type && type !== "open" && region.ranges[type]
      ? [region.ranges[type]!]
      : Object.values(region.ranges);

  if (candidateRanges.length === 0) return "unknown";

  // Pour "ouvert", le meilleur fit possible parmi les types disponibles.
  let best: ProjectFit = "tight";
  const order: Record<ProjectFit, number> = { unknown: 0, tight: 1, possible: 2, strong: 3 };

  for (const [min, max] of candidateRanges) {
    let fit: ProjectFit;
    if (budget >= max * 0.95) fit = "strong";
    else if (budget >= min) fit = "possible";
    else fit = "tight"; // sous la fourchette → serré, jamais impossible
    if (order[fit] > order[best]) best = fit;
  }
  return best;
}

// ── Scoring interne (0-100) ──────────────────────────────────────────────────
export function computeScoring(answers: Answers): ScoringResult {
  const factors: ScoringFactor[] = [];

  // 1. Financement — max 35
  let financing = 0;
  switch (answers.financingStatus) {
    case "preapproved":
      financing = 35;
      factors.push({ label: "Préapprouvé — financement solide", delta: 35, tone: "positive" });
      break;
    case "prequalified":
      financing = 28;
      factors.push({ label: "Préqualifié — bonne base de financement", delta: 28, tone: "positive" });
      break;
    case "in_process":
      financing = 15;
      factors.push({ label: "Financement en cours de validation", delta: 15, tone: "neutral" });
      break;
    case "not_started":
      financing = 0;
      factors.push({ label: "Financement pas encore entamé", delta: 0, tone: "negative" });
      break;
  }

  // 2. Échéancier — max 25
  let timeline = 0;
  switch (answers.purchaseTimeline) {
    case "asap":
      timeline = 25;
      factors.push({ label: "Prêt à agir dès la bonne propriété", delta: 25, tone: "positive" });
      break;
    case "0_3_months":
      timeline = 23;
      factors.push({ label: "Achat visé dans les 3 mois", delta: 23, tone: "positive" });
      break;
    case "3_6_months":
      timeline = 16;
      factors.push({ label: "Achat visé dans 3 à 6 mois", delta: 16, tone: "positive" });
      break;
    case "6_12_months":
      timeline = 8;
      factors.push({ label: "Projet à moyen terme (6-12 mois)", delta: 8, tone: "neutral" });
      break;
    case "exploring":
      timeline = 0;
      factors.push({ label: "En exploration — pas d'échéance ferme", delta: 0, tone: "neutral" });
      break;
  }

  // 3. Représentation — max 20
  let representation = 0;
  switch (answers.brokerStatus) {
    case "none":
      representation = 20;
      factors.push({ label: "Aucun courtier — libre de collaborer", delta: 20, tone: "positive" });
      break;
    case "talking_unsigned":
      representation = 10;
      factors.push({ label: "En discussion, rien de signé", delta: 10, tone: "neutral" });
      break;
    case "under_contract":
      representation = 0;
      factors.push({ label: "Déjà sous contrat avec un courtier", delta: 0, tone: "negative" });
      break;
  }

  // 4. Préparation résidentielle — max 10
  let residentialPrep = 0;
  const housing = answers.currentHousing;
  if (housing === "renter" || housing === "with_family") {
    residentialPrep = 10;
    factors.push({ label: "Aucune vente préalable requise", delta: 10, tone: "positive" });
  } else if (housing === "owner_no_sale_needed") {
    residentialPrep = 8;
    factors.push({ label: "Propriétaire sans obligation de vendre", delta: 8, tone: "positive" });
  } else if (housing === "owner_must_sell") {
    switch (answers.salePreparation) {
      case "accepted_offer":
        residentialPrep = 10;
        factors.push({ label: "Vente déjà sous promesse acceptée", delta: 10, tone: "positive" });
        break;
      case "already_listed":
        residentialPrep = 7;
        factors.push({ label: "Propriété déjà sur le marché", delta: 7, tone: "positive" });
        break;
      case "preparing":
      case "valuation_done":
        residentialPrep = 5;
        factors.push({ label: "Vente en préparation", delta: 5, tone: "neutral" });
        break;
      case "not_started":
      default:
        residentialPrep = 2;
        factors.push({ label: "Vente à préparer avant l'achat", delta: 2, tone: "neutral" });
        break;
    }
  }
  // "other" → 0, neutre (pas de facteur)

  // 5. Compatibilité budget-projet — max 10
  const projectFit = evaluateProjectFit(answers);
  let projectFitPts = 0;
  switch (projectFit) {
    case "strong":
      projectFitPts = 10;
      factors.push({ label: "Budget bien aligné avec le secteur visé", delta: 10, tone: "positive" });
      break;
    case "possible":
      projectFitPts = 6;
      factors.push({ label: "Projet réaliste dans le secteur visé", delta: 6, tone: "positive" });
      break;
    case "tight":
      projectFitPts = 2;
      factors.push({ label: "Budget serré pour le secteur — à valider", delta: 2, tone: "neutral" });
      break;
    case "unknown":
      projectFitPts = 4; // ne pas pénaliser l'absence de données
      factors.push({ label: "Compatibilité à valider avec le courtier", delta: 4, tone: "neutral" });
      break;
  }

  const score = Math.round(
    clamp(financing + timeline + representation + residentialPrep + projectFitPts, 0, 100)
  );

  // Segments internes
  let segment: LeadSegment;
  if (answers.brokerStatus === "under_contract") {
    segment = "represented";
  } else if (score >= 80) {
    segment = "priority";
  } else if (score >= 60) {
    segment = "qualified";
  } else if (score >= 35) {
    segment = "nurture";
  } else {
    segment = "early_stage";
  }

  const secondaryTags: SecondaryTag[] = [];
  if (answers.currentHousing === "owner_must_sell") {
    secondaryTags.push("seller_buyer_opportunity");
  }

  return {
    score,
    segment,
    projectFit,
    secondaryTags,
    factors,
    breakdown: {
      financing,
      timeline,
      representation,
      residentialPrep,
      projectFit: projectFitPts,
    },
  };
}
