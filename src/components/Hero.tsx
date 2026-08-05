/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, BookOpen, Cpu, Shield, RefreshCw, Activity, Terminal, Sparkles, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import GameCard from './GameCard';
import GameButton from './GameButton';

interface HeroProps {
  onDocsClick: () => void;
  onDownloadClick: () => void;
  engineVersion: string;
}

export default function Hero({ onDocsClick, onDownloadClick, engineVersion }: HeroProps) {
  const [activePipelineStage, setActivePipelineStage] = useState<'entity' | 'data' | 'logic' | 'gen'>('data');

  return (
    <section className="relative overflow-hidden pt-8 pb-20 md:pt-16 md:pb-28 flex flex-col items-center text-center px-4">
      {/* Background radial ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] md:w-[750px] h-[380px] md:h-[750px] bg-m3-primary/10 rounded-full blur-[110px] -z-10 pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[220px] md:w-[450px] h-[220px] md:h-[450px] bg-m3-tertiary/10 rounded-full blur-[130px] -z-10 pointer-events-none" />

      {/* Main Display Title */}
      <motion.h1
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="font-display font-extrabold text-3xl sm:text-4xl md:text-6xl leading-tight md:leading-tight text-white tracking-tight max-w-4xl"
      >
        Создавайте геймплей, а <span className="text-m3-primary drop-shadow-[0_0_28px_rgba(208,188,255,0.4)]">не боритесь</span> с архитектурным кодом
      </motion.h1>

      {/* Subtitles */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 text-sm sm:text-base md:text-lg text-[#cac4d0] max-w-2xl leading-relaxed"
      >
        <span className="font-semibold text-white">Solas Engine</span> — легковесный C# движок для инди-разработчиков. Используя простую Data-Oriented архитектуру Entity-Data-Logic (EDL) и Source Generators, он разгружает процессор и избавляет от лишнего бойлерплейта.
      </motion.p>

      {/* Expressive Action Call buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center"
      >
        <GameButton
          id="hero-download-btn-xl"
          onClick={onDownloadClick}
          variant="primary"
          className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base"
        >
          <Download className="w-5 h-5" />
          Установить SDK v{engineVersion}
        </GameButton>

        <GameButton
          id="hero-docs-btn-xl"
          onClick={onDocsClick}
          variant="outline"
          className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base"
        >
          <BookOpen className="w-5 h-5 text-m3-primary" />
          Документация
        </GameButton>
      </motion.div>

      {/* Solve core problems Section Cards - Material 3 Expressive Bento Layout */}
      <div className="mt-16 w-full max-w-6xl text-left grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Featured DX Card (Spans 2 columns on desktop) */}
        <GameCard
          id="hero-core-card-1"
          accent="primary"
          className="md:col-span-2 flex flex-col justify-between p-8"
        >
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="w-14 h-14 bg-m3-primaryContainer/60 rounded-2xl flex items-center justify-center text-m3-primary shadow-xl shadow-m3-primary/10 border border-m3-primary/20">
                  <Cpu className="w-7 h-7" />
                </div>
              </div>

              <h3 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3">
                Удобство разработки (DX)
              </h3>
              <p className="text-sm text-[#cac4d0] leading-relaxed max-w-2xl">
                Реактивные структуры и классы данных, автоматическое внедрение зависимостей, встроенная многопоточность и эффективное получение объектов по компонентам – всё, чтобы разработчикам было максимально комфортно создавать геймплей.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center gap-3 text-xs font-mono text-[#cac4d0]">
              <span className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Source Generators
              </span>
              <span className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-m3-primary">
                Auto-DI Container
              </span>
              <span className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-m3-tertiary">
                Parallel Execution
              </span>
            </div>
          </div>
        </GameCard>

        {/* Card 2: Easy Git Merges */}
        <GameCard
          id="hero-core-card-2"
          accent="tertiary"
          className="md:col-span-1 flex flex-col justify-between p-6"
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="w-12 h-12 bg-m3-tertiaryContainer/50 rounded-2xl flex items-center justify-center text-m3-tertiary mb-5 shadow-lg shadow-black/20">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">
                Простые слияния в Git
              </h3>
              <p className="text-xs text-[#cac4d0] leading-relaxed">
                Вместо огромных и нечитаемых сцен в формате YAML, Solas хранит данные в максимально компактном виде, сохраняя то, что вам нужно. Вы можете выбрать заготовленные сериализаторы или даже написать свой!
              </p>
            </div>
            <div className="mt-6 flex">
              <span className="text-[10px] font-mono text-m3-tertiary font-bold bg-m3-tertiaryContainer/30 border border-m3-tertiary/20 px-2.5 py-1 rounded-lg">
                EASY SCENE MERGING
              </span>
            </div>
          </div>
        </GameCard>

        {/* Card 3: Data-Oriented Architecture */}
        <GameCard
          id="hero-core-card-3"
          accent="secondary"
          className="md:col-span-3 flex flex-col md:flex-row items-center justify-between gap-6 p-8"
        >
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 bg-m3-secondaryContainer/50 rounded-2xl flex items-center justify-center text-m3-secondary shrink-0 shadow-lg shadow-black/20">
              <RefreshCw className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-display font-bold text-xl md:text-2xl text-white">
                  Разделение данных и логики
                </h3>
              </div>
              <p className="text-xs md:text-sm text-[#cac4d0] leading-relaxed max-w-3xl">
                Solas использует современный Data-Oriented подход, разделяя данные и логику. Данные могут быть представлены в виде лёгких структур или ссылаемых классов. Логика наследуется от абстрактного класса, а сущность является контейнером.
              </p>
            </div>
          </div>
        </GameCard>

      </div>
    </section>
  );
}
