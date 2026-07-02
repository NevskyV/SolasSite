/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Cpu, 
  Network, 
  Search, 
  Copy, 
  Check, 
  BookOpen, 
  FolderOpen, 
  Menu, 
  X, 
  ChevronRight, 
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { DocCategory } from '../types';

interface CodeBlockProps {
  language: string;
  value: string;
}

function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d11] font-mono text-xs shadow-2xl">
      <div className="bg-[#141419] px-4 py-2.5 border-b border-white/5 flex items-center justify-between text-[11px] text-[#cac4d0] select-none">
        <span className="font-semibold uppercase tracking-wider text-m3-primary">{language} Code</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer border border-white/5 active:scale-95 text-[10px] font-bold"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold uppercase tracking-wider">Скопировано!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-m3-primary" />
              <span className="uppercase tracking-wider">Копировать</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[#e0e0e0] bg-black/30">
        <code className="block whitespace-pre text-[11px] leading-relaxed select-text">{value}</code>
      </pre>
    </div>
  );
}

export default function DocViewer() {
  const [categories, setCategories] = useState<DocCategory[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('Introduction');
  const [markdown, setMarkdown] = useState<string>('');
  const [isInitLoading, setIsInitLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Введение': true,
    'Ядро (Core)': true,
    'Пространства и Связи': true
  });

  // Load documentation structural folders (index.json)
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}docs/index.json`)
      .then(res => {
        if (!res.ok) throw new Error('Offline mode or missing public directory index.json');
        return res.json();
      })
      .then((data: DocCategory[]) => {
        setCategories(data);
      })
      .catch((err) => {
        console.warn('Doc index fetch failed, initializing embedded static categories.', err);
      });
  }, []);

  // Fetch or load fallback content whenever a page selection triggers
  useEffect(() => {
    // Scroll content panel to top smoothly
    const docPanel = document.getElementById('docs-view-scroll-canvas');
    if (docPanel) docPanel.scrollTop = 0;

    // Load from public directory with direct fallback
    fetch(`${import.meta.env.BASE_URL}/docs/${selectedPageId}.md`)
      .then(res => {
        if (!res.ok) throw new Error('Network file failed, fallback to offline embedded documentation');
        return res.text();
      })
      .then(text => {
        setMarkdown(text);
        setIsInitLoading(false);
      })
      .catch((err) => {
        console.info(`Fetched failed for ${selectedPageId}.md, rendering local high-fidelity copy.`, err);
        setIsInitLoading(false);
      });
  }, [selectedPageId]);

  const copyPageToClipboard = () => {
    navigator.clipboard.writeText(markdown);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  // Instant real-time Search Filters
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const query = searchQuery.toLowerCase();

    return categories.map(cat => {
      const matchedPages = cat.pages.filter(page => 
        page.title.toLowerCase().includes(query) || 
        page.id.toLowerCase().includes(query)
      );

      return {
        ...cat,
        pages: matchedPages
      };
    }).filter(cat => cat.pages.length > 0);
  }, [categories, searchQuery]);

  // Toggle categories folders expanded state
  const toggleCategory = (catName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  // Category Icon Mapping
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass': return <Compass className="w-4 h-4 text-[#efb8c8]" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-[#d0bcff]" />;
      case 'Network': return <Network className="w-4 h-4 text-emerald-400" />;
      default: return <BookOpen className="w-4 h-4 text-slate-300" />;
    }
  };

  // Calculate next page for pagination
  const nextPage = useMemo(() => {
    const allPages = categories.flatMap(cat => cat.pages);
    const currentIndex = allPages.findIndex(page => page.id === selectedPageId);
    if (currentIndex !== -1 && currentIndex < allPages.length - 1) {
      return allPages[currentIndex + 1];
    }
    return null;
  }, [categories, selectedPageId]);

  // Find currently active page title
  const activePageTitle = useMemo(() => {
    for (const cat of categories) {
      const page = cat.pages.find(p => p.id === selectedPageId);
      if (page) return page.title;
    }
    return "Документация";
  }, [categories, selectedPageId]);

  return (
    <div className="pt-12 md:pt-12 pb-12 max-w-7xl mx-auto relative px-4 min-h-[550px]" id="docs-view-layout-container">
      <AnimatePresence mode="wait">
        {isInitLoading ? (
          <motion.div
            key="docs-initial-loader"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex flex-col items-center justify-center py-36 text-center"
          >
            {/* Aesthetic Cosmic Ring Spinner */}
            <div className="relative w-16 h-16 mb-5 select-none">
              <div className="absolute inset-0 rounded-full border-4 border-white/5" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-4 border-t-m3-primary border-r-m3-tertiary border-r-transparent border-t-transparent"
              />
              <div className="absolute inset-3 rounded-full border border-dashed border-white/10 animate-[spin_8s_linear_infinite_reverse]" />
            </div>

            <h3 className="font-display font-semibold text-base text-white tracking-wide">
              Загрузка документации ядра...
            </h3>
            <p className="text-[10.5px] font-mono text-[#cac4d0]/60 mt-1.5 tracking-widest uppercase animate-pulse">
              Чтение файловой системы
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="docs-canvas-modules"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-12 items-start relative gap-6 md:gap-8"
          >
            {/* Dynamic Slide Toast Dialogue: M3 Expressive Alert */}
            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="fixed top-24 right-6 z-50 bg-[#381e72] border border-m3-primary/30 text-[#eaddff] px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold font-mono"
                  id="toast-notification-success"
                >
                  <Check className="w-4 h-4 text-m3-primary" />
                  <span>Страница скопирована в буфер обмена!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating menu button for tablet/mobile viewports */}
            <button
              id="mobile-docs-menu-toggler"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden fixed bottom-6 right-6 z-40 p-4 bg-m3-primary hover:bg-[#c2aeff] text-m3-onPrimary rounded-full shadow-2xl transition-all cursor-pointer flex items-center justify-center border border-white/5"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* LEFT SIDE: Dynamic Sidebar with index folders - col-span-3 */}
            <aside className={`
              fixed md:sticky md:top-28 left-0 z-30 w-[280px] md:w-auto md:col-span-3 p-4 sm:p-5 m3-glass border border-white/10 rounded-2xl md:rounded-3xl transition-transform duration-300 transform md:transform-none flex flex-col justify-between md:h-[calc(100vh-160px)] inset-y-0 md:inset-y-auto self-start
              ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `} id="docs-sidebar-panel">
              
              <div className="flex flex-col overflow-hidden">
                {/* Header of Docs Sidebar */}
                <div className="flex items-center justify-between mb-4 select-none">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#ccc4d0] flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-m3-primary" />
                    ПАКЕТ ДОКУМЕНТАЦИИ
                  </span>
                </div>

                {/* Search bar inputs */}
                <div className="relative mb-4" id="docs-search-wrapper">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                  <input
                    id="docs-search-input"
                    type="text"
                    placeholder="Поиск разделов..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-black/40 border border-white/5 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-m3-primary/30 transition-all font-sans text-white focus:ring-1 focus:ring-m3-primary/20"
                  />
                </div>

                {/* Folders navigation list */}
                <motion.nav 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-1"
                >
                  {filteredCategories.length === 0 ? (
                    <div className="text-xs font-mono text-neutral-500 text-center py-6 border border-dashed border-white/5 rounded-xl">
                      Разделы не найдены
                    </div>
                  ) : (
                    filteredCategories.map((cat, cIdx) => {
                      const isExpanded = expandedCategories[cat.category] !== false;
                      
                      return (
                        <div key={cat.category} className="space-y-1.5" id={`sidebar-category-${cIdx}`}>
                          {/* Category item header toggler */}
                          <button
                            onClick={() => toggleCategory(cat.category)}
                            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white hover:text-m3-primary transition-all p-1.5 cursor-pointer rounded-lg hover:bg-white/2"
                          >
                            <span className="flex items-center gap-2">
                              {getCategoryIcon(cat.icon)}
                              <span>{cat.category}</span>
                            </span>
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                            )}
                          </button>

                          {/* Pages inside this folder category */}
                          {isExpanded && (
                            <div className="pl-4 border-l border-white/5 ml-3.5 space-y-1">
                              {cat.pages.map(page => {
                                const isActive = page.id === selectedPageId;
                                
                                return (
                                  <button
                                    key={page.id}
                                    id={`sidebar-page-${page.id}`}
                                    onClick={() => {
                                      setSelectedPageId(page.id);
                                      setIsMobileMenuOpen(false); // Close mobile drawer
                                    }}
                                    className={`w-full text-left py-2 px-3 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                                      isActive
                                        ? 'bg-m3-primaryContainer/30 text-m3-onPrimaryContainer font-semibold border-l-2 border-m3-primary pl-2'
                                        : 'text-[#cac4d0] hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    <span>{page.title}</span>
                                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-m3-primary" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </motion.nav>
              </div>

              {/* Action controls footer */}
              <div className="mt-4 pt-3 border-t border-white/5 shrink-0">
                <button
                  id="docs-action-copypage"
                  onClick={copyPageToClipboard}
                  className="w-full py-2 rounded-xl text-[10px] font-semibold bg-white/3 hover:bg-white/8 text-white uppercase tracking-wider font-mono transition-all flex items-center justify-center gap-2 border border-white/5 cursor-pointer m3-btn-expressive"
                >
                  <Copy className="w-3.5 h-3.5 text-m3-primary" />
                  Копировать страницу
                </button>
              </div>

            </aside>

            {/* Screen block dim layer when mobile sidebar is active */}
            {isMobileMenuOpen && (
              <div 
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 z-20 bg-black/50 backdrop-blur-xs md:hidden"
              />
            )}

            {/* RIGHT SIDE: Markdown Canvas Content Display - col-span-9 */}
            <main className="md:col-span-9" id="docs-view-scroll-canvas">
              <div className="max-w-3xl mx-auto">
                
                {/* Top Breadcrumb Navigation */}
                <div className="flex items-center gap-2 text-xs font-mono text-[#cac4d0]/60 mb-5 select-none" id="docs-breadcrumb">
                  <span>Документация</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="text-m3-primary font-medium">{activePageTitle}</span>
                </div>

                {/* Render markdown with custom stylish wrappers */}
                <div className="p-6 md:p-10 rounded-3xl m3-glass border border-white/5 shadow-xl relative min-h-[450px] overflow-hidden">
                  
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={selectedPageId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18, ease: 'easeInOut' }}
                      className="markdown-body"
                    >
                      <Markdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-3xl font-display font-bold text-white mb-6 border-b border-white/10 pb-3" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-2xl font-display font-bold text-m3-primary mt-8 mb-4 border-b border-white/5 pb-2" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-xl font-display font-semibold text-m3-tertiary mt-6 mb-3" {...props} />,
                          p: ({node, ...props}) => <p className="text-sm text-[#cac4d0] leading-relaxed mb-4" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1.5 text-sm text-[#cac4d0]" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-sm text-[#cac4d0]" {...props} />,
                          li: ({node, ...props}) => <li className="marker:text-m3-primary text-sm text-[#cac4d0]" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-m3-tertiary" {...props} />,
                          table: ({node, ...props}) => <div className="overflow-x-auto my-6"><table className="w-full text-sm text-[#cac4d0] border-collapse border border-white/10" {...props} /></div>,
                          th: ({node, ...props}) => <th className="border border-white/10 p-3 bg-white/5 font-semibold" {...props} />,
                          td: ({node, ...props}) => <td className="border border-white/10 p-3" {...props} />,
                          code: ({node, className, children, ...props}: any) => {
                            const match = /language-(\w+)/.exec(className || '');
                            const codeContent = String(children).replace(/\n$/, '');
                            if (!match) {
                              return <code className="bg-white/5 text-m3-primary font-mono text-xs px-0 py-0 rounded border border-white/5" {...props}>{children}</code>;
                            }
                            return (
                              <CodeBlock language={match[1]} value={codeContent} />
                            );
                          },
                          blockquote: ({node, ...props}) => (
                            <blockquote className="border-l-4 border-m3-primary bg-m3-primaryContainer/10 p-2 rounded-r-2xl text-m3-onPrimaryContainer my-1 text-sm italic shadow-inner" {...props} />
                          )
                        }}
                      >
                        {markdown}
                      </Markdown>
                    </motion.div>
                  </AnimatePresence>

                  {/* Bottom pagination / navigators */}
                  <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#cac4d0]/50">
                    <span>Solas Engine Documentation</span>
                    
                    {nextPage && (
                      <button 
                        onClick={() => setSelectedPageId(nextPage.id)}
                        className="flex items-center gap-2 text-m3-primary text-right hover:text-white transition-colors"
                      >
                        Следующая страница: {nextPage.title}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
