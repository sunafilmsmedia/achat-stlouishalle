"use client";

import { motion } from "framer-motion";
import type { Choice } from "@/lib/questions";

interface Props {
  choices: Choice[];
  value: string[];
  max?: number;
  // Valeur exclusive : quand sélectionnée, désélectionne toutes les autres
  // (et inversement). Utilisé pour « Aucun critère indispensable ».
  exclusiveValue?: string;
  onChange: (values: string[]) => void;
}

export default function MultiChoiceQuestion({
  choices,
  value,
  max = 3,
  exclusiveValue = "aucun",
  onChange,
}: Props) {
  const toggle = (v: string) => {
    if (v === exclusiveValue) {
      onChange(value.includes(v) ? [] : [v]);
      return;
    }
    // Retirer l'exclusif si on choisit un vrai critère
    const base = value.filter((x) => x !== exclusiveValue);
    if (base.includes(v)) {
      onChange(base.filter((x) => x !== v));
    } else {
      if (base.length >= max) return; // limite atteinte
      onChange([...base, v]);
    }
  };

  const selectedCount = value.filter((x) => x !== exclusiveValue).length;

  return (
    <div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {choices.map((c, i) => {
          const selected = value.includes(c.value);
          const isExclusive = c.value === exclusiveValue;
          const atLimit = !selected && !isExclusive && selectedCount >= max;
          return (
            <motion.button
              key={c.value}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => toggle(c.value)}
              disabled={atLimit}
              className={`
                group relative text-left
                rounded-2xl px-4 py-3.5
                transition-all duration-200
                ${
                  selected
                    ? "bg-[var(--color-brand-500)]/[0.07] border border-[var(--color-brand-500)]/70 shadow-[0_0_0_3px_rgba(220,20,46,0.10)]"
                    : atLimit
                    ? "glass-card opacity-40 cursor-not-allowed"
                    : "glass-card hover:border-black/15 hover:bg-black/[0.03]"
                }
              `}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={`text-sm font-medium ${selected ? "text-[var(--color-brand-600)]" : "text-[var(--color-brand-100)]"}`}>
                  {c.label}
                </span>
                <span
                  className={`
                    shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all
                    ${
                      selected
                        ? "bg-[var(--color-brand-500)] border-[var(--color-brand-500)]"
                        : "border-black/20 group-hover:border-black/40"
                    }
                  `}
                  aria-hidden
                >
                  {selected && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M2 6.5L4.5 9L10 3.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
      <p className="text-xs text-slate-500 mt-4 text-center">
        {selectedCount}/{max} sélectionné{selectedCount > 1 ? "s" : ""}
      </p>
    </div>
  );
}
