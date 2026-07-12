import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale, LOCALE_COOKIE } from "./i18n.config";
import type { Locale } from "./i18n.config";
export { locales, defaultLocale, LOCALE_COOKIE, localeNames, localeFlags } from "./i18n.config";
export type { Locale } from "./i18n.config";

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
