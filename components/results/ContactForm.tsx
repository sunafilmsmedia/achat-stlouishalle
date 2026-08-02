"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { trackLeadWithMatching } from "../MetaPixel";
import { BROKER_NAME } from "@/lib/broker";
import type { Answers, LeadSegment } from "@/lib/types";

export interface SubmitResult {
  stored: boolean;
  firstName: string;
  segment: LeadSegment | null;
  reason?: string | null;
}

interface Props {
  answers: Answers;
  segment: LeadSegment;
  onSubmitted: (result: SubmitResult) => void;
}

function leadValue(segment: LeadSegment): number {
  if (segment === "priority") return 20;
  if (segment === "qualified") return 10;
  return 3;
}

export default function ContactForm({ answers, segment, onSubmitted }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) return setError("Ton nom est requis.");
    if (!email.trim()) return setError("Ton courriel est requis.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setError("Format de courriel invalide.");
    }
    if (!phone.trim()) return setError("Ton téléphone est requis.");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) return setError("Numéro de téléphone invalide.");
    if (!consent) return setError("Merci de cocher la case de consentement.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          consent,
          answers,
          leadType: "buyer_analysis",
        }),
      });
      const data = await res.json();

      const [firstNameRaw, ...lastParts] = name.trim().split(/\s+/);

      // Meta Pixel — Lead avec Advanced Matching (uniquement si stocké).
      if (data.stored) {
        trackLeadWithMatching(
          {
            email: email.trim(),
            phone: phone.trim(),
            firstName: firstNameRaw,
            lastName: lastParts.join(" ") || undefined,
          },
          {
            currency: "CAD",
            value: leadValue(segment),
            lead_segment: segment,
            financing_status: answers.financingStatus,
            purchase_timeline: answers.purchaseTimeline,
            project_fit: answers.propertyType, // placeholder informatif
          }
        );
      }

      onSubmitted({
        stored: !!data.stored,
        firstName: firstNameRaw,
        segment: data.segment ?? segment,
        reason: data.reason ?? null,
      });
    } catch {
      setError("Une erreur est survenue. Réessaie dans quelques secondes.");
      setSubmitting(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="
        rounded-3xl p-6 sm:p-8
        bg-gradient-to-br from-[var(--color-brand-50)] to-white
        border border-[var(--color-brand-400)]/30
        shadow-[0_30px_80px_-30px_rgba(0,0,0,0.18)]
      "
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-1 h-1 rounded-full bg-[var(--color-brand-400)]" />
        <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-brand-300)]">
          Analyse personnalisée
        </span>
      </div>

      <h3 className="font-serif text-2xl sm:text-3xl text-[var(--color-brand-100)] leading-tight text-balance">
        Où veux-tu recevoir ton analyse personnalisée ?
      </h3>
      <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
        Entre tes coordonnées pour découvrir ce que ton budget et tes critères te
        permettent de viser.
      </p>

      <div className="mt-6 space-y-3">
        <Field label="Courriel" required type="email" autoComplete="email" value={email} onChange={setEmail} placeholder="marie@exemple.ca" />
        <Field label="Ton prénom" required autoComplete="given-name" value={name} onChange={setName} placeholder="Marie" />
        <Field label="Téléphone" required type="tel" autoComplete="tel" value={phone} onChange={setPhone} placeholder="(450) 555-0123" helper="Pour qu'un courtier puisse valider ton projet avec toi." />
      </div>

      <label className="flex items-start gap-3 cursor-pointer group select-none mt-5">
        <span className="relative shrink-0 mt-0.5">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="peer sr-only" />
          <span className="block w-5 h-5 rounded-md border border-black/15 bg-black/[0.03] peer-checked:bg-[var(--color-brand-500)] peer-checked:border-[var(--color-brand-400)] transition-colors" />
          <svg className="absolute inset-0 m-auto w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 6.5L4.5 9L10 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          J&apos;accepte de recevoir mon analyse et d&apos;être contacté par {BROKER_NAME} au
          sujet de mon projet d&apos;achat.
        </span>
      </label>

      {error && <p className="mt-3 text-sm text-rose-400 text-center">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="
          mt-6 w-full inline-flex items-center justify-center gap-2
          px-6 py-4 rounded-full text-base font-medium
          bg-gradient-to-b from-[var(--color-brand-500)] to-[var(--color-brand-700)]
          text-white shadow-[0_15px_40px_-10px_rgba(220,20,46,0.55)]
          hover:shadow-[0_20px_50px_-10px_rgba(220,20,46,0.7)]
          disabled:opacity-60 disabled:cursor-not-allowed transition-all
        "
      >
        {submitting ? (
          <>
            <Spinner /> Envoi en cours…
          </>
        ) : (
          <>
            Voir mon analyse
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 10h10M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </button>
    </motion.section>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  helper?: string;
}

function Field({ label, value, onChange, placeholder, type = "text", required, autoComplete, helper }: FieldProps) {
  return (
    <div>
      <label className="block">
        <span className="text-[11px] uppercase tracking-wider text-slate-500 mb-1.5 block">
          {label} {required && <span className="text-[var(--color-brand-400)]">*</span>}
        </span>
        <input
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full glass-card rounded-xl px-4 py-3 text-[var(--color-brand-100)] placeholder:text-slate-400 focus-within:border-[var(--color-brand-400)]/60 transition-colors text-base"
        />
      </label>
      {helper && <p className="text-[11px] text-slate-500 mt-1.5">{helper}</p>}
    </div>
  );
}
