"use client";

import dynamic from "next/dynamic";
import { REGIONS } from "@/lib/regions";

const Inner = dynamic(() => import("./RegionMapInner"), { ssr: false });

interface Props {
  value?: string; // secteur principal
  alternates: string[]; // jusqu'à 2 alternatifs
  onMain: (id: string) => void;
  onAlternates: (ids: string[]) => void;
}

const MAX_ALTERNATES = 2;

export default function RegionMap({ value, alternates, onMain, onAlternates }: Props) {
  const handlePick = (id: string) => {
    if (!value) {
      onMain(id);
      return;
    }
    if (id === value) return; // le principal reste sélectionné
    if (alternates.includes(id)) {
      onAlternates(alternates.filter((x) => x !== id));
      return;
    }
    if (alternates.length < MAX_ALTERNATES) {
      onAlternates([...alternates, id]);
    }
  };

  const reset = () => {
    onAlternates([]);
    onMain("");
  };

  const name = (id: string) => REGIONS.find((r) => r.id === id)?.name ?? "";

  return (
    <div className="space-y-3">
      <div className="relative w-full h-[420px] sm:h-[480px] rounded-2xl overflow-hidden border border-black/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
        <Inner value={value} alternates={alternates} onPick={handlePick} />
      </div>

      {value ? (
        <div className="space-y-1.5">
          <p className="text-sm text-center">
            <span className="text-[var(--color-brand-300)]">✓ Secteur principal :</span>{" "}
            <span className="text-[var(--color-brand-100)] font-medium">{name(value)}</span>
          </p>
          {alternates.length > 0 && (
            <p className="text-xs text-center text-[var(--color-gold-soft)]">
              Alternatifs : {alternates.map(name).join(", ")}
            </p>
          )}
          <p className="text-xs text-center text-slate-500">
            {alternates.length < MAX_ALTERNATES
              ? "Touche d'autres secteurs pour ajouter jusqu'à 2 alternatives (facultatif)."
              : "Maximum de secteurs alternatifs atteint."}
            {"  "}
            <button
              type="button"
              onClick={reset}
              className="underline underline-offset-2 hover:text-[var(--color-brand-200)]"
            >
              Recommencer
            </button>
          </p>
        </div>
      ) : (
        <p className="text-xs text-slate-500 text-center">
          Touche la carte près du secteur visé — on sélectionne le plus proche.
        </p>
      )}
    </div>
  );
}
