import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-base-100 border-t border-base-300 py-4 pb-20 md:pb-4 text-center text-[11px] sm:text-xs text-base-content/70 mt-auto overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-1.5 font-medium whitespace-nowrap">
        <span>Made with</span>
        <span className="text-error">❤️</span>
        <span>by <strong>Team Turing</strong> for <strong>Hexaware Mavericks Hackathon 2026</strong></span>
      </div>
    </footer>
  );
}
