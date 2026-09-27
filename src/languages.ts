/**
 * The languages every catalog namespace carries in full. A tenant may offer fewer (the engine's
 * `Language` collection, the website's `LOCALES`); it can never offer one that is not here.
 */
export const SUPPORTED_LANGUAGES = ["en", "de", "es", "fr", "it", "tr"] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/** The language a text falls back to, and the one every other language is checked against. */
export const FALLBACK_LANGUAGE: Language = "en";
