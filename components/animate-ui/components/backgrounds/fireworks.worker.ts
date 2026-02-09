/* eslint-disable no-restricted-globals */
type FireworkRange = { min: number; max: number } | number;

type FireworksConfig = {
  population: number;
  color?: string | string[];
  fireworkSpeed: FireworkRange;
  fireworkSize: FireworkRange;
  particleSpeed: FireworkRange;
  particleSize: FireworkRange;
  frameRate: number;
  maxShips: number;
  shipSpawnInterval: { min: number; max: number };
  useRectParticles?: boolean;
};

type InitMessage = {
  type: "init";
  canvas: OffscreenCanvas;
  width: number;
  height: number;
  dpr: number;
  config: FireworksConfig;
};

type ResizeMessage = { type: "resize"; width: number; height: number; dpr: number };
type PointerMessage = { type: "pointer"; x: number; y: number };
type VisibilityMessage = { type: "visibility"; hidden: boolean };
type UpdateConfigMessage = { type: "config"; config: Partial<FireworksConfig> };

type WorkerMessage = InitMessage | ResizeMessage | PointerMessage | VisibilityMessage | UpdateConfigMessage;

const DEFAULT_GRAVITY = 0.02;
const SHIP_EVADE_CHANCE = 0.8;
const SHIP_EVADE_DISTANCE = 120;
const SHIP_EVADE_COOLDOWN = 120;
const SHIP_EVADE_BOOST = 1.6;
const FIREWORK_OFFSCREEN_MARGIN = 60;

const MAX_FIREWORKS = 10;
const MAX_PARTICLES = 1400;
const POINTER_SPAWN_COOLDOWN_MS = 0;
const MAX_POINTER_FIREWORKS = 16;

const rand = (min: number, max: number): number => Math.random() * (max - min) + min;
const randInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min) + min);
const clamp = (n: number, min: number, max: number): number => Math.max(min, Math.min(max, n));

const resolveRange = (range: FireworkRange): { min: number; max: number; preferred: number } => {
  if (typeof range === "number") return { min: range, max: range, preferred: range };
  return { min: range.min, max: range.max, preferred: (range.min + range.max) / 2 };
};

const getValueByRange = (range: FireworkRange): number => {
  if (typeof range === "number") return range;
  return rand(range.min, range.max);
};

const getColor = (color?: string | string[]) => {
  if (!color) return `hsl(${randInt(0, 360)}, 100%, 50%)`;
  if (Array.isArray(color)) return color[randInt(0, color.length)];
  return color;
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
  speedRange: FireworkRange;
  gravity?: number;
}) => {
  const dx = targetX - startX;
  const dy = targetY - startY;
  const { min, max, preferred } = resolveRange(speedRange);

  let best: { vx: number; vy: number; score: number } | null = null;
  for (let t = 10; t <= 120; t++) {
    const vx = dx / t;
    const vy = (dy - 0.5 * gravity * t * t) / t;
    if (vy >= 0) continue;
    const speed = Math.hypot(vx, vy);
    const inRange = speed >= min && speed <= max;
    const score = Math.abs(speed - preferred) - (inRange ? 1000 : 0);
    if (!best || score < best.score) best = { vx, vy, score };
  }
  if (!best) return { vx: 0, vy: -preferred };
  return { vx: best.vx, vy: best.vy };
};

const removeAtSwap = <T>(arr: T[], i: number) => {
  const last = arr.length - 1;
  if (i !== last) arr[i] = arr[last]!;
  arr.pop();
};

type Particle = {
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
};

type Ship = {
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
};

type Firework = {
  x: number;
  y: number;
  targetY: number;
  color: string;
  vx: number;
  vy: number;
  size: number;
  gravity: number;
  friction: number;
  trail: { data: { x: number; y: number }[]; head: number; size: number; len: number };
  exploded: boolean;
  onExplode: (count: number, origin: { x: number; y: number; color: string }, speed: FireworkRange, size: FireworkRange) => void;
  particleSpeed: FireworkRange;
  particleSize: FireworkRange;
  targetX?: number;
  aimed?: boolean;
};

