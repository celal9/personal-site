import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // `requestLocale` is the locale detected by the middleware.
  const locale = (await requestLocale) ?? routing.defaultLocale;

  if (!routing.locales.includes(locale as never)) {
    return { locale: routing.defaultLocale, messages: {} };
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});


