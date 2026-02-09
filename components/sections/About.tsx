import { Section } from "@/components/layout/Section";

export function About({
  title,
  body,
  focusTitle,
  focusItems,
}: Readonly<{
  title: string;
  body: string;
  focusTitle: string;
  focusItems: string[];
}>) {
  return (
    <Section id="about" title={title}>
      <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="lg:col-span-2">
          <p className="text-base leading-7 text-zinc-700 dark:text-zinc-200">
            {body}
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white/60 p-5 text-sm text-zinc-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            {focusTitle}
          </div>
          <ul className="mt-3 space-y-2">
            {focusItems.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}


