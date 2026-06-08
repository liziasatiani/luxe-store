import { getRequestConfig } from "next-intl/server";

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

export default getRequestConfig(async ({ requestLocale }) => {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const requested = await requestLocale;
  const locale = (
    locales.includes(cookieLocale as Locale) ? cookieLocale :
    locales.includes(requested as Locale) ? requested :
    defaultLocale
  ) as Locale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
