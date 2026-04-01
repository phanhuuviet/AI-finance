import type { Language } from "./config";
import en from "./locales/en.json";
import vi from "./locales/vi.json";

export type TranslationParams = Record<string, string | number>;

const dictionaries: Record<Language, Record<string, unknown>> = {
  en,
  vi
};

function getByPath(obj: Record<string, unknown>, key: string): unknown {
  return key.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, obj);
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name: string) => {
    const value = params[name];
    return value === undefined || value === null ? "" : String(value);
  });
}

export function translate(language: Language, key: string, params?: TranslationParams): string {
  const dict = dictionaries[language] ?? dictionaries.vi;
  const value = getByPath(dict, key);

  if (typeof value !== "string") {
    return key;
  }

  return interpolate(value, params);
}
