/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';

interface ShapeItem {
  id: string;
  type: 'arch' | 'semicircle' | 'slanted' | 'triangle' | 'diamond' | 'flower' | 'cookie' | 'clover' | 'bun' | 'pill' | 'heart';
  size: number;
  x: number; // % width (vw)
  y: number; // % height (vh)
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
  colorClass: string;
  borderColorClass: string;
  depth: 'far' | 'mid' | 'front';
}

interface ExplosionParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
}

interface Shockwave {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
}

export default function MaterialBackground({ activeTab }: { activeTab: 'landing' | 'docs' }) {
  const [shapes, setShapes] = useState<ShapeItem[]>([]);
  const [particles, setParticles] = useState<ExplosionParticle[]>([]);
  const [shockwaves, setShockwaves] = useState<Shockwave[]>([]);

  // Позиция мыши на странице (для физики фигур) и на экране (для свечения)
  const mousePosRef = useRef({ vw: -100, vh: -100 });
  const [cursorGlow, setCursorGlow] = useState({ x: 50, y: 50 });

  const nextIdRef = useRef(0);
  const generateId = () => `shape_${nextIdRef.current++}_${Date.now()}`;

  const shapeTypes: ShapeItem['type'][] = [
    'arch', 'semicircle', 'slanted', 'triangle', 'diamond', 
    'flower', 'cookie', 'clover', 'bun', 'pill', 'heart'
  ];

  // Создание фигуры
  const createRandomShape = (isAggressive = false, borderSpawn = false): ShapeItem => {
    const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    const depthRoll = Math.random();
    const depth: ShapeItem['depth'] = isAggressive ? 'front' : (depthRoll < 0.25 ? 'far' : depthRoll > 0.75 ? 'front' : 'mid');
    
    const baseSize = isAggressive ? 45 + Math.random() * 15 : 40 + Math.random() * 10;
    const size = depth === 'far' ? baseSize * 0.7 : depth === 'front' ? baseSize * 1.25 : baseSize;

    let x = Math.random() * 80 + 10;
    let y = Math.random() * 420 + 15;
    if (borderSpawn) {
      if (Math.random() > 0.5) {
        x = Math.random() > 0.5 ? -5 : 105;
        y = Math.random() * 450;
      } else {
        x = Math.random() * 100;
        y = Math.random() > 0.5 ? -15 : 465;
      }
    }

    const angle = Math.random() * Math.PI * 2;
    const speedMult = depth === 'far' ? 0.6 : depth === 'front' ? 1.3 : 1.0;
    const maxSpeed = (isAggressive ? 0.05 + Math.random() * 0.06 : 0.018 + Math.random() * 0.035) * speedMult;
    const force = (isAggressive ? 0.0015 + Math.random() * 0.0025 : 0.0008 + Math.random() * 0.0015) * speedMult;
    const initialSpeed = maxSpeed * (0.6 + Math.random() * 0.4);
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
      colorClass: isAggressive ? 'text-rose-500/45' : (Math.random() > 0.5 ? 'text-m3-primary/15' : 'text-m3-tertiary/15'),
      borderColorClass: isAggressive ? 'text-rose-400' : (Math.random() > 0.5 ? 'text-m3-primary/40' : 'text-m3-tertiary/40'),
      depth,
    };
  };

  // Частицы и взрывная волна
  const triggerExplosion = (shape: ShapeItem) => {
    const shapeCenterX = shape.x + (shape.size / 2 / window.innerWidth) * 100;
    const shapeCenterY = shape.y + (shape.size / 2 / window.innerHeight) * 100;

    setShockwaves(prev => [
      ...prev,
      {
        id: `sw_${Date.now()}_${Math.random()}`,
        x: shapeCenterX,
        y: shapeCenterY,
        size: shape.size * 0.4,
        color: shape.isAggressive ? 'rgba(244, 63, 94, 0.7)' : 'rgba(208, 188, 255, 0.7)',
        opacity: 0.9,
      }
    ]);

    const newParticles: ExplosionParticle[] = [];
    const count = 12 + Math.floor(Math.random() * 6);
    const particleColors = shape.isAggressive
      ? ['#f43f5e', '#fda4af', '#e11d48']
      : ['#d0bcff', '#efb8c8', '#86e3ce', '#c2aeff'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.15 + Math.random() * 0.25;
      newParticles.push({
        id: `particle_${Date.now()}_${Math.random()}`,
        x: shapeCenterX,
        y: shapeCenterY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 6,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        opacity: 1,
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
  };

  // Отслеживание курсора
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const vw = (e.clientX / window.innerWidth) * 100;
      const vh = ((e.clientY + window.scrollY) / window.innerHeight) * 100;
      mousePosRef.current = { vw, vh };

      // Свечение привязано СТРОГО к экрану (0-100% viewport)
      setCursorGlow({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Инициализация
  useEffect(() => {
    const initial: ShapeItem[] = [];
    for (let i = 0; i < 24; i++) initial.push(createRandomShape(false));
    for (let i = 0; i < 8; i++) initial.push(createRandomShape(true)); // 8 красных фигур
    setShapes(initial);
  }, []);

  // Глобальный клик
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('button, a, input, textarea, select, [role="button"]')) return;

      const clickX = e.clientX;
      const clickY = e.clientY + window.scrollY;
      const winW = window.innerWidth;
      const winH = window.innerHeight;

      setShapes(prevShapes => {
        let hitShape: ShapeItem | null = null;

        for (let i = prevShapes.length - 1; i >= 0; i--) {
          const s = prevShapes[i];
          if (s.isEaten) continue;

          const centerX = (s.x / 100) * winW + s.size / 2;
          const centerY = (s.y / 100) * winH + s.size / 2;
          const radius = (s.size / 2) * s.scale + 16;

          if (Math.hypot(clickX - centerX, clickY - centerY) <= radius) {
            hitShape = s;
            break;
          }
        }

        if (hitShape) {
          triggerExplosion(hitShape);
          return prevShapes.map(s => s.id === hitShape!.id ? { ...s, isEaten: true } : s);
        }

        return prevShapes;
      });
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Физический цикл
  useEffect(() => {
    const interval = setInterval(() => {
      const mouse = mousePosRef.current;

      setShapes(prevShapes => {
        const current = prevShapes.map(s => ({ ...s }));
        const active = current.filter(s => !s.isEaten);

        active.forEach(shape => {
          if (shape.isEaten) return;

          // 1. Физика силового поля мыши
          const dxMouse = shape.x - mouse.vw;
          const dyMouse = shape.y - mouse.vh;
          const distMouse = Math.hypot(dxMouse, dyMouse);
          const mouseRadius = 14;

          if (distMouse > 0 && distMouse < mouseRadius) {
            const forceRatio = ((mouseRadius - distMouse) / mouseRadius) * 0.007;
            if (!shape.isAggressive) {
              shape.vx += (dxMouse / distMouse) * forceRatio;
              shape.vy += (dyMouse / distMouse) * forceRatio;
            } else {
              shape.vx -= (dxMouse / distMouse) * forceRatio * 0.8;
              shape.vy -= (dyMouse / distMouse) * forceRatio * 0.8;
            }
          }

          // 2. Взаимодействие фигур (Охота с ограничением радиуса)
          if (shape.isAggressive) {
            // Разделение красных фигур
            active.forEach(other => {
              if (other.isAggressive && other.id !== shape.id && !other.isEaten) {
                const rdx = shape.x - other.x;
                const rdy = shape.y - other.y;
                const rdist = Math.hypot(rdx, rdy);
                if (rdist > 0 && rdist < 10) {
                  const repelForce = (10 - rdist) * 0.003;
                  shape.vx += (rdx / rdist) * repelForce;
                  shape.vy += (rdy / rdist) * repelForce;
                }
              }
            });

            // Поиск близких нейтральных целей (не дальше 100vh)
            let closest: ShapeItem | null = null;
            let minDist = 100; // Ограничение радиуса поиска

            active.forEach(other => {
              if (!other.isAggressive && !other.isEaten) {
                const dx = other.x - shape.x;
                const dy = other.y - shape.y;
                const dist = Math.hypot(dx, dy);
                if (dist < minDist) {
                  minDist = dist;
                  closest = other;
                }
              }
            });

            if (closest) {
              const target: ShapeItem = closest;
              const dx = target.x - shape.x;
              const dy = target.y - shape.y;
              const dist = Math.hypot(dx, dy);

              if (dist > 0) {
                shape.vx += (dx / dist) * shape.force;
                shape.vy += (dy / dist) * shape.force;

                const speed = Math.hypot(shape.vx, shape.vy);
                if (speed > shape.maxSpeed) {
                  shape.vx = (shape.vx / speed) * shape.maxSpeed;
                  shape.vy = (shape.vy / speed) * shape.maxSpeed;
                }

                if (dist < 4.0 && !target.isEaten) {
                  target.isEaten = true;
                  shape.scale = 1.35;
                  shape.flashActive = true;
                }
              }
            }
          }

          shape.x += shape.vx;
          shape.y += shape.vy;
          shape.rotation += shape.rotSpeed;

          if (shape.scale > 1) shape.scale -= 0.025;
          else shape.scale = 1;

          if (shape.scale <= 1.05) shape.flashActive = false;

          const buffer = 2;
          if (shape.x < buffer) { shape.x = buffer; shape.vx = Math.abs(shape.vx); }
          else if (shape.x > 100 - buffer) { shape.x = 100 - buffer; shape.vx = -Math.abs(shape.vx); }

          if (shape.y < buffer) { shape.y = buffer; shape.vy = Math.abs(shape.vy); }
          else if (shape.y > 450 - buffer) { shape.y = 450 - buffer; shape.vy = -Math.abs(shape.vy); }
        });

        const neutralCount = active.filter(s => !s.isAggressive && !s.isEaten).length;
        const aggressiveCount = active.filter(s => s.isAggressive && !s.isEaten).length;

        if (neutralCount < 20 && Math.random() < 0.05) active.push(createRandomShape(false, true));
        if (aggressiveCount < 6 && Math.random() < 0.03) active.push(createRandomShape(true, true));

        return active;
      });

      setParticles(prev =>
        prev
          .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, opacity: p.opacity - 0.025 }))
          .filter(p => p.opacity > 0)
      );

      setShockwaves(prev =>
        prev
          .map(sw => ({ ...sw, size: sw.size + 3.5, opacity: sw.opacity - 0.03 }))
          .filter(sw => sw.opacity > 0)
      );

    }, 33);

    return () => clearInterval(interval);
  }, []);

  const getShapePath = (type: ShapeItem['type']) => {
    switch (type) {
      case 'arch': return 'M 20 80 V 50 A 30 30 0 0 1 80 50 V 80 Z';
      case 'semicircle': return 'M 15 70 A 35 35 0 0 1 85 70 Z';
      case 'slanted': return 'M 35 22 C 40 22, 78 22, 81 22 C 85 22, 87 25, 85 29 L 71 73 C 69 77, 66 79, 61 79 H 22 C 16 79, 13 75, 15 70 L 27 29 C 29 25, 31 22, 35 22 Z';
      case 'triangle': return 'M 50 18 C 55 18, 59 21, 84 66 C 87 71, 84 78, 78 78 H 22 C 16 78, 13 71, 16 66 L 44 21 C 45 18, 47 18, 50 18 Z';
      case 'diamond': return 'M 50 15 Q 53 15 56 18 L 81 44 Q 84 47 81 50 L 56 75 Q 53 78 50 78 Q 47 78 44 75 L 19 50 Q 16 47 19 44 L 44 18 Q 47 15 50 15 Z';
      case 'flower': return 'M 50 15 C 57 15 62 25 65 28 C 72 25 80 30 77 37 C 84 40 84 49 77 52 C 80 59 72 64 65 61 C 62 64 57 74 50 74 C 43 74 38 64 35 61 C 28 64 20 59 23 52 C 16 49 16 40 23 37 C 20 30 28 25 35 28 C 38 25 43 15 50 15 Z';
      case 'cookie': return 'M 50 15 C 62 25, 75 25, 85 50 C 75 75, 62 75, 50 85 C 38 75, 25 75, 15 50 C 25 25, 38 25, 50 15 Z';
      case 'clover': return 'M 50 50 C 35 25, 65 25, 50 50 C 75 35, 75 65, 50 50 C 65 75, 35 75, 50 50 C 25 65, 25 35, 50 50 Z';
      case 'bun': return 'M 25 50 C 25 35, 45 30, 50 42 C 55 30, 75 35, 75 50 C 75 65, 55 70, 50 58 C 45 70, 25 65, 25 50 Z';
      case 'pill': return 'M 30 30 H 70 C 80 30, 80 70, 70 70 H 30 C 20 70, 20 30, 30 30 Z';
      case 'heart': return 'M 50 30 C 50 15, 20 12, 20 40 C 20 62, 45 78, 50 82 C 55 78, 80 62, 80 40 C 80 12, 50 15, 50 30 Z';
      default: return 'M 50 15 A 35 35 0 1 1 50 85 A 35 35 0 1 1 50 15 Z';
    }
  };

  return (
    <>
      {/* 1. ФИКСИРОВАННЫЙ ЭКРАННЫЙ СЛОЙ СВЕЧЕНИЯ (Преследует мышь ровно 1 к 1) */}
      <div className="fixed inset-0 z-0 select-none overflow-hidden opacity-35 pointer-events-none">
        <div
          className="absolute w-[550px] aspect-square rounded-full bg-m3-primary/25 blur-[120px] transition-all duration-300 ease-out"
          style={{
            left: `${cursorGlow.x}%`,
            top: `${cursorGlow.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] aspect-square rounded-full bg-m3-primary/15 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[700px] aspect-square rounded-full bg-m3-tertiary/10 blur-[140px]" />
      </div>

      {/* 2. СЛОЙ ФИГУР (По всей длине 450vh) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" id="material-expressive-canvas">
        <div className="absolute inset-0 z-0 w-full h-full select-none">
          {shapes.map((shape) => {
            const pathD = getShapePath(shape.type);
            const isDocs = activeTab === 'docs';

            const depthStyles = {
              far: 'blur-[2px] opacity-40 scale-90',
              mid: 'blur-none opacity-80 scale-100',
              front: 'blur-none opacity-95 scale-110 drop-shadow-xl',
            }[shape.depth];

            return (
              <div
                key={shape.id}
                style={{
                  left: `${shape.x}vw`,
                  top: `${shape.y}vh`,
                  width: `${shape.size}px`,
                  height: `${shape.size}px`,
                  position: 'absolute',
                  transform: `scale(${shape.scale}) rotate(${shape.rotation}deg)`,
                  transition: 'transform 0.15s ease-out, opacity 0.5s',
                  pointerEvents: 'none',
                  zIndex: shape.isAggressive ? 3 : shape.depth === 'front' ? 2 : shape.depth === 'mid' ? 1 : 0,
                  opacity: isDocs ? 0.2 : undefined,
                }}
                className={`flex items-center justify-center select-none group ${depthStyles}`}
              >
                {shape.isAggressive && (
                  <div className="absolute inset-[-8px] rounded-full border border-rose-500/50 animate-ping pointer-events-none" />
                )}

                <svg
                  viewBox="0 0 100 100"
                  className={`w-full h-full transition-transform duration-200 select-none ${
                    shape.flashActive ? 'text-white' : shape.colorClass
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d={pathD} fill="currentColor" />
                  <path
                    d={pathD}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={shape.isAggressive ? '3' : '2.5'}
                    className={shape.borderColorClass}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            );
          })}

          {/* Ударные волны */}
          {shockwaves.map(sw => (
            <div
              key={sw.id}
              style={{
                left: `${sw.x}vw`,
                top: `${sw.y}vh`,
                width: `${sw.size}px`,
                height: `${sw.size}px`,
                borderColor: sw.color,
                opacity: sw.opacity,
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                borderWidth: '2px',
                borderStyle: 'solid',
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Частицы */}
          {particles.map(p => (
            <div
              key={p.id}
              style={{
                left: `${p.x}vw`,
                top: `${p.y}vh`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
                backgroundColor: p.color,
                position: 'absolute',
                borderRadius: '50%',
                boxShadow: `0 0 10px ${p.color}`,
                pointerEvents: 'none',
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}