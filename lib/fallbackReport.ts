import type { Answers, ProjectFit, Report, ScoringResult } from "./types";
import { regionName, RANGES_SOURCE } from "./regions";
import { formatCurrency } from "./format";

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

const MUST_HAVE_LABEL: Record<string, string> = {
  garage: "un garage",
  terrain: "un terrain",
  stationnement: "un stationnement",
  sous_sol: "un sous-sol",
  construction_recente: "une construction récente",
  transport: "la proximité du transport en commun",
  ecoles: "la proximité des écoles",
  renover: "un potentiel de rénovation",
  faibles_frais: "de faibles frais de condo",
  intergeneration: "un espace intergénérationnel",
  aucun: "aucun critère indispensable",
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

export function buildFallbackReport(answers: Answers, scoring: ScoringResult): Report {
  const fit = scoring.projectFit;
  const region = regionName(answers.region) || "ton secteur";
  const type = answers.propertyType ? PROPERTY_LABEL[answers.propertyType] : "propriété";
  const timeline = answers.purchaseTimeline ? TIMELINE_LABEL[answers.purchaseTimeline] : "à définir";
  const notConfirmed =
    answers.financingStatus === "in_process" || answers.financingStatus === "not_started";

  const projectProfile = `Recherche d'une ${type} à ${region}, ${
    answers.bedrooms ? `${answers.bedrooms}${answers.bedrooms >= 5 ? "+" : ""} chambre${answers.bedrooms > 1 ? "s" : ""}, ` : ""
  }budget ${budgetLabel(answers)}, achat ${timeline}.`;

  // Forces
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
    strengths.push(`Ton budget est cohérent avec ${type === "propriété" ? "les propriétés" : `les ${type}s`} à ${region}.`);
  }
  if (strengths.length === 0) {
    strengths.push("Tu prends le temps de clarifier ton projet avant de te lancer — c'est la bonne approche.");
  }

  // Éléments à valider
  const considerations: string[] = [];
  if (notConfirmed) {
    considerations.push(
      "Ton financement n'est pas encore confirmé : une préqualification officielle est la première étape avant les visites."
    );
  }
  if (fit === "tight") {
    considerations.push(
      `Selon nos fourchettes indicatives (${RANGES_SOURCE}), ton budget est serré pour ${region} — à valider avec le courtier.`
    );
  }
  if (fit === "unknown") {
    considerations.push(
      "Nous n'avons pas de fourchette fiable pour ce secteur/type : la compatibilité doit être validée avec le courtier."
    );
  }
  if (answers.currentHousing === "owner_must_sell") {
    considerations.push(
      "Tu dois vendre ta propriété actuelle avant d'acheter : coordonner les deux transactions demande une stratégie précise."
    );
  }
  const mustHaves = (answers.mustHaves ?? []).filter((m) => m !== "aucun");
  if (mustHaves.length >= 3) {
    considerations.push(
      "Tu as plusieurs critères indispensables : prioriser les 1-2 plus importants élargira tes possibilités."
    );
  }
  if (considerations.length === 0) {
    considerations.push("Aucun frein majeur — reste à valider les détails avec le courtier.");
  }

  // Ajustements possibles
  const recommendedAdjustments: string[] = [];
  if (fit === "tight") {
    recommendedAdjustments.push("Envisager un secteur voisin ou un type de propriété plus accessible.");
    recommendedAdjustments.push("Distinguer les besoins réels des simples préférences.");
  }
  if (mustHaves.length >= 3) {
    recommendedAdjustments.push("Classer tes critères par ordre de priorité pour gagner en flexibilité.");
  }
  if (answers.alternateRegions && answers.alternateRegions.length > 0) {
    recommendedAdjustments.push("Tes secteurs alternatifs élargissent déjà utilement ta recherche.");
  } else {
    recommendedAdjustments.push("Ajouter 1-2 secteurs alternatifs pour multiplier les occasions.");
  }
  if (recommendedAdjustments.length < 3) {
    recommendedAdjustments.push("Valider la stratégie d'achat avec le courtier avant les premières visites.");
  }

  // Plan d'action — 4 étapes
  const nextSteps: string[] = notConfirmed
    ? [
        "Obtenir une préqualification hypothécaire officielle.",
        "Confirmer ton budget réel et ta mise de fonds.",
        "Prioriser tes secteurs et critères avec le courtier.",
        `Planifier tes premières visites une fois le financement confirmé.`,
      ]
    : [
        "Valider ta stratégie et tes secteurs avec le courtier.",
        "Mettre en place des alertes sur les propriétés qui correspondent.",
        "Préparer ta documentation pour agir vite sur la bonne propriété.",
        answers.currentHousing === "owner_must_sell"
          ? "Coordonner la vente de ta propriété actuelle avec ton achat."
          : "Organiser tes visites ciblées dès qu'une occasion se présente.",
      ];

  const summaryByFit: Record<ProjectFit, string> = {
    strong: `Ton budget et ton secteur sont bien alignés. Avec ${timeline === "à définir" ? "un échéancier à préciser" : `un achat ${timeline}`}, tu es en bonne position pour passer à l'action une fois les détails validés avec le courtier.`,
    possible: `Ton projet d'achat d'une ${type} à ${region} est réaliste. Quelques éléments restent à valider, mais la direction est claire.`,
    tight: `Ton projet est ambitieux pour ${region}, sans être hors de portée. En ajustant légèrement le secteur, le type ou les critères, tu ouvres des possibilités concrètes.`,
    unknown: `Ton projet a de bonnes bases. Comme certaines données de marché nous manquent pour ${region}, une validation avec le courtier précisera tes possibilités réelles.`,
  };

  return {
    headline: FIT_HEADLINE[fit],
    summary: summaryByFit[fit],
    projectProfile,
    fitLevel: fit,
    strengths: strengths.slice(0, 3),
    considerations: considerations.slice(0, 3),
    recommendedAdjustments: recommendedAdjustments.slice(0, 3),
    nextSteps: nextSteps.slice(0, 4),
    disclaimer: STANDARD_DISCLAIMER,
  };
}
