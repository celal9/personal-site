import { Container } from "@/components/layout/Container";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";

type Item = {
  href: string;
  title: string;
  description: string;
};

export function HomeLinks({
  title,
  items,
}: Readonly<{ title: string; items: Item[] }>) {
  return (
    <section className="pb-6">
      <Container>
        <Reveal>
          <div className="mb-4 text-sm font-medium text-zinc-600 dark:text-zinc-300">
            {title}
          </div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map((it, idx) => (
            <Reveal key={it.href} delay={0.05 + idx * 0.04}>
              <Link
                href={it.href}
                className="block rounded-2xl border border-black/10 bg-white/60 p-5 backdrop-blur transition hover:-translate-y-0.5 hover:border-black/20 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10"
              >
                <div className="text-base font-semibold tracking-tight">
                  <span className="bg-gradient-to-r from-fuchsia-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent dark:from-fuchsia-400 dark:via-blue-400 dark:to-emerald-400">
                    {it.title}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                  {it.description}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}


