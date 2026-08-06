/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, memo } from 'react';

interface ShapeItem {
  id: string;
  type: 'arch' | 'semicircle' | 'slanted' | 'triangle' | 'diamond' | 'flower' | 'cookie' | 'clover' | 'bun' | 'pill' | 'heart';
  size: number;
  x: number; // % width of page
  y: number; // % height of page
  vx: number;
  vy: number;
  maxSpeed: number;
  force: number;
  isAggressive: boolean;
  scale: number;
  isEaten: boolean;
  rotation: number;
  rotSpeed: number;
  flashActive: boolean;
  colorType: 'primary' | 'tertiary' | 'rose';
  depth: 'far' | 'mid' | 'front';
}

interface ExplosionParticle {
  id: string;
  x: number; // px
  y: number; // px
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
}

interface Shockwave {
  id: string;
  x: number; // px
  y: number; // px
  size: number;
  color: string;
  opacity: number;
}

// Cached SVG paths for ultra-fast canvas rendering via Path2D
const SVG_PATH_STRINGS: Record<ShapeItem['type'], string> = {
  arch: 'M 20 80 V 50 A 30 30 0 0 1 80 50 V 80 Z',
  semicircle: 'M 15 70 A 35 35 0 0 1 85 70 Z',
  slanted: 'M 35 22 C 40 22, 78 22, 81 22 C 85 22, 87 25, 85 29 L 71 73 C 69 77, 66 79, 61 79 H 22 C 16 79, 13 75, 15 70 L 27 29 C 29 25, 31 22, 35 22 Z',
  triangle: 'M 50 18 C 55 18, 59 21, 84 66 C 87 71, 84 78, 78 78 H 22 C 16 78, 13 71, 16 66 L 44 21 C 45 18, 47 18, 50 18 Z',
  diamond: 'M 50 15 Q 53 15 56 18 L 81 44 Q 84 47 81 50 L 56 75 Q 53 78 50 78 Q 47 78 44 75 L 19 50 Q 16 47 19 44 L 44 18 Q 47 15 50 15 Z',
  flower: 'M 50 15 C 57 15 62 25 65 28 C 72 25 80 30 77 37 C 84 40 84 49 77 52 C 80 59 72 64 65 61 C 62 64 57 74 50 74 C 43 74 38 64 35 61 C 28 64 20 59 23 52 C 16 49 16 40 23 37 C 20 30 28 25 35 28 C 38 25 43 15 50 15 Z',
  cookie: 'M 50 15 C 62 25, 75 25, 85 50 C 75 75, 62 75, 50 85 C 38 75, 25 75, 15 50 C 25 25, 38 25, 50 15 Z',
  clover: 'M 50 50 C 35 25, 65 25, 50 50 C 75 35, 75 65, 50 50 C 65 75, 35 75, 50 50 C 25 65, 25 35, 50 50 Z',
  bun: 'M 25 50 C 25 35, 45 30, 50 42 C 55 30, 75 35, 75 50 C 75 65, 55 70, 50 58 C 45 70, 25 65, 25 50 Z',
  pill: 'M 30 30 H 70 C 80 30, 80 70, 70 70 H 30 C 20 70, 20 30, 30 30 Z',
  heart: 'M 50 30 C 50 15, 20 12, 20 40 C 20 62, 45 78, 50 82 C 55 78, 80 62, 80 40 C 80 12, 50 15, 50 30 Z',
};

let cachedPath2DMap: Record<string, Path2D> | null = null;
function getPath2D(type: ShapeItem['type']): Path2D {
  if (!cachedPath2DMap) {
    cachedPath2DMap = {} as Record<ShapeItem['type'], Path2D>;
    for (const [key, d] of Object.entries(SVG_PATH_STRINGS)) {
      cachedPath2DMap[key as ShapeItem['type']] = new Path2D(d);
    }
  }
  return cachedPath2DMap[type] || cachedPath2DMap.arch;
}

/* =========================================================
 * 1. HARDWARE-SYNCHRONIZED ASCII WAVES BACKGROUND COMPONENT
 * Renders in absolute page space for 100% compositor sync
 * ========================================================= */