const makeTrail = (len: number) => ({
  data: new Array(len),
  head: 0,
  size: 0,
  len,
});

const trailPush = (trail: ReturnType<typeof makeTrail>, x: number, y: number) => {
  trail.data[trail.head] = { x, y };
  trail.head = (trail.head + 1) % trail.len;
  trail.size = Math.min(trail.size + 1, trail.len);
};

const trailForEach = (trail: ReturnType<typeof makeTrail>, fn: (p: { x: number; y: number }) => void) => {
  const start = trail.size === trail.len ? trail.head : 0;
  for (let i = 0; i < trail.size; i++) {
    const idx = (start + i) % trail.len;
    const p = trail.data[idx];
    if (p) fn(p);
  }
};

const initParticle = (
  p: Particle,
  x: number,
  y: number,
  color: string,
  speed: number,
  angle: number,
  gravity: number,
  friction: number,
  size: number
) => {
  p.x = x;
  p.y = y;
  p.color = color;
  p.vx = Math.cos(angle) * speed;
  p.vy = Math.sin(angle) * speed;
  p.gravity = gravity;
  p.friction = friction;
  p.alpha = 1;
  p.decay = rand(0.01, 0.02);
  p.size = size;
  return p;
};

const createParticle = (): Particle => ({
  x: 0,
  y: 0,
  color: "#fff",
  vx: 0,
  vy: 0,
  gravity: 0.01,
  friction: 0.98,
  alpha: 1,
  decay: 0.02,
  size: 2,
});

const createShip = (maxX: number, maxY: number): Ship => {
  const size = rand(8, 18);
  const margin = size * 2;
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

  const targetX = rand(maxX * 0.1, maxX * 0.9);
  let targetY = rand(maxY * 0.1, maxY * 0.9);
  if (Math.abs(targetY - y) < maxY * 0.2) {
    targetY = clamp(
      targetY + (Math.random() < 0.5 ? -1 : 1) * maxY * 0.3,
      0,
      maxY,
    );
  }

  const angle = Math.atan2(targetY - y, targetX - x);
  const speed = rand(0.8, 2.1);
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;

  return {
    x,
    y,
    vx,
    vy,
    size,
    rotation: angle,
    canEvade: Math.random() > 0.3,
    evadeUntil: 0,
    color: "rgba(255,255,255,0.9)",
    margin,
  };
};

const applyEvasion = (ship: Ship, threats: { x: number; y: number }[]) => {
  if (!ship.canEvade) return;
  const now = performance.now();
  if (now < ship.evadeUntil) return;

  for (let i = 0; i < threats.length; i++) {
    const t = threats[i]!;
    const dx = t.x - ship.x;
    const dy = t.y - ship.y;
    const dist2 = dx * dx + dy * dy;
    if (dist2 > SHIP_EVADE_DISTANCE * SHIP_EVADE_DISTANCE) continue;
    if (Math.random() > SHIP_EVADE_CHANCE) return;

    const sign = dy > 0 ? -1 : 1;
    ship.vy += sign * SHIP_EVADE_BOOST;
    ship.evadeUntil = now + SHIP_EVADE_COOLDOWN;
    return;
  }
};

let ctx: OffscreenCanvasRenderingContext2D | null = null;
let width = 0;
let height = 0;
let dpr = 1;
let config: FireworksConfig | null = null;

let active = true;
let animationTimer: number | null = null;
let fireworkTimer: number | null = null;
let shipTimer: number | null = null;
let lastFrame = performance.now();
let lastPointerSpawn = 0;

const particlePool: Particle[] = [];

const acquireParticle = (): Particle =>
  particlePool.pop() ??
  ({
    x: 0,
    y: 0,
    color: "#fff",
    vx: 0,
    vy: 0,
    gravity: 0.01,
    friction: 0.98,
    alpha: 1,
    decay: 0.02,
    size: 2,
  } as Particle);

const releaseParticle = (p: Particle) => {
  if (particlePool.length < MAX_PARTICLES * 2) particlePool.push(p);
};

