"use client";

import { motion } from "framer-motion";

interface Props {
  onRestart: () => void;
}

// Écran terminal pour une personne déjà sous contrat avec un autre courtier.
// Aucun /api/analyze ni /api/lead n'est appelé (sauf configuration contraire).
// Le message est respectueux et n'encourage pas à contourner le contrat.
export default function DisqualifiedScreen({ onRestart }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl text-center"
      >
        <div className="mx-auto mb-7 w-14 h-14 rounded-full bg-[var(--color-brand-500)]/15 border border-[var(--color-brand-400)]/30 flex items-center justify-center">
          <svg className="w-6 h-6 text-[var(--color-brand-300)]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path
              d="M10 17 C5 13 2 10 2 7 C2 4.5 4 3 6 3 C7.5 3 9 4 10 5.5 C11 4 12.5 3 14 3 C16 3 18 4.5 18 7 C18 10 15 13 10 17 Z"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-brand-300)] mb-3">
          Merci pour tes réponses
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[var(--color-brand-100)] leading-[1.1] tracking-tight text-balance">
          Tu es déjà bien accompagné.
        </h1>
        <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed text-balance max-w-md mx-auto">
          Comme tu es déjà représenté par un courtier pour ton achat, le mieux est de
          valider ton projet directement avec lui. On respecte cette relation — tes
          informations ne seront pas transmises à notre équipe.
        </p>

        <button
          onClick={onRestart}
          className="
            mt-10 inline-flex items-center gap-2
            px-6 py-3 rounded-full text-sm font-medium
            bg-black/[0.05] border border-black/10
            text-[var(--color-brand-100)]
            hover:bg-black/[0.06] hover:border-black/15
            transition-all
          "
        >
          Retour à l&apos;accueil
        </button>
      </motion.div>
    </div>
  );
}
