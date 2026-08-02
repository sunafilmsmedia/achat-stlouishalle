import type { Answers, ScoringResult } from "./types";
import {
  STORE_ALREADY_REPRESENTED,
  STORE_LOW_FIT,
  STORE_NOT_PREAPPROVED,
} from "./config";

export interface Qualification {
  // true = on transmet le lead au CRM (webhook).
  storeInCrm: boolean;
  // Raison lisible (pour logs / debug). null quand storeInCrm = true.
  blockReason:
    | "already_represented"
    | "not_preapproved"
    | "low_fit"
    | "below_min_budget"
    | null;
}

// Décide, à partir des règles client (lib/config.ts), si un profil doit être
// transmis au CRM. Cette logique est la source de vérité côté serveur.
export function evaluateQualification(
  answers: Answers,
  scoring: ScoringResult
): Qualification {
  // 1. Déjà sous contrat avec un autre courtier — on respecte la relation.
  if (answers.brokerStatus === "under_contract" && !STORE_ALREADY_REPRESENTED) {
    return { storeInCrm: false, blockReason: "already_represented" };
  }

  // 2. Financement pas commencé — on oriente vers une préqualification.
  if (answers.financingStatus === "not_started" && !STORE_NOT_PREAPPROVED) {
    return { storeInCrm: false, blockReason: "not_preapproved" };
  }

  // 3. Segment peu avancé.
  if (scoring.segment === "early_stage" && !STORE_LOW_FIT) {
    return { storeInCrm: false, blockReason: "low_fit" };
  }

  return { storeInCrm: true, blockReason: null };
}
