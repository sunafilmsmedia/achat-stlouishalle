"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, ((current + 1) / total) * 100));
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 tracking-wide">
        <span className="uppercase">
          Question <span className="text-[var(--color-brand-200)] font-medium">{current + 1}</span> / {total}
        </span>
        <span className="text-[var(--color-gold)] font-medium">{Math.round(pct)} %</span>
      </div>
      <div className="h-[3px] w-full rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand-400)] via-[var(--color-brand-300)] to-[var(--color-gold)]"
        />
      </div>
    </div>
  );
}
