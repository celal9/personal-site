"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const rand = (min: number, max: number): number =>
  Math.random() * (max - min) + min;
const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min) + min);
const randColor = (): string => `hsl(${randInt(0, 360)}, 100%, 50%)`;
const clamp = (n: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, n));

const DEFAULT_GRAVITY = 0.02;
const SHIP_SPAWN_INTERVAL = { min: 200, max: 800 };
const SHIP_SPEED_RANGE = { min: 0.8, max: 2.1 };
const MAX_SHIPS = 36;
const SHIP_EVADE_CHANCE = 0.8;
const SHIP_EVADE_DISTANCE = 120;
const SHIP_EVADE_COOLDOWN = 120;
const SHIP_EVADE_BOOST = 1.6;
const FIREWORK_OFFSCREEN_MARGIN = 60;

// Limits (perf knobs)
const MAX_FIREWORKS = 10;
const MAX_PARTICLES = 1400;
const POINTER_SPAWN_COOLDOWN_MS = 0;
const MAX_POINTER_FIREWORKS = 16;

const resolveRange = (
  range: { min: number; max: number } | number,
): { min: number; max: number; preferred: number } => {
  if (typeof range === "number")
    return { min: range, max: range, preferred: range };
  return {
    min: range.min,
    max: range.max,
    preferred: (range.min + range.max) / 2,
  };
};

const solveLaunchVelocity = ({
  startX,
  startY,
  targetX,
  targetY,
  speedRange,
  gravity = DEFAULT_GRAVITY,
}: {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  speedRange: { min: number; max: number } | number;
  gravity?: number;
}): { vx: number; vy: number } => {
  const dx = targetX - startX;
  const dy = targetY - startY;
  const { min, max, preferred } = resolveRange(speedRange);

  let best: { vx: number; vy: number; score: number } | null = null;
  const minFrames = 10;
  const maxFrames = 120;

  for (let t = minFrames; t <= maxFrames; t++) {
    const vx = dx / t;
    const vy = (dy - 0.5 * gravity * t * t) / t;
    if (vy >= 0) continue; // want upwards (negative vy in canvas space)
    const speed = Math.hypot(vx, vy);
    const inRange = speed >= min && speed <= max;
    const score = Math.abs(speed - preferred) - (inRange ? 1000 : 0);
    if (!best || score < best.score) best = { vx, vy, score };
  }

  if (!best) return { vx: 0, vy: -preferred };
  return { vx: best.vx, vy: best.vy };
};

// O(1) remove without splice
const removeAtSwap = <T,>(arr: T[], i: number) => {
  const last = arr.length - 1;
  if (i !== last) arr[i] = arr[last]!;
  arr.pop();
};

type ParticleType = {
  x: number;
  y: number;
  color: string;
  vx: number;
  vy: number;
  gravity: number;
  friction: number;
  alpha: number;
  decay: number;
  size: number;
  update: () => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
  isAlive: () => boolean;
};

type ShipType = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  canEvade: boolean;
  evadeUntil: number;
  color: string;
  margin: number;
  update: (maxX: number, maxY: number, dt: number) => boolean;
  draw: (ctx: CanvasRenderingContext2D) => void;
};

type Trail = {
  data: { x: number; y: number }[];
  head: number;
  size: number;
  len: number;
};

const makeTrail = (len: number): Trail => ({
  data: new Array(len),
  head: 0,
  size: 0,
  len,
});

const trailPush = (trail: Trail, x: number, y: number) => {
  trail.data[trail.head] = { x, y };
  trail.head = (trail.head + 1) % trail.len;
  trail.size = Math.min(trail.size + 1, trail.len);
};

const trailForEach = (
  trail: Trail,
  fn: (p: { x: number; y: number }) => void,
) => {
  for (let i = 0; i < trail.size; i++) {
    const idx = (trail.head - trail.size + i + trail.len) % trail.len;
    const p = trail.data[idx];
    if (p) fn(p);
  }
};

