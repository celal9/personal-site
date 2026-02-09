"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/data/projects.static";

type ApiResponse = { source: "github" | "static"; projects: Project[] };

export function GitHubFetchDemo() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/github?limit=5");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ApiResponse;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 p-5 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="text-sm font-semibold tracking-tight">GitHub Fetch</div>
      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
        API route üzerinden repo listesi (fallback’li).
      </p>

      <div className="mt-4 text-sm text-zinc-700 dark:text-zinc-200">
        {error ? (
          <div className="text-red-600 dark:text-red-400">{error}</div>
        ) : data ? (
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              source: <span className="font-medium">{data.source}</span>
            </div>
            <ul className="mt-3 space-y-2">
              {data.projects.map((p) => (
                <li key={p.url} className="flex items-center justify-between gap-3">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate font-medium text-zinc-900 hover:underline dark:text-white"
                  >
                    {p.name}
                  </a>
                  <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                    {p.language ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-zinc-500 dark:text-zinc-400">Loading…</div>
        )}
      </div>
    </div>
  );
}


