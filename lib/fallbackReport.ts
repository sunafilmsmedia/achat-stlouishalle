import type { Answers, ProjectFit, Report, ScoringResult } from "./types";
import { regionName, RANGES_SOURCE } from "./regions";
import { formatCurrency } from "./format";
import { affordableAlternatives, isNotReady, typeLabelFr, typeLabelWithArticleFr } from "./scoring";

export const STANDARD_DISCLAIMER =
  "Cette analyse est indicative et repose uniquement sur les informations fournies. Elle ne constitue pas une préapprobation hypothécaire, une évaluation immobilière, un avis financier ni une garantie qu'une propriété correspondant aux critères est disponible. Les possibilités doivent être validées avec les professionnels concernés.";

const PROPERTY_LABEL: Record<string, string> = {
  house: "maison unifamiliale",
  condo: "condo",
  townhouse: "maison de ville",
  plex: "duplex ou plex",
  open: "type ouvert",
};

const TIMELINE_LABEL: Record<string, string> = {
  asap: "dès la bonne occasion",
  "0_3_months": "dans les 3 prochains mois",
  "3_6_months": "dans 3 à 6 mois",
  "6_12_months": "dans 6 à 12 mois",
  exploring: "en phase d'exploration",
};

const FIT_HEADLINE: Record<ProjectFit, string> = {
  strong: "Ton projet est bien aligné.",
  possible: "Ton projet est réaliste.",
  tight: "Ton projet est ambitieux — mais faisable.",
  unknown: "Ton projet mérite une validation.",
};

function budgetLabel(answers: Answers): string {
  if (typeof answers.approvedBudget === "number") {
    return `${formatCurrency(answers.approvedBudget)} (à valider)`;
  }
  if (typeof answers.targetBudget === "number") {
    return `${formatCurrency(answers.targetBudget)} (souhaité, à valider)`;
  }
  return "à préciser";
}

// Construit une phrase « ce budget te permet plutôt de viser… »
function affordabilitySentence(answers: Answers): string | null {
  const opt = affordableAlternatives(answers);
  if (opt.budget <= 0 || opt.chosenAffordable || !opt.chosenType || opt.chosenType === "open") {
    return null;
  }
  const chosen = typeLabelWithArticleFr(opt.chosenType);
  const region = opt.chosenRegion ?? "ce secteur";
  const money = formatCurrency(opt.budget);

  // 1) Autres types abordables dans le même secteur
  if (opt.affordableTypesInRegion.length > 0) {
    const types = opt.affordableTypesInRegion
      .filter((t) => t !== opt.chosenType)
      .map((t) => typeLabelFr(t));
    if (types.length > 0) {
      return `Avec ${money}, ${chosen} à ${region} est peu réaliste. Ce budget te permet plutôt d'y viser : ${types.slice(0, 3).join(", ")}.`;
    }
  }
  // 2) Le type choisi ailleurs
  if (opt.affordableRegionsForType.length > 0) {
    return `Avec ${money}, ${chosen} à ${region} est peu réaliste. Ce type devient accessible dans : ${opt.affordableRegionsForType.slice(0, 4).join(", ")}.`;
  }
  // 3) Repli global
  if (opt.globalAffordable.length > 0) {
    const combos = opt.globalAffordable
      .slice(0, 3)
      .map((c) => `${c.typeLabel} à ${c.region}`);
    return `Avec ${money}, ${chosen} à ${region} n'est pas réaliste. Ce budget te permet plutôt de viser : ${combos.join(", ")}.`;
  }
  return `Avec ${money}, ${chosen} à ${region} est peu réaliste. On validera ensemble les options concrètes selon le marché actuel.`;
}

