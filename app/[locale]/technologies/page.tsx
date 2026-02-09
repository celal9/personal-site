import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Hero } from "@/components/sections/Hero";
import { TechStack } from "@/components/sections/TechStack";
import { PageSubnav } from "@/components/site/PageSubnav";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default async function TechnologiesPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const t = await getTranslations("technologies");
  const summaryItems = t.raw("hero.summaryItems") as string[];

  return (
    <div>
      <Hero
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        primaryCta={t("hero.primaryCta")}
        secondaryCta={t("hero.secondaryCta")}
        primaryHref="#tech"
        secondaryHref="/projects"
        summaryTitle={t("hero.summaryTitle")}
        summaryItems={summaryItems}
      />

      <Container>
        <PageSubnav
          items={[
            { href: "#tech", label: t("subnav.stack") },
            { href: "#examples", label: t("subnav.examples") }
          ]}
        />
      </Container>

      <TechStack title={t("sections.stack.title")} subtitle={t("sections.stack.subtitle")} />

      <Section id="examples" title={t("sections.examples.title")} subtitle={t("sections.examples.subtitle")}>
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock title={t("sections.examples.snippetTitle")}>
            {`// Bir örnek: sayfa içi anchor ile scroll
<a href="#tech">Stack'e git</a>`}
          </CodeBlock>
          <CodeBlock title="next-intl navigation">
            {`import { Link } from "@/i18n/navigation";

<Link href="/projects">Projects</Link>`}
          </CodeBlock>
        </div>
      </Section>
    </div>
  );
}


