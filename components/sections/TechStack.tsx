import { techItems } from "@/data/tech";
import { Section } from "@/components/layout/Section";
import { CodeBlock } from "@/components/ui/CodeBlock";

export function TechStack({
  title,
  subtitle,
}: Readonly<{ title: string; subtitle: string }>) {
  return (
    <Section id="tech" title={title} subtitle={subtitle}>
      <div className=" grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {techItems.map((t) => (
          <div
            key={t.title}
            className="w-full rounded-2xl border border-black/10 bg-white/60 p-5 backdrop-blur dark:border-white/10 dark:bg-white/5"
          >
            <div className="text-body font-semibold tracking-tight">
              {t.title}
            </div>
            <p className="text-body mt-2 text-zinc-700 dark:text-zinc-200">
              {t.description}
            </p>
            <div className="mt-4">
              <CodeBlock title={t.exampleTitle}>{t.exampleCode}</CodeBlock>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}


