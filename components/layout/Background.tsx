 "use client";

import * as React from "react";
import { FireworksBackgroundLayer } from "@/components/backgrounds/FireworksBackgroundLayer";

export function Background() {
  const [isEnabled, setIsEnabled] = React.useState(false);

  React.useEffect(() => {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (prefersReduced?.matches) return;

    const start = () => setIsEnabled(true);
    const idleId =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(start, { timeout: 1500 })
        : window.setTimeout(start, 1200);

    return () => {
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId as number);
      } else {
        window.clearTimeout(idleId as number);
      }
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {isEnabled ? <FireworksBackgroundLayer population={1} /> : null}
    </div>
  );
}