// Particle pool to avoid GC spikes
const particlePool: ParticleType[] = [];
const acquireParticle = (): ParticleType =>
  particlePool.pop() ?? ({} as ParticleType);
const releaseParticle = (p: ParticleType) => {
  if (particlePool.length < MAX_PARTICLES * 2) particlePool.push(p);
};

function initParticle(
  p: ParticleType,
  x: number,
  y: number,
  color: string,
  speed: number,
  direction: number,
  gravity: number,
  friction: number,
  size: number,
): ParticleType {
  const vx = Math.cos(direction) * speed;
  const vy = Math.sin(direction) * speed;

  p.x = x;
  p.y = y;
  p.color = color;
  p.vx = vx;
  p.vy = vy;
  p.gravity = gravity;
  p.friction = friction;
  p.alpha = 1;
  p.decay = rand(0.006, 0.02);
  p.size = size;

  p.update = function update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  };

  // Avoid save/restore per particle; set only what we need.
  // If you want even faster: swap this to fillRect.
  p.draw = function draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  };

  p.isAlive = function isAlive() {
    return this.alpha > 0;
  };

  return p;
}

function createShip(maxX: number, maxY: number): ShipType {
  const size = rand(10, 18);
  const margin = size * 2;

  const targetX = rand(maxX * 0.1, maxX * 0.9);
  let targetY = rand(maxY * 0.1, maxY * 0.9);

  const entry = randInt(0, 4);
  let x = 0;
  let y = 0;

  switch (entry) {
    case 0:
      x = -margin;
      y = rand(0, maxY);
      break;
    case 1:
      x = maxX + margin;
      y = rand(0, maxY);
      break;
    case 2:
      x = rand(0, maxX);
      y = -margin;
      break;
    default:
      x = rand(0, maxX);
      y = maxY + margin;
      break;
  }

  if (Math.abs(targetY - y) < maxY * 0.2) {
    targetY = clamp(
      targetY + (Math.random() < 0.5 ? -1 : 1) * maxY * 0.3,
      0,
      maxY,
    );
  }

  const angle = Math.atan2(targetY - y, targetX - x);
  const speed = rand(SHIP_SPEED_RANGE.min, SHIP_SPEED_RANGE.max);
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  const color = `hsl(${randInt(180, 260)}, 90%, 70%)`;
  const canEvade = Math.random() < SHIP_EVADE_CHANCE;

  return {
    x,
    y,
    vx,
    vy,
    size,
    rotation: angle,
    canEvade,
    evadeUntil: 0,
    color,
    margin,
    update(maxXValue, maxYValue, dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.rotation = Math.atan2(this.vy, this.vx);

      const bounds = this.margin * 2;
      return (
        this.x >= -bounds &&
        this.x <= maxXValue + bounds &&
        this.y >= -bounds &&
        this.y <= maxYValue + bounds
      );
    },
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(this.size * 1.2, 0);
      ctx.lineTo(-this.size * 0.8, this.size * 0.6);
      ctx.lineTo(-this.size * 0.4, 0);
      ctx.lineTo(-this.size * 0.8, -this.size * 0.6);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.size * 0.2, 0);
      ctx.lineTo(-this.size * 0.4, 0);
      ctx.stroke();
      ctx.restore();
    },
  };
}

