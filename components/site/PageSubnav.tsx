type Item = { href: string; label: string };

export function PageSubnav({ items }: Readonly<{ items: Item[] }>) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <a
            key={it.href}
            href={it.href}
            className="rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-xs font-medium text-zinc-700 backdrop-blur transition hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            {it.label}
          </a>
        ))}
      </div>
    </div>
  );
}


