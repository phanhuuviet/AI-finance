export const SUPPORTED_LANGUAGES = ["vi", "en"] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "vi";

export const LANGUAGE_STORAGE_KEY = "app.language";

export function isSupportedLanguage(value: string | null | undefined): value is Language {
  return Boolean(value && SUPPORTED_LANGUAGES.includes(value as Language));
}
