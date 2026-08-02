"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

// Indicateur segmenté : un segment par étape, rempli au fur et à mesure.
export default function ProgressBar({ current, total }: ProgressBarProps) {
  const done = Math.min(total, current + 1);
  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => {
          const filled = i < done;
          const isCurrent = i === current;
          return (
            <div
              key={i}
              className="relative flex-1 h-1.5 rounded-full bg-black/[0.06] overflow-hidden"
            >
              <motion.div
                initial={false}
                animate={{ scaleX: filled ? 1 : 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: "left" }}
                className={`absolute inset-0 rounded-full ${
                  isCurrent
                    ? "bg-[var(--color-brand-500)]"
                    : "bg-[var(--color-brand-500)]/45"
                }`}
              />
            </div>
          );
        })}
      </div>
      <p className="mt-2.5 text-[11px] uppercase tracking-[0.14em] text-slate-500">
        Étape <span className="text-[var(--color-brand-500)] font-semibold">{done}</span>
        <span className="text-slate-400"> / {total}</span>
      </p>
    </div>
  );
}
