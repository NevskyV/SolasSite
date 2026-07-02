/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import EdlSandbox from './components/EdlSandbox';
import SpaceHierarchy from './components/SpaceHierarchy';
import SourceGenVisualizer from './components/SourceGenVisualizer';
import Roadmap from './components/Roadmap';
import Support from './components/Support';
import DocViewer from './components/DocViewer';
import WavyStripes from './components/WavyStripes';
import MaterialBackground from './components/MaterialBackground';
import { initializeTheme, applyThemeProperties } from './lib/theme';
import { motion, AnimatePresence } from 'motion/react';
import { Download, CheckCircle2, X, Play, BookOpen, AlertCircle, Copy, Check } from 'lucide-react';
import GameButton from './components/GameButton';

export default function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'docs'>('landing');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Initialize dynamic Accent Color theme palette on load
  useEffect(() => {
    const palette = initializeTheme();
    applyThemeProperties(palette);
    console.log(`[Material You Init] Theme successfully harmonized.`);
  }, []);

  // Auto scroll to top on tab transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleDownloadTrigger = () => {
    setShowDownloadModal(true);
    setDownloadSuccess(false);
  };

  const handleConfirmDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      // Simulate static zip generation and download
      const link = document.createElement('a');
      link.href = '#';
      link.setAttribute('download', 'Orbitality_C#_Engine_SDK_v0.1.zip');
      document.body.appendChild(link);
      // Let the user know the code is perfectly executing
      console.log('Initiated mock C# engine download archive.');
      document.body.removeChild(link);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0b090f] text-[#ede8f5] selection:bg-m3-primary selection:text-m3-onPrimary relative font-sans overflow-x-clip">
      
      {/* Expressive Material Design floating shapes + simple unbuggy gradient loops background */}
      <MaterialBackground activeTab={activeTab} />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Header */}
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onDownloadClick={handleDownloadTrigger} 
        />

        {/* Main viewport toggles */}
        <AnimatePresence mode="wait">
          {activeTab === 'landing' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 28 }}
            >
              {/* 1. HERO GREETING BANNER */}
              <Hero 
                onDocsClick={() => setActiveTab('docs')} 
                onDownloadClick={handleDownloadTrigger} 
              />

              <WavyStripes opacity={0.45} color="rgba(208, 188, 255, 0.3)" speed={10} className="-my-10 z-0" />

              {/* 2. DYNAMIC EDL RE-EVALUATION SANDBOX */}
              <EdlSandbox />

              <WavyStripes opacity={0.4} color="rgba(239, 184, 200, 0.28)" speed={12} className="-my-10 z-0" />

              {/* 3. GRAPHS: INTUITIVE SPACE ISOLATION & DEPENDENCY INJECTS */}
              <SpaceHierarchy />

              <WavyStripes opacity={0.42} color="rgba(45, 212, 191, 0.26)" speed={11} className="-my-10 z-0" />

              {/* 3.5. IMMERSIVE C# SOURCE GENERATION PIPELINE */}
              <SourceGenVisualizer />

              <WavyStripes opacity={0.38} color="rgba(208, 188, 255, 0.24)" speed={13} className="-my-10 z-0" />

              {/* 4. SPRING ROADMAP MODULES PIPELINE */}
              <Roadmap />

              <WavyStripes opacity={0.35} color="rgba(208, 188, 255, 0.22)" speed={14} className="-my-10 z-0" />

              {/* 5. PROJECT SUPPORT WITH DONATIONS & SOCIALS BLOB */}
              <Support />

              {/* LANDING FOOTER DETAILS */}
              <footer className="py-12 px-4 border-t border-white/5 bg-black/40 text-center select-none">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-9 h-9 flex items-center justify-center rounded-xl group-hover:bg-m3-primary/20 transition-all duration-300">
                      <img 
                        src="/logo_icon.svg" 
                        className="w-full h-full object-contain select-none" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="font-display font-semibold text-sm text-white">Solas C# Game Engine</span>
                  </div>
                  <p className="text-xs justify-end text-[#cac4d0]/60 max-w-sm text-right">
                    Разработано профессиональной инди-командой со страстью к идеальному DX. Распространяется под свободной лицензией MPL-2.0.
                  </p>
                </div>
              </footer>
            </motion.div>
          ) : (
            <motion.div
              key="docs"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 28 }}
            >
              {/* DOCUMENTATION MULTI-PAGE MARKDOWN VIEWER */}
              <DocViewer />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* EXPRESSIVE MATERIAL 3 DIALOG MODAL (SDK DOWNLOADS) */}
      <AnimatePresence>
        {showDownloadModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setShowDownloadModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md cursor-pointer"
          >
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 15 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 bg-m3-surface border border-white/10 m3-shape-container shadow-2xl relative cursor-default"
              id="download-sdk-dialog-modal"
            >
              {/* Close Button */}
              <button
                id="close-download-sdk-btn"
                onClick={() => setShowDownloadModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 hover:bg-white/5 rounded-full transition-all outline-none"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center">
                
                {/* Visual Icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
                  downloadSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-m3-primaryContainer/40 text-m3-primary'
                }`}>
                  {downloadSuccess ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <Download className="w-8 h-8" />
                  )}
                </div>

                {/* Header */}
                <h3 className="font-display font-bold text-xl text-white mb-2">
                  'Установка Solas'
                </h3>

                {/* Subtitle description */}
                <p className="text-xs text-[#cac4d0] leading-relaxed mb-6 max-w-xs">
                  'Последняя версия Solas – 0.1.0! Она включает в себя три пакета: Core, SourceGenerators, Build'
                </p>

                {/* Bullet attributes */}
                {!downloadSuccess && (
                  <div className="w-full space-y-2 mb-6 text-left bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Версия:</span>
                      <span className="text-m3-primary font-bold">0.1.0 Alpha</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Требование:</span>
                      <span className="text-white">.NET 10</span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="w-full flex flex-col gap-2">
                   {downloadSuccess ? (
                    <GameButton
                      id="close-after-success-btn"
                      onClick={() => setShowDownloadModal(false)}
                      variant="secondary"
                      className="w-full py-3.5"
                    >
                      Закрыть Окно
                    </GameButton>
                  ) : (
                    <>
                        <div className="w-full bg-black/80 rounded-xl border border-white/10 flex items-center justify-between p-3.5 font-mono text-sm text-m3-primary mb-2">
                          <span className="truncate">dotnet package add Solas</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('dotnet package add Solas');
                            }}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>

                      <button
                        id="cancel-sdk-download-btn"
                        onClick={() => setShowDownloadModal(false)}
                        className="w-full py-2 text-slate-400 hover:text-white text-xs transition-all font-semibold cursor-pointer"
                      >
                        Отмена
                      </button>
                    </>
                  )}
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
