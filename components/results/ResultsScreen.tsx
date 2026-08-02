"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { BROKER_NAME } from "@/lib/broker";
import { regionName } from "@/lib/regions";
import { formatCurrency } from "@/lib/format";
import { isNotReady } from "@/lib/scoring";
import type { AnalyzeResponse, Answers, LeadSegment, ProjectFit } from "@/lib/types";
import ContactForm, { type SubmitResult } from "./ContactForm";
import PropertyIllustration from "./PropertyIllustration";

// Verdict avec mot-clé mis en évidence (rendu en rouge dans le titre).
function verdictParts(fit: ProjectFit, notReady: boolean): { pre: string; em: string; post: string } {
  if (notReady) return { pre: "Ton projet ", em: "n'est pas encore prêt", post: "." };
  switch (fit) {
    case "strong":
      return { pre: "Ton projet est ", em: "bien aligné", post: "." };
    case "possible":
      return { pre: "Ton projet est ", em: "réaliste", post: "." };
    case "tight":
      return { pre: "Ton projet est ", em: "ambitieux", post: " — mais faisable." };
    case "unknown":
    default:
      return { pre: "Ton projet mérite une ", em: "validation", post: "." };
  }
}

interface Props {
  analyze: AnalyzeResponse;
  answers: Answers;
  revealChoice: "yes" | "no";
  onRestart: () => void;
}

const PREP_LABEL: Record<LeadSegment, string> = {
  priority: "Prêt à passer à l'action",
  qualified: "Projet bien avancé",
  nurture: "Préparation en cours",
  early_stage: "Premières étapes",
  represented: "Déjà accompagné",
};

