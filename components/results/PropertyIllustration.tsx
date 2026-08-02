"use client";

import type { PropertyType } from "@/lib/types";

// Illustrations SVG minimalistes par type de propriété (aucun asset externe).
// Rouge = accent de marque, gris foncé = structure.

const RED = "var(--color-brand-500)";
const INK = "#141416";
const LINE = "#141416";

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" aria-hidden>
          {children}
        </svg>
      </div>
      <span className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</span>
    </div>
  );
}

function Condo() {
  return (
    <Frame label="Condo">
      <rect x="34" y="18" width="52" height="90" rx="3" fill="#f4f4f5" stroke={LINE} strokeWidth="3" />
      {[26, 44, 62, 80].map((y) =>
        [42, 55, 68].map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="8" height="10" rx="1.5" fill={RED} opacity={0.85} />
        ))
      )}
      <rect x="54" y="94" width="12" height="14" rx="1" fill={INK} />
      <rect x="30" y="108" width="60" height="4" rx="2" fill={INK} />
    </Frame>
  );
}

function House() {
  return (
    <Frame label="Maison">
      <path d="M22 58 L60 26 L98 58" stroke={LINE} strokeWidth="3" strokeLinejoin="round" fill="#fdeaec" />
      <path d="M60 26 L98 58 L98 60 L60 28 Z" fill={RED} />
      <rect x="32" y="58" width="56" height="50" rx="2" fill="#f4f4f5" stroke={LINE} strokeWidth="3" />
      <rect x="52" y="80" width="16" height="28" rx="1" fill={INK} />
      <rect x="40" y="66" width="12" height="12" rx="1.5" fill={RED} opacity={0.85} />
      <rect x="68" y="66" width="12" height="12" rx="1.5" fill={RED} opacity={0.85} />
      <rect x="26" y="108" width="68" height="4" rx="2" fill={INK} />
    </Frame>
  );
}

function Townhouse() {
  return (
    <Frame label="Maison de ville">
      {[24, 48, 72].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 46 L${x + 12} 34 L${x + 24} 46`} stroke={LINE} strokeWidth="2.5" strokeLinejoin="round" fill={i === 1 ? RED : "#fdeaec"} />
          <rect x={x} y="46" width="24" height="62" rx="1.5" fill="#f4f4f5" stroke={LINE} strokeWidth="2.5" />
          <rect x={x + 6} y="86" width="12" height="22" rx="1" fill={INK} />
          <rect x={x + 7} y="54" width="10" height="10" rx="1" fill={RED} opacity={0.85} />
        </g>
      ))}
      <rect x="20" y="108" width="84" height="4" rx="2" fill={INK} />
    </Frame>
  );
}

function Plex() {
  return (
    <Frame label="Plex">
      <rect x="34" y="22" width="52" height="86" rx="2" fill="#f4f4f5" stroke={LINE} strokeWidth="3" />
      <line x1="34" y1="51" x2="86" y2="51" stroke={LINE} strokeWidth="2.5" />
      <line x1="34" y1="80" x2="86" y2="80" stroke={LINE} strokeWidth="2.5" />
      {[28, 57, 86].map((y) => (
        <g key={y}>
          <rect x="42" y={y - 2} width="12" height="12" rx="1.5" fill={RED} opacity={0.85} />
          <rect x="66" y={y - 2} width="12" height="12" rx="1.5" fill={RED} opacity={0.85} />
        </g>
      ))}
      {/* Escalier extérieur — signature du plex montréalais */}
      <path d="M86 108 L104 108 L104 78" stroke={RED} strokeWidth="3" fill="none" strokeLinejoin="round" />
      <rect x="30" y="108" width="76" height="4" rx="2" fill={INK} />
    </Frame>
  );
}

function Open() {
  return (
    <Frame label="Ouvert">
      <rect x="20" y="46" width="34" height="62" rx="2" fill="#f4f4f5" stroke={LINE} strokeWidth="2.5" />
      {[54, 72, 90].map((y) => (
        <rect key={y} x="27" y={y - 4} width="8" height="9" rx="1" fill={RED} opacity={0.85} />
      ))}
      <path d="M58 62 L76 46 L94 62" stroke={LINE} strokeWidth="2.5" strokeLinejoin="round" fill={RED} />
      <rect x="62" y="62" width="36" height="46" rx="2" fill="#f4f4f5" stroke={LINE} strokeWidth="2.5" />
      <rect x="73" y="86" width="14" height="22" rx="1" fill={INK} />
      <rect x="16" y="108" width="86" height="4" rx="2" fill={INK} />
    </Frame>
  );
}

export default function PropertyIllustration({ type }: { type?: PropertyType }) {
  switch (type) {
    case "condo":
      return <Condo />;
    case "house":
      return <House />;
    case "townhouse":
      return <Townhouse />;
    case "plex":
      return <Plex />;
    default:
      return <Open />;
  }
}
