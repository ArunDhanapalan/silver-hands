import React, { useState, useEffect } from 'react';
import { Eye, Volume2, Type, Sun, Moon, Sparkles } from 'lucide-react';

export default function AccessibilityBar() {
  const [fontSizeLevel, setFontSizeLevel] = useState(() => {
    return localStorage.getItem('sh_font_size') || 'normal';
  });
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('sh_high_contrast') === 'true';
  });
  const [speechActive, setSpeechActive] = useState(false);

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

  useEffect(() => {
    const body = document.body;
    if (highContrast) {
      body.classList.add('contrast-125', 'brightness-105');
      document.documentElement.setAttribute('data-theme', 'autumn');
    } else {
      body.classList.remove('contrast-125', 'brightness-105');
      document.documentElement.setAttribute('data-theme', 'silverhands');
    }
    localStorage.setItem('sh_high_contrast', highContrast);
  }, [highContrast]);

  const handleSpeakCurrentPage = () => {
    if (!window.speechSynthesis) return;
    if (speechActive) {
      window.speechSynthesis.cancel();
      setSpeechActive(false);
      return;
    }

    const mainText = document.querySelector('main')?.innerText || document.body.innerText;
    const utterance = new SpeechSynthesisUtterance(mainText.slice(0, 300));
    utterance.rate = 0.9; // Patient pace for seniors
    utterance.onend = () => setSpeechActive(false);
    utterance.onerror = () => setSpeechActive(false);

    setSpeechActive(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <aside 
      aria-label="Senior Accessibility Controls"
      className="fixed bottom-20 sm:bottom-4 right-4 z-40 bg-base-100/90 backdrop-blur border-2 border-primary/30 shadow-xl rounded-full px-3 py-1.5 flex items-center gap-2 text-xs"
    >
      
      {/* Font Size Selector */}
      <div className="flex items-center gap-1 border-r border-base-300 pr-2">
        <Type className="w-3.5 h-3.5 text-primary" />
        <button
          type="button"
          onClick={() => setFontSizeLevel('normal')}
          className={`btn btn-xs rounded-full min-h-[32px] min-w-[32px] font-bold ${fontSizeLevel === 'normal' ? 'btn-primary text-white' : 'btn-ghost'}`}
          aria-label="Set normal font size"
        >
          A
        </button>
        <button
          type="button"
          onClick={() => setFontSizeLevel('large')}
          className={`btn btn-xs rounded-full min-h-[32px] min-w-[32px] font-bold text-sm ${fontSizeLevel === 'large' ? 'btn-primary text-white' : 'btn-ghost'}`}
          aria-label="Set large font size"
        >
          A+
        </button>
        <button
          type="button"
          onClick={() => setFontSizeLevel('xlarge')}
          className={`btn btn-xs rounded-full min-h-[32px] min-w-[32px] font-extrabold text-base ${fontSizeLevel === 'xlarge' ? 'btn-primary text-white' : 'btn-ghost'}`}
          aria-label="Set extra large font size for senior readability"
        >
          A++
        </button>
      </div>

      {/* High Contrast Toggle */}
      <button
        type="button"
        onClick={() => setHighContrast(!highContrast)}
        className={`btn btn-xs rounded-full min-h-[32px] px-2.5 font-bold gap-1 ${highContrast ? 'btn-secondary text-white' : 'btn-ghost'}`}
        aria-label="Toggle High Contrast Mode"
      >
        <Eye className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{highContrast ? 'High Contrast' : 'Contrast'}</span>
      </button>

      {/* Text-to-Speech Reader */}
      {window.speechSynthesis && (
        <button
          type="button"
          onClick={handleSpeakCurrentPage}
          className={`btn btn-xs rounded-full min-h-[32px] px-2.5 font-bold gap-1 ${speechActive ? 'btn-error text-white animate-pulse' : 'btn-ghost'}`}
          aria-label="Read Page Out Loud Voice Assistant"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{speechActive ? 'Stop Reading' : 'Read Aloud'}</span>
        </button>
      )}

    </aside>
  );
}
