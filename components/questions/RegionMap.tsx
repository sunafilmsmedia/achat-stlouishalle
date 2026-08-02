"use client";

import dynamic from "next/dynamic";
import { REGIONS } from "@/lib/regions";

const Inner = dynamic(() => import("./RegionMapInner"), { ssr: false });

interface Props {
  value?: string;
  onChange: (id: string) => void;
}

export default function RegionMap({ value, onChange }: Props) {
  const name = REGIONS.find((r) => r.id === value)?.name;
  return (
    <div className="space-y-3">
      <div className="relative w-full h-[420px] sm:h-[480px] rounded-2xl overflow-hidden border border-black/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
        <Inner value={value} onPick={onChange} />
      </div>
      <p className="text-xs text-slate-500 text-center">
        {value
          ? `✓ Secteur sélectionné : ${name}`
          : "Touche la carte près du secteur visé — on sélectionne le plus proche."}
      </p>
    </div>
  );
}