const AsciiWaveCanvas = memo(function AsciiWaveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef({ x: -9999, y: -9999, active: false });

  // Track cursor in page coordinates
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pointerRef.current.x = e.pageX;
      pointerRef.current.y = e.pageY;
      pointerRef.current.active = true;
    };
    const onLeave = () => {
      pointerRef.current.active = false;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let w = 0;
    let h = 0;
    let isVisible = !document.hidden;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && !animationFrameId) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const updateDimensions = () => {
      const parent = canvas.parentElement;
      const targetW = parent ? parent.offsetWidth : window.innerWidth;
      const targetH = parent ? parent.offsetHeight : Math.max(window.innerHeight, document.documentElement.scrollHeight);

      if (targetW !== w || targetH !== h) {
        w = targetW;
        h = targetH;
        const dpr = Math.min(1.5, window.devicePixelRatio || 1);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions, { passive: true });

    // ResizeObserver on parent to adapt to content height changes smoothly
    let resizeObserver: ResizeObserver | null = null;
    if (canvas.parentElement && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });
      resizeObserver.observe(canvas.parentElement);
    }

    // Presets
    const characters = ' .:-+*=%@#';
    const elementSize = 13;
    const fontWeight = '600';
    const waveTension = 0.1;
    const speedVal = 0.5;
    const twistVal = 0.1;
    const scaleVal = 0.08;
    const intensityVal = 0.6;
    const cursorForceVal = 1;
    const interactionRadius = 140;
    const interactionRadiusSq = interactionRadius * interactionRadius;

    const driftX = 0;
    const driftY = -1;
    const driftRate = 0.5;

    const rampArr = characters;
    const rampMax = rampArr.length - 1;
    const startTime = performance.now();

    // Noise function
    const noise = (x: number, y: number, t: number) => {
      const a = Math.sin(x * 1.3 + t) * Math.cos(y * 1.1 - t * 0.7);
      const b = Math.sin((x + y) * 0.7 + t * 0.5);
      const c = Math.sin(x * 0.4 - y * 0.6 + t * 0.3);
      return (a + b + c) * 0.33333;
    };

    const draw = (now: number) => {
      if (!isVisible) {
        animationFrameId = 0;
        return;
      }

      if (w <= 0 || h <= 0) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      const cell = Math.max(4, elementSize);
      const colStep = cell * 0.6;
      const cols = Math.ceil(w / colStep) + 1;
      const totalRows = Math.ceil(h / cell);

      // Only render visible viewport rows with a small buffer for ultra-high FPS
      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      const viewportH = window.innerHeight;
      const startRow = Math.max(0, Math.floor((currentScrollY - 120) / cell));
      const endRow = Math.min(totalRows, Math.ceil((currentScrollY + viewportH + 120) / cell));

      const clearTop = Math.max(0, startRow * cell);
      const clearHeight = Math.min(h - clearTop, (endRow - startRow + 1) * cell);
      ctx.clearRect(0, clearTop, w, clearHeight);

      ctx.font = `${fontWeight} ${cell}px ui-monospace, SFMono-Regular, Consolas, monospace`;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(208, 188, 255, 0.22)';

      const t = ((now - startTime) * 0.001) * speedVal;
      const p = pointerRef.current;

      const ox = t * driftRate * driftX;
      const oy = t * driftRate * driftY;
      const waveT = t * waveTension;

      for (let j = startRow; j < endRow; j++) {
        const py = j * cell;
        const jTwist = Math.sin((j + t) * twistVal) * 2;
        const jScaleOy = j * scaleVal + oy;

        for (let i = 0; i < cols; i++) {
          const px = i * colStep;
          const iTwist = Math.cos((i + t) * twistVal) * 2;

          const nx = i * scaleVal + ox + jTwist;
          const ny = jScaleOy + iTwist;

          let v = noise(nx, ny, waveT);

          if (p.active) {
            const dx = px - p.x;
            const dy = py - p.y;
            if (Math.abs(dx) < interactionRadius && Math.abs(dy) < interactionRadius) {
              const dSq = dx * dx + dy * dy;
              if (dSq < interactionRadiusSq) {
                const d = Math.sqrt(dSq);
                const falloff = 1 - d / interactionRadius;
                v += Math.sin(d * 0.08 - t * 4) * falloff * cursorForceVal;
              }
            }
          }

          const norm = Math.max(0, Math.min(1, (v * intensityVal + 1) * 0.5));
          const chIdx = Math.round(norm * rampMax);
          if (chIdx > 0) {
            ctx.fillText(rampArr[chIdx], px, py);
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', updateDimensions);
      if (resizeObserver) resizeObserver.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-45 select-none">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
});

/* =========================================================
 * 2. HARDWARE-SYNCHRONIZED INTERACTIVE SHAPES & PARTICLES CANVAS
 * Renders in absolute page space for 100% compositor sync
 * ========================================================= */
const InteractiveShapesCanvas = memo(function InteractiveShapesCanvas({ activeTab }: { activeTab: 'landing' | 'docs' }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shapesRef = useRef<ShapeItem[]>([]);
  const particlesRef = useRef<ExplosionParticle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);

  // Track pure raw mouse position in document page coordinates
  const mousePosRef = useRef({ x: -9999, y: -9999 });
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  const nextIdRef = useRef(0);
  const generateId = () => `shape_${nextIdRef.current++}_${Date.now()}`;

  const shapeTypes: ShapeItem['type'][] = [
    'arch', 'semicircle', 'slanted', 'triangle', 'diamond', 
    'flower', 'cookie', 'clover', 'bun', 'pill', 'heart'
  ];

  const winWRef = useRef(typeof window !== 'undefined' ? window.innerWidth : 1920);
  const totalHRef = useRef(typeof window !== 'undefined' ? window.innerHeight * 4 : 4000);

  const createRandomShape = (isAggressive = false, borderSpawn = false): ShapeItem => {
    const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    const depthRoll = Math.random();
    const depth: ShapeItem['depth'] = isAggressive ? 'front' : (depthRoll < 0.25 ? 'far' : depthRoll > 0.75 ? 'front' : 'mid');
    
    const baseSize = isAggressive ? 30 + Math.random() * 20 : 25 + Math.random() * 12;
    const size = depth === 'far' ? baseSize * 0.75 : depth === 'front' ? baseSize * 1.25 : baseSize;

    let x = Math.random() * 85 + 7;
    let y = Math.random() * 92 + 4;
    if (borderSpawn) {
      if (Math.random() > 0.5) {
        x = Math.random() > 0.5 ? -4 : 104;
        y = Math.random() * 100;
      } else {
        x = Math.random() * 100;
        y = Math.random() > 0.5 ? -4 : 104;
      }
    }

    const angle = Math.random() * Math.PI * 2;
    const speedMult = depth === 'far' ? 0.4 : depth === 'front' ? 0.8 : 0.6;
    const maxSpeed = (isAggressive ? 0.035 + Math.random() * 0.05 : 0.026 + Math.random() * 0.05) * speedMult;
    const force = (isAggressive ? 0.0012 + Math.random() * 0.002 : 0.0006 + Math.random() * 0.0012) * speedMult;
    const initialSpeed = maxSpeed * (0.2 + Math.random() * 0.1);
    const vx = Math.cos(angle) * initialSpeed;
    const vy = Math.sin(angle) * initialSpeed;

    return {
      id: generateId(),
      type,
      size,
      x,
      y,
      vx,
      vy,
      maxSpeed,
      force,
      isAggressive,
      scale: 1,
      isEaten: false,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() * 0.4 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
      flashActive: false,
      colorType: isAggressive ? 'rose' : (Math.random() > 0.5 ? 'primary' : 'tertiary'),
      depth,
    };
  };

  const triggerExplosion = (shape: ShapeItem, pageX: number, pageY: number) => {
    shockwavesRef.current.push({
      id: `sw_${Date.now()}_${Math.random()}`,
      x: pageX,
      y: pageY,
      size: shape.size * 0.5,
      color: shape.isAggressive ? 'rgba(244, 63, 94, 0.75)' : 'rgba(208, 188, 255, 0.75)',
      opacity: 0.95,
    });

    const count = 14 + Math.floor(Math.random() * 6);
    const particleColors = shape.isAggressive
      ? ['#f43f5e', '#fda4af', '#e11d48']
      : ['#d0bcff', '#efb8c8', '#86e3ce', '#c2aeff'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      particlesRef.current.push({
        id: `particle_${Date.now()}_${Math.random()}`,
        x: pageX,
        y: pageY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 6,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        opacity: 1,
      });
    }
  };

  // Setup initial shapes
  useEffect(() => {
    const initial: ShapeItem[] = [];
    for (let i = 0; i < 26; i++) initial.push(createRandomShape(false));
    for (let i = 0; i < 8; i++) initial.push(createRandomShape(true));
    shapesRef.current = initial;
  }, []);

  // Global mouse tracking in page coordinates
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current.x = e.pageX;
      mousePosRef.current.y = e.pageY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Global click explosion handler
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('button, a, input, textarea, select, [role="button"], code, pre, .clickable')) return;

      const clickX = e.pageX;
      const clickY = e.pageY;
      const winW = winWRef.current;
      const totalH = totalHRef.current;

      const shapes = shapesRef.current;
      for (let i = shapes.length - 1; i >= 0; i--) {
        const s = shapes[i];
        if (s.isEaten) continue;

        const centerX = (s.x / 100) * winW + s.size / 2;
        const centerY = (s.y / 100) * totalH + s.size / 2;
        const radius = (s.size / 2) * s.scale + 20;

        if (Math.hypot(clickX - centerX, clickY - centerY) <= radius) {
          triggerExplosion(s, centerX, centerY);
          s.isEaten = true;
          break;
        }
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // High-performance canvas rendering & physics loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let isVisible = !document.hidden;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        lastTime = performance.now();
        if (!animationFrameId) animationFrameId = requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const updateDimensions = () => {
      const parent = canvas.parentElement;
      const targetW = parent ? parent.offsetWidth : window.innerWidth;
      const targetH = parent ? parent.offsetHeight : Math.max(window.innerHeight, document.documentElement.scrollHeight);

      winWRef.current = targetW;
      totalHRef.current = targetH;

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(targetW * dpr);
      canvas.height = Math.floor(targetH * dpr);
      canvas.style.width = `${targetW}px`;
      canvas.style.height = `${targetH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (canvas.parentElement && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });
      resizeObserver.observe(canvas.parentElement);
    }

    // Color definitions for styles
    const colors = {
      primary: { fill: 'rgba(208, 188, 255, 0.16)', stroke: 'rgba(208, 188, 255, 0.42)' },
      tertiary: { fill: 'rgba(239, 184, 200, 0.16)', stroke: 'rgba(239, 184, 200, 0.42)' },
      rose: { fill: 'rgba(244, 63, 94, 0.32)', stroke: 'rgba(251, 113, 133, 0.45)' },
      white: { fill: 'rgba(255, 255, 255, 0.95)', stroke: '#ffffff' },
    };

    const loop = (now: number) => {
      if (!isVisible) {
        animationFrameId = 0;
        return;
      }

      const dtMs = Math.min(40, now - lastTime);
      lastTime = now;
      const dt = dtMs / 33.333;

      const winW = winWRef.current;
      const totalH = totalHRef.current;

      if (winW <= 0 || totalH <= 0) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      const viewportH = window.innerHeight;

      // Clear viewport area
      const clearTop = Math.max(0, currentScrollY - 100);
      const clearHeight = Math.min(totalH - clearTop, viewportH + 200);
      ctx.clearRect(0, clearTop, winW, clearHeight);

      const isDocs = activeTabRef.current === 'docs';
      ctx.globalAlpha = isDocs ? 0.2 : 1.0;

      // Extract current mouse position in page percentage coordinates
      const mousePageX = mousePosRef.current.x;
      const mousePageY = mousePosRef.current.y;
      const mouseVw = (mousePageX / winW) * 100;
      const mouseVh = (mousePageY / totalH) * 100;

      const shapes = shapesRef.current;
      const activeShapes = shapes.filter(s => !s.isEaten);

      // 1. UPDATE PHYSICS (Independent of scroll)
      for (let idx = 0; idx < activeShapes.length; idx++) {
        const shape = activeShapes[idx];
        if (shape.isEaten) continue;

        // Mouse interaction
        const dxMouse = shape.x - mouseVw;
        const dyMouse = shape.y - mouseVh;
        const distMouse = Math.hypot(dxMouse, dyMouse);
        const mouseRadius = 8;

        if (distMouse > 0 && distMouse < mouseRadius) {
          const forceRatio = ((mouseRadius - distMouse) / mouseRadius) * 0.0015 * dt;
          if (!shape.isAggressive) {
            shape.vx += (dxMouse / distMouse) * forceRatio * 1.5;
            shape.vy += (dyMouse / distMouse) * forceRatio * 1.5;
          } else {
            shape.vx -= (dxMouse / distMouse) * forceRatio * 0.1;
            shape.vy -= (dyMouse / distMouse) * forceRatio * 0.1;
          }
        }

        // Aggressive shape behaviors
        if (shape.isAggressive) {
          // Repel other aggressive shapes
          for (let oIdx = 0; oIdx < activeShapes.length; oIdx++) {
            const other = activeShapes[oIdx];
            if (other.isAggressive && other.id !== shape.id && !other.isEaten) {
              const rdx = shape.x - other.x;
              const rdy = shape.y - other.y;
              const rdist = Math.hypot(rdx, rdy);
              if (rdist > 0 && rdist < 6) {
                const repelForce = (6 - rdist) * 0.003 * dt;
                shape.vx += (rdx / rdist) * repelForce;
                shape.vy += (rdy / rdist) * repelForce;
              }
            }
          }

          // Seek closest neutral shape
          let closest: ShapeItem | null = null;
          let minDist = 35;

          for (let oIdx = 0; oIdx < activeShapes.length; oIdx++) {
            const other = activeShapes[oIdx];
            if (!other.isAggressive && !other.isEaten) {
              const dx = other.x - shape.x;
              const dy = other.y - shape.y;
              const dist = Math.hypot(dx, dy);
              if (dist < minDist) {
                minDist = dist;
                closest = other;
              }
            }
          }

          if (closest) {
            const target: ShapeItem = closest;
            const dx = target.x - shape.x;
            const dy = target.y - shape.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 0) {
              shape.vx += (dx / dist) * shape.force * dt;
              shape.vy += (dy / dist) * shape.force * dt;

              const speed = Math.hypot(shape.vx, shape.vy);
              if (speed > shape.maxSpeed) {
                shape.vx = (shape.vx / speed) * shape.maxSpeed;
                shape.vy = (shape.vy / speed) * shape.maxSpeed;
              }

              if (dist < 2.5 && !target.isEaten) {
                target.isEaten = true;
                shape.scale = 1.35;
                shape.flashActive = true;
                const targetPageX = (target.x / 100) * winW + target.size / 2;
                const targetPageY = (target.y / 100) * totalH + target.size / 2;
                triggerExplosion(target, targetPageX, targetPageY);
              }
            }
          }
        }

        shape.x += shape.vx * dt;
        shape.y += shape.vy * dt;
        shape.rotation += shape.rotSpeed * dt;

        if (shape.scale > 1) shape.scale -= 0.025 * dt;
        else shape.scale = 1;

        if (shape.scale <= 1.05) shape.flashActive = false;

        const buffer = 2;
        if (shape.x < buffer) { shape.x = buffer; shape.vx = Math.abs(shape.vx); }
        else if (shape.x > 100 - buffer) { shape.x = 100 - buffer; shape.vx = -Math.abs(shape.vx); }

        if (shape.y < buffer) { shape.y = buffer; shape.vy = Math.abs(shape.vy); }
        else if (shape.y > 100 - buffer) { shape.y = 100 - buffer; shape.vy = -Math.abs(shape.vy); }
      }

      // Repopulate shapes if eaten
      const neutralCount = activeShapes.filter(s => !s.isAggressive && !s.isEaten).length;
      const aggressiveCount = activeShapes.filter(s => s.isAggressive && !s.isEaten).length;

      if (neutralCount < 22 && Math.random() < 0.05 * dt) activeShapes.push(createRandomShape(false, true));
      if (aggressiveCount < 6 && Math.random() < 0.03 * dt) activeShapes.push(createRandomShape(true, true));
      shapesRef.current = activeShapes;

      // 2. RENDER SHOCKWAVES
      const shockwaves = shockwavesRef.current;
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.size += 4 * dt;
        sw.opacity -= 0.035 * dt;
        if (sw.opacity <= 0) {
          shockwaves.splice(i, 1);
          continue;
        }

        // Viewport culling in absolute page coordinates
        if (sw.y + sw.size < currentScrollY - 60 || sw.y - sw.size > currentScrollY + viewportH + 60) continue;

        ctx.save();
        ctx.globalAlpha = (isDocs ? 0.2 : 1.0) * Math.max(0, sw.opacity);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.size / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. RENDER PARTICLES
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.opacity -= 0.025 * dt;
        if (p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Viewport culling
        if (p.y < currentScrollY - 40 || p.y > currentScrollY + viewportH + 40) continue;

        ctx.save();
        ctx.globalAlpha = (isDocs ? 0.2 : 1.0) * Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. RENDER SHAPES (Sorted by depth)
      const sortedShapes = [...activeShapes].sort((a, b) => {
        const rank = (s: ShapeItem) => s.isAggressive ? 3 : s.depth === 'front' ? 2 : s.depth === 'mid' ? 1 : 0;
        return rank(a) - rank(b);
      });

      for (let i = 0; i < sortedShapes.length; i++) {
        const shape = sortedShapes[i];
        if (shape.isEaten) continue;

        const pageX = (shape.x / 100) * winW;
        const pageY = (shape.y / 100) * totalH;
        const renderSize = shape.size;

        // Viewport culling: only draw shapes on screen or near edges
        if (pageY + renderSize * 2 < currentScrollY - 50 || pageY - renderSize > currentScrollY + viewportH + 50) continue;

        const path = getPath2D(shape.type);
        const colorSet = shape.flashActive ? colors.white : colors[shape.colorType];

        const depthAlpha = shape.depth === 'far' ? 0.45 : shape.depth === 'front' ? 0.95 : 0.8;
        const baseAlpha = isDocs ? 0.2 : depthAlpha;

        ctx.save();
        ctx.globalAlpha = baseAlpha;

        // Aggressive ping ring
        if (shape.isAggressive) {
          const pingPhase = (now * 0.0007) % 1;
          const pingScale = 1 + pingPhase * 0.15;
          const pingAlpha = (1 - pingPhase) * 0.4 * baseAlpha;

          ctx.save();
          ctx.beginPath();
          ctx.arc(pageX + renderSize / 2, pageY + renderSize / 2, (renderSize / 2) * pingScale + 6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(244, 63, 94, ${pingAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }

        // Draw shape with transforms
        ctx.translate(pageX + renderSize / 2, pageY + renderSize / 2);
        ctx.rotate((shape.rotation * Math.PI) / 180);
        const s = (renderSize / 100) * shape.scale;
        ctx.scale(s, s);
        ctx.translate(-50, -50);

        if (shape.depth === 'front' || shape.isAggressive) {
          ctx.shadowColor = shape.isAggressive ? 'rgba(244, 63, 94, 0.4)' : 'rgba(208, 188, 255, 0.25)';
          ctx.shadowBlur = 12;
        }

        ctx.fillStyle = colorSet.fill;
        ctx.fill(path);

        ctx.strokeStyle = colorSet.stroke;
        ctx.lineWidth = shape.isAggressive ? 4 : 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke(path);

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', updateDimensions);
      if (resizeObserver) resizeObserver.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none" id="material-expressive-canvas">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
});

/* =========================================================
 * MAIN MATERIAL BACKGROUND STAGE
 * 100% Native Compositor Synchronization with Page Scroll
 * ========================================================= */
export default function MaterialBackground({ activeTab }: { activeTab: 'landing' | 'docs' }) {
  const [cursorGlow, setCursorGlow] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      setCursorGlow({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, []);

  return (
    <>
      {/* 1. FIXED SCREEN CURSOR LIGHTING GLOW */}
      <div className="fixed inset-0 z-0 select-none overflow-hidden opacity-30 pointer-events-none">
        <div
          className="absolute w-[520px] aspect-square rounded-full bg-m3-primary/20 blur-[130px] transition-transform duration-100 ease-out"
          style={{
            left: `${cursorGlow.x}px`,
            top: `${cursorGlow.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] aspect-square rounded-full bg-m3-primary/15 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[700px] aspect-square rounded-full bg-m3-tertiary/10 blur-[150px]" />
      </div>

      {/* 2. ABSOLUTE SCROLL-SYNCED STAGE (Moves natively with the page on the GPU Compositor) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Hardware-synced ASCII Waves */}
        <AsciiWaveCanvas />

        {/* Hardware-synced Interactive Shapes */}
        <InteractiveShapesCanvas activeTab={activeTab} />
      </div>
    </>
  );
}