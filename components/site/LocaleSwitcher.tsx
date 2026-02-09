"use client";

import { routing, type Locale } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher({ locale }: Readonly<{ locale: Locale }>) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 rounded-full border border-black/10 bg-white/60 p-1 text-xs backdrop-blur dark:border-white/10 dark:bg-white/5">
      {routing.locales.map((l) => {
        const isActive = l === locale;
        return (
          <button
            key={l}
            type="button"
            onClick={() => router.replace(pathname, { locale: l })}
            className={`rounded-full px-2 py-1 transition ${
              isActive
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-zinc-700 hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/10"
            }`}
            aria-pressed={isActive}
          >
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}