function applyEvasion(ship: ShipType, threats: { x: number; y: number }[]) {
  if (!ship.canEvade || threats.length === 0) return;
  const now = performance.now();
  if (now < ship.evadeUntil) return;

  let closestX = 0;
  let closestY = 0;
  let closestDistSq = Number.POSITIVE_INFINITY;

  for (let i = 0; i < threats.length; i++) {
    const t = threats[i]!;
    const dx = ship.x - t.x;
    const dy = ship.y - t.y;
    const distSq = dx * dx + dy * dy;
    if (distSq < closestDistSq) {
      closestDistSq = distSq;
      closestX = t.x;
      closestY = t.y;
    }
  }

  if (closestDistSq > SHIP_EVADE_DISTANCE * SHIP_EVADE_DISTANCE) return;

  const awayAngle = Math.atan2(ship.y - closestY, ship.x - closestX);
  const dodgeAngle =
    awayAngle + (Math.random() < 0.5 ? Math.PI / 2 : -Math.PI / 2);

  const baseSpeed = Math.hypot(ship.vx, ship.vy);
  const boosted = Math.min(
    baseSpeed * SHIP_EVADE_BOOST,
    SHIP_SPEED_RANGE.max * 1.6,
  );
  ship.vx = Math.cos(dodgeAngle) * boosted;
  ship.vy = Math.sin(dodgeAngle) * boosted;
  ship.evadeUntil = now + SHIP_EVADE_COOLDOWN;
}

type FireworkType = {
  x: number;
  y: number;
  targetX?: number;
  targetY: number;
  aimed: boolean;
  color: string;
  size: number;
  vx: number;
  vy: number;
  trail: Trail;
  exploded: boolean;
  update: (maxX: number, maxY: number, dt: number) => boolean;
  explode: () => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
};

function getValueByRange(range: { min: number; max: number } | number): number {
  if (typeof range === "number") return range;
  return rand(range.min, range.max);
}

function getColor(color: string | string[] | undefined): string {
  if (Array.isArray(color))
    return color[randInt(0, color.length)] ?? randColor();
  return color ?? randColor();
}

function createFirework({
  x,
  y,
  targetY,
  color,
  speed,
  size,
  particleSpeed,
  particleSize,
  onExplode,
  initialVelocity,
  targetX,
  aimed = false,
  gravity = DEFAULT_GRAVITY,
}: {
  x: number;
  y: number;
  targetY: number;
  color: string;
  speed: number;
  size: number;
  particleSpeed: { min: number; max: number } | number;
  particleSize: { min: number; max: number } | number;
  onExplode: (
    count: number,
    params: { x: number; y: number; color: string },
    speedRange: any,
    sizeRange: any,
  ) => void;
  initialVelocity?: { vx: number; vy: number };
  targetX?: number;
  aimed?: boolean;
  gravity?: number;
}): FireworkType {
  const angle = initialVelocity
    ? Math.atan2(initialVelocity.vy, initialVelocity.vx)
    : -Math.PI / 2 + rand(-0.3, 0.3);

  const vx = initialVelocity ? initialVelocity.vx : Math.cos(angle) * speed;
  const vy = initialVelocity ? initialVelocity.vy : Math.sin(angle) * speed;

  const trailLen = randInt(10, 22);
  const trail = makeTrail(trailLen);

  return {
    x,
    y,
    targetX,
    targetY,
    aimed,
    color,
    size,
    vx,
    vy,
    trail,
    exploded: false,
    update(maxXValue, maxYValue, dt) {
      if (this.exploded) return false;

      trailPush(this.trail, this.x, this.y);

      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vy += gravity * dt;

      if (this.aimed && this.targetX !== undefined) {
        const dx = this.x - this.targetX;
        const dy = this.y - this.targetY;
        const aimedRadius = Math.max(6, this.size * 2.4);

        if (dx * dx + dy * dy <= aimedRadius * aimedRadius) {
          this.explode();
          return false;
        }

        const outOfBounds =
          this.x < -FIREWORK_OFFSCREEN_MARGIN ||
          this.x > maxXValue + FIREWORK_OFFSCREEN_MARGIN ||
          this.y < -FIREWORK_OFFSCREEN_MARGIN ||
          this.y > maxYValue + FIREWORK_OFFSCREEN_MARGIN;

        if (outOfBounds) return false;
        return true;
      }

      if (this.vy >= 0 || this.y <= this.targetY) {
        this.explode();
        return false;
      }

      return true;
    },
    explode() {
      if (this.exploded) return;
      this.exploded = true;

      // Instead of allocating an array of particles, just tell the handler how many to spawn.
      const numParticles = randInt(50, 140);
      onExplode(
        numParticles,
        { x: this.x, y: this.y, color: this.color },
        particleSpeed,
        particleSize,
      );
    },
    draw(ctx) {
      ctx.save();
      ctx.beginPath();

      let first = true;
      trailForEach(this.trail, (p) => {
        if (first) {
          ctx.moveTo(p.x, p.y);
          first = false;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      });

      if (first) {
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y);
      }

      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();
    },
  };
}

