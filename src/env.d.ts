/// <reference types="astro/client" />

import type { ConsentChoice } from "@/lib/consent";

declare global {
  interface Window {
    dataLayer: unknown[];
    /** Set by ConsentInit before any tag loads. */
    __opentaintConsent?: {
      readonly required: boolean;
      choice: ConsentChoice | null;
      update: (next: ConsentChoice) => void;
    };
  }
}

export {};
