import React, { useState, useEffect } from 'react';
import { Settings, Sun, Moon, Type, X } from 'lucide-react';

export default function AccessibilityBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState(() => {
    return localStorage.getItem('sh_font_size') || 'normal';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('sh_dark_mode') === 'true';
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
    localStorage.setItem('sh_font_size', fontSizeLevel);
  }, [fontSizeLevel]);

  // Apply Dark Mode
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.setAttribute('data-theme', 'night');
    } else {
      root.setAttribute('data-theme', 'silverhands');
    }
    localStorage.setItem('sh_dark_mode', isDarkMode);
  }, [isDarkMode]);

  return (
    <div 
      style={{ position: 'fixed', bottom: '1.25rem', right: '1.25rem', zIndex: 99999 }}
      className="flex flex-col items-end gap-2 select-none"
    >
      {/* Expanded Accessibility Options Card */}
      {isOpen && (
        <div className="bg-base-100 border-2 border-primary/30 shadow-2xl rounded-3xl p-4 w-64 space-y-3.5 mb-1 animate-in fade-in zoom-in duration-200">
          
          <div className="flex items-center justify-between border-b border-base-200 pb-2">
            <span className="font-extrabold text-xs text-base-content flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-primary" /> Accessibility Settings
            </span>
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost btn-xs btn-circle text-base-content/60"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Text Size Options */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-base-content/70 flex items-center gap-1">
              <Type className="w-3.5 h-3.5 text-primary" /> Text Size
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setFontSizeLevel('normal')}
                className={`btn btn-xs rounded-xl font-bold ${
                  fontSizeLevel === 'normal' ? 'btn-primary text-white shadow-xs' : 'btn-outline border-base-300'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setFontSizeLevel('large')}
                className={`btn btn-xs rounded-xl font-bold text-xs ${
                  fontSizeLevel === 'large' ? 'btn-primary text-white shadow-xs' : 'btn-outline border-base-300'
                }`}
              >
                Large
              </button>
              <button
                type="button"
                onClick={() => setFontSizeLevel('xlarge')}
                className={`btn btn-xs rounded-xl font-extrabold text-sm ${
                  fontSizeLevel === 'xlarge' ? 'btn-primary text-white shadow-xs' : 'btn-outline border-base-300'
                }`}
              >
                X-Large
              </button>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold text-base-content/70 flex items-center gap-1">
              {isDarkMode ? <Moon className="w-3.5 h-3.5 text-secondary" /> : <Sun className="w-3.5 h-3.5 text-warning" />} Theme Mode
            </label>
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`btn btn-sm w-full rounded-xl font-bold text-xs justify-between ${
                isDarkMode ? 'btn-secondary text-white' : 'btn-outline border-base-300'
              }`}
            >
              <span>{isDarkMode ? '🌙 Dark Mode Active' : '☀️ Light Mode Active'}</span>
              <span className="badge badge-sm badge-ghost text-[10px] font-bold">
                {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
              </span>
            </button>
          </div>

        </div>
      )}

      {/* Floating Accessibility Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-circle btn-primary text-white shadow-2xl ring-4 ring-primary/20 hover:scale-105 transition-transform"
        aria-label="Toggle Accessibility Settings"
        title="Accessibility Settings"
      >
        <Settings className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
    </div>
  );
}
