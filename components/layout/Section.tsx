import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";

export function Section({
  id,
  title,
  subtitle,
  children,
}: Readonly<{
  id: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}>) {
  return (
    <section id={id} className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <div className="mb-10">
            <div className="mb-3 h-1 w-12 rounded-full bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-400" />
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-400">
                {title}
              </span>
            </h2>
            {subtitle ? (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {subtitle}
              </p>
            ) : null}
          </div>
        </Reveal>
        <Reveal delay={0.06}>{children}</Reveal>
      </Container>
    </section>
  );
}


