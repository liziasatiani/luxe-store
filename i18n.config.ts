export const locales = ["en", "fr", "es", "ka"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "luxe-locale";

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  ka: "ქართული",
};

export const localeFlags: Record<Locale, string> = {
  en: "GB",
  fr: "FR",
  es: "ES",
  ka: "GE",
};
