"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import type { Simulation } from "@/data/simulations";

export function SimulationCard({
  simulation,
}: Readonly<{ simulation: Simulation }>) {
  const [failed, setFailed] = React.useState(false);
  const playable = simulation.playable;
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] || "en";
  const playableUrl = `/${locale}/simulations/${simulation.id}`;

  const handlePlay = () => {
    if (typeof window === "undefined") return;
    window.open(playableUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 p-4 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-black/40">
      <div className="overflow-hidden rounded-xl border border-black/5 bg-black/5 dark:border-white/10 dark:bg-white/10">
        {playable &&(
          <div className="relative">
            <div className="flex aspect-video w-full items-center justify-center bg-linear-to-br from-black/60 via-black/40 to-black/70 text-xs text-white/80">
              Playable simülasyon
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 text-xs text-white">
              <div>Yeni sekmede oyna</div>
              <button
                type="button"
                onClick={handlePlay}
                className="rounded-full border border-white/30 bg-white/90 px-4 py-1 text-xs font-semibold text-zinc-900 transition hover:bg-white"
              >
                Oyna
              </button>
              <a
                href={playableUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-white/80 underline underline-offset-2"
              >
                Linki yeni sekmede ac
              </a>
            </div>
          </div>
        ) }
      </div>

      <div className="mt-4">
        <div className="text-sm font-semibold text-zinc-900 dark:text-white">
          {simulation.title}
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
          {simulation.description}
        </p>

        {simulation.tags && simulation.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-600 dark:text-zinc-300">
            {simulation.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-black/10 bg-white/70 px-2 py-0.5 backdrop-blur dark:border-white/10 dark:bg-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-600 dark:text-zinc-300">
     
          {simulation.repoUrl ? (
            <a
              href={simulation.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-zinc-700 transition hover:text-zinc-900 hover:underline dark:text-zinc-200 dark:hover:text-white"
            >
              Code
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

