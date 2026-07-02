/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ShapeItem {
  id: string;
  type: 'arch' | 'semicircle' | 'slanted' | 'triangle' | 'diamond' | 'flower' | 'cookie' | 'clover' | 'bun' | 'pill' | 'heart';
  size: number;
  x: number; // percentage of viewport width (vw)
  y: number; // percentage of viewport height (vh)
  vx: number;
  vy: number;
  isAggressive: boolean;
  scale: number;
  isEaten: boolean;
  rotation: number;
  rotSpeed: number;
  flashActive: boolean;
  colorClass: string;
  borderColorClass: string;
}

interface ExplosionParticle {
  id: string;
  x: number; // vw
  y: number; // vh
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
}

export default function MaterialBackground({ activeTab }: { activeTab: 'landing' | 'docs' }) {
  const [shapes, setShapes] = useState<ShapeItem[]>([]);
  const [particles, setParticles] = useState<ExplosionParticle[]>([]);

  // Unique ID generator
  const nextIdRef = useRef(0);
  const generateId = () => `shape_${nextIdRef.current++}_${Date.now()}`;

  // Authentic Material Design 3 shape list
  const shapeTypes: ShapeItem['type'][] = [
    'arch', 'semicircle', 'slanted', 'triangle', 'diamond', 
    'flower', 'cookie', 'clover', 'bun', 'pill', 'heart'
  ];

  // Helper to construct a new randomized shape
  const createRandomShape = (isAggressive = false, borderSpawn = false): ShapeItem => {
    const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    const size = isAggressive ? 55 + Math.random() * 20 : 45 + Math.random() * 25;
    
    // Position: either completely random or spawned at the edges over a 450vh scrollable height
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
    const speed = isAggressive ? 0.04 + Math.random() * 0.04 : 0.02 + Math.random() * 0.03;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    return {
      id: generateId(),
      type,
      size,
      x,
      y,
      vx,
      vy,
      isAggressive,
      scale: 1,
      isEaten: false,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() * 0.4 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
      flashActive: false,
      colorClass: isAggressive ? 'text-rose-500/35' : (Math.random() > 0.5 ? 'text-m3-primary/12' : 'text-m3-tertiary/12'),
      borderColorClass: isAggressive ? 'text-rose-500' : (Math.random() > 0.5 ? 'text-m3-primary/30' : 'text-m3-tertiary/30'),
    };
  };

  // Initialize shapes on load
  useEffect(() => {
    const initial: ShapeItem[] = [];
    // Spawn 22 neutral shapes to cover the long page scroll
    for (let i = 0; i < 22; i++) {
      initial.push(createRandomShape(false));
    }
    // Spawn 6 aggressive red shapes
    for (let i = 0; i < 6; i++) {
      initial.push(createRandomShape(true));
    }
    setShapes(initial);
  }, []);

  // Main game loop (runs at ~30 FPS using setInterval for lightweight CPU footprint)
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Update existing shapes
      setShapes(prevShapes => {
        // Prepare copy
        const current = prevShapes.map(s => ({ ...s }));

        // Filter out completely eaten or destroyed shapes
        const active = current.filter(s => !s.isEaten);

        // Update positions & physics
        active.forEach(shape => {
          if (shape.isEaten) return;

          // Aggressive shapes behavior: Hunt closest neutral shape!
          if (shape.isAggressive) {
            // Find closest non-eaten neutral shape
            let closest: ShapeItem | null = null;
            let minDist = Infinity;

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
              // Direction vector
              const dx = target.x - shape.x;
              const dy = target.y - shape.y;
              const dist = Math.hypot(dx, dy);

              if (dist > 0) {
                // Apply small steering acceleration towards prey
                const force = 0.0025;
                shape.vx += (dx / dist) * force;
                shape.vy += (dy / dist) * force;

                // Speed limit for aggressive shapes
                const speed = Math.hypot(shape.vx, shape.vy);
                const maxSpeed = 0.08;
                if (speed > maxSpeed) {
                  shape.vx = (shape.vx / speed) * maxSpeed;
                  shape.vy = (shape.vy / speed) * maxSpeed;
                }

                // Check collision (EAT PREY!)
                const eatRange = 4.0; // trigger range in vw/vh
                if (dist < eatRange && !target.isEaten) {
                  target.isEaten = true;
                  shape.scale = 1.35; // puff up upon eating
                  shape.flashActive = true;
                }
              }
            } else {
              // No prey found: slowly drag back to slow random drifting velocities
              const speed = Math.hypot(shape.vx, shape.vy);
              const driftSpeed = 0.03;
              if (speed > 0) {
                shape.vx = (shape.vx / speed) * driftSpeed;
                shape.vy = (shape.vy / speed) * driftSpeed;
              }
            }
          }

          // Move
          shape.x += shape.vx;
          shape.y += shape.vy;
          shape.rotation += shape.rotSpeed;

          // Scale transition back to normal if puffed up
          if (shape.scale > 1) {
            shape.scale -= 0.025;
          } else {
            shape.scale = 1;
          }

          // Turn off feeding flash
          if (shape.scale <= 1.05) {
            shape.flashActive = false;
          }

          // Bounce off boundary walls (viewport limits up to 450vh)
          const buffer = 2; // buffer percentage
          if (shape.x < buffer) {
            shape.x = buffer;
            shape.vx = Math.abs(shape.vx);
          } else if (shape.x > 100 - buffer) {
            shape.x = 100 - buffer;
            shape.vx = -Math.abs(shape.vx);
          }

          if (shape.y < buffer) {
            shape.y = buffer;
            shape.vy = Math.abs(shape.vy);
          } else if (shape.y > 450 - buffer) {
            shape.y = 450 - buffer;
            shape.vy = -Math.abs(shape.vy);
          }
        });

        // Maintain the ecosystem balance:
        const neutralCount = active.filter(s => !s.isAggressive && !s.isEaten).length;
        const aggressiveCount = active.filter(s => s.isAggressive && !s.isEaten).length;

        // Spawn a new neutral shape if count drops below 18
        if (neutralCount < 18 && Math.random() < 0.05) {
          active.push(createRandomShape(false, true));
        }

        // Spawn a new aggressive red shape if count drops below 4
        if (aggressiveCount < 4 && Math.random() < 0.02) {
          active.push(createRandomShape(true, true));
        }

        return active;
      });

      // 2. Update click explosion particles
      setParticles(prevParticles => {
        return prevParticles
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            opacity: p.opacity - 0.025,
          }))
          .filter(p => p.opacity > 0);
      });

    }, 33); // ~30 FPS

    return () => clearInterval(interval);
  }, []);

  // Handle popping click of an aggressive red shape
  const handleRedPop = (e: React.MouseEvent, clickedShape: ShapeItem) => {
    e.stopPropagation();
    e.preventDefault();

    // Trigger visual pop: mark as eaten so it vanishes instantly
    setShapes(prev => prev.map(s => s.id === clickedShape.id ? { ...s, isEaten: true } : s));

    // Spawn 12 colorful red/rose explosion particles
    const newParticles: ExplosionParticle[] = [];
    const count = 12 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.15 + Math.random() * 0.25;
      newParticles.push({
        id: `particle_${Date.now()}_${Math.random()}`,
        x: clickedShape.x + (clickedShape.size / 2 / window.innerWidth) * 100,
        y: clickedShape.y + (clickedShape.size / 2 / window.innerHeight) * 100,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 6,
        color: Math.random() > 0.4 ? '#f43f5e' : '#fda4af', // rose-500 or rose-300
        opacity: 1,
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
  };

  // SVG Drawing path library
  const getShapePath = (type: ShapeItem['type']) => {
    switch (type) {
      case 'arch':
        return 'M 20 80 V 50 A 30 30 0 0 1 80 50 V 80 Z';
      case 'semicircle':
        return 'M 15 70 A 35 35 0 0 1 85 70 Z';
      case 'slanted':
        return 'M 35 22 C 40 22, 78 22, 81 22 C 85 22, 87 25, 85 29 L 71 73 C 69 77, 66 79, 61 79 H 22 C 16 79, 13 75, 15 70 L 27 29 C 29 25, 31 22, 35 22 Z';
      case 'triangle':
        return 'M 50 18 C 55 18, 59 21, 84 66 C 87 71, 84 78, 78 78 H 22 C 16 78, 13 71, 16 66 L 44 21 C 45 18, 47 18, 50 18 Z';
      case 'diamond':
        return 'M 50 15 Q 53 15 56 18 L 81 44 Q 84 47 81 50 L 56 75 Q 53 78 50 78 Q 47 78 44 75 L 19 50 Q 16 47 19 44 L 44 18 Q 47 15 50 15 Z';
      case 'flower':
        return 'M 50 15 C 57 15 62 25 65 28 C 72 25 80 30 77 37 C 84 40 84 49 77 52 C 80 59 72 64 65 61 C 62 64 57 74 50 74 C 43 74 38 64 35 61 C 28 64 20 59 23 52 C 16 49 16 40 23 37 C 20 30 28 25 35 28 C 38 25 43 15 50 15 Z';
      case 'cookie':
        return 'M 50 15 C 62 25, 75 25, 85 50 C 75 75, 62 75, 50 85 C 38 75, 25 75, 15 50 C 25 25, 38 25, 50 15 Z';
      case 'clover':
        return 'M 50 50 C 35 25, 65 25, 50 50 C 75 35, 75 65, 50 50 C 65 75, 35 75, 50 50 C 25 65, 25 35, 50 50 Z';
      case 'bun':
        return 'M 25 50 C 25 35, 45 30, 50 42 C 55 30, 75 35, 75 50 C 75 65, 55 70, 50 58 C 45 70, 25 65, 25 50 Z';
      case 'pill':
        return 'M 30 30 H 70 C 80 30, 80 70, 70 70 H 30 C 20 70, 20 30, 30 30 Z';
      case 'heart':
        return 'M 50 30 C 50 15, 20 12, 20 40 C 20 62, 45 78, 50 82 C 55 78, 80 62, 80 40 C 80 12, 50 15, 50 30 Z';
      default:
        return 'M 50 15 A 35 35 0 1 1 50 85 A 35 35 0 1 1 50 15 Z';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden" id="material-expressive-canvas">
      
      {/* 
        PREMIUM DYNAMICALLY SPINNING GRADIENT CLOUD SYSTEM
        Floating beautiful decorative ambient glows
      */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] aspect-square rounded-full bg-m3-primary/20 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[700px] aspect-square rounded-full bg-m3-tertiary/15 blur-[140px]" />
        <div className="absolute top-[40%] right-[15%] w-[500px] aspect-square rounded-full bg-m3-secondary/10 blur-[120px]" />
      </div>

      {/* 
        LIVING SHAPE STAGE
      */}
      <div className="absolute inset-0 z-10 w-full h-full select-none">
        {shapes.map((shape) => {
          const pathD = getShapePath(shape.type);
          const isDocs = activeTab === 'docs';
          
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
                transition: 'transform 0.1s ease-out, opacity 0.5s',
                pointerEvents: shape.isAggressive ? 'auto' : 'none',
                zIndex: isDocs && shape.isAggressive ? -1 : 10,
                opacity: isDocs && shape.isAggressive ? 0.3 : (isDocs ? 0.5 : 1),
              }}
              className="flex items-center justify-center drop-shadow-lg"
            >
              {/* Aggressive glowing pulse ring */}
              {shape.isAggressive && (
                <div className="absolute inset-[-8px] rounded-full border border-rose-500/30 animate-ping pointer-events-none" />
              )}

              {/* Vector representation */}
              <svg 
                viewBox="0 0 100 100" 
                onClick={(e) => shape.isAggressive ? handleRedPop(e, shape) : null}
                className={`w-full h-full cursor-pointer transition-colors duration-500 select-none ${
                  shape.flashActive ? 'text-white' : shape.colorClass
                }`}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d={pathD} fill="currentColor" />
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={shape.isAggressive ? '3.5' : '2.5'} 
                  className={shape.borderColorClass}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          );
        })}

        {/* Render Explosion Particles */}
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
  );
}