type FireworksBackgroundProps = Omit<React.ComponentProps<"div">, "color"> & {
  canvasProps?: React.ComponentProps<"canvas">;
  population?: number;
  color?: string | string[];
  fireworkSpeed?: { min: number; max: number } | number;
  fireworkSize?: { min: number; max: number } | number;
  particleSpeed?: { min: number; max: number } | number;
  particleSize?: { min: number; max: number } | number;
  frameRate?: number;
  maxShips?: number;
  shipSpawnInterval?: { min: number; max: number };
};

function FireworksBackground({
  ref,
  className,
  canvasProps,
  population = 1,
  color,
  fireworkSpeed = { min: 10, max: 20 },
  fireworkSize = { min: 2, max: 5 },
  particleSpeed = { min: 5, max: 10 },
  particleSize = { min: 1, max: 5 },
  frameRate = 20,
  maxShips = MAX_SHIPS,
  shipSpawnInterval = SHIP_SPAWN_INTERVAL,
  ...props
}: FireworksBackgroundProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const workerRef = React.useRef<Worker | null>(null);
  const workerCleanupTimerRef = React.useRef<number | null>(null);
  const coarsePointerRef = React.useRef(false);
  const configRef = React.useRef({
    population,
    color,
    fireworkSpeed,
    fireworkSize,
    particleSpeed,
    particleSize,
    frameRate,
    maxShips,
    shipSpawnInterval,
    useRectParticles: false,
  });
  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  const [isCoarsePointer, setIsCoarsePointer] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia?.("(pointer: coarse)");
    const update = () => {
      const next = Boolean(media?.matches);
      coarsePointerRef.current = next;
      setIsCoarsePointer(next);
    };
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

  const config = React.useMemo(
    () => ({
      population,
      color,
      fireworkSpeed,
      fireworkSize,
      particleSpeed,
      particleSize,
      frameRate,
      maxShips,
      shipSpawnInterval,
      useRectParticles: isCoarsePointer,
    }),
    [
      population,
      color,
      fireworkSpeed,
      fireworkSize,
      particleSpeed,
      particleSize,
      frameRate,
      maxShips,
      shipSpawnInterval,
      isCoarsePointer,
    ],
  );

  React.useEffect(() => {
    configRef.current = config;
    if (workerRef.current) {
      workerRef.current.postMessage({ type: "config", config });
    }
  }, [config]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Respect reduced motion
    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (prefersReduced) return;

    const supportsOffscreen =
      typeof (window as unknown as { OffscreenCanvas?: typeof OffscreenCanvas })
        .OffscreenCanvas !== "undefined" &&
      "transferControlToOffscreen" in canvas &&
      typeof Worker !== "undefined";

    if (!supportsOffscreen) return;

    if (workerCleanupTimerRef.current) {
      window.clearTimeout(workerCleanupTimerRef.current);
      workerCleanupTimerRef.current = null;
    }

    let activeWorker = workerRef.current;

    if (!activeWorker && (canvas as HTMLCanvasElement).dataset.offscreen !== "true") {
      const rect = container.getBoundingClientRect();
      const maxDpr = coarsePointerRef.current ? 1.25 : 2;
      const dpr = Math.max(1, Math.min(maxDpr, window.devicePixelRatio ?? 1));
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const offscreen = canvas.transferControlToOffscreen();
      (canvas as HTMLCanvasElement).dataset.offscreen = "true";
      const worker = new Worker(
        new URL("./fireworks.worker.ts", import.meta.url),
        {
          type: "module",
        },
      );
      workerRef.current = worker;
      activeWorker = worker;

      worker.postMessage(
        {
          type: "init",
          canvas: offscreen,
          width,
          height,
          dpr,
          config: configRef.current,
        },
        [offscreen],
      );
    }

    if (!activeWorker) return;

    const resizeOptions: AddEventListenerOptions = { passive: true };
    const pointerOptions: AddEventListenerOptions = {
      capture: true,
      passive: true,
    };

    const handleResize = () => {
      const nextRect = container.getBoundingClientRect();
      const nextMaxDpr = coarsePointerRef.current ? 1.25 : 2;
      const nextDpr = Math.max(
        1,
        Math.min(nextMaxDpr, window.devicePixelRatio ?? 1),
      );
      const nextWidth = Math.max(1, Math.floor(nextRect.width));
      const nextHeight = Math.max(1, Math.floor(nextRect.height));
      canvas.style.width = `${nextWidth}px`;
      canvas.style.height = `${nextHeight}px`;
      activeWorker.postMessage({
        type: "resize",
        width: nextWidth,
        height: nextHeight,
        dpr: nextDpr,
      });
    };

    const getClientPoint = (
      event: PointerEvent | MouseEvent | TouchEvent,
    ): { x: number; y: number } | null => {
      if ("touches" in event) {
        const touch = event.touches[0] ?? event.changedTouches[0];
        if (!touch) return null;
        return { x: touch.clientX, y: touch.clientY };
      }
      return { x: event.clientX, y: event.clientY };
    };

    const handlePointerDown = (
      event: PointerEvent | MouseEvent | TouchEvent,
    ) => {
      const point = getClientPoint(event);
      if (!point) return;
      const nextRect = container.getBoundingClientRect();
      const targetX = point.x - nextRect.left;
      const targetY = point.y - nextRect.top;
      activeWorker.postMessage({ type: "pointer", x: targetX, y: targetY });
    };

    const handleVisibility = () => {
      activeWorker.postMessage({ type: "visibility", hidden: document.hidden });
    };

    const touchOptions: AddEventListenerOptions = {
      passive: true,
      capture: true,
    };

    window.addEventListener("resize", handleResize, resizeOptions);
    // Use both container + window capture to avoid pointer-events/stacking issues.
    container.addEventListener(
      "pointerdown",
      handlePointerDown,
      pointerOptions,
    );
    window.addEventListener("pointerdown", handlePointerDown, pointerOptions);
    window.addEventListener("touchstart", handlePointerDown, touchOptions);
    container.addEventListener("touchstart", handlePointerDown, touchOptions);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("resize", handleResize, resizeOptions);
      container.removeEventListener(
        "pointerdown",
        handlePointerDown,
        pointerOptions,
      );
      window.removeEventListener(
        "pointerdown",
        handlePointerDown,
        pointerOptions,
      );
      window.removeEventListener("touchstart", handlePointerDown, touchOptions);
      container.removeEventListener(
        "touchstart",
        handlePointerDown,
        touchOptions,
      );
      document.removeEventListener("visibilitychange", handleVisibility);
      workerCleanupTimerRef.current = window.setTimeout(() => {
        activeWorker.terminate();
        if (workerRef.current === activeWorker) workerRef.current = null;
        workerCleanupTimerRef.current = null;
      }, 0);
    };
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Respect reduced motion
    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (prefersReduced) return;

    const supportsOffscreen =
      typeof (window as unknown as { OffscreenCanvas?: typeof OffscreenCanvas })
        .OffscreenCanvas !== "undefined" &&
      "transferControlToOffscreen" in canvas &&
      typeof Worker !== "undefined";

    if (supportsOffscreen) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let maxX = 0;
    let maxY = 0;
    let dpr = 1;

    const setCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const maxDpr = coarsePointerRef.current ? 1.25 : 2;
      dpr = Math.max(1, Math.min(maxDpr, window.devicePixelRatio ?? 1));
      maxX = Math.max(1, Math.floor(rect.width));
      maxY = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(maxX * dpr);
      canvas.height = Math.floor(maxY * dpr);
      canvas.style.width = `${maxX}px`;
      canvas.style.height = `${maxY}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resizeOptions: AddEventListenerOptions = { passive: true };
    const pointerOptions: AddEventListenerOptions = {
      capture: true,
      passive: true,
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize, resizeOptions);

    const explosions: ParticleType[] = [];
    const fireworks: FireworkType[] = [];
    const ships: ShipType[] = [];

    let timeoutId: number | undefined;
    let shipTimeoutId: number | undefined;
    let animationFrameId: number | undefined;

    let isActive = true;
    let isMounted = true;

    // frame pacing
    let lastFrameTime = performance.now();
    let lastTickTime = lastFrameTime;
    const frameInterval = frameRate > 0 ? 1000 / frameRate : 0;

    // pointer throttling
    let lastPointerSpawnAt = 0;

    // IntersectionObserver: stop if not in viewport
    let inView = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? true;
        if (!inView) stopLoops(true);
        else startLoops();
      },
      { threshold: 0.01 },
    );
    io.observe(container);

    const addExplosionParticles = (
      count: number,
      origin: { x: number; y: number; color: string },
      speedRange: { min: number; max: number } | number,
      sizeRange: { min: number; max: number } | number,
    ) => {
      const allowed = Math.max(0, MAX_PARTICLES - explosions.length);
      const n = Math.min(count, allowed);
      for (let i = 0; i < n; i++) {
        const p = acquireParticle();
        const particleAngle = rand(0, Math.PI * 2);
        const localParticleSpeed = getValueByRange(speedRange);
        const localParticleSize = getValueByRange(sizeRange);
        explosions.push(
          initParticle(
            p,
            origin.x,
            origin.y,
            origin.color,
            localParticleSpeed,
            particleAngle,
            0.01,
            0.98,
            localParticleSize,
          ),
        );
      }
    };

    const spawnHitEffect = (x: number, y: number) => {
      const count = randInt(8, 14);
      addExplosionParticles(
        count,
        { x, y, color: "hsl(10, 90%, 60%)" },
        { min: 0.8, max: 2.5 },
        { min: 0.8, max: 1.6 },
      );
    };

    const launchShip = () => {
      if (!isActive || !inView) return;
      if (ships.length < maxShips) ships.push(createShip(maxX, maxY));
      shipTimeoutId = window.setTimeout(
        launchShip,
        rand(shipSpawnInterval.min, shipSpawnInterval.max),
      );
    };

    const spawnAt = (clientX: number, clientY: number) => {
      if (!inView) return;
      if (fireworks.length >= MAX_POINTER_FIREWORKS) return;

      const rect = container.getBoundingClientRect();
      const targetX = clamp(clientX - rect.left, 0, maxX);
      const targetY = clamp(clientY - rect.top, 0, maxY);

      const x = rand(maxX * 0.1, maxX * 0.9);
      const y = maxY;

      const fireworkColor = getColor(color);
      const initialVelocity = solveLaunchVelocity({
        startX: x,
        startY: y,
        targetX,
        targetY,
        speedRange: fireworkSpeed,
        gravity: DEFAULT_GRAVITY,
      });

      const pointerSpeedMultiplier = 3;
      const boostedVelocity = {
        vx: initialVelocity.vx * pointerSpeedMultiplier,
        vy: initialVelocity.vy * pointerSpeedMultiplier,
      };
      const speed = Math.hypot(boostedVelocity.vx, boostedVelocity.vy);
      const size = getValueByRange(fireworkSize);

      if (fireworks.length >= MAX_FIREWORKS) removeAtSwap(fireworks, 0);

      fireworks.push(
        createFirework({
          x,
          y,
          targetY,
          targetX,
          aimed: true,
          color: fireworkColor,
          speed,
          size,
          particleSpeed,
          particleSize,
          onExplode: addExplosionParticles,
          initialVelocity: boostedVelocity,
        }),
      );
    };

    const launchFirework = () => {
      if (!isActive || !inView) return;

      const x = rand(maxX * 0.1, maxX * 0.9);
      const y = maxY;
      const fireworkColor = getColor(color);

      // Pick a random visible ship without allocating a filtered array
      let targetShip: ShipType | null = null;
      if (ships.length > 0) {
        for (let tries = 0; tries < 6; tries++) {
          const candidate = ships[randInt(0, ships.length)];
          if (!candidate) continue;
          if (
            candidate.x >= 0 &&
            candidate.x <= maxX &&
            candidate.y >= 0 &&
            candidate.y <= maxY
          ) {
            targetShip = candidate;
            break;
          }
        }
      }

      const targetX = targetShip?.x;
      const targetY = targetShip ? targetShip.y : rand(maxY * 0.1, maxY * 0.4);

      const initialVelocity = targetShip
        ? solveLaunchVelocity({
            startX: x,
            startY: y,
            targetX: targetShip.x,
            targetY,
            speedRange: fireworkSpeed,
            gravity: DEFAULT_GRAVITY,
          })
        : undefined;

      const speed = initialVelocity
        ? Math.hypot(initialVelocity.vx, initialVelocity.vy)
        : getValueByRange(fireworkSpeed);
      const size = getValueByRange(fireworkSize);

      if (fireworks.length < MAX_FIREWORKS) {
        fireworks.push(
          createFirework({
            x,
            y,
            targetY,
            color: fireworkColor,
            speed,
            size,
            particleSpeed,
            particleSize,
            onExplode: addExplosionParticles,
            initialVelocity,
            targetX,
            aimed: Boolean(targetShip),
          }),
        );
      }

      const timeout = rand(220, 550) / population;
      timeoutId = window.setTimeout(launchFirework, timeout);
    };

    const threats: { x: number; y: number }[] = [];

    const animate = () => {
      if (!isActive || !isMounted || !inView) return;

      // pacing
      const now = performance.now();
      if (frameInterval > 0 && now - lastFrameTime < frameInterval) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = now;

      // dt normalize to 60fps step
      const rawDtMs = now - lastTickTime;
      lastTickTime = now;
      const dt = Math.min(rawDtMs / 16.67, 1.2);

      ctx.clearRect(0, 0, maxX, maxY);

      // Threat list reuse to avoid allocations
      threats.length = 0;
      if (ships.length > 0 && fireworks.length > 0) {
        for (let i = 0; i < fireworks.length; i++) {
          const f = fireworks[i]!;
          threats.push({ x: f.x, y: f.y });
        }
      }

      // Ships
      for (let i = ships.length - 1; i >= 0; i--) {
        const ship = ships[i]!;
        if (threats.length > 0) applyEvasion(ship, threats);

        if (!ship.update(maxX, maxY, dt)) {
          removeAtSwap(ships, i);
        } else {
          ship.draw(ctx);
        }
      }

      // Fireworks
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const firework = fireworks[i]!;
        if (!firework.update(maxX, maxY, dt)) {
          removeAtSwap(fireworks, i);
          continue;
        }

        let hit = false;
        for (let s = ships.length - 1; s >= 0; s--) {
          const ship = ships[s]!;
          const dx = firework.x - ship.x;
          const dy = firework.y - ship.y;
          const hitRadius = ship.size * 2.3;

          if (dx * dx + dy * dy <= hitRadius * hitRadius) {
            removeAtSwap(ships, s);
            spawnHitEffect(ship.x, ship.y);
            firework.explode();
            removeAtSwap(fireworks, i);
            hit = true;
            break;
          }
        }

        if (!hit) firework.draw(ctx);
      }

      // Particles
      ctx.save();
      for (let i = explosions.length - 1; i >= 0; i--) {
        const p = explosions[i]!;
        p.update();
        if (p.isAlive()) {
          p.draw(ctx);
        } else {
          removeAtSwap(explosions, i);
          releaseParticle(p);
        }
      }
      ctx.restore();
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(animate);
    };

    const stopLoops = (clear = false) => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      if (shipTimeoutId) {
        window.clearTimeout(shipTimeoutId);
        shipTimeoutId = undefined;
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = undefined;
      }
      if (clear) {
        // release particles to pool
        for (let i = 0; i < explosions.length; i++)
          releaseParticle(explosions[i]!);
        explosions.length = 0;
        fireworks.length = 0;
        ships.length = 0;
        ctx.clearRect(0, 0, maxX, maxY);
      }
    };

    const startLoops = () => {
      if (!isActive || !inView) return;
      if (!timeoutId) launchFirework();
      if (!shipTimeoutId) launchShip();
      if (!animationFrameId) {
        lastFrameTime = performance.now();
        lastTickTime = lastFrameTime;
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    const handleVisibilityChange = () => {
      isActive = !document.hidden;
      if (!isActive) stopLoops(true);
      else startLoops();
    };

    startLoops();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const getClientPoint = (
      event: PointerEvent | MouseEvent | TouchEvent,
    ): { x: number; y: number } | null => {
      if ("touches" in event) {
        const touch = event.touches[0] ?? event.changedTouches[0];
        if (!touch) return null;
        return { x: touch.clientX, y: touch.clientY };
      }
      return { x: event.clientX, y: event.clientY };
    };

    const handleWindowPointerDown = (
      event: PointerEvent | MouseEvent | TouchEvent,
    ) => {
      const now = performance.now();
      if (now - lastPointerSpawnAt < POINTER_SPAWN_COOLDOWN_MS) return;
      lastPointerSpawnAt = now;
      const point = getClientPoint(event);
      if (!point) return;
      spawnAt(point.x, point.y);
    };

    const touchOptions: AddEventListenerOptions = {
      passive: true,
      capture: true,
    };

    // Use both container + window capture to avoid pointer-events/stacking issues.
    container.addEventListener(
      "pointerdown",
      handleWindowPointerDown,
      pointerOptions,
    );
    window.addEventListener(
      "pointerdown",
      handleWindowPointerDown,
      pointerOptions,
    );
    window.addEventListener(
      "mousedown",
      handleWindowPointerDown,
      pointerOptions,
    );
    window.addEventListener("click", handleWindowPointerDown, pointerOptions);
    window.addEventListener(
      "touchstart",
      handleWindowPointerDown,
      touchOptions,
    );
    container.addEventListener(
      "touchstart",
      handleWindowPointerDown,
      touchOptions,
    );

    return () => {
      isActive = false;
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", setCanvasSize, resizeOptions);
      container.removeEventListener(
        "pointerdown",
        handleWindowPointerDown,
        pointerOptions,
      );
      window.removeEventListener(
        "pointerdown",
        handleWindowPointerDown,
        pointerOptions,
      );
      window.removeEventListener(
        "mousedown",
        handleWindowPointerDown,
        pointerOptions,
      );
      window.removeEventListener(
        "click",
        handleWindowPointerDown,
        pointerOptions,
      );
      window.removeEventListener(
        "touchstart",
        handleWindowPointerDown,
        touchOptions,
      );
      container.removeEventListener(
        "touchstart",
        handleWindowPointerDown,
        touchOptions,
      );
      io.disconnect();
      stopLoops(true);
    };
  }, [
    population,
    color,
    fireworkSpeed,
    fireworkSize,
    particleSpeed,
    particleSize,
    frameRate,
    maxShips,
    shipSpawnInterval,
  ]);

  return (
    <div
      ref={containerRef}
      data-slot="fireworks-background"
      className={cn("relative size-full overflow-hidden", className)}
      {...props}
    >
      <canvas
        {...canvasProps}
        ref={canvasRef}
        className={cn(
          "absolute inset-0 size-full pointer-events-none",
          canvasProps?.className,
        )}
      />
    </div>
  );
}

export { FireworksBackground, type FireworksBackgroundProps };
