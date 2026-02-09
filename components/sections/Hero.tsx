import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { site } from "@/data/site";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";

export function Hero({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  primaryHref,
  secondaryHref,
  summaryTitle,
  summaryItems,
}: Readonly<{
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  primaryHref: string;
  secondaryHref: string;
  summaryTitle: string;
  summaryItems: string[];
}>) {
  const Primary = primaryHref.startsWith("#") ? "a" : Link;
  const Secondary = secondaryHref.startsWith("#") ? "a" : Link;

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-medium text-zinc-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
                <span>{site.role}</span>
                <span className="text-zinc-400">•</span>
                <span>{site.location}</span>
              </div>
            </Reveal>

            <Reveal delay={0.04}>
              <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                  {title}
                </span>
              </h1>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-4 max-w-xl text-pretty text-base leading-7 text-zinc-700 dark:text-zinc-200">
                {subtitle}
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Primary
                  href={primaryHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-black/10 transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md hover:shadow-black/10 dark:bg-white dark:text-black dark:shadow-white/10 dark:hover:bg-zinc-200"
                >
                  {primaryCta} <ArrowRight className="h-4 w-4" />
                </Primary>
                <Secondary
                  href={secondaryHref}
                  className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/60 px-5 py-2.5 text-sm font-medium text-zinc-900 backdrop-blur transition hover:-translate-y-0.5 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  {secondaryCta}
                </Secondary>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-black/10 bg-white/60 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-black/40">
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                {summaryTitle}
              </div>
              <ul className="mt-4 space-y-3 text-sm text-zinc-700 dark:text-zinc-200">
                {summaryItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <a
                  href={site.socials.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 hover:underline dark:text-white"
                >
                  GitHub profilim <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}


