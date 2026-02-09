import { Section } from "@/components/layout/Section";
import { CounterDemo } from "@/components/demos/CounterDemo";
import { GitHubFetchDemo } from "@/components/demos/GitHubFetchDemo";

export function InteractiveDemos({
  title,
  subtitle,
}: Readonly<{ title: string; subtitle: string }>) {
  return (
    <Section id="demos" title={title} subtitle={subtitle}>
      <div className="grid gap-4 lg:grid-cols-2">
        <CounterDemo />
        <GitHubFetchDemo />
      </div>
    </Section>
  );
}


