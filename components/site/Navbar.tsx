import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/Container";
import { LocaleSwitcher } from "@/components/site/LocaleSwitcher";
import { MobileNav } from "@/components/site/MobileNav";
import { site } from "@/data/site";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export async function Navbar({ locale }: Readonly<{ locale: Locale }>) {
  const t = await getTranslations("nav.tabs");

  const tabs = [
    { href: "/", label: t("home") },
    { href: "/technologies", label: t("technologies") },
    { href: "/demos", label: t("demos") },
    { href: "/projects", label: t("projects") },
    { href: "/#contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-black/50 dark:shadow-black/40">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          locale={locale}
          className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white"
        >
          {site.name}
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-zinc-700 dark:text-zinc-200 md:flex">
          {tabs.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              locale={locale}
              className="relative transition hover:text-black dark:hover:text-white"
            >
              <span className="after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-gradient-to-r after:from-blue-500 after:via-indigo-500 after:to-cyan-500 after:transition-all after:duration-200 hover:after:w-full">
              {it.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <MobileNav
            items={tabs.map((it) => ({
              ...it,
              href: it.href.startsWith("#") ? it.href : `/${locale}${it.href === "/" ? "" : it.href}`.replace(/\/+/, "/"),
            }))}
          />
          <a
            href={site.socials.github}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-xs font-medium text-zinc-700 backdrop-blur transition hover:-translate-y-0.5 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10 sm:inline-flex"
          >
            GitHub
          </a>
          <LocaleSwitcher locale={locale} />
        </div>
      </Container>
    </header>
  );
}


