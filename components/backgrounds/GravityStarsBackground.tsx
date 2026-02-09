"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type GlowAnimation = "instant" | "ease" | "spring";
type MouseGravity = "attract" | "repel";
type InteractionType = "bounce" | "merge";

type Props = {
  starsCount?: number;
  starsSize?: number;
  starsOpacity?: number;
  glowIntensity?: number;
  glowAnimation?: GlowAnimation;
  movementSpeed?: number;
  mouseInfluence?: number;
  mouseGravity?: MouseGravity;
  gravityStrength?: number;
  starsInteraction?: boolean;
  starsInteractionType?: InteractionType;
} & React.ComponentProps<"div">;

type Star = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function GravityStarsBackground({
  starsCount = 75,
  starsSize = 2,
  starsOpacity = 0.75,
  glowIntensity = 15,
  glowAnimation = "ease",
  movementSpeed = 0.3,
  mouseInfluence = 100,
  mouseGravity = "attract",
  gravityStrength = 75,
  starsInteraction = false,
  starsInteractionType = "bounce",
  className,
  ...props
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const [size, setSize] = useState({ w: 0, h: 0, dpr: 1 });
  const mouse = useRef({ x: 0, y: 0, active: false });

  const stars = useRef<Star[]>([]);
  const glow = useRef(0);

  const containerClass = useMemo(
    () =>
      `pointer-events-none absolute inset-0 -z-10 ${className ?? ""}`.trim(),
    [className]
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const el = canvasRef.current?.parentElement;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      if (!isMountedRef.current) return;
      const rect = el.getBoundingClientRect();
      const dpr = clamp(window.devicePixelRatio ?? 1, 1, 2);
      setSize({ w: Math.floor(rect.width), h: Math.floor(rect.height), dpr });
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const onLeave = () => {
      mouse.current.active = false;
    };
    const options: AddEventListenerOptions = { passive: true };

    window.addEventListener("mousemove", onMove, options);
    window.addEventListener("mouseleave", onLeave, options);

    return () => {
      window.removeEventListener("mousemove", onMove, options);
      window.removeEventListener("mouseleave", onLeave, options);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.w === 0 || size.h === 0) return;

    canvas.width = Math.floor(size.w * size.dpr);
    canvas.height = Math.floor(size.h * size.dpr);
    canvas.style.width = `${size.w}px`;
    canvas.style.height = `${size.h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);

    // init stars
    const rand = (min: number, max: number) => min + Math.random() * (max - min);
    stars.current = new Array(starsCount).fill(0).map(() => ({
      x: rand(0, size.w),
      y: rand(0, size.h),
      vx: rand(-0.15, 0.15),
      vy: rand(-0.15, 0.15),
      r: rand(Math.max(1, starsSize * 0.65), Math.max(1, starsSize * 1.35)),
    }));

    const friction = 0.985;
    const maxV = 0.9 + movementSpeed * 1.2;

    let isActive = true;
    const tick = () => {
      if (!isActive || !isMountedRef.current) return;
      // Clear
      ctx.clearRect(0, 0, size.w, size.h);

      // glow target
      const glowTarget = mouse.current.active ? 1 : 0;
      if (glowAnimation === "instant") {
        glow.current = glowTarget;
      } else if (glowAnimation === "spring") {
        // simple critically damped-ish spring approximation
        glow.current += (glowTarget - glow.current) * 0.18;
      } else {
        glow.current += (glowTarget - glow.current) * 0.08;
      }

      const mx = mouse.current.x;
      const my = mouse.current.y;

      // Update physics
      for (let i = 0; i < stars.current.length; i++) {
        const s = stars.current[i];

        // gentle gravity to center
        const cx = size.w / 2;
        const cy = size.h / 2;
        const dxC = cx - s.x;
        const dyC = cy - s.y;
        s.vx += (dxC / (size.w + 1)) * (gravityStrength * 0.00008);
        s.vy += (dyC / (size.h + 1)) * (gravityStrength * 0.00008);

        // mouse influence
        if (mouse.current.active) {
          const dx = mx - s.x;
          const dy = my - s.y;
          const dist2 = dx * dx + dy * dy + 40;
          const force = (mouseInfluence * movementSpeed) / dist2;
          const dir = mouseGravity === "repel" ? -1 : 1;
          s.vx += dir * dx * force * 0.03;
          s.vy += dir * dy * force * 0.03;
        }

        // friction + clamp
        s.vx *= friction;
        s.vy *= friction;
        s.vx = clamp(s.vx, -maxV, maxV);
        s.vy = clamp(s.vy, -maxV, maxV);

        s.x += s.vx;
        s.y += s.vy;

        // wrap
        if (s.x < -20) s.x = size.w + 20;
        if (s.x > size.w + 20) s.x = -20;
        if (s.y < -20) s.y = size.h + 20;
        if (s.y > size.h + 20) s.y = -20;
      }

      // optional interaction (cheap)
      if (starsInteraction) {
        for (let i = 0; i < stars.current.length; i++) {
          for (let j = i + 1; j < stars.current.length; j++) {
            const a = stars.current[i];
            const b = stars.current[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const rr = a.r + b.r;
            const dist2 = dx * dx + dy * dy;
            if (dist2 > rr * rr) continue;

            if (starsInteractionType === "merge") {
              // merge: slightly average velocities and sizes
              const m = 0.5;
              a.vx = a.vx * m + b.vx * m;
              a.vy = a.vy * m + b.vy * m;
              a.r = clamp(a.r + b.r * 0.02, 0.75, starsSize * 2.2);
            } else {
              // bounce: swap a bit
              const tmpx = a.vx;
              const tmpy = a.vy;
              a.vx = b.vx;
              a.vy = b.vy;
              b.vx = tmpx;
              b.vy = tmpy;
            }
          }
        }
      }

      // Draw
      for (let i = 0; i < stars.current.length; i++) {
        const s = stars.current[i];
        const g = glow.current;
        const glowR = s.r + glowIntensity * g * 0.12;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${starsOpacity})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        // glow (subtle)
        if (g > 0.001) {
          const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR * 6);
          grad.addColorStop(0, `rgba(99,102,241,${0.10 * g})`);
          grad.addColorStop(0.5, `rgba(236,72,153,${0.06 * g})`);
          grad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(s.x, s.y, glowR * 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      isActive = false;
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [
    size.w,
    size.h,
    size.dpr,
    starsCount,
    starsSize,
    starsOpacity,
    glowIntensity,
    glowAnimation,
    movementSpeed,
    mouseInfluence,
    mouseGravity,
    gravityStrength,
    starsInteraction,
    starsInteractionType,
  ]);

  return (
    <div className={containerClass} {...props}>
      <canvas ref={canvasRef} className="h-full w-full opacity-70 dark:opacity-60" />
    </div>
  );
}


