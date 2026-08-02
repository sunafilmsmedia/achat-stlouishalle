"use client";

import { useState, useEffect } from "react";
import { groupedNumber, parseCurrency } from "@/lib/format";

interface Props {
  value?: number;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  helper?: string;
}

export default function CurrencyQuestion({
  value,
  onChange,
  placeholder = "350 000",
  helper,
}: Props) {
  const [display, setDisplay] = useState<string>(value ? groupedNumber(value) : "");

  useEffect(() => {
    if (typeof value === "number" && parseCurrency(display) !== value) {
      setDisplay(groupedNumber(value));
    }
    if (value === undefined && display === "") return;
  }, [value, display]);

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-3xl sm:text-4xl text-[var(--color-gold)]">$</span>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={display}
          onChange={(e) => {
            const raw = e.target.value;
            const parsed = parseCurrency(raw);
            setDisplay(parsed !== undefined ? groupedNumber(parsed) : raw.replace(/[^\d\s]/g, ""));
            onChange(parsed);
          }}
          placeholder={placeholder}
          className="
            flex-1 font-serif text-4xl sm:text-5xl text-white bg-transparent
            placeholder:text-white/20 focus:outline-none w-full
            tracking-wide
          "
        />
        <span className="text-sm text-slate-400">CAD</span>
      </div>
      {helper && <p className="text-xs text-slate-500 mt-3">{helper}</p>}
    </div>
  );
}
