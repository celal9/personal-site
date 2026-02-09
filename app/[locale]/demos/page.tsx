import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Hero } from "@/components/sections/Hero";
import { InteractiveDemos } from "@/components/sections/InteractiveDemos";
import { PageSubnav } from "@/components/site/PageSubnav";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default async function DemosPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const t = await getTranslations("demosPage");
  const summaryItems = t.raw("hero.summaryItems") as string[];

  return (
    <div>
      <Hero
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        primaryCta={t("hero.primaryCta")}
        secondaryCta={t("hero.secondaryCta")}
        primaryHref="#demos"
        secondaryHref="/technologies"
        summaryTitle={t("hero.summaryTitle")}
        summaryItems={summaryItems}
      />

      <Container>
        <PageSubnav
          items={[
            { href: "#demos", label: t("subnav.all") },
            { href: "#api", label: t("subnav.api") }
          ]}
        />
      </Container>

      <InteractiveDemos
        title={t("sections.demos.title")}
        subtitle={t("sections.demos.subtitle")}
      />

      <Section id="api" title={t("sections.api.title")} subtitle={t("sections.api.subtitle")}>
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock title="GET /api/github?limit=8">
            {`fetch("/api/github?limit=8")
  .then((r) => r.json())
  .then(console.log);`}
          </CodeBlock>
          <CodeBlock title={t("sections.api.responseTitle")}>
            {`{
  "source": "github" | "static",
  "projects": [{ "name": "...", "url": "...", "language": "..." }]
}`}
          </CodeBlock>
        </div>
      </Section>
    </div>
  );
}


