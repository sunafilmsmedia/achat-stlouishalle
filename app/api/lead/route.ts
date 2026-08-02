import { NextResponse } from "next/server";
import { computeScoring } from "@/lib/scoring";
import { evaluateQualification } from "@/lib/qualification";
import { regionName } from "@/lib/regions";
import type { Answers, LeadPayload } from "@/lib/types";

export const runtime = "nodejs";

const SOURCE = "achat-stlouishalle";

interface IncomingBody extends Partial<LeadPayload> {
  answers?: Answers;
}

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export async function POST(req: Request) {
  let body: IncomingBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, phone, email, consent, answers } = body;

  // Le téléphone est requis : l'objectif est de transmettre un acheteur
  // qualifié au courtier.
  if (!name || !email || !phone || !consent || !answers) {
    return NextResponse.json(
      { stored: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  const scoring = computeScoring(answers);
  const qualification = evaluateQualification(answers, scoring);

  // Règles critiques d'envoi CRM (source de vérité = lib/config.ts).
  if (!qualification.storeInCrm) {
    return NextResponse.json({
      stored: false,
      reason: qualification.blockReason,
      segment: scoring.segment,
    });
  }

  const { firstName, lastName } = splitName(name);

  // Payload APLATI à la racine pour mapping GHL direct + objets imbriqués.
  const payload = {
    source: SOURCE,
    leadType: "buyer_analysis" as const,
    receivedAt: new Date().toISOString(),

    // Contact
    firstName,
    lastName,
    fullName: name,
    email,
    phone,

    // Scoring (interne)
    leadScore: scoring.score,
    leadSegment: scoring.segment,
    projectFit: scoring.projectFit,
    secondaryTags: scoring.secondaryTags,

    // Projet d'achat
    financingStatus: answers.financingStatus ?? "",
    approvedBudget: answers.approvedBudget ?? null,
    targetBudget: answers.targetBudget ?? null,
    downPayment: answers.downPayment ?? null,
    region: regionName(answers.region),
    regionId: answers.region ?? "",
    alternateRegions: (answers.alternateRegions ?? []).map(regionName),
    propertyType: answers.propertyType ?? "",
    bedrooms: answers.bedrooms ?? null,
    mustHaves: answers.mustHaves ?? [],
    purchaseTimeline: answers.purchaseTimeline ?? "",
    currentHousing: answers.currentHousing ?? "",
    ownerStrategy: answers.ownerStrategy ?? "",
    salePreparation: answers.salePreparation ?? "",
    buyingWith: answers.buyingWith ?? "",
    brokerStatus: answers.brokerStatus ?? "",

    consent: !!consent,

    // Structures imbriquées
    lead: { name, phone, email },
    scoring,
    qualification,
    answers,
  };

  const webhookUrl = process.env.CRM_WEBHOOK_URL;
  const webhookSecret = process.env.CRM_WEBHOOK_SECRET;

  if (webhookUrl) {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (webhookSecret) headers["X-Webhook-Secret"] = webhookSecret;
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) console.error("[lead] Webhook returned", res.status);
    } catch (err) {
      console.error("[lead] Webhook failed", err);
    }
  } else {
    console.log("[lead] Stored (no webhook configured):", JSON.stringify(payload));
  }

  return NextResponse.json({
    stored: true,
    segment: scoring.segment,
  });
}
