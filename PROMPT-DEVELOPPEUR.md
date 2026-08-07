# PROMPT DÉVELOPPEUR — Logiciel Acheteur IA (analyseur de projet d'achat immobilier)

> Copie-colle ce prompt à ton développeur, à Claude ou à Cursor.
> Il décrit le concept, le questionnaire et le fonctionnement complet pour
> reconstruire l'application. L'identité (courtier, secteurs, couleurs) est
> variabilisée : change les blocs `{{ }}` selon le client.

---

## 1. CONCEPT & POSITIONNEMENT

Développe une application web **one-page** de qualification d'**acheteurs**
immobiliers pour un courtier. La promesse centrale :

> « Déjà préapprouvé ? Découvre ce que ton budget te permet **réellement**
> d'acheter dans le secteur que tu recherches. »

L'IA compare le budget confirmé de l'acheteur, son secteur, son type de
propriété, ses critères et son échéancier, produit une **analyse stratégique**
du projet, et transmet les meilleurs prospects au courtier via un CRM.

**L'application ne doit JAMAIS :**
- Calculer ou garantir une capacité d'emprunt.
- Présenter une préqualification comme une approbation finale.
- Inventer des propriétés, des prix, des données de marché ou des disponibilités.
- Garantir qu'une propriété correspondant aux critères existe.
- Donner un avis financier, juridique ou hypothécaire.

Le budget « confirmé » sert **uniquement** à évaluer la cohérence du projet,
jamais comme une approbation. Ton : français canadien, tutoiement chaleureux,
simple, rassurant, direct.

---

## 2. STACK TECHNIQUE (non négociable)

- Next.js 15 (App Router) + TypeScript + React 19
- Tailwind CSS v4 (config via `@theme` dans le CSS)
- Framer Motion 11 (animations)
- react-leaflet 5 + Leaflet (carte des secteurs)
- @anthropic-ai/sdk — modèle **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`)
- Polices via `next/font/google`
- Déploiement Vercel
- Mobile-first (priorité 375–390 px)

---

## 3. IDENTITÉ, THÈME & TYPOGRAPHIE

Variables client (fichier `lib/broker.ts`) :
- Nom : `{{NOM_COURTIER}}` (ex. St-Louis Hallé)
- Titre : `{{TITRE}}` (ex. Équipe immobilière)
- Franchise : `{{FRANCHISE}}` (ex. eXp)
- Région : `{{REGION}}` (ex. Rive-Sud de Montréal)

**Thème clair (blanc / noir / rouge)** — le fond est blanc, les titres quasi
noirs, l'accent et les CTA en **rouge `#dc142e`**. Design system par tokens CSS
`--color-brand-100..900` :
- `brand-100` = titres (quasi-noir `#141416`)
- `brand-200` = texte secondaire
- `brand-300`/`400`/`500` = rouge (accents, CTA) — `500 = #dc142e`
- `brand-600/700` = dégradés de bouton foncés
- `brand-800/900` = rouges profonds

**Typographie :**
- Police d'affichage (titres, chiffres, verdicts) : **Montserrat**, grasse et
  large (font-weight **800**, letter-spacing serré `-0.02em`). Slot `--font-serif`.
- Police du corps : **DM Sans**. Slot `--font-sans`.

**Logos** dans `/public/` : `logo-broker.png` (courtier) + `logo-franchise.png`
(franchise), PNG transparents, affichés en haut à gauche/droite. **Aucune photo
du courtier, aucun badge d'appel flottant.**

**Carte de fond** décorative : CartoDB Positron (noir & blanc), non interactive,
sous un voile blanc radial. z-0 pour la carte, z-10 pour le contenu (jamais de
z-index négatif).

---

## 4. STRUCTURE DE FICHIERS

```
app/
  layout.tsx            (polices, metadata, MetaPixel, Clarity)
  page.tsx              (machine à états)
  globals.css           (tokens @theme + utilities)
  api/analyze/route.ts  (scoring + rapport IA/fallback)
  api/lead/route.ts     (validation + gating CRM + webhook)
components/
  Hero.tsx  HeroBackground.tsx  TopLogos.tsx
  QualificationForm.tsx  ProgressBar.tsx  LoadingScreen.tsx
  PreRevealScreen.tsx  DisqualifiedScreen.tsx
  MetaPixel.tsx  Clarity.tsx
  questions/
    ChoiceQuestion.tsx  CurrencyQuestion.tsx  BedroomsQuestion.tsx
    MultiChoiceQuestion.tsx  RegionMap.tsx  RegionMapInner.tsx
  results/
    ResultsScreen.tsx  ContactForm.tsx  PropertyIllustration.tsx
lib/
  types.ts  questions.ts  scoring.ts  qualification.ts
  fallbackReport.ts  regions.ts  config.ts  broker.ts  format.ts
```

