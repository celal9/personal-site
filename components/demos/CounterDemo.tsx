"use client";

import { useMemo, useState } from "react";

export function CounterDemo() {
  const [count, setCount] = useState(0);
  const label = useMemo(() => (count === 1 ? "click" : "clicks"), [count]);

  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 p-5 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="text-sm font-semibold tracking-tight">React Counter</div>
      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
        Client component + state yönetimi.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          +1
        </button>
        <button
          type="button"
          onClick={() => setCount(0)}
          className="rounded-full border border-black/10 bg-white/60 px-4 py-2 text-sm font-medium text-zinc-900 backdrop-blur transition hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          Reset
        </button>
        <div className="text-sm text-zinc-700 dark:text-zinc-200">
          {count} {label}
        </div>
      </div>
    </div>
  );
}


