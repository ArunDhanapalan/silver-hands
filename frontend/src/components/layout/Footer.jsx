import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-base-100 border-t border-base-300 py-6 pb-20 md:pb-6 text-center text-xs sm:text-sm text-base-content/70 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-1.5 font-medium">
        <span>Made with</span>
        <span className="text-error animate-pulse">❤️</span>
        <span>by <strong>Team Turing</strong> for <strong>Hexaware Mavericks Hackathon 2026</strong></span>
      </div>
    </footer>
  );
}
