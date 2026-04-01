import { derived, get } from "svelte/store";
import { DEFAULT_LANGUAGE, type Language } from "./config";
import { languageStore } from "./store";
import { translate, type TranslationParams } from "./translator";

export const language = {
  subscribe: languageStore.subscribe
};

export const t = derived(language, ($language) => {
  return (key: string, params?: TranslationParams) => translate($language, key, params);
});

export function setLanguage(next: Language): void {
  languageStore.setLanguage(next);
}

export function initLanguage(): void {
  languageStore.initLanguage();
}

export function translateNow(key: string, params?: TranslationParams): string {
  const current = get(language) ?? DEFAULT_LANGUAGE;
  return translate(current, key, params);
}

export type { Language };
