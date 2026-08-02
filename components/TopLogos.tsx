"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BROKER_NAME, BROKER_FRANCHISE } from "@/lib/broker";

// Remplacer /public/logo-broker.png et /public/logo-franchise.png par les
// vrais logos (PNG transparents). Ajuster width/height selon le ratio réel.
export default function TopLogos() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-30 pointer-events-none"
        aria-hidden
      >
        <Image
          src="/logo-broker.png"
          alt={BROKER_NAME}
          width={2716}
          height={412}
          priority
          className="h-7 sm:h-9 w-auto"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30 pointer-events-none"
        aria-hidden
      >
        <Image
          src="/logo-franchise.png"
          alt={BROKER_FRANCHISE}
          width={957}
          height={259}
          priority
          className="h-7 sm:h-9 w-auto"
        />
      </motion.div>
    </>
  );
}