const particles: Particle[] = [];
const fireworks: Firework[] = [];
const ships: Ship[] = [];
const threats: { x: number; y: number }[] = [];

const drawShip = (ship: Ship) => {
  if (!ctx) return;
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.rotation);
  ctx.fillStyle = ship.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, ship.size * 1.2, ship.size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const updateShip = (ship: Ship, dt: number) => {
  ship.x += ship.vx * dt;
  ship.y += ship.vy * dt;
  if (ship.x < -ship.margin || ship.x > width + ship.margin) return false;
  if (ship.y < -ship.margin || ship.y > height + ship.margin) return false;
  ship.vy *= 0.985;
  return true;
};

const addExplosionParticles = (
  count: number,
  origin: { x: number; y: number; color: string },
  speedRange: FireworkRange,
  sizeRange: FireworkRange
) => {
  const allowed = Math.max(0, MAX_PARTICLES - particles.length);
  const n = Math.min(count, allowed);
  for (let i = 0; i < n; i++) {
    const p = acquireParticle();
    const angle = rand(0, Math.PI * 2);
    const speed = getValueByRange(speedRange);
    const size = getValueByRange(sizeRange);
    particles.push(initParticle(p, origin.x, origin.y, origin.color, speed, angle, 0.01, 0.98, size));
  }
};

const createFirework = (opts: {
  x: number;
  y: number;
  targetY: number;
  color: string;
  speed: number;
  size: number;
  particleSpeed: FireworkRange;
  particleSize: FireworkRange;
  onExplode: Firework["onExplode"];
  initialVelocity?: { vx: number; vy: number };
  targetX?: number;
  aimed?: boolean;
}): Firework => {
  const {
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
    aimed,
  } = opts;
  const vel = initialVelocity ?? { vx: rand(-0.8, 0.8) * speed, vy: -speed };
  return {
    x,
    y,
    targetY,
    color,
    vx: vel.vx,
    vy: vel.vy,
    size,
    gravity: DEFAULT_GRAVITY,
    friction: 0.998,
    trail: makeTrail(8),
    exploded: false,
    onExplode,
    particleSpeed,
    particleSize,
    targetX,
    aimed,
  };
};

const updateFirework = (firework: Firework, dt: number) => {
  firework.vx *= firework.friction;
  firework.vy = firework.vy * firework.friction + firework.gravity * dt;
  firework.x += firework.vx * dt;
  firework.y += firework.vy * dt;

  trailPush(firework.trail, firework.x, firework.y);

  if (firework.y > height + FIREWORK_OFFSCREEN_MARGIN || firework.x < -FIREWORK_OFFSCREEN_MARGIN || firework.x > width + FIREWORK_OFFSCREEN_MARGIN) {
    return false;
  }

  if (firework.aimed && firework.targetX !== undefined) {
    const dx = firework.x - firework.targetX;
    const dy = firework.y - firework.targetY;
    const r = Math.max(6, firework.size * 2.4);
    if (dx * dx + dy * dy <= r * r) {
      if (!firework.exploded) {
        firework.exploded = true;
        const count = randInt(50, 140);
        firework.onExplode(
          count,
          { x: firework.x, y: firework.y, color: firework.color },
          firework.particleSpeed,
          firework.particleSize
        );
      }
      return false;
    }
  }

  if (firework.vy >= 0 || firework.y <= firework.targetY) {
    if (!firework.exploded) {
      firework.exploded = true;
      const count = randInt(50, 140);
      firework.onExplode(count, { x: firework.x, y: firework.y, color: firework.color }, firework.particleSpeed, firework.particleSize);
    }
    return false;
  }

  return true;
};

const drawFirework = (firework: Firework) => {
  const ctxLocal = ctx;
  if (!ctxLocal) return;
  ctxLocal.save();
  ctxLocal.beginPath();
  let first = true;
  trailForEach(firework.trail, (p) => {
    if (first) {
      ctxLocal.moveTo(p.x, p.y);
      first = false;
    } else {
      ctxLocal.lineTo(p.x, p.y);
    }
  });
  if (first) {
    ctxLocal.moveTo(firework.x, firework.y);
    ctxLocal.lineTo(firework.x, firework.y);
  }
  ctxLocal.strokeStyle = firework.color;
  ctxLocal.lineWidth = firework.size;
  ctxLocal.lineCap = "round";
  ctxLocal.stroke();
  ctxLocal.restore();
};

