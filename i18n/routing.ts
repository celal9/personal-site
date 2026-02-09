export const routing = {
  locales: ["tr", "en"] as const,
  defaultLocale: "tr" as const,
};

export type Locale = (typeof routing.locales)[number];