const FIT_META: Record<ProjectFit, { label: string; color: string; bg: string; ring: string }> = {
  strong: { label: "Forte", color: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-300" },
  possible: { label: "Possible", color: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" },
  tight: { label: "Serrée", color: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-300" },
  unknown: { label: "À valider", color: "text-slate-700", bg: "bg-black/[0.03]", ring: "ring-black/10" },
};

const PROPERTY_LABEL: Record<string, string> = {
  house: "Maison unifamiliale",
  condo: "Condo",
  townhouse: "Maison de ville",
  plex: "Duplex / plex",
  open: "Ouvert",
};

const TIMELINE_LABEL: Record<string, string> = {
  asap: "Dès la bonne occasion",
  "0_3_months": "0-3 mois",
  "3_6_months": "3-6 mois",
  "6_12_months": "6-12 mois",
  exploring: "Exploration",
};

export default function ResultsScreen({ analyze, answers, revealChoice, onRestart }: Props) {
  const { scoring, report } = analyze;
  const [submission, setSubmission] = useState<SubmitResult | null>(null);
  const [summaryUnlock, setSummaryUnlock] = useState(false);

  const needsForm =
    !submission && (revealChoice === "yes" || (revealChoice === "no" && summaryUnlock));
  const showSummaryOnly = !submission && revealChoice === "no" && !summaryUnlock;

  // ── Vue verrouillée : formulaire de coordonnées ───────────────────────────
  if (needsForm) {
    return (
      <div className="min-h-screen px-5 sm:px-8 py-12 sm:py-16 max-w-xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <div className="relative mx-auto mb-7 w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-[var(--color-brand-500)]/20 blur-xl" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] border border-black/10 flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(220,20,46,0.5)]">
              <svg className="w-7 h-7 text-white" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="4" y="9" width="12" height="9" rx="2" />
                <path d="M7 9V6.5C7 4.8 8.3 3.5 10 3.5C11.7 3.5 13 4.8 13 6.5V9" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-brand-300)] mb-3">
            Analyse prête
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-[var(--color-brand-100)] leading-[1.1] tracking-tight text-balance">
            Ton analyse est prête.
          </h1>
        </motion.div>

        <ContactForm answers={answers} segment={scoring.segment} onSubmitted={setSubmission} />

        <div className="mt-10 text-center">
          <button onClick={onRestart} className="text-xs text-slate-500 hover:text-[var(--color-brand-200)] transition-colors">
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  // ── Vue résumé (choix « juste un résumé ») ────────────────────────────────
  if (showSummaryOnly) {
    return (
      <div className="min-h-screen px-5 sm:px-8 py-12 sm:py-16 max-w-xl mx-auto w-full text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="flex justify-center mb-5">
            <PropertyIllustration type={answers.propertyType} />
          </div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-brand-300)] mb-3">Résumé</p>
          {(() => {
            const p = verdictParts(report.fitLevel, isNotReady(answers));
            return (
              <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-brand-100)] leading-tight text-balance">
                {p.pre}
                <span className="text-[var(--color-brand-500)]">{p.em}</span>
                {p.post}
              </h1>
            );
          })()}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <SummaryTile label="Niveau de préparation" value={PREP_LABEL[scoring.segment]} />
            <SummaryTile label="Compatibilité estimée" value={FIT_META[scoring.projectFit].label} />
          </div>
          <p className="mt-8 text-sm text-slate-600 leading-relaxed">
            Pour voir tes points forts, les éléments à valider et ton plan d&apos;action détaillé,
            débloque ton analyse complète.
          </p>
          <button
            onClick={() => setSummaryUnlock(true)}
            className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium bg-gradient-to-b from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white shadow-[0_15px_40px_-10px_rgba(220,20,46,0.55)] hover:-translate-y-0.5 transition-all"
          >
            Voir mon analyse complète
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 10h10M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="mt-10">
            <button onClick={onRestart} className="text-xs text-slate-500 hover:text-[var(--color-brand-200)] transition-colors">
              Refaire l&apos;analyse
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Vue complète (après soumission) ───────────────────────────────────────
  const fit = FIT_META[report.fitLevel];
  const budget =
    typeof answers.approvedBudget === "number"
      ? `${formatCurrency(answers.approvedBudget)} (à valider)`
      : typeof answers.targetBudget === "number"
      ? `${formatCurrency(answers.targetBudget)} (souhaité)`
      : "À préciser";

  return (
    <div className="min-h-screen px-5 sm:px-8 py-10 sm:py-14 max-w-3xl mx-auto w-full">
      {/* Confirmation soumission */}
      {submission && <ConfirmationBlock result={submission} />}

      {/* Illustration + verdict (mot-clé en rouge) */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="text-center mt-10 mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center mb-6"
        >
          <PropertyIllustration type={answers.propertyType} />
        </motion.div>

        {(() => {
          const p = verdictParts(report.fitLevel, isNotReady(answers));
          return (
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[var(--color-brand-100)] leading-[1.05] tracking-tight text-balance">
              {p.pre}
              <span className="text-[var(--color-brand-500)]">{p.em}</span>
              {p.post}
            </h1>
          );
        })()}

        <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed text-balance max-w-2xl mx-auto">
          {report.summary}
        </p>
      </motion.div>

      {/* Projet en un coup d'œil */}
      <Section title="Ton projet d'achat en un coup d'œil" delay={0.15}>
        <div className="glass-card rounded-2xl p-5 sm:p-6">
          <p className="text-sm text-slate-700 leading-relaxed mb-4">{report.projectProfile}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Info label="Secteur" value={regionName(answers.region) || "—"} />
            <Info label="Type" value={answers.propertyType ? PROPERTY_LABEL[answers.propertyType] : "—"} />
            <Info label="Chambres" value={answers.bedrooms ? `${answers.bedrooms}${answers.bedrooms >= 5 ? "+" : ""}` : "—"} />
            <Info label="Budget" value={budget} />
            <Info label="Échéancier" value={answers.purchaseTimeline ? TIMELINE_LABEL[answers.purchaseTimeline] : "—"} />
            <Info label="Mise de fonds" value={answers.downPayment ? formatCurrency(answers.downPayment) : "—"} />
          </div>
        </div>
      </Section>

      {/* Niveau de préparation + compatibilité */}
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <div className="glass-card rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">Niveau de préparation</p>
          <p className="font-serif text-2xl text-[var(--color-brand-100)] mt-1.5">{PREP_LABEL[scoring.segment]}</p>
        </div>
        <div className={`rounded-2xl p-5 ${fit.bg} ring-1 ${fit.ring}`}>
          <p className="text-[11px] uppercase tracking-wider text-slate-600">Compatibilité estimée</p>
          <p className={`font-serif text-2xl mt-1.5 ${fit.color}`}>{fit.label}</p>
        </div>
      </div>

      <ListSection title="Points forts du projet" items={report.strengths} tone="positive" delay={0.25} />
      <ListSection title="Éléments à valider" items={report.considerations} tone="neutral" delay={0.3} />
      <ListSection title="Ajustements possibles" items={report.recommendedAdjustments} tone="neutral" delay={0.35} />

      {/* Plan d'action */}
      <Section title="Plan d'action" delay={0.4}>
        <ol className="space-y-3">
          {report.nextSteps.map((s, i) => (
            <li key={i} className="glass-card rounded-2xl p-4 sm:p-5 flex gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] flex items-center justify-center font-serif text-white text-sm shadow-[0_6px_18px_-4px_rgba(220,20,46,0.5)]">
                {i + 1}
              </span>
              <p className="text-sm text-slate-700 leading-relaxed self-center">{s}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* CTA */}
      <div className="mt-10 text-center">
        <p className="font-serif text-2xl sm:text-3xl text-[var(--color-brand-100)] mb-5 text-balance">
          Prêt à concrétiser ton projet ?
        </p>
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium bg-gradient-to-b from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white shadow-[0_15px_40px_-10px_rgba(220,20,46,0.55)] hover:-translate-y-0.5 transition-all"
        >
          Valider mon projet avec {BROKER_NAME}
        </button>
      </div>

      {/* Avertissement */}
      <div className="mt-12 rounded-2xl bg-black/[0.025] border border-black/[0.08] p-5">
        <p className="text-[11px] text-slate-500 leading-relaxed">{report.disclaimer}</p>
      </div>

      {/* Footer */}
      <div className="mt-8 mb-16 text-center">
        <button onClick={onRestart} className="text-sm text-slate-600 hover:text-[var(--color-brand-200)] transition-colors underline underline-offset-4 decoration-black/15">
          Refaire l&apos;analyse
        </button>
        <p className="mt-6 text-[10px] text-slate-600 uppercase tracking-[0.2em]">
          Analyse {analyze.generatedBy === "claude" ? "IA" : "déterministe"} · {BROKER_NAME}
        </p>
      </div>
    </div>
  );
}

function ConfirmationBlock({ result }: { result: SubmitResult }) {
  const { stored, firstName, reason } = result;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`rounded-3xl p-6 sm:p-7 ${
        stored
          ? "bg-emerald-50 border border-emerald-300"
          : "bg-[var(--color-brand-50)] border border-[var(--color-brand-400)]/40"
      }`}
    >
      {stored ? (
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          <span className="font-serif text-lg text-[var(--color-brand-100)]">Merci {firstName} !</span>{" "}
          Ton analyse complète est ci-dessous. Un courtier de l&apos;équipe {BROKER_NAME} te
          joindra sous peu pour valider ton projet.
        </p>
      ) : (
        <p className="text-sm sm:text-base text-[var(--color-gold-soft)]/90 leading-relaxed">
          <span className="font-serif text-lg text-[var(--color-gold-soft)]">Merci {firstName} !</span>{" "}
          {reason === "not_preapproved"
            ? "Voici ton analyse à titre indicatif. Comme ton financement n'est pas encore confirmé, la prochaine étape idéale est d'obtenir une préqualification avant les visites."
            : "Voici ton analyse à titre indicatif. Tes coordonnées n'ont pas été conservées."}
        </p>
      )}
    </motion.div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="font-serif text-lg text-[var(--color-brand-100)] mt-1 leading-tight">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-sm text-[var(--color-brand-100)] mt-0.5 font-medium">{value}</p>
    </div>
  );
}

function Section({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="mt-8"
    >
      <h3 className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-4">{title}</h3>
      {children}
    </motion.section>
  );
}

function ListSection({
  title,
  items,
  tone,
  delay,
}: {
  title: string;
  items: string[];
  tone: "positive" | "neutral";
  delay: number;
}) {
  if (!items || items.length === 0) return null;
  return (
    <Section title={title} delay={delay}>
      <ul className="space-y-2.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <span className={`shrink-0 mt-1.5 w-2 h-2 rounded-full ${tone === "positive" ? "bg-emerald-400" : "bg-[var(--color-brand-400)]"}`} />
            <span className="text-slate-700 leading-relaxed">{it}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