const updateParticles = (dt: number) => {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]!;
    p.vx *= p.friction;
    p.vy = p.vy * p.friction + p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.alpha -= p.decay;
    if (p.alpha <= 0) {
      const dead = particles[i]!;
      removeAtSwap(particles, i);
      releaseParticle(dead);
    }
  }
};

const drawParticles = () => {
  const ctxLocal = ctx;
  if (!ctxLocal) return;
  const useRect = Boolean(config?.useRectParticles);
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]!;
    ctxLocal.globalAlpha = p.alpha;
    ctxLocal.fillStyle = p.color;
    if (useRect) {
      const s = p.size;
      ctxLocal.fillRect(p.x - s, p.y - s, s * 2, s * 2);
    } else {
      ctxLocal.beginPath();
      ctxLocal.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctxLocal.fill();
    }
  }
  ctxLocal.globalAlpha = 1;
};

const spawnFirework = () => {
  if (!config || !active) return;
  if (fireworks.length >= MAX_FIREWORKS) return;

  const x = rand(width * 0.1, width * 0.9);
  const y = height;
  const color = getColor(config.color);

  let targetShip: Ship | null = null;
  if (ships.length > 0) {
    for (let i = 0; i < 6; i++) {
      const candidate = ships[randInt(0, ships.length)];
      if (!candidate) continue;
      if (candidate.x >= 0 && candidate.x <= width && candidate.y >= 0 && candidate.y <= height) {
        targetShip = candidate;
        break;
      }
    }
  }
  const targetX = targetShip?.x;
  const targetY = targetShip ? targetShip.y : rand(height * 0.1, height * 0.4);

  const initialVelocity = targetShip
    ? solveLaunchVelocity({ startX: x, startY: y, targetX: targetShip.x, targetY, speedRange: config.fireworkSpeed })
    : undefined;

  const speed = initialVelocity ? Math.hypot(initialVelocity.vx, initialVelocity.vy) : getValueByRange(config.fireworkSpeed);
  const size = getValueByRange(config.fireworkSize);

  fireworks.push(
    createFirework({
      x,
      y,
      targetY,
      color,
      speed,
      size,
      particleSpeed: config.particleSpeed,
      particleSize: config.particleSize,
      onExplode: addExplosionParticles,
      initialVelocity,
      targetX,
      aimed: Boolean(targetShip),
    })
  );
};

const spawnShip = () => {
  if (!config || !active) return;
  if (ships.length < config.maxShips) ships.push(createShip(width, height));
};

const spawnAt = (x: number, y: number) => {
  if (!config || !active) return;
  if (fireworks.length >= MAX_POINTER_FIREWORKS) return;
  const targetX = clamp(x, 0, width);
  const targetY = clamp(y, 0, height);
  const now = performance.now();
  if (now - lastPointerSpawn < POINTER_SPAWN_COOLDOWN_MS) return;
  lastPointerSpawn = now;

  const startX = rand(width * 0.1, width * 0.9);
  const startY = height;
  const color = getColor(config.color);
  const initialVelocity = solveLaunchVelocity({
    startX,
    startY,
    targetX,
    targetY,
    speedRange: config.fireworkSpeed,
  });
  const pointerSpeedMultiplier = 3;
  const boostedVelocity = {
    vx: initialVelocity.vx * pointerSpeedMultiplier,
    vy: initialVelocity.vy * pointerSpeedMultiplier,
  };
  const speed = Math.hypot(boostedVelocity.vx, boostedVelocity.vy);
  const size = getValueByRange(config.fireworkSize);
  if (fireworks.length >= MAX_FIREWORKS) removeAtSwap(fireworks, 0);
  fireworks.push(
    createFirework({
      x: startX,
      y: startY,
      targetY,
      targetX,
      aimed: true,
      color,
      speed,
      size,
      particleSpeed: config.particleSpeed,
      particleSize: config.particleSize,
      onExplode: addExplosionParticles,
      initialVelocity: boostedVelocity,
    })
  );
};

