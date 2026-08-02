"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useRef, useState } from "react";
import { getVisibleQuestions, isAnswered, MUST_HAVE_CHOICES } from "@/lib/questions";
import { BROKER_NAME } from "@/lib/broker";
import { regionName } from "@/lib/regions";
import type { Answers, MustHave } from "@/lib/types";
import ProgressBar from "./ProgressBar";
import ChoiceQuestion from "./questions/ChoiceQuestion";
import CurrencyQuestion from "./questions/CurrencyQuestion";
import RegionMap from "./questions/RegionMap";
import MultiChoiceQuestion from "./questions/MultiChoiceQuestion";
import BedroomsQuestion from "./questions/BedroomsQuestion";

interface Props {
  onComplete: (answers: Answers) => void;
  onDisqualified: (answers: Answers) => void;
  onExit: () => void;
}

const AUTO_ADVANCE_MS = 220;
const FINISH_OVERLAY_MS = 1000;
const REGION_CONFIRM_MS = 850;

export default function QualificationForm({ onComplete, onDisqualified, onExit }: Props) {
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [finishing, setFinishing] = useState(false);
  // Message de confirmation transitoire (ex. après sélection d'un secteur).
  const [confirming, setConfirming] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visible = useMemo(() => getVisibleQuestions(answers), [answers]);
  const current = visible[Math.min(index, visible.length - 1)];
  const isLast = index >= visible.length - 1;
  const canProceed = current ? isAnswered(current, answers) : false;

  const submit = useCallback(
    (finalAnswers: Answers) => {
      if (timer.current) clearTimeout(timer.current);
      setFinishing(true);
      timer.current = setTimeout(() => onComplete(finalAnswers), FINISH_OVERLAY_MS);
    },
    [onComplete]
  );

  const goNext = useCallback(() => {
    setDirection(1);
    if (isLast) {
      submit(answers);
    } else {
      setIndex((i) => Math.min(visible.length - 1, i + 1));
    }
  }, [isLast, submit, answers, visible.length]);

  const goPrev = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setDirection(-1);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const advanceAfter = useCallback(
    (nextAnswers: Answers) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setDirection(1);
        setIndex((i) => {
          const visibleAfter = getVisibleQuestions(nextAnswers);
          if (i >= visibleAfter.length - 1) {
            submit(nextAnswers);
            return i;
          }
          return i + 1;
        });
      }, AUTO_ADVANCE_MS);
    },
    [submit]
  );

  const updateAndMaybeAdvance = useCallback(
    (partial: Partial<Answers>, autoAdvance: boolean) => {
      let next: Answers = answers;
      setAnswers((prev) => {
        const merged = { ...prev, ...partial };
        // Nettoyage des branches conditionnelles
        if ("financingStatus" in partial) {
          if (partial.financingStatus === "preapproved" || partial.financingStatus === "prequalified") {
            delete merged.targetBudget;
          } else {
            delete merged.approvedBudget;
          }
        }
        if ("currentHousing" in partial && partial.currentHousing !== "owner") {
          delete merged.ownerStrategy;
          delete merged.salePreparation;
        }
        if ("ownerStrategy" in partial && partial.ownerStrategy !== "must_sell") {
          delete merged.salePreparation;
        }
        // Si la mise de fonds repasse au-dessus du seuil, on oublie buyingWith.
        if ("downPayment" in partial && typeof partial.downPayment === "number" && partial.downPayment >= 20000) {
          delete merged.buyingWith;
        }
        next = merged;
        return merged;
      });

      // Secteur : confirmation « Bien reçu » puis avance automatique.
      if ("region" in partial && partial.region) {
        if (timer.current) clearTimeout(timer.current);
        setConfirming(`Secteur bien reçu : ${regionName(next.region)}`);
        timer.current = setTimeout(() => {
          setConfirming(null);
          setDirection(1);
          setIndex((i) => {
            const visibleAfter = getVisibleQuestions(next);
            if (i >= visibleAfter.length - 1) {
              submit(next);
              return i;
            }
            return i + 1;
          });
        }, REGION_CONFIRM_MS);
        return;
      }

      // Dernière étape : représentation courtier.
      if ("brokerStatus" in partial) {
        if (partial.brokerStatus === "under_contract") {
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => onDisqualified(next), AUTO_ADVANCE_MS);
          return;
        }
        // none / talking_unsigned → overlay puis analyse
        if (timer.current) clearTimeout(timer.current);
        setFinishing(true);
        timer.current = setTimeout(() => onComplete(next), FINISH_OVERLAY_MS);
        return;
      }

      if (autoAdvance) advanceAfter(next);
    },
    [answers, onComplete, onDisqualified, advanceAfter, submit]
  );

  if (!current) return null;

  if (confirming) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 w-14 h-14 rounded-full bg-[var(--color-brand-500)]/15 border border-[var(--color-brand-400)]/40 flex items-center justify-center">
            <svg className="w-7 h-7 text-[var(--color-brand-300)]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 10L8 14L16 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[var(--color-brand-100)]">Bien reçu !</h2>
          <p className="mt-3 text-slate-600">{confirming}</p>
        </motion.div>
      </div>
    );
  }

  if (finishing) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 w-14 h-14 rounded-full bg-[var(--color-brand-500)]/15 border border-[var(--color-brand-400)]/40 flex items-center justify-center">
            <svg className="w-7 h-7 text-[var(--color-brand-300)]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 10L8 14L16 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[var(--color-brand-100)]">Bien reçu !</h2>
          <p className="mt-3 text-slate-600">On prépare ton analyse…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-5 sm:px-8 py-6 sm:py-10 max-w-2xl mx-auto w-full">
      <header className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
        <button
          onClick={onExit}
          className="text-xs text-slate-500 hover:text-[var(--color-brand-200)] transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 2L2 6L5 10M2 6H10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Retour
        </button>
        <div className="font-serif italic text-sm text-[var(--color-brand-300)]">{BROKER_NAME}</div>
      </header>

      <ProgressBar current={index} total={visible.length} />

      <div className="flex-1 mt-10 sm:mt-14 relative">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={`${current.id}-${index}`}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-7 sm:mb-9">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[var(--color-brand-100)] leading-tight tracking-tight text-balance">
                {current.title}
              </h2>
              {current.subtitle && (
                <p className="mt-2.5 text-sm sm:text-base text-slate-600">{current.subtitle}</p>
              )}
            </div>

            <QuestionRenderer answers={answers} onUpdate={updateAndMaybeAdvance} current={current} />

            {current.note && (
              <p className="mt-6 text-xs text-slate-500 leading-relaxed border-l-2 border-black/10 pl-3">
                {current.note}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="mt-8 sm:mt-10 pt-6 border-t border-black/[0.08]">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goPrev}
            disabled={index === 0}
            className="px-5 py-2.5 rounded-full text-sm font-medium text-slate-600 hover:text-[var(--color-brand-200)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Précédent
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={() => submit(answers)}
              disabled={!canProceed}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full text-sm font-medium bg-gradient-to-b from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white shadow-[0_15px_40px_-10px_rgba(220,20,46,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(220,20,46,0.65)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Voir mon analyse
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 10h10M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium bg-black/[0.05] border border-black/10 text-[var(--color-brand-100)] hover:bg-black/[0.06] hover:border-black/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Suivant
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 10h10M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

interface RendererProps {
  current: ReturnType<typeof getVisibleQuestions>[number];
  answers: Answers;
  onUpdate: (partial: Partial<Answers>, autoAdvance: boolean) => void;
}

function QuestionRenderer({ current, answers, onUpdate }: RendererProps) {
  const auto = !!current.autoAdvance;
  switch (current.id) {
    case "financingStatus":
      return (
        <ChoiceQuestion
          choices={current.choices!}
          value={answers.financingStatus}
          onChange={(v) => onUpdate({ financingStatus: v as Answers["financingStatus"] }, auto)}
        />
      );
    case "budget": {
      const isConfirmed =
        answers.financingStatus === "preapproved" || answers.financingStatus === "prequalified";
      return (
        <CurrencyQuestion
          value={isConfirmed ? answers.approvedBudget : answers.targetBudget}
          onChange={(v) =>
            onUpdate(isConfirmed ? { approvedBudget: v } : { targetBudget: v }, false)
          }
          placeholder="500 000"
          helper={
            isConfirmed
              ? "Montant à confirmer avec ton professionnel avant toute transaction."
              : "Budget souhaité, à valider — jamais présenté comme approuvé."
          }
        />
      );
    }
    case "downPayment":
      return (
        <CurrencyQuestion
          value={answers.downPayment}
          onChange={(v) => onUpdate({ downPayment: v }, false)}
          placeholder="50 000"
          helper="Sert à comprendre l'état de préparation, pas à calculer un prêt."
        />
      );
    case "buyingWith":
      return (
        <ChoiceQuestion
          choices={current.choices!}
          value={answers.buyingWith}
          onChange={(v) => onUpdate({ buyingWith: v as Answers["buyingWith"] }, auto)}
        />
      );
    case "region":
      return (
        <RegionMap
          value={answers.region}
          onChange={(id) => onUpdate({ region: id }, false)}
        />
      );
    case "propertyType":
      return (
        <ChoiceQuestion
          choices={current.choices!}
          value={answers.propertyType}
          onChange={(v) => onUpdate({ propertyType: v as Answers["propertyType"] }, auto)}
        />
      );
    case "bedrooms":
      return (
        <BedroomsQuestion
          value={answers.bedrooms}
          onChange={(v) => onUpdate({ bedrooms: v }, auto)}
        />
      );
    case "mustHaves":
      return (
        <MultiChoiceQuestion
          choices={MUST_HAVE_CHOICES}
          value={answers.mustHaves ?? []}
          max={3}
          exclusiveValue="aucun"
          onChange={(vals) => onUpdate({ mustHaves: vals as MustHave[] }, false)}
        />
      );
    case "purchaseTimeline":
      return (
        <ChoiceQuestion
          choices={current.choices!}
          value={answers.purchaseTimeline}
          onChange={(v) => onUpdate({ purchaseTimeline: v as Answers["purchaseTimeline"] }, auto)}
        />
      );
    case "currentHousing":
      return (
        <ChoiceQuestion
          choices={current.choices!}
          value={answers.currentHousing}
          onChange={(v) => onUpdate({ currentHousing: v as Answers["currentHousing"] }, auto)}
        />
      );
    case "ownerStrategy":
      return (
        <ChoiceQuestion
          choices={current.choices!}
          value={answers.ownerStrategy}
          onChange={(v) => onUpdate({ ownerStrategy: v as Answers["ownerStrategy"] }, auto)}
        />
      );
    case "salePreparation":
      return (
        <ChoiceQuestion
          choices={current.choices!}
          value={answers.salePreparation}
          onChange={(v) => onUpdate({ salePreparation: v as Answers["salePreparation"] }, auto)}
        />
      );
    case "brokerStatus":
      return (
        <ChoiceQuestion
          choices={current.choices!}
          value={answers.brokerStatus}
          onChange={(v) => onUpdate({ brokerStatus: v as Answers["brokerStatus"] }, auto)}
        />
      );
    default:
      return null;
  }
}
