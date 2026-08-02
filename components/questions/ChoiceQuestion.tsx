"use client";

import { motion } from "framer-motion";
import type { Choice } from "@/lib/questions";

interface Props {
  choices: Choice[];
  value?: string;
  onChange: (v: string) => void;
}

export default function ChoiceQuestion({ choices, value, onChange }: Props) {
  return (
    <div className="grid gap-3">
      {choices.map((c, i) => {
        const selected = value === c.value;
        return (
          <motion.button
            key={c.value}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => onChange(c.value)}
            className={`
              group relative text-left
              rounded-2xl px-5 py-4 sm:py-5
              transition-all duration-200
              ${
                selected
                  ? "bg-[var(--color-brand-500)]/[0.07] border border-[var(--color-brand-500)]/70 shadow-[0_0_0_3px_rgba(220,20,46,0.10)]"
                  : "glass-card hover:border-black/15 hover:bg-black/[0.03]"
              }
            `}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${selected ? "text-[var(--color-brand-600)]" : "text-[var(--color-brand-100)]"}`}>
                  {c.label}
                </p>
                {c.hint && (
                  <p className="text-xs text-slate-600 mt-0.5">{c.hint}</p>
                )}
              </div>
              <span
                className={`
                  shrink-0 w-5 h-5 rounded-full border transition-all flex items-center justify-center
                  ${
                    selected
                      ? "bg-[var(--color-brand-500)] border-[var(--color-brand-500)] shadow-[0_0_10px_rgba(220,20,46,0.4)]"
                      : "border-black/20 group-hover:border-black/40"
                  }
                `}
                aria-hidden
              />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