const loop = () => {
  if (!ctx || !config || !active) return;
  const now = performance.now();
  const frameInterval = config.frameRate > 0 ? 1000 / config.frameRate : 0;
  if (frameInterval > 0 && now - lastFrame < frameInterval) return;
  const dt = Math.min((now - lastFrame) / 16.67, 1.2);
  lastFrame = now;

  ctx.clearRect(0, 0, width, height);

  threats.length = 0;
  if (ships.length > 0 && fireworks.length > 0) {
    for (let i = 0; i < fireworks.length; i++) {
      const f = fireworks[i]!;
      threats.push({ x: f.x, y: f.y });
    }
  }

  for (let i = ships.length - 1; i >= 0; i--) {
    const ship = ships[i]!;
    if (threats.length > 0) applyEvasion(ship, threats);
    if (!updateShip(ship, dt)) removeAtSwap(ships, i);
    else drawShip(ship);
  }

  for (let i = fireworks.length - 1; i >= 0; i--) {
    const firework = fireworks[i]!;
    if (!updateFirework(firework, dt)) {
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
        addExplosionParticles(randInt(8, 14), { x: ship.x, y: ship.y, color: "hsl(10, 90%, 60%)" }, { min: 0.8, max: 2.5 }, { min: 0.8, max: 1.6 });
        firework.exploded = true;
        removeAtSwap(fireworks, i);
        hit = true;
        break;
      }
    }
    if (!hit) drawFirework(firework);
  }

  updateParticles(dt);
  drawParticles();
};

const scheduleNextFrame = () => {
  if (!config || !active) return;
  const frameInterval = config.frameRate > 0 ? 1000 / config.frameRate : 16;
  animationTimer = self.setTimeout(() => {
    loop();
    scheduleNextFrame();
  }, frameInterval);
};

const startTimers = () => {
  if (!config) return;
  if (animationTimer === null) scheduleNextFrame();
  if (fireworkTimer === null) {
    const schedule = () => {
      spawnFirework();
      if (!config) return;
      fireworkTimer = self.setTimeout(schedule, rand(220, 550) / config.population);
    };
    fireworkTimer = self.setTimeout(schedule, rand(220, 550) / config.population);
  }
  if (shipTimer === null) {
    const scheduleShip = () => {
      spawnShip();
      if (!config) return;
      shipTimer = self.setTimeout(scheduleShip, rand(config.shipSpawnInterval.min, config.shipSpawnInterval.max));
    };
    shipTimer = self.setTimeout(scheduleShip, rand(config.shipSpawnInterval.min, config.shipSpawnInterval.max));
  }
};

const stopTimers = () => {
  if (animationTimer !== null) {
    self.clearTimeout(animationTimer);
    animationTimer = null;
  }
  if (fireworkTimer !== null) {
    self.clearTimeout(fireworkTimer);
    fireworkTimer = null;
  }
  if (shipTimer !== null) {
    self.clearTimeout(shipTimer);
    shipTimer = null;
  }
};

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;
  switch (message.type) {
    case "init": {
      config = message.config;
      const canvas = message.canvas;
      ctx = canvas.getContext("2d");
      width = message.width;
      height = message.height;
      dpr = message.dpr;
      if (ctx) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      active = true;
      lastFrame = performance.now();
      startTimers();
      break;
    }
    case "resize": {
      width = message.width;
      height = message.height;
      dpr = message.dpr;
      if (ctx) {
        ctx.canvas.width = Math.floor(width * dpr);
        ctx.canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      break;
    }
    case "pointer": {
      spawnAt(message.x, message.y);
      break;
    }
    case "visibility": {
      active = !message.hidden;
      if (!active) stopTimers();
      else startTimers();
      break;
    }
    case "config": {
      config = { ...config!, ...message.config };
      break;
    }
  }
};