---

## 5. MACHINE À ÉTATS (`app/page.tsx`)

Stages : `"hero" | "form" | "loading" | "preReveal" | "results" | "disqualified"`

Transitions :
- hero → form : clic sur le CTA
- form → loading : dernière réponse complétée (appel `/api/analyze`)
- form → disqualified : personne déjà sous contrat avec un autre courtier
- loading → preReveal : minimum **2 secondes** ET résultat reçu
- preReveal → results : choix de révélation
- results → hero : refaire l'analyse
- disqualified → hero : retour accueil

Les logos (TopLogos) sont visibles sur hero, preReveal, results, disqualified ;
masqués pendant form et loading.

---

## 6. LE QUESTIONNAIRE (9 à 13 étapes selon branchements)

Chaque **choix unique** avance automatiquement après ~220 ms. La barre de
progression est **segmentée** (un segment par étape, se remplit au fur et à
mesure) — pas une barre continue.

### Q1 — Statut de financement · clé `financingStatus` · auto-advance
« Où en es-tu avec ton financement ? »
- `preapproved` — Je suis préapprouvé
- `prequalified` — Je suis préqualifié
- `in_process` — Je suis en processus
- `not_started` — Je n'ai pas encore commencé

Note sous la question : « On ne recalculera pas ta capacité d'emprunt. Cette
information sert seulement à évaluer où tu en es dans ton projet. »

### Q2 — Budget · clé `approvedBudget` OU `targetBudget` (champ monétaire formaté)
- Si `preapproved`/`prequalified` → « Pour quel montant es-tu préapprouvé ou
  préqualifié ? » → stocké dans **`approvedBudget`** (jamais affiché comme
  approuvé ; mention « à valider »).
- Si `in_process`/`not_started` → « Quel budget approximatif fais-tu valider ? »
  → stocké dans **`targetBudget`** (« souhaité, à valider »). Facultatif si
  `not_started`.
- Valeurs : 50 000 $ à 10 000 000 $.

### Q3 — Mise de fonds · clé `downPayment` (champ monétaire)
« Quelle mise de fonds as-tu actuellement disponible ? »
Ne sert PAS à un calcul hypothécaire, seulement à comprendre l'état de préparation.

### Q4 — Achat seul/à plusieurs · clé `buyingWith` · auto-advance
**Afficher seulement si `downPayment < 20 000`.**
« Achètes-tu seul ou à plusieurs ? »
- `alone` — J'achète seul
- `cobuyer` — J'achète à plusieurs (conjoint, famille, associé…)

→ Si `alone` + mise de fonds < 20 000 $ : le résultat dira que **le projet
n'est pas encore prêt** (priorité : bâtir la mise de fonds). Si `cobuyer` :
projet possible.

### Q5 — Secteur · clé `region` · carte Leaflet
« Dans quel secteur aimerais-tu acheter ? »
Carte affichant **uniquement** les secteurs couverts (marqueurs). Au clic :
sélectionne le secteur le plus proche, affiche un overlay **« Bien reçu !
Secteur : {nom} »**, puis **passe automatiquement** à la question suivante
(~850 ms). Sélection unique.

### Q6 — Type de propriété · clé `propertyType` · auto-advance
« Quel type de propriété recherches-tu ? »
- `house` — Maison unifamiliale
- `condo` — Condo
- `townhouse` — Maison de ville
- `plex` — Duplex ou plex
- `open` — Je suis ouvert

### Q7 — Chambres · clé `bedrooms` · auto-advance
« De combien de chambres as-tu besoin ? » → 1, 2, 3, 4, 5+ (boutons).

### Q8 — Critères · clé `mustHaves` (multisélection, **max 3**)
« Quels sont tes trois critères les plus importants ? »
Garage, Terrain, Stationnement, Sous-sol, Construction récente, Transport en
commun, Proximité des écoles, Possibilité de rénover, Faibles frais de condo,
Intergénération, **Aucun critère indispensable** (exclusif : désélectionne les autres).

### Q9 — Échéancier · clé `purchaseTimeline` · auto-advance
« À quel moment aimerais-tu acheter ? »
- `asap` — Dès que je trouve la bonne propriété
- `0_3_months` — Dans les 3 prochains mois
- `3_6_months` — Dans 3 à 6 mois
- `6_12_months` — Dans 6 à 12 mois
- `exploring` — Je veux simplement explorer

