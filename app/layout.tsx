import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import MetaPixel from "@/components/MetaPixel";
import Clarity from "@/components/Clarity";
import { BROKER_NAME, BROKER_REGION } from "@/lib/broker";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: `${BROKER_NAME} — Qu'est-ce que ton budget te permet d'acheter ?`,
  description: `Déjà préapprouvé ? Découvre ce que ton budget te permet réellement d'acheter sur la ${BROKER_REGION}. Analyse de projet d'achat propulsée par l'IA — sans calcul hypothécaire.`,
  openGraph: {
    title: "Qu'est-ce que ton budget te permet réellement d'acheter ?",
    description: `Analyse personnalisée de ton projet d'achat — ${BROKER_NAME}, ${BROKER_REGION}.`,
    locale: "fr_CA",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA" className={`${dmSans.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-screen antialiased">
        <MetaPixel />
        <Clarity />
        {children}
      </body>
    </html>
  );
}
