import type { ReactNode } from "react";

export function CodeBlock({
  title,
  children,
}: Readonly<{ title?: string; children: ReactNode }>) {
  return (
    <div className="rounded-xl border border-black/10 bg-white/60 p-4 text-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
      {title ? (
        <div className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
          {title}
        </div>
      ) : null}
      <pre className="overflow-x-auto text-xs leading-5 text-zinc-900 dark:text-zinc-100">
        <code>{children}</code>
      </pre>
    </div>
  );
}


