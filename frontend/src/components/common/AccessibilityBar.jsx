import React, { useState, useEffect } from 'react';
import { Eye, Volume2, Type, Sun, Moon, Sparkles, VolumeX } from 'lucide-react';

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
    const root = document.documentElement;
    if (highContrast) {
      root.setAttribute('data-theme', 'black');
      root.classList.add('high-contrast-mode');
    } else {
      root.setAttribute('data-theme', 'silverhands');
      root.classList.remove('high-contrast-mode');
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

    const mainElement = document.querySelector('main');
    const mainText = mainElement?.innerText || document.body.innerText;
    const cleanText = mainText.replace(/\s+/g, ' ').slice(0, 400);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.85; // Patient pace for seniors
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeechActive(false);
    utterance.onerror = () => setSpeechActive(false);

    setSpeechActive(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <aside 
      aria-label="Senior Accessibility Controls"
      style={{ position: 'fixed', bottom: '1.25rem', right: '1.25rem', zIndex: 99999 }}
      className="bg-base-100/95 backdrop-blur-md border-2 border-primary/40 shadow-2xl rounded-full px-3.5 py-2 flex items-center gap-2 text-xs"
    >
      
      {/* Font Size Scaler */}
      <div className="flex items-center gap-1 border-r border-base-300 pr-2.5">
        <Type className="w-3.5 h-3.5 text-primary shrink-0" />
        <button
          type="button"
          onClick={() => setFontSizeLevel('normal')}
          className={`btn btn-xs rounded-full min-h-[30px] min-w-[30px] font-bold ${fontSizeLevel === 'normal' ? 'btn-primary text-white shadow-xs' : 'btn-ghost'}`}
          aria-label="Standard font size"
        >
          A
        </button>
        <button
          type="button"
          onClick={() => setFontSizeLevel('large')}
          className={`btn btn-xs rounded-full min-h-[30px] min-w-[30px] font-bold text-sm ${fontSizeLevel === 'large' ? 'btn-primary text-white shadow-xs' : 'btn-ghost'}`}
          aria-label="Large font size"
        >
          A+
        </button>
        <button
          type="button"
          onClick={() => setFontSizeLevel('xlarge')}
          className={`btn btn-xs rounded-full min-h-[30px] min-w-[30px] font-extrabold text-base ${fontSizeLevel === 'xlarge' ? 'btn-primary text-white shadow-xs' : 'btn-ghost'}`}
          aria-label="Extra large font size for senior readability"
        >
          A++
        </button>
      </div>

      {/* High Contrast Mode Toggle */}
      <button
        type="button"
        onClick={() => setHighContrast(!highContrast)}
        className={`btn btn-xs rounded-full min-h-[30px] px-2.5 font-bold gap-1 ${highContrast ? 'btn-warning text-black font-extrabold' : 'btn-ghost'}`}
        aria-label="Toggle High Contrast Mode"
      >
        <Eye className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{highContrast ? 'High Contrast On' : 'Contrast'}</span>
      </button>

      {/* Screen Reader Voice Assistant */}
      {window.speechSynthesis && (
        <button
          type="button"
          onClick={handleSpeakCurrentPage}
          className={`btn btn-xs rounded-full min-h-[30px] px-2.5 font-bold gap-1 ${speechActive ? 'btn-error text-white animate-pulse' : 'btn-ghost'}`}
          aria-label="Read Page Out Loud Voice Assistant"
        >
          {speechActive ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{speechActive ? 'Stop Voice' : 'Read Aloud'}</span>
        </button>
      )}

    </aside>
  );
}
