/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Database, Shield, Cpu, Activity, Play, Settings } from 'lucide-react';
import { EdlComponent, EntityType } from '../types';
import { EDL_COMPONENTS_POOL } from '../data';
import GameCard from './GameCard';

export default function EdlSandbox() {
  const [selectedComponents, setSelectedComponents] = useState<EdlComponent[]>([
    EDL_COMPONENTS_POOL[0], // TransformData
    EDL_COMPONENTS_POOL[2], // HealthData
  ]);

  const [isRunningSim, setIsRunningSim] = useState(false);

  // Determine entity type based on composition
  const entityType = useMemo((): EntityType | 'Empty' => {
    if (selectedComponents.length === 0) return 'Empty';
    const hasData = selectedComponents.some(c => c.type === 'data');
    const hasLogic = selectedComponents.some(c => c.type === 'logic');

    if (hasData && hasLogic) return 'Composition';
    if (hasData) return 'Config';
    return 'System';
  }, [selectedComponents]);

  // Generate binary bitmask based on selected item indices
  const bitmask = useMemo(() => {
    return EDL_COMPONENTS_POOL.map(poolComponent => {
      const isSelected = selectedComponents.some(sc => sc.id === poolComponent.id);
      return isSelected ? '1' : '0';
    }).join('');
  }, [selectedComponents]);

  // Handle adding components
  const addComponent = (comp: EdlComponent) => {
    if (selectedComponents.some(sc => sc.id === comp.id)) return;
    setSelectedComponents([...selectedComponents, comp]);
  };

  // Handle removing components
  const removeComponent = (id: string) => {
    setSelectedComponents(selectedComponents.filter(c => c.id !== id));
  };

  // Preset loading helpers to let developers play instantly!
  const loadPreset = (type: EntityType | 'Empty') => {
    if (type === 'Empty') {
      setSelectedComponents([]);
      return;
    }
    if (type === 'Config') {
      setSelectedComponents(EDL_COMPONENTS_POOL.filter(c => c.type === 'data').slice(0, 3));
    } else if (type === 'System') {
      setSelectedComponents(EDL_COMPONENTS_POOL.filter(c => c.type === 'logic').slice(0, 3));
    } else {
      setSelectedComponents([
        EDL_COMPONENTS_POOL[0], // TransformData
        EDL_COMPONENTS_POOL[1], // PhysicsData
        EDL_COMPONENTS_POOL[7], // MovementSystem
        EDL_COMPONENTS_POOL[11], // RenderSystem
      ]);
    }
  };

  // Check active presets for visual highlighting
  const isPresetEmptyActive = useMemo(() => selectedComponents.length === 0, [selectedComponents]);
  
  const isPresetConfigActive = useMemo(() => {
    return selectedComponents.length > 0 && selectedComponents.every(c => c.type === 'data');
  }, [selectedComponents]);
  
  const isPresetSystemActive = useMemo(() => {
    return selectedComponents.length > 0 && selectedComponents.every(c => c.type === 'logic');
  }, [selectedComponents]);
  
  const isPresetCompositionActive = useMemo(() => {
    return selectedComponents.length > 0 && 
           selectedComponents.some(c => c.type === 'data') && 
           selectedComponents.some(c => c.type === 'logic');
  }, [selectedComponents]);

  return (
    <section className="py-16 md:py-24 relative bg-transparent">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header Title with MD3 Feel */}
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-m3-primary uppercase tracking-widest bg-m3-primary/10 px-4 py-1.5 rounded-full border-3 border-m3-primary/20">
            Интерактивный демо-стенд
          </span>
          <h2 className="font-display font-bold text-2xl md:text-4xl text-white mt-4 tracking-tight">
            Entity | Data | Logic
          </h2>
          <p className="mt-4 text-sm text-[#cac4d0] max-w-xxl mx-auto">
            В Solas сущности могут хранить только 1 экземпляр компонента из-за особенности поиска. Поиск осуществляется при помощи битовых масок, где каждый бит отвечает за наличие компонента у сущности. тип сущности не объявляется вручную. В будущем редакторе тип сущности будет определяться автоматически, чтобы упростить навигацию и поиск сущностей по типу. Попробуйте кликать по компонентам!
          </p>
        </div>

        {/* Preset selections */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <span className="text-xs text-[#cac4d0] self-center mr-2 font-medium">Готовые пресеты:</span>
          <button 
            id="preset-empty"
            onClick={() => loadPreset('Empty')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border-2 outline-none focus:outline-none focus:ring-0 ${
              isPresetEmptyActive
                ? 'bg-white/20 text-white border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.15)] font-bold'
                : 'bg-white/5 text-[#ede8f5] hover:bg-white/10 border-white/5'
            }`}
          >
            Очистить Сущность
          </button>
          <button 
            id="preset-config"
            onClick={() => loadPreset('Config')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border-2 outline-none focus:outline-none focus:ring-0 ${
              isPresetConfigActive
                ? 'bg-m3-tertiary text-m3-onTertiary border-m3-tertiary shadow-[0_0_12px_rgba(239,184,200,0.3)] font-bold'
                : 'bg-m3-tertiaryContainer/40 text-m3-onTertiaryContainer hover:bg-m3-tertiaryContainer/60 border-m3-tertiary/10'
            }`}
          >
            Config (Только Data)
          </button>
          <button 
            id="preset-system"
            onClick={() => loadPreset('System')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border-2 outline-none focus:outline-none focus:ring-0 ${
              isPresetSystemActive
                ? 'bg-m3-primary text-m3-onPrimary border-m3-primary shadow-[0_0_12px_rgba(208,188,255,0.3)] font-bold'
                : 'bg-m3-primaryContainer/40 text-m3-onPrimaryContainer hover:bg-m3-primaryContainer/60 border-m3-primary/10'
            }`}
          >
            System (Только Logic)
          </button>
          <button 
            id="preset-composition"
            onClick={() => loadPreset('Composition')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border-2 outline-none focus:outline-none focus:ring-0 ${
              isPresetCompositionActive
                ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.3)] font-bold'
                : 'bg-cyan-950/40 text-cyan-200 hover:bg-cyan-900/60 border-cyan-500/20'
            }`}
          >
            Composition (Data + Logic)
          </button>
        </div>

        {/* Sandbox Content Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
          
          {/* LEFT: Available Components Database - col-span-4 */}
          <GameCard id="edl-library-card" accent="primary" className="lg:col-span-4 lg:h-[550px] flex flex-col justify-between overflow-hidden">
            <div>
              <h3 className="font-display font-semibold text-md text-white mb-1 flex items-center gap-2">
                <Database className="w-5 h-5 text-m3-primary" />
                Библиотека Компонентов
              </h3>
              <p className="text-xs text-[#cac4d0] mb-3">
                Нажмите на компонент, чтобы добавить его к текущей сущности.
              </p>

              <div className="space-y-4 h-[430px] overflow-y-auto pl-1.5 pr-2 py-1">
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-m3-tertiary font-semibold block mb-2">
                    — Реактивные структуры (Data)
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {EDL_COMPONENTS_POOL.filter(c => c.type === 'data').map(comp => {
                      const isAdded = selectedComponents.some(sc => sc.id === comp.id);
                      return (
                        <button
                          key={comp.id}
                          id={`add-comp-${comp.id}`}
                          onClick={() => addComponent(comp)}
                          disabled={isAdded}
                          className={`w-full text-left p-2.5 rounded-xl border-2 text-xs flex items-center justify-between transition-all ${
                            isAdded
                              ? 'bg-white/5 border-white/5 text-[#918d96]/80 cursor-not-allowed'
                              : 'bg-m3-tertiaryContainer/10 hover:bg-m3-tertiaryContainer/20 border-m3-tertiary/25 hover:border-m3-tertiary/60 text-m3-onTertiaryContainer hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                          }`}
                        >
                          <div className="flex flex-col pr-2">
                            <span className="font-mono font-medium">{comp.name}</span>
                            <span className="text-[10px] opacity-70 mt-0.5 line-clamp-1">{comp.description}</span>
                          </div>
                          <Plus className={`w-4 h-4 shrink-0 ${isAdded ? 'opacity-30' : 'text-m3-tertiary'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-m3-primary font-semibold block mb-2 mt-4">
                    — Компоненты Логики (Logic)
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {EDL_COMPONENTS_POOL.filter(c => c.type === 'logic').map(comp => {
                      const isAdded = selectedComponents.some(sc => sc.id === comp.id);
                      return (
                        <button
                          key={comp.id}
                          id={`add-comp-${comp.id}`}
                          onClick={() => addComponent(comp)}
                          disabled={isAdded}
                          className={`w-full text-left p-2.5 rounded-xl border-2 text-xs flex items-center justify-between transition-all ${
                            isAdded
                              ? 'bg-white/5 border-white/5 text-[#918d96]/80 cursor-not-allowed'
                              : 'bg-m3-primaryContainer/10 hover:bg-m3-primaryContainer/20 border-m3-primary/25 hover:border-m3-primary/60 text-m3-onPrimaryContainer hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                          }`}
                        >
                          <div className="flex flex-col pr-2">
                            <span className="font-mono font-medium">{comp.name}</span>
                            <span className="text-[10px] opacity-70 mt-0.5 line-clamp-1">{comp.description}</span>
                          </div>
                          <Plus className={`w-4 h-4 shrink-0 ${isAdded ? 'opacity-30' : 'text-m3-primary'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </GameCard>

          {/* MIDDLE: Visualizer Entity Orb - col-span-5 */}
          <GameCard id="edl-visualizer-card" accent="secondary" className="lg:col-span-5 lg:h-[550px] flex flex-col justify-between items-center text-center relative overflow-hidden p-6 py-8">
            
            {/* Component type mode badge */}
            <div className="w-full flex items-center justify-center z-10">
              <span className="text-[10px] font-mono tracking-wider bg-white/5 px-3 py-1.5 rounded-full border-2 border-white/15 text-slate-300 uppercase">
                РЕЖИМ АВТООПРЕДЕЛЕНИЯ (EDL)
              </span>
            </div>

            {/* Glowing Orb Canvas with rich morphing physics - Whole group floats to stay centered */}
            <div className="relative w-48 h-48 flex items-center justify-center z-10 my-auto mx-auto" id="orb-visualizer-container">
              
              {/* Outer orbits revolving */}
              {entityType === 'Composition' && (
                <>
                  <div className="absolute inset-0 border-2 border-emerald-500/10 rounded-full animate-[spin_6s_linear_infinite]" />
                  <div className="absolute inset-2 border-2 border-dashed border-cyan-400/20 rounded-full animate-[spin_4s_linear_infinite_reverse]" />
                  
                  {/* Satellites rotating */}
                  <div className="absolute w-3 h-3 bg-cyan-400 rounded-full top-0 left-1/2 -ml-1.5 shadow-[0_0_8px_cyan] animate-pulse" />
                  <div className="absolute w-2 h-2 bg-emerald-400 rounded-full bottom-0 left-1/2 -ml-1 shadow-[0_0_8px_emerald] animate-pulse" />
                </>
              )}
              {entityType === 'Config' && (
                <div className="absolute inset-2 border-2 border-dashed border-m3-tertiary/20 rounded-full animate-[spin_12s_linear_infinite]" />
              )}
              {entityType === 'System' && (
                <div className="absolute inset-2 border-2 border-m3-primary/10 rounded-full animate-[spin_8s_linear_infinite]" />
              )}

              {/* Central Morphing Core with bouncy physics (Concept 2.2) */}
              <motion.div
                animate={
                  entityType === 'Empty'
                    ? { borderRadius: '50%', scale: 0.8, backgroundColor: 'rgba(255,255,255,0.05)', boxShadow: 'inset 0 0 15px rgba(255,255,255,0.05)' }
                    : entityType === 'Config'
                    ? { borderRadius: '40% 60% 50% 50% / 50% 50% 40% 60%', scale: 1.05, backgroundColor: 'rgba(239, 184, 200, 0.15)', boxShadow: '0 0 35px rgba(239, 184, 200, 0.45), inset 0 0 20px rgba(239, 184, 200, 0.2)' }
                    : entityType === 'System'
                    ? { borderRadius: '60% 40% 60% 40% / 40% 60% 40% 60%', scale: 1.05, backgroundColor: 'rgba(208, 188, 255, 0.15)', boxShadow: '0 0 35px rgba(208, 188, 255, 0.45), inset 0 0 20px rgba(208, 188, 255, 0.2)' }
                    : { borderRadius: '35% 65% 55% 45% / 45% 35% 65% 55%', scale: 1.15, backgroundColor: 'rgba(45, 212, 191, 0.15)', boxShadow: '0 0 45px rgba(45, 212, 191, 0.55), inset 0 0 25px rgba(45, 212, 191, 0.25)' }
                }
                transition={{
                  type: 'spring',
                  stiffness: 160,
                  damping: 8,
                  mass: 0.9
                }}
                className={`w-36 h-36 border-2 backdrop-filter flex flex-col items-center justify-center transition-colors duration-500 ${
                  entityType === 'Empty' 
                    ? 'border-white/15'
                    : entityType === 'Config'
                    ? 'border-m3-tertiary/50'
                    : entityType === 'System'
                    ? 'border-m3-primary/50'
                    : 'border-emerald-400/50'
                }`}
              >
                {/* Dynamic Icon */}
                {entityType === 'Empty' && <Settings className="w-10 h-10 text-neutral-600 animate-spin" />}
                {entityType === 'Config' && <Database className="w-12 h-12 text-m3-tertiary" />}
                {entityType === 'System' && <Cpu className="w-12 h-12 text-m3-primary" />}
                {entityType === 'Composition' && <Activity className="w-12 h-12 text-teal-400" />}

                {/* Subtitle dynamic display */}
                <span className="text-xs font-mono font-bold text-white mt-3 uppercase tracking-wider block">
                  {entityType === 'Empty' ? 'Entity' : entityType}
                </span>
              </motion.div>
            </div>

            {/* Description matching core state */}
            <div className="z-10 w-full min-h-[100px] flex flex-col items-center justify-center text-center mt-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={entityType}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className={`font-display font-bold text-lg ${
                    entityType === 'Config' ? 'text-m3-tertiary' :
                    entityType === 'System' ? 'text-m3-primary' :
                    entityType === 'Composition' ? 'text-teal-400' : 'text-[#cac4d0]'
                  }`}>
                    {entityType === 'Empty' && 'Пустой контейнер Entity'}
                    {entityType === 'Config' && 'Тип определен: CONFIG'}
                    {entityType === 'System' && 'Тип определен: SYSTEM'}
                    {entityType === 'Composition' && 'Тип определен: COMPOSITION'}
                  </h4>
                  <p className="text-xs text-[#cac4d0] mt-1.5 leading-relaxed max-w-sm mx-auto">
                    {entityType === 'Empty' && 'Сущности Solas полностью пусты изначально. Добавьте данные или классы логики из левой библиотеки.'}
                    {entityType === 'Config' && 'Сущность содержит только данные. Имеет тип Config. Используется поведением для конфигов, хранения сохранений и балансов.'}
                    {entityType === 'System' && 'Сущность содержит только логику без данных. Используется как взаимосвязанная система, где логики часто взаимодействуют друг с другом.'}
                    {entityType === 'Composition' && 'Сущность содержит как данные, так и логику. Теперь она определена как игровая Композиция.'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

          </GameCard>

          {/* RIGHT: Current Entity Components & Bitmask - col-span-3 */}
          <GameCard id="edl-composition-card" accent="tertiary" className="lg:col-span-3 lg:h-[550px] flex flex-col justify-between">
            <div>
              <h3 className="font-display font-semibold text-md text-white mb-4 flex items-center justify-between">
                <span>Состав Сущности</span>
                <span className="text-xs font-mono text-m3-primary bg-m3-primary/10 px-2 py-0.5 rounded">
                  {selectedComponents.length} шт
                </span>
              </h3>

              {/* Added Components list */}
              <div className="h-[210px] min-h-[210px] max-h-[210px] overflow-y-auto pl-1 px-1.5 py-1 scrollbox border border-white/5 bg-black/15 rounded-2xl">
                <AnimatePresence initial={false} mode="popLayout">
                  {selectedComponents.length === 0 ? (
                    <motion.div
                      key="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-6 text-xs text-[#cac4d0]/50 border border-dashed border-white/5 rounded-xl h-full flex flex-col items-center justify-center"
                    >
                      Нет компонентов
                    </motion.div>
                  ) : (
                    selectedComponents.map(comp => (
                      <motion.div
                        key={comp.id}
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
                        className="mb-1.5"
                      >
                        <div
                          className={`p-2.5 rounded-xl border-2 flex items-center justify-between text-xs font-mono font-medium ${
                            comp.type === 'data'
                              ? 'bg-m3-tertiaryContainer/25 border-m3-tertiary/35 text-m3-onTertiaryContainer'
                              : 'bg-m3-primaryContainer/25 border-m3-primary/35 text-m3-onPrimaryContainer'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full ${comp.type === 'data' ? 'bg-m3-tertiary' : 'bg-m3-primary'}`} />
                            <span className="truncate">{comp.name}</span>
                          </div>
                          <button
                            id={`remove-comp-${comp.id}`}
                            onClick={() => removeComponent(comp.id)}
                            className="text-[#cac4d0] hover:text-red-400 p-1 rounded-md hover:bg-white/5 transition-all outline-none shrink-0 cursor-pointer"
                            title="Удалить"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Under the hood bitmask technical diagnostics */}
            <div className="mt-6 pt-5 border-t border-white/5 space-y-3.5">
              
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#918d96] block mb-1">
                  — GUID сущности:
                </span>
                <span className="text-[10.5px] font-mono text-white tracking-tight break-all block py-1 px-2.5 bg-black/40 rounded-xl border border-white/5">
                  da647b0a-3d23-45ab-bc10-ef1831c19010
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#918d96] block mb-2">
                  — Битовая Маска Индекса (Bitmask):
                </span>
                <span className="text-sm font-mono text-m3-primary font-bold tracking-widest block text-center py-1.5 px-1 bg-[#15121b] rounded-xl border border-m3-primary/25 shadow-inner">
                  {bitmask.slice(0, 4)} {bitmask.slice(4, 8)} {bitmask.slice(8, 12)}
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-[#cac4d0]/70">
                <span>Memory Overhead:</span>
                <span className="text-emerald-400 font-bold">0 bytes (Flat data)</span>
              </div>

            </div>

          </GameCard>

        </div>

      </div>
    </section>
  );
}
