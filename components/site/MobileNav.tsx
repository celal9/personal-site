"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

type Item = { href: string; label: string };

export function MobileNav({ items }: Readonly<{ items: Item[] }>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/60 backdrop-blur transition hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-16 border-b border-black/5 bg-white/95 p-4 backdrop-blur dark:border-white/10 dark:bg-black/90">
          <nav className="flex flex-col gap-2 text-sm">
            {items.map((it) => (
              <a
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-zinc-800 hover:bg-black/5 dark:text-zinc-100 dark:hover:bg-white/10"
              >
                {it.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}