### Q10 — Situation résidentielle · clé `currentHousing` · auto-advance
« Quelle est ta situation actuellement ? »
- `renter` — Je suis locataire
- `owner` — Je suis propriétaire
- `with_family` — J'habite avec ma famille
- `other` — Autre

### Q11 — Stratégie propriétaire · clé `ownerStrategy` · auto-advance
**Afficher seulement si `currentHousing === "owner"`.**
« Pour acheter, où en es-tu avec ta propriété actuelle ? »
- `must_sell` — Je dois vendre avant d'acheter
- `no_sale_needed` — Je peux acheter sans vendre

### Q12 — Préparation de la vente · clé `salePreparation` · auto-advance
**Afficher seulement si `ownerStrategy === "must_sell"`.**
« Où en es-tu avec la vente de ta propriété actuelle ? »
- `not_started`, `valuation_done`, `preparing`, `already_listed`, `accepted_offer`
→ Ce profil reçoit le tag CRM `seller_buyer_opportunity`.

### Q13 — Représentation (DERNIÈRE étape) · clé `brokerStatus` · auto-advance
« Travailles-tu déjà avec un courtier immobilier pour ton achat ? »
- `none` — Non
- `talking_unsigned` — J'en consulte un, mais rien de signé
- `under_contract` — Oui, j'ai signé un contrat

→ `under_contract` : va à **DisqualifiedScreen** (écran respectueux, aucun
webhook, ne pas encourager à contourner le contrat).
→ `none` / `talking_unsigned` : overlay « Bien reçu ! On prépare ton analyse… »
(~1 s) puis appel `/api/analyze` et loader.

---

## 7. SCORING INTERNE (`lib/scoring.ts`) — jamais affiché au visiteur

Score 0–100 (interne, réservé au CRM). Barème :

- **Financement (max 35)** : preapproved 35 · prequalified 28 · in_process 15 · not_started 0
- **Échéancier (max 25)** : asap 25 · 0_3 23 · 3_6 16 · 6_12 8 · exploring 0
- **Représentation (max 20)** : none 20 · talking_unsigned 10 · under_contract 0 (disqualifié)
- **Préparation résidentielle (max 10)** : renter/with_family 10 · owner+no_sale_needed 8 ·
  owner+must_sell : accepted_offer 10 / already_listed 7 / preparing|valuation_done 5 / not_started 2 · other 0
- **Compatibilité budget-projet (max 10)** : strong 10 · possible 6 · tight 2 · unknown 4
  (ne jamais pénaliser l'absence de données)

**Segments** : 80–100 `priority` · 60–79 `qualified` · 35–59 `nurture` ·
0–34 `early_stage` · under_contract → `represented`.
**Tag secondaire** : `seller_buyer_opportunity` si owner + must_sell.

### `evaluateProjectFit(answers)` → `strong | possible | tight | unknown`
Déterministe, basé uniquement sur les **fourchettes indicatives** configurées
par secteur/type dans `lib/regions.ts`. Aucune donnée fiable → `unknown`.
Budget sous la fourchette → `tight` (jamais « impossible »).

### `affordableAlternatives(answers)` — « ce qui EST possible »
Quand le budget est trop bas pour le type/secteur choisi, calcule et propose :
1. les **autres types** abordables dans le secteur choisi,
2. sinon les **secteurs** où le type choisi devient abordable,
3. sinon un **repli global** (combos type+secteur les plus abordables).
Exemple : plex à Brossard avec 300 000 $ → « Avec 300 000 $, un plex à Brossard
n'est pas réaliste. Ce budget te permet plutôt de viser : condo à Saint-Hubert,
condo à Longueuil, condo à Chambly. »

### `isNotReady(answers)`
Vrai si `downPayment < 20 000` **et** `buyingWith === "alone"`. Le rapport
mène alors avec « Ton projet n'est pas encore prêt » (bâtir la mise de fonds,
ou acheter à plusieurs).

---

## 8. RÈGLES DE QUALIFICATION CRM (`lib/config.ts` + `lib/qualification.ts`)

Constantes client :
- `MIN_BUDGET` = `{{null ou montant}}`
- `STORE_NOT_PREAPPROVED` = `{{true/false}}` (défaut false)
- `STORE_ALREADY_REPRESENTED` = `{{true/false}}` (défaut false)
- `STORE_LOW_FIT` = `{{true/false}}` (défaut true — nurturing)

`evaluateQualification()` décide de l'envoi au CRM :
- `under_contract` + !STORE_ALREADY_REPRESENTED → **pas de webhook**
- `not_started` + !STORE_NOT_PREAPPROVED → **pas de webhook** (orienter vers préqualif)
- segment `early_stage` + !STORE_LOW_FIT → pas de webhook
- sinon → envoi au CRM

