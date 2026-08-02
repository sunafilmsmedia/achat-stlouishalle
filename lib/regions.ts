import type { PropertyType, Region } from "./types";

// Fourchettes indicatives [min, max] en CAD, par type de propriété.
// ⚠️ Ces valeurs sont des ESTIMATIONS INTERNES et servent uniquement à
// produire une indication qualitative de compatibilité budget/secteur.
// Elles ne représentent PAS des prix en temps réel. Le courtier doit les
// remplacer par ses propres données datées, ou les laisser vides
// (dans ce cas evaluateProjectFit() retourne "unknown").
export type PriceRanges = Partial<Record<PropertyType, [number, number]>>;

export interface RegionWithLabel extends Region {
  // Direction du tooltip Leaflet pour éviter les chevauchements.
  labelDir: "top" | "bottom" | "left" | "right";
  ranges?: PriceRanges;
}

// Date de référence affichée lorsqu'une donnée chiffrée est utilisée.
export const RANGES_SOURCE = "Fourchettes indicatives internes — à valider · août 2026";

// Secteurs couverts par l'équipe St Louis Hallé (Rive-Sud de Montréal).
// GPS = centre approximatif de chaque municipalité/quartier.
export const REGIONS: RegionWithLabel[] = [
  {
    id: "longueuil", name: "Longueuil", lat: 45.5312, lng: -73.5185, labelDir: "left",
    ranges: { condo: [280000, 480000], house: [520000, 850000], townhouse: [430000, 650000], plex: [650000, 1100000] },
  },
  {
    id: "brossard", name: "Brossard", lat: 45.4600, lng: -73.4660, labelDir: "bottom",
    ranges: { condo: [340000, 620000], house: [650000, 1200000], townhouse: [520000, 780000], plex: [800000, 1300000] },
  },
  {
    id: "saint-lambert", name: "Saint-Lambert", lat: 45.5000, lng: -73.5090, labelDir: "left",
    ranges: { condo: [380000, 700000], house: [800000, 1500000], townhouse: [600000, 950000], plex: [900000, 1600000] },
  },
  {
    id: "boucherville", name: "Boucherville", lat: 45.6100, lng: -73.4360, labelDir: "top",
    ranges: { condo: [350000, 600000], house: [650000, 1250000], townhouse: [520000, 800000], plex: [750000, 1200000] },
  },
  {
    id: "saint-bruno", name: "Saint-Bruno-de-Montarville", lat: 45.5340, lng: -73.3490, labelDir: "right",
    ranges: { condo: [340000, 580000], house: [700000, 1400000], townhouse: [540000, 820000], plex: [800000, 1300000] },
  },
  {
    id: "saint-hubert", name: "Saint-Hubert", lat: 45.4900, lng: -73.4180, labelDir: "right",
    ranges: { condo: [270000, 450000], house: [480000, 780000], townhouse: [400000, 600000], plex: [600000, 1000000] },
  },
  {
    id: "sainte-julie", name: "Sainte-Julie", lat: 45.5830, lng: -73.3350, labelDir: "top",
    ranges: { condo: [300000, 500000], house: [560000, 950000], townhouse: [450000, 700000], plex: [650000, 1050000] },
  },
  {
    id: "la-prairie", name: "La Prairie", lat: 45.4190, lng: -73.5000, labelDir: "bottom",
    ranges: { condo: [300000, 520000], house: [550000, 950000], townhouse: [450000, 700000], plex: [650000, 1050000] },
  },
  {
    id: "candiac", name: "Candiac", lat: 45.3830, lng: -73.5170, labelDir: "bottom",
    ranges: { condo: [330000, 560000], house: [620000, 1150000], townhouse: [500000, 780000], plex: [700000, 1150000] },
  },
  {
    id: "chambly", name: "Chambly", lat: 45.4460, lng: -73.2870, labelDir: "right",
    ranges: { condo: [290000, 490000], house: [520000, 900000], townhouse: [430000, 680000], plex: [620000, 1000000] },
  },
  {
    id: "saint-basile", name: "Saint-Basile-le-Grand", lat: 45.5350, lng: -73.2870, labelDir: "right",
    ranges: { condo: [300000, 500000], house: [560000, 950000], townhouse: [450000, 700000], plex: [650000, 1000000] },
  },
  {
    id: "varennes", name: "Varennes", lat: 45.6870, lng: -73.4370, labelDir: "top",
    ranges: { condo: [300000, 490000], house: [540000, 900000], townhouse: [440000, 680000], plex: [620000, 980000] },
  },
];

// Centre approximatif pour la carte de fond décorative.
export const REGION_CENTER: [number, number] = [45.52, -73.42];

// Bounds englobant tous les secteurs avec padding pour la carte interactive.
export const REGION_BOUNDS: [[number, number], [number, number]] = [
  [45.37, -73.58], // sud-ouest (englobe Candiac / La Prairie)
  [45.70, -73.26], // nord-est (englobe Varennes / Chambly)
];

export function regionName(id: string | undefined): string {
  if (!id) return "";
  return REGIONS.find((r) => r.id === id)?.name ?? "";
}
