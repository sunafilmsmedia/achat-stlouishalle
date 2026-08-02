"use client";

import { motion } from "framer-motion";

interface Props {
  value?: number;
  onChange: (v: number) => void;
}

const OPTIONS = [
  { v: 1, label: "1" },
  { v: 2, label: "2" },
  { v: 3, label: "3" },
  { v: 4, label: "4" },
  { v: 5, label: "5+" },
];

export default function BedroomsQuestion({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
      {OPTIONS.map((o, i) => {
        const selected = value === o.v;
        return (
          <motion.button
            key={o.v}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => onChange(o.v)}
            className={`
              rounded-2xl py-5 sm:py-7
              font-serif text-2xl sm:text-3xl
              transition-all duration-200
              ${
                selected
                  ? "bg-gradient-to-br from-[var(--color-brand-600)]/30 to-[var(--color-brand-800)]/30 border border-[var(--color-brand-400)]/60 text-white shadow-[0_0_0_3px_rgba(220,20,46,0.12)]"
                  : "glass-card text-[var(--color-brand-100)] hover:border-white/20 hover:bg-white/[0.06]"
              }
            `}
          >
            {o.label}
          </motion.button>
        );
      })}
    </div>
  );
}