---

## 9. ÉCRANS

**Hero** — eyebrow animé « Analyse propulsée par l'IA » ; H1 (2-3 lignes,
Montserrat gras) : « Qu'est-ce que tu peux **réellement** [en rouge] acheter
avec ton budget ? » ; sous-titre ; CTA « Analyser mon projet » ; microtexte
« Gratuit · Environ 2 minutes · Aucun calcul hypothécaire ».

**Loader** — minimum 2 s, animation « L'IA analyse ton projet d'achat ».

**Pré-révélation** — bouton principal « Oui, je veux voir mon analyse » +
petit lien « Je veux seulement voir un résumé ». Boutons désactivés 700 ms
(anti-clic fantôme).

**Résultats** — voir §10.

**DisqualifiedScreen** (under_contract) — message respectueux, aucun CRM,
aucun formulaire.

---

## 10. ÉCRAN DE RÉSULTATS (`results/ResultsScreen.tsx`)

Gating :
- Si « voir mon analyse » et coordonnées pas encore soumises → afficher
  seulement : cadenas, « Ton analyse est prête », **ContactForm**
  (titre « Où veux-tu recevoir ton analyse personnalisée ? »). Ne rien révéler
  avant soumission.
- Si « résumé » → niveau de préparation + compatibilité (non chiffrés) + CTA
  facultatif pour débloquer l'analyse complète.

Analyse complète, dans l'ordre :
1. **Illustration SVG du type de propriété** (condo, maison, maison de ville,
   plex avec escalier extérieur, ouvert) — accents rouges, inline (aucun asset externe).
2. **Verdict** en gros titre avec le **mot-clé en rouge** :
   « Ton projet est **réaliste** » / « **bien aligné** » / « **ambitieux** » /
   « mérite une **validation** » / « n'est **pas encore prêt** ».
3. Résumé (2-3 phrases).
4. « Ton projet d'achat en un coup d'œil » : secteur, type, chambres, budget
   (confirmé ou souhaité), échéancier, mise de fonds.
5. Niveau de préparation (Prêt à passer à l'action / Projet bien avancé /
   Préparation en cours / Premières étapes) + Compatibilité estimée
   (Forte / Possible / Serrée / À valider).
6. Points forts du projet.
7. Éléments à valider.
8. Ajustements possibles.
9. Plan d'action en 4 étapes.
10. CTA « Valider mon projet avec {{NOM_COURTIER}} ».
11. Avertissement standard (voir plus bas).

**Ne jamais afficher le score numérique** au visiteur.

Avertissement standard :
> « Cette analyse est indicative et repose uniquement sur les informations
> fournies. Elle ne constitue pas une préapprobation hypothécaire, une
> évaluation immobilière, un avis financier ni une garantie qu'une propriété
> correspondant aux critères est disponible. Les possibilités doivent être
> validées avec les professionnels concernés. »

---

## 11. API

### POST `/api/analyze`
Entrée : `{ answers }`. Le serveur calcule d'abord (déterministe) : `scoring`,
`segment`, `projectFit`, `secondaryTags`, `affordableAlternatives`, `isNotReady`.
Si `ANTHROPIC_API_KEY` présente → appel Claude Haiku 4.5 (JSON strict). Sinon,
ou si réponse invalide → `buildFallbackReport()` (100 % déterministe).

Rapport (JSON strict) :
```json
{
  "headline": "string",
  "summary": "string",
  "projectProfile": "string",
  "fitLevel": "strong | possible | tight | unknown",
  "strengths": ["...", "...", "..."],
  "considerations": ["...", "...", "..."],
  "recommendedAdjustments": ["...", "...", "..."],
  "nextSteps": ["...", "...", "...", "..."],
  "disclaimer": "string"
}
```
Forcer `fitLevel` sur la valeur déterministe. Retour :
`{ scoring, report, generatedBy: "claude" | "fallback" }`.

