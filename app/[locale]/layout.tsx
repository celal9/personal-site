import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Background } from "@/components/layout/Background";
import FloatingShortcutMenu from "@/components/shortcuts/FloatingShortcutMenu";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const shortcutItems =
    locale === "tr"
      ? [
          {
            id: "home",
            label: "Ana Sayfa",
            description: "Kisa ozet ve vurgulu bolumler",
            href: `/${locale}#about`,
          },
          {
            id: "projects",
            label: "Projeler",
            description: "GitHub repo listesi",
            href: `/${locale}/projects#projects`,
          },
          {
            id: "simulations",
            label: "Simulasyon Vitrini",
            description: "Yeni sekmede calisir",
            href: `/${locale}/projects#simulations`,
          },
          {
            id: "tech",
            label: "Teknolojiler",
            description: "Stack ve ornekler",
            href: `/${locale}/technologies#stack`,
          },
          {
            id: "demos",
            label: "Demolar",
            description: "Kucuk interaktif ornekler",
            href: `/${locale}/demos#all`,
          },
          {
            id: "contact",
            label: "Iletisim",
            description: "Hizli baglanti",
            href: `/${locale}#contact`,
          },
        ]
      : [
          {
            id: "home",
            label: "Home",
            description: "Quick highlights and overview",
            href: `/${locale}#about`,
          },
          {
            id: "projects",
            label: "Projects",
            description: "GitHub repository list",
            href: `/${locale}/projects#projects`,
          },
          {
            id: "simulations",
            label: "Simulation Showcase",
            description: "Runs in a new tab",
            href: `/${locale}/projects#simulations`,
          },
          {
            id: "tech",
            label: "Technologies",
            description: "Stack and examples",
            href: `/${locale}/technologies#stack`,
          },
          {
            id: "demos",
            label: "Demos",
            description: "Small interactive examples",
            href: `/${locale}/demos#all`,
          },
          {
            id: "contact",
            label: "Contact",
            description: "Get in touch",
            href: `/${locale}#contact`,
          },
        ];

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="relative min-h-dvh ">
        <Background />
        <Navbar locale={locale} />
        <main>{children}</main>
        <Footer />
        <FloatingShortcutMenu
          items={shortcutItems}
          title={locale === "tr" ? "Kisayollar" : "Shortcuts"}
        />
      </div>
    </NextIntlClientProvider>
  );
}
