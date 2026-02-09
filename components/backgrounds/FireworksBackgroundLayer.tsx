"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { FireworksBackground } from "../animate-ui/components/backgrounds/fireworks";

export function FireworksBackgroundLayer({
  population,
  className,
}: Readonly<{ population: number; className?: string }>) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme ?? "light";
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  useEffect(() => {
    const media = window.matchMedia?.("(pointer: coarse)");
    const update = () => setIsCoarsePointer(Boolean(media?.matches));
    update();
    if (media?.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    if (media?.addListener) {
      media.addListener(update);
      return () => media.removeListener(update);
    }
    return;
  }, []);

  return (
    <FireworksBackground
      className="absolute inset-0 -z-10 flex items-center justify-center rounded-xl"
      color={theme === "dark" ? "white" : "black"}
      population={population}
      frameRate={isCoarsePointer ? 80 : 160}
      maxShips={15}
      shipSpawnInterval={{ min: 400, max: 800 }}
    />
  );
}
