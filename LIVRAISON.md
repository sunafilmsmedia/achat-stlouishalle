# Achat — St Louis Hallé (Logiciel Acheteur IA)

Analyseur IA de projet d'achat immobilier. Qualifie des **acheteurs** (déjà
préapprouvés/préqualifiés) et transmet les meilleurs profils au CRM.
Ne calcule **jamais** une capacité d'emprunt.

Basé sur le template Vyncent (Next.js 15 · React 19 · Tailwind v4 · Framer Motion ·
react-leaflet · Claude Haiku 4.5). Thème **noir / rouge** (eXp, Rive-Sud).

## ⚠️ À personnaliser avant la mise en production

| Élément | Fichier | État |
|---|---|---|
| **Logos** (broker + franchise) | `public/logo-broker.png`, `public/logo-franchise.png` | ⚠️ Placeholders (images Vyncent/RE-MAX) — à remplacer par les vrais PNG transparents + ajuster `width`/`height` dans `components/TopLogos.tsx` |
| Identité courtier | `lib/broker.ts` | Nom/titre/franchise renseignés — vérifier |
| Courriel / téléphone GHL | (non fournis dans le brief) | À ajouter au besoin |
| Secteurs + GPS | `lib/regions.ts` | 12 secteurs Rive-Sud plausibles — à valider |
| Fourchettes de prix | `lib/regions.ts` | **Estimations internes** (`RANGES_SOURCE`) — à remplacer par des données datées, ou vider pour forcer `unknown` |
| Règles de qualification | `lib/config.ts` | Valeurs par défaut recommandées (Section H du brief non remplie) |
| Couleurs hex précises | `app/globals.css` | Rouge `#dc142e` par défaut (brief ne donnait pas de hex) |

## Variables d'environnement (`.env.local`)

Toutes optionnelles. Voir `.env.local.example`.

- `ANTHROPIC_API_KEY` — sans clé, rapport déterministe de fallback.
- `CRM_WEBHOOK_URL` / `CRM_WEBHOOK_SECRET` — ⚠️ renseigner le webhook **de St Louis Hallé** (ne jamais réutiliser celui d'un autre courtier).
- `NEXT_PUBLIC_META_PIXEL_ID` — vide = pixel non chargé.
- `NEXT_PUBLIC_CLARITY_PROJECT_ID` — vide = Clarity non chargé.

## Règles d'envoi CRM (`lib/config.ts` → `lib/qualification.ts`)

- `under_contract` + `STORE_ALREADY_REPRESENTED=false` → **pas de webhook**
- `not_started` + `STORE_NOT_PREAPPROVED=false` → **pas de webhook**
- segment `early_stage` + `STORE_LOW_FIT=false` → pas de webhook (défaut `true` = nurturing)
- Tous les autres profils autorisés → envoi au CRM (payload aplati + objets imbriqués, header `X-Webhook-Secret`).

## Scoring (interne, jamais affiché)

Financement 35 · Échéancier 25 · Représentation 20 · Préparation résidentielle 10 ·
Compatibilité budget/secteur 10. Segments : priority (80+) / qualified (60+) /
nurture (35+) / early_stage (<35) / represented. Tag secondaire
`seller_buyer_opportunity` si `owner_must_sell`.

## Tests API vérifiés (`next start`)

| Scénario | Résultat |
|---|---|
| Préapprouvé / asap / renter / none | score 100 · **priority** · fit strong · webhook ✓ |
| Préapprouvé / owner_must_sell | **priority** · tag `seller_buyer_opportunity` ✓ |
| Financement pas commencé, sans budget | fit **unknown** · early_stage |
| Lead not_started | `stored:false` · `not_preapproved` |
| Lead under_contract | `stored:false` · `already_represented` |
| Lead sans téléphone | HTTP 400 |

## Déploiement

Repo : `https://github.com/sunafilmsmedia/achat-stlouishalle.git`

```bash
npm install
npm run build   # ✓ compile sans erreur
npm run dev
```

Push sur `main` → auto-déploiement Vercel. Configurer les variables d'env,
brancher le domaine, puis retester chaque profil avec de vraies soumissions GHL.
