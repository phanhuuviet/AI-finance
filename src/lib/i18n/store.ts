import { writable } from "svelte/store";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isSupportedLanguage,
  type Language
} from "./config";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const persisted = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (isSupportedLanguage(persisted)) {
    return persisted;
  }

  return DEFAULT_LANGUAGE;
}

function createLanguageStore() {
  const { subscribe, set } = writable<Language>(getInitialLanguage());

  function setLanguage(next: Language) {
    set(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    }
  }

  function initLanguage() {
    setLanguage(getInitialLanguage());
  }

  return {
    subscribe,
    setLanguage,
    initLanguage
  };
}

export const languageStore = createLanguageStore();