export function buildFallbackReport(answers: Answers, scoring: ScoringResult): Report {
  const fit = scoring.projectFit;
  const region = regionName(answers.region) || "ton secteur";
  const type = answers.propertyType ? PROPERTY_LABEL[answers.propertyType] : "propriété";
  const timeline = answers.purchaseTimeline ? TIMELINE_LABEL[answers.purchaseTimeline] : "à définir";
  const notConfirmed =
    answers.financingStatus === "in_process" || answers.financingStatus === "not_started";
  const notReady = isNotReady(answers);
  const affordability = affordabilitySentence(answers);

  const projectProfile = `Recherche d'une ${type} à ${region}, ${
    answers.bedrooms ? `${answers.bedrooms}${answers.bedrooms >= 5 ? "+" : ""} chambre${answers.bedrooms > 1 ? "s" : ""}, ` : ""
  }budget ${budgetLabel(answers)}, achat ${timeline}.`;

  // ── Forces ────────────────────────────────────────────────────────────────
  const strengths: string[] = [];
  if (answers.financingStatus === "preapproved") {
    strengths.push("Ton financement est déjà préapprouvé — tu peux te positionner rapidement.");
  } else if (answers.financingStatus === "prequalified") {
    strengths.push("Ta préqualification te donne une base solide pour cibler tes visites.");
  }
  if (answers.purchaseTimeline === "asap" || answers.purchaseTimeline === "0_3_months") {
    strengths.push("Ton échéancier est court et clair, un vrai atout dans les négociations.");
  }
  if (answers.brokerStatus === "none") {
    strengths.push("Tu es libre de collaborer avec l'équipe dès maintenant.");
  }
  if (fit === "strong" || fit === "possible") {
    strengths.push(`Ton budget est cohérent avec les propriétés recherchées à ${region}.`);
  }
  if (answers.buyingWith === "cobuyer") {
    strengths.push("Acheter à plusieurs renforce ta capacité de mise de fonds.");
  }
  if (strengths.length === 0) {
    strengths.push("Tu prends le temps de clarifier ton projet avant de te lancer — c'est la bonne approche.");
  }

  // ── Éléments à valider ──────────────────────────────────────────────────────
  const considerations: string[] = [];
  if (notReady) {
    considerations.push(
      "Avec une mise de fonds sous 20 000 $ en achetant seul, le projet n'est pas encore prêt : bâtir ta mise de fonds est la priorité."
    );
  }
  if (notConfirmed) {
    considerations.push(
      "Ton financement n'est pas encore confirmé : une préqualification officielle est la première étape avant les visites."
    );
  }
  if (affordability) {
    considerations.push(affordability);
  } else if (fit === "tight") {
    considerations.push(
      `Selon nos fourchettes indicatives (${RANGES_SOURCE}), ton budget est serré pour ${region} — à valider avec le courtier.`
    );
  } else if (fit === "unknown") {
    considerations.push(
      "Nous n'avons pas de fourchette fiable pour ce secteur/type : la compatibilité doit être validée avec le courtier."
    );
  }
  if (answers.currentHousing === "owner" && answers.ownerStrategy === "must_sell") {
    considerations.push(
      "Tu dois vendre ta propriété actuelle avant d'acheter : coordonner les deux transactions demande une stratégie précise."
    );
  }
  if (considerations.length === 0) {
    considerations.push("Aucun frein majeur — reste à valider les détails avec le courtier.");
  }

  // ── Ajustements possibles ───────────────────────────────────────────────────
  const recommendedAdjustments: string[] = [];
  if (notReady) {
    recommendedAdjustments.push("Constituer une mise de fonds d'au moins 20 000 $, ou acheter à plusieurs.");
  }
  if (affordability || fit === "tight") {
    recommendedAdjustments.push("Envisager un secteur voisin ou un type de propriété plus accessible.");
    recommendedAdjustments.push("Distinguer les besoins réels des simples préférences.");
  }
  const mustHaves = (answers.mustHaves ?? []).filter((m) => m !== "aucun");
  if (mustHaves.length >= 3) {
    recommendedAdjustments.push("Classer tes critères par ordre de priorité pour gagner en flexibilité.");
  }
  recommendedAdjustments.push("Rester ouvert à un secteur voisin pour multiplier les occasions.");
  if (recommendedAdjustments.length < 3) {
    recommendedAdjustments.push("Valider la stratégie d'achat avec le courtier avant les premières visites.");
  }

  // ── Plan d'action ───────────────────────────────────────────────────────────
  const nextSteps: string[] = notReady
    ? [
        "Bâtir ta mise de fonds (ou identifier un co-acheteur).",
        "Obtenir une préqualification hypothécaire officielle.",
        "Cibler des secteurs et types réalistes avec le courtier.",
        "Revenir faire l'analyse une fois ta mise de fonds consolidée.",
      ]
    : notConfirmed
    ? [
        "Obtenir une préqualification hypothécaire officielle.",
        "Confirmer ton budget réel et ta mise de fonds.",
        "Prioriser tes secteurs et critères avec le courtier.",
        "Planifier tes premières visites une fois le financement confirmé.",
      ]
    : [
        "Valider ta stratégie et tes secteurs avec le courtier.",
        "Mettre en place des alertes sur les propriétés qui correspondent.",
        "Préparer ta documentation pour agir vite sur la bonne propriété.",
        answers.currentHousing === "owner" && answers.ownerStrategy === "must_sell"
          ? "Coordonner la vente de ta propriété actuelle avec ton achat."
          : "Organiser tes visites ciblées dès qu'une occasion se présente.",
      ];

  // ── Résumé ──────────────────────────────────────────────────────────────────
  let summary: string;
  if (notReady) {
    summary =
      "Ton projet est prometteur, mais avec ta mise de fonds actuelle en achetant seul, ce n'est pas encore le bon moment. En la consolidant — ou en achetant à plusieurs — tu débloques des possibilités concrètes.";
  } else if (affordability) {
    summary = affordability;
  } else {
    const summaryByFit: Record<ProjectFit, string> = {
      strong: `Ton budget et ton secteur sont bien alignés. Avec ${timeline === "à définir" ? "un échéancier à préciser" : `un achat ${timeline}`}, tu es en bonne position pour passer à l'action une fois les détails validés avec le courtier.`,
      possible: `Ton projet d'achat d'une ${type} à ${region} est réaliste. Quelques éléments restent à valider, mais la direction est claire.`,
      tight: `Ton projet est ambitieux pour ${region}, sans être hors de portée. En ajustant légèrement le secteur, le type ou les critères, tu ouvres des possibilités concrètes.`,
      unknown: `Ton projet a de bonnes bases. Comme certaines données de marché nous manquent pour ${region}, une validation avec le courtier précisera tes possibilités réelles.`,
    };
    summary = summaryByFit[fit];
  }

  return {
    headline: notReady ? "Ton projet n'est pas encore prêt." : FIT_HEADLINE[fit],
    summary,
    projectProfile,
    fitLevel: fit,
    strengths: strengths.slice(0, 3),
    considerations: considerations.slice(0, 3),
    recommendedAdjustments: recommendedAdjustments.slice(0, 3),
    nextSteps: nextSteps.slice(0, 4),
    disclaimer: STANDARD_DISCLAIMER,
  };
}
