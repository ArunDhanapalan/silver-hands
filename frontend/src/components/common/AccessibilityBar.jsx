import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Type, X } from 'lucide-react';

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
    <div className="fixed bottom-5 right-5 z-[99999]">
      
      {/* Floating Compact Gear Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-circle btn-neutral shadow-2xl border-2 border-base-300 hover:scale-105 transition-all text-white flex items-center justify-center"
        aria-label="Accessibility & Display Settings"
        title="Accessibility & Display Settings"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
      </button>

      {/* Compact Popover Panel (Clean, bounded, strictly within screen) */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-64 max-w-[calc(100vw-2.5rem)] bg-base-100 border border-base-300 rounded-3xl p-4 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
          
          <div className="flex items-center justify-between pb-2 border-b border-base-200">
            <span className="text-xs font-bold text-base-content flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-primary" /> Display Settings
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost btn-xs btn-circle"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Text Size Control */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-base-content/70 flex items-center gap-1">
              <Type className="w-3.5 h-3.5 text-primary" /> Text Size
            </label>
            <div className="join w-full grid grid-cols-3">
              <button
                type="button"
                onClick={() => setFontSizeLevel('normal')}
                className={`join-item btn btn-xs ${fontSizeLevel === 'normal' ? 'btn-primary text-white font-bold' : 'btn-outline border-base-300 text-[11px]'}`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSizeLevel('large')}
                className={`join-item btn btn-xs ${fontSizeLevel === 'large' ? 'btn-primary text-white font-bold' : 'btn-outline border-base-300 text-xs font-semibold'}`}
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSizeLevel('xlarge')}
                className={`join-item btn btn-xs ${fontSizeLevel === 'xlarge' ? 'btn-primary text-white font-bold' : 'btn-outline border-base-300 text-sm font-bold'}`}
              >
                A++
              </button>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold text-base-content/70 flex items-center justify-between">
              <span className="flex items-center gap-1">
                {isDarkMode ? <Moon className="w-3.5 h-3.5 text-secondary" /> : <Sun className="w-3.5 h-3.5 text-warning" />} Theme
              </span>
              <span className="text-[10px] font-bold text-primary uppercase">{isDarkMode ? 'Dark' : 'Light'}</span>
            </label>
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`btn btn-sm w-full rounded-2xl text-xs font-bold gap-2 ${
                isDarkMode 
                  ? 'btn-secondary text-white shadow-md' 
                  : 'btn-outline border-base-300 text-base-content hover:bg-base-200'
              }`}
            >
              {isDarkMode ? (
                <>
                  <Moon className="w-4 h-4 text-white" /> Dark Mode (Active)
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-warning" /> Switch to Dark Mode
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