### POST `/api/lead`
Entrée : `{ name, email, phone, consent, answers, leadType: "buyer_analysis" }`.
**Champs requis : nom, courriel, téléphone, consentement, réponses** (téléphone
obligatoire car l'objectif est de transmettre un acheteur qualifié).
Consentement : « J'accepte de recevoir mon analyse et d'être contacté par
{{NOM_COURTIER}} au sujet de mon projet d'achat. »

Applique les règles CRM (§8). Si envoi autorisé, POST au webhook avec un
**payload aplati à la racine** (source, leadType, firstName, lastName, fullName,
email, phone, leadScore, leadSegment, projectFit, secondaryTags,
financingStatus, approvedBudget, targetBudget, downPayment, region, regionId,
propertyType, bedrooms, mustHaves, purchaseTimeline, currentHousing,
ownerStrategy, salePreparation, buyingWith, brokerStatus, consent, receivedAt)
**+ objets imbriqués** `{ lead, scoring, qualification, answers }`. Header
`X-Webhook-Secret` si le secret existe.

---

## 12. PROMPT SYSTÈME DE L'IA (analyse)

> Tu es un assistant d'analyse de projet d'achat immobilier au Québec. Tu aides
> un acheteur à comprendre la cohérence entre son financement confirmé ou en
> cours, son secteur, son type de propriété, ses critères et son échéancier. Tu
> ne remplaces ni un courtier immobilier ni un courtier hypothécaire. Tu ne
> recalcules pas la capacité d'emprunt. Tu n'inventes aucune statistique, aucun
> prix, aucune propriété, aucune donnée de marché, aucune disponibilité. Tu
> utilises seulement les données reçues et les fourchettes configurées. Si les
> données de marché manquent, tu le dis. Tu ne promets jamais qu'un achat sera
> possible. Si le type/secteur choisi est peu réaliste avec le budget, explique-le
> franchement et propose ce qui EST possible. Si le projet n'est pas prêt (mise
> de fonds < 20 000 $ en achetant seul), dis-le et recommande de bâtir la mise
> de fonds ou d'acheter à plusieurs. Ton simple, rassurant, direct, français
> canadien (tutoiement). Retourne uniquement le JSON demandé, sans markdown.

---

## 13. INTÉGRATIONS (variables d'environnement)

- `ANTHROPIC_API_KEY` — optionnelle (sinon fallback déterministe)
- `CRM_WEBHOOK_URL` / `CRM_WEBHOOK_SECRET` — webhook GHL du courtier
- `NEXT_PUBLIC_META_PIXEL_ID` — Meta Pixel (vide = non chargé) — build-time
- `NEXT_PUBLIC_CLARITY_PROJECT_ID` — Microsoft Clarity (vide = non chargé)

Meta Pixel : `PageView` au chargement, `ViewContent` au démarrage du formulaire,
`CompleteRegistration` à la fin du questionnaire, `Lead` seulement après
soumission acceptée par `/api/lead` (avec Advanced Matching + valeur selon le
segment : priority 20, qualified 10, autres 3).

---

## 14. CRITÈRES D'ACCEPTATION

- Déploie sur Vercel sans erreur.
- Le hero explique une analyse de projet, pas un calcul hypothécaire.
- Le statut de financement change la question de budget ; un budget souhaité
  n'est jamais présenté comme approuvé.
- La carte ne contient que les secteurs couverts ; au clic → « Bien reçu » +
  avance automatique.
- Choix uniques : auto-advance ~220 ms ; multisélection critères limitée à 3.
- Branche propriétaire (vendre avant / sans vendre) fonctionnelle ; tag
  `seller_buyer_opportunity` envoyé.
- Mise de fonds < 20 000 $ → question seul/à plusieurs ; seul → « pas prêt ».
- Budget trop bas → l'app dit ce qui EST possible (jamais « impossible » sec).
- Résultats : illustration du type + mot-clé du verdict en rouge ; score
  numérique jamais affiché.
- under_contract → écran respectueux, aucun CRM.
- Loader ≥ 2 s ; rapport IA toujours JSON valide ou fallback ; l'IA n'invente
  aucune donnée de marché.
- Formulaire final : nom, courriel, téléphone, consentement requis.
- Payload GHL aplati + objets imbriqués ; Pixel/Clarity ne chargent rien si ID vide.

---

## 15. SCÉNARIOS DE TEST OBLIGATOIRES

1. Préapprouvé, budget compatible, achat immédiat, locataire, aucun courtier →
   `priority`, webhook envoyé, verdict « bien aligné ».
2. Préqualifié, 3-6 mois, aucun courtier → `qualified`, webhook.
3. Préapprouvé, propriétaire devant vendre (vente pas commencée) → tag
   `seller_buyer_opportunity`.
4. Financement en processus, 6-12 mois → `nurture`/`early_stage`.
5. Non préqualifié (not_started) → aucun budget affiché comme approuvé ; webhook
   selon `STORE_NOT_PREAPPROVED`.
6. Déjà sous contrat → DisqualifiedScreen, aucun webhook.
7. Secteur sans données → `projectFit = unknown`, aucun chiffre inventé.
8. Plex à 300 000 $ dans un secteur cher → « pas réaliste » + alternatives concrètes.
9. Mise de fonds 10 000 $ + achat seul → « pas encore prêt » ; + à plusieurs → possible.
