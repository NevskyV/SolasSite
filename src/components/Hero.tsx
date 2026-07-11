/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Download, BookOpen, Cpu, Shield, RefreshCw, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import GameCard from './GameCard';
import GameButton from './GameButton';

interface HeroProps {
  onDocsClick: () => void;
  onDownloadClick: () => void;
  engineVersion: string;
}

export default function Hero({ onDocsClick, onDownloadClick, engineVersion }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 flex flex-col items-center text-center px-4">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[700px] h-[350px] md:h-[700px] bg-m3-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-m3-tertiary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Floating Engine Icon Badge */}
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, type: 'spring' }}
        className="font-display font-extrabold text-3xl md:text-5xl leading-tight md:leading-tight text-white tracking-tight max-w-4xl"
      >
        Создавайте геймплей, а <span className="text-m3-primary drop-shadow-[0_0_24px_rgba(208,188,255,0.3)]">не боритесь</span> с архитектурным кодом
      </motion.h1>

      {/* Subtitles */}
      <motion.p
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-6 text-sm md:text-lg text-[#cac4d0] max-w-2xl leading-relaxed"
      >
        <span className="font-semibold text-white">Solas</span> — легковесный C# движок для инди-разработчиков. Используя простую Data-Oriented архитектуру Entity-Data-Logic (EDL) и Source Generators, он разгружает процессор и избавляет от лишнего бойлерплейта.
      </motion.p>

      {/* Expressive Action Call buttons (Concept 1.2) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center"
      >
        <GameButton
          id="hero-download-btn-xl"
          onClick={onDownloadClick}
          variant="primary"
          className="w-full sm:w-auto px-8 py-4 text-base"
        >
          <Download className="w-5 h-5" />
          Установить v{engineVersion}
        </GameButton>

        <GameButton
          id="hero-docs-btn-xl"
          onClick={onDocsClick}
          variant="outline"
          className="w-full sm:w-auto px-8 py-4 text-base"
        >
          <BookOpen className="w-5 h-5 text-m3-primary" />
          Документация
        </GameButton>
      </motion.div>

      {/* Solve core problems Section (Concept 1.1 / Concept 3.2) */}
      <div className="mt-24 w-full max-w-6xl text-left grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <GameCard
          id="hero-core-card-1"
          accent="primary"
          className="flex flex-col justify-between"
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="w-12 h-12 bg-m3-primaryContainer/50 rounded-2xl flex items-center justify-center text-m3-primary mb-5 shadow-lg shadow-black/20">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">
                Удобство разработки (DX)
              </h3>
              <p className="text-xs text-[#cac4d0] leading-relaxed">
                Реактивные структуры и классы данных, автоматическое внедрени зависимостей, встроенная многопоточность и эффективное получение объектов по компонентам – всё, чтобы разработчикам было удобно.
              </p>
            </div>
            <div className="mt-6 flex">
              <span className="text-[10px] font-mono text-m3-primary font-bold bg-m3-primaryContainer/30 border border-m3-primary/20 px-2 py-1 rounded">
                ALMOST ZERO RUNTIME REFLECTION
              </span>
            </div>
          </div>
        </GameCard>

        {/* Card 2 */}
        <GameCard
          id="hero-core-card-2"
          accent="tertiary"
          className="flex flex-col justify-between"
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
                Вместо огромных и нечитаемых сцен в формате YAML, Solas хранит данные в максимально компактом виде, сохраняя то, что вам нужно и как вам нужно. В Solas вы можете выбрать заготовленные сериализаторы или даже написать свой!.
              </p>
            </div>
            <div className="mt-6 flex">
              <span className="text-[10px] font-mono text-m3-tertiary font-bold bg-m3-tertiaryContainer/30 border border-m3-tertiary/20 px-2 py-1 rounded">
                EASY SCENE MERGING
              </span>
            </div>
          </div>
        </GameCard>

        {/* Card 3 */}
        <GameCard
          id="hero-core-card-3"
          accent="secondary"
          className="flex flex-col justify-between"
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="w-12 h-12 bg-m3-secondaryContainer/50 rounded-2xl flex items-center justify-center text-m3-secondary mb-5 shadow-lg shadow-black/20">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">
                Разделение данных и логики
              </h3>
              <p className="text-xs text-[#cac4d0] leading-relaxed">
                Solas использует современный Data-Oriented подход, разделяя данные и логику. Данные могут быть представлены ввиде лёгких структур или ссылаемых классов. Логика же наследуется от абстрактного класса, а сущность является контейнером с мета-данными.
              </p>
            </div>
            <div className="mt-6 flex">
              <span className="text-[10px] font-mono text-m3-secondary font-bold bg-m3-secondaryContainer/30 border border-m3-secondary/20 px-2 py-1 rounded">
                DATA-ORIENTED
              </span>
            </div>
          </div>
        </GameCard>

      </div>
    </section>
  );
}
