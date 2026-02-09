import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { HomeLinks } from "@/components/sections/HomeLinks";

export default async function Home({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const heroSummaryItems = t.raw("hero.summaryItems") as string[];
  const aboutFocusItems = t.raw("about.focusItems") as string[];

  return (
    <div>
      <Hero
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        primaryCta={t("hero.primaryCta")}
        secondaryCta={t("hero.secondaryCta")}
        primaryHref="/projects"
        secondaryHref="#contact"
        summaryTitle={t("hero.summaryTitle")}
        summaryItems={heroSummaryItems}
      />

      <HomeLinks
        title={t("links.title")}
        items={[
          {
            href: "/technologies",
            title: t("links.technologies.title"),
            description: t("links.technologies.description"),
          },
          {
            href: "/demos",
            title: t("links.demos.title"),
            description: t("links.demos.description"),
          },
          {
            href: "/projects",
            title: t("links.projects.title"),
            description: t("links.projects.description"),
          },
        ]}
      />

      <About
        title={t("about.title")}
        body={t("about.body")}
        focusTitle={t("about.focusTitle")}
        focusItems={aboutFocusItems}
      />
      <Contact title={t("contact.title")} subtitle={t("contact.subtitle")} />
    </div>
  );
}


