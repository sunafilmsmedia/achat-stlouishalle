"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export type RevealChoice = "yes" | "no";

interface Props {
  onContinue: (choice: RevealChoice) => void;
}

// Empêche les clics fantômes de l'étape précédente de traverser cet écran.
const CLICK_GUARD_MS = 700;

export default function PreRevealScreen({ onContinue }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), CLICK_GUARD_MS);
    return () => clearTimeout(t);
  }, []);

  const handleClick = (choice: RevealChoice) => {
    if (!ready) return;
    onContinue(choice);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 sm:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl w-full text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, duration: 0.6, type: "spring", stiffness: 160, damping: 14 }}
          className="mx-auto mb-7 w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-brand-500)]/25 to-[var(--color-brand-700)]/20 border border-[var(--color-brand-400)]/40 flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(220,20,46,0.4)]"
        >
          <svg className="w-7 h-7 text-[var(--color-brand-300)]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 10L8 14L16 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>

        <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-brand-300)] mb-3">
          Analyse complète
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[var(--color-brand-100)] leading-[1.05] tracking-tight text-balance">
          Ton analyse est prête.
        </h1>
        <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed text-balance max-w-md mx-auto">
          Veux-tu découvrir ce que ton budget et tes critères te permettent réellement de viser ?
        </p>

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          onClick={() => handleClick("yes")}
          disabled={!ready}
          className="
            group mt-10 w-full relative overflow-hidden rounded-2xl
            bg-gradient-to-b from-[var(--color-brand-500)] to-[var(--color-brand-700)]
            text-white px-6 py-5
            shadow-[0_20px_50px_-15px_rgba(220,20,46,0.6)]
            hover:shadow-[0_25px_60px_-10px_rgba(220,20,46,0.7)]
            hover:-translate-y-0.5 transition-all duration-300
            disabled:opacity-70 disabled:cursor-wait disabled:translate-y-0
          "
        >
          <span className="block font-medium text-base sm:text-lg">Oui, je veux voir mon analyse</span>
          <span className="block text-xs sm:text-sm text-[var(--color-brand-100)]/80 mt-1">
            Analyse personnalisée de ton projet d&apos;achat
          </span>
          <span className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
            {ready ? (
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 10h10M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <span className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-white/70 animate-pulse" />
                <span className="w-1 h-1 rounded-full bg-white/70 animate-pulse" style={{ animationDelay: "0.15s" }} />
                <span className="w-1 h-1 rounded-full bg-white/70 animate-pulse" style={{ animationDelay: "0.3s" }} />
              </span>
            )}
          </span>
        </motion.button>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          onClick={() => handleClick("no")}
          disabled={!ready}
          className="
            mt-6 mx-auto text-xs sm:text-sm text-slate-500 hover:text-slate-300
            transition-colors underline underline-offset-4 decoration-white/15 block
            disabled:cursor-wait
          "
        >
          Je veux seulement voir un résumé
        </motion.button>
      </motion.div>
    </div>
  );
}
