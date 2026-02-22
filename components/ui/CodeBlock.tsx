import type { ReactNode } from "react";

export function CodeBlock({
  title,
  children,
}: Readonly<{ title?: string; children: ReactNode }>) {
  return (
    <div className="text-body max-w-full rounded-xl border border-black/10 bg-white/60 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
      {title ? (
        <div className="text-micro mb-2 font-medium text-zinc-600 dark:text-zinc-300">
          {title}
        </div>
      ) : null}
      <pre className="text-micro overflow-x-auto leading-5 text-zinc-900 dark:text-zinc-100">
        <code className="max-w-full whitespace-pre-wrap">{children}</code>
      </pre>
    </div>
  );
}
