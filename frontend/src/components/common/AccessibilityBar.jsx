import React, { useState, useEffect } from 'react';
import { Accessibility, Eye, Moon, Sun, Type, X, Sliders } from 'lucide-react';
import SeniorHelpWidget from './SeniorHelpWidget';

export default function AccessibilityBar() {
  const [isOpen, setIsOpen] = useState(false);

  // 1. Font Size State (Normal 16px, Large 18px, X-Large 20px)
  const [fontSizeLevel, setFontSizeLevel] = useState(() => {
    return localStorage.getItem('silverhands_font_size') || 'normal';
  });

  // 2. Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('silverhands_dark_mode') === 'true';
  });

  // Apply Font Size
  useEffect(() => {
    const root = document.documentElement;
    if (fontSizeLevel === 'large') {
      root.style.fontSize = '18px';
    } else if (fontSizeLevel === 'xlarge') {
      root.style.fontSize = '20px';
    } else {
      root.style.fontSize = '16px';
    }
    localStorage.setItem('silverhands_font_size', fontSizeLevel);
  }, [fontSizeLevel]);

  // Apply Dark Mode
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.setAttribute('data-theme', 'silverhands_dark');
      root.classList.add('dark');
    } else {
      root.setAttribute('data-theme', 'silverhands');
      root.classList.remove('dark');
    }
    localStorage.setItem('silverhands_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  return (
    /* Floating Container: Positioned at bottom-20 on mobile to cleanly avoid MobileNav bar (bottom-0) */
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[99999] flex flex-col items-center gap-3">
      
      {/* 1. Help Desk Button (Positioned directly above Accessibility) */}
      <SeniorHelpWidget />

      {/* 2. Floating Accessibility Button (Human Accessibility Icon instead of Gear) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-circle btn-neutral shadow-2xl border-2 border-base-300 hover:scale-105 transition-all text-white flex items-center justify-center min-h-[48px] min-w-[48px]"
          aria-label="Display & Vision Accessibility Settings"
          title="Display & Vision Accessibility Settings"
        >
          {isOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Accessibility className="w-6 h-6 stroke-[2.5]" />}
        </button>

        {/* Compact Popover Panel (Clean, bounded, strictly within screen) */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 w-72 max-w-[calc(100vw-2.5rem)] bg-base-100 border-2 border-base-300 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150 z-[99999]">
            
            <div className="flex items-center justify-between pb-2 border-b border-base-200">
              <span className="text-xs font-bold text-base-content flex items-center gap-1.5">
                <Accessibility className="w-4 h-4 text-primary" /> Vision & Text Comfort
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost btn-xs btn-circle min-h-[32px] min-w-[32px]"
                aria-label="Close display settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Text Size Control */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-base-content/70 flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-primary" /> Elder Text Size
              </label>
              <div className="join w-full grid grid-cols-3">
                <button
                  type="button"
                  onClick={() => setFontSizeLevel('normal')}
                  className={`join-item btn min-h-[42px] ${fontSizeLevel === 'normal' ? 'btn-primary text-white font-bold' : 'btn-outline border-base-300 text-xs'}`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setFontSizeLevel('large')}
                  className={`join-item btn min-h-[42px] ${fontSizeLevel === 'large' ? 'btn-primary text-white font-bold' : 'btn-outline border-base-300 text-xs font-bold'}`}
                >
                  Large (18px)
                </button>
                <button
                  type="button"
                  onClick={() => setFontSizeLevel('xlarge')}
                  className={`join-item btn min-h-[42px] ${fontSizeLevel === 'xlarge' ? 'btn-primary text-white font-bold' : 'btn-outline border-base-300 text-sm font-black'}`}
                >
                  Extra Large
                </button>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="space-y-1.5 pt-1 border-t border-base-200">
              <label className="text-[11px] font-bold text-base-content/70 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  {isDarkMode ? <Moon className="w-3.5 h-3.5 text-secondary" /> : <Sun className="w-3.5 h-3.5 text-warning" />} High Contrast Theme
                </span>
                <span className="text-[10px] font-bold text-primary uppercase">{isDarkMode ? 'Dark' : 'Light'}</span>
              </label>
              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`btn min-h-[44px] w-full rounded-2xl text-xs font-bold gap-2 ${
                  isDarkMode 
                    ? 'btn-secondary text-white shadow-md' 
                    : 'btn-outline border-base-300 text-base-content hover:bg-base-200'
                }`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDarkMode ? 'Switch to Bright Light Mode' : 'Switch to High-Contrast Dark Mode'}
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
