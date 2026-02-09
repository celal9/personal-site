import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { PageSubnav } from "@/components/site/PageSubnav";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export default async function ProjectsPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const t = await getTranslations("projectsPage");
  const summaryItems = t.raw("hero.summaryItems") as string[];
  const simulationsBaseHref = "/simulations";

  return (
    <div>
      <Hero
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        primaryCta={t("hero.primaryCta")}
        secondaryCta={t("hero.secondaryCta")}
        primaryHref="#projects"
        secondaryHref="/#contact"
        summaryTitle={t("hero.summaryTitle")}
        summaryItems={summaryItems}
      />

      <Container>
        <PageSubnav
          items={[
            { href: "#projects", label: t("subnav.list") },
            { href: "#simulations", label: t("subnav.simulations") },
            { href: "#filters", label: t("subnav.filters") },
          ]}
        />
      </Container>

      <Projects
        title={t("sections.projects.title")}
        subtitle={t("sections.projects.subtitle")}
        simulationsTitle={t("sections.simulations.title")}
        simulationsSubtitle={t("sections.simulations.subtitle")}
        simulationsHint={t("sections.simulations.ctaHint")}
        simulationsPlayLabel={t("sections.simulations.playLabel")}
        simulationsCodeLabel={t("sections.simulations.codeLabel")}
        simulationsBaseHref={simulationsBaseHref}
      />

      <Section id="filters" title={t("sections.filters.title")} subtitle={t("sections.filters.subtitle")}>
        <div className="rounded-2xl border border-black/10 bg-white/60 p-5 text-sm text-zinc-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
          {t("sections.filters.body")}
        </div>
      </Section>
    </div>
  );
}


