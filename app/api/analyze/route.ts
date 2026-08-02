import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { computeScoring, affordableAlternatives, isNotReady } from "@/lib/scoring";
import { buildFallbackReport, STANDARD_DISCLAIMER } from "@/lib/fallbackReport";
import { regionName, RANGES_SOURCE } from "@/lib/regions";
import type { AnalyzeResponse, Answers, ProjectFit, Report } from "@/lib/types";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Tu es un assistant d'analyse de projet d'achat immobilier au Québec (Rive-Sud de Montréal). Tu aides un acheteur à comprendre la cohérence générale entre son financement déjà confirmé ou en cours, son secteur, son type de propriété, ses critères et son échéancier. Tu ne remplaces ni un courtier immobilier ni un courtier hypothécaire. Tu ne recalcules pas la capacité d'emprunt. Tu n'inventes aucune statistique, aucun prix, aucune propriété, aucune donnée de marché et aucune disponibilité. Tu utilises seulement les données reçues et les fourchettes configurées. Si les données de marché sont absentes ou datées, tu le dis clairement. Tu ne promets jamais qu'un achat sera possible. Tu proposes des compromis raisonnables, par exemple élargir le secteur, ajuster le type de propriété, distinguer les besoins des préférences ou valider la stratégie avec le courtier. Le ton est simple, rassurant, direct et en français canadien (tutoiement). Retourne uniquement le JSON demandé, sans markdown ni texte supplémentaire.`;

const VALID_FITS: ProjectFit[] = ["strong", "possible", "tight", "unknown"];

function extractJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // fallthrough
  }
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
  return null;
}

function isValidReport(r: unknown): r is Report {
  if (!r || typeof r !== "object") return false;
  const x = r as Record<string, unknown>;
  return (
    typeof x.headline === "string" &&
    typeof x.summary === "string" &&
    typeof x.projectProfile === "string" &&
    typeof x.fitLevel === "string" &&
    VALID_FITS.includes(x.fitLevel as ProjectFit) &&
    Array.isArray(x.strengths) &&
    Array.isArray(x.considerations) &&
    Array.isArray(x.recommendedAdjustments) &&
    Array.isArray(x.nextSteps) &&
    x.nextSteps.length >= 3
  );
}

export async function POST(req: Request) {
  let body: { answers?: Answers };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const answers = body.answers ?? {};
  const scoring = computeScoring(answers);
  const fallback = buildFallbackReport(answers, scoring);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const payload: AnalyzeResponse = { scoring, report: fallback, generatedBy: "fallback" };
    return NextResponse.json(payload);
  }

  try {
    const client = new Anthropic({ apiKey });
    const userMessage = {
      answers: {
        ...answers,
        regionName: regionName(answers.region),
        alternateRegionNames: (answers.alternateRegions ?? []).map(regionName),
      },
      computed: {
        projectFit: scoring.projectFit,
        segment: scoring.segment, // interne, ne pas divulguer au visiteur
        notReady: isNotReady(answers),
        affordability: affordableAlternatives(answers),
      },
      dataNote: `Les fourchettes de prix disponibles sont indicatives (${RANGES_SOURCE}). N'invente aucun autre chiffre. Si "affordability.chosenAffordable" est faux, explique franchement que le type/secteur choisi est peu réaliste avec ce budget et propose plutôt les options de "affordability" (autres types du secteur, mêmes types ailleurs, ou "globalAffordable"). Si "notReady" est vrai, dis clairement que le projet n'est pas prêt (mise de fonds < 20 000 $ en achetant seul) et recommande de bâtir la mise de fonds ou d'acheter à plusieurs.`,
      requiredSchema: {
        headline: "phrase d'accroche, 1 ligne",
        summary: "résumé, 2-3 phrases",
        projectProfile: "1 phrase résumant secteur, type, chambres, budget, échéancier",
        fitLevel: "strong | possible | tight | unknown — DOIT valoir exactement " + scoring.projectFit,
        strengths: ["3 forces courtes"],
        considerations: ["3 éléments à valider"],
        recommendedAdjustments: ["3 ajustements possibles"],
        nextSteps: ["exactement 4 étapes courtes et actionnables"],
        disclaimer: "avertissement (tu peux reprendre celui fourni)",
      },
      fallbackDisclaimer: STANDARD_DISCLAIMER,
    };

    const completion = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Voici les données. Réponds uniquement avec un objet JSON valide qui respecte le schéma. Le champ fitLevel doit valoir exactement "${scoring.projectFit}".\n\n${JSON.stringify(userMessage, null, 2)}`,
        },
      ],
    });

    const textBlock = completion.content.find((c) => c.type === "text");
    const text = textBlock && textBlock.type === "text" ? textBlock.text : "";
    const parsed = extractJson(text);

    if (isValidReport(parsed)) {
      // On force fitLevel sur la valeur déterministe et on garantit le disclaimer.
      const report: Report = {
        ...parsed,
        fitLevel: scoring.projectFit,
        disclaimer: parsed.disclaimer || STANDARD_DISCLAIMER,
      };
      const payload: AnalyzeResponse = { scoring, report, generatedBy: "claude" };
      return NextResponse.json(payload);
    }
  } catch (err) {
    console.error("[analyze] Claude error", err);
  }

  const payload: AnalyzeResponse = { scoring, report: fallback, generatedBy: "fallback" };
  return NextResponse.json(payload);
}
