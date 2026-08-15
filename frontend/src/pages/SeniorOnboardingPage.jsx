import React from 'react';
import { Mic, Sparkles } from 'lucide-react';

export default function SeniorOnboardingPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content">Tell Us Your Story</h1>
        <p className="text-sm text-base-content/70">
          Speak naturally in your preferred language. Our AI will discover your practical skills and match you with local opportunities.
        </p>
      </div>
      <div className="p-8 text-center bg-base-100 rounded-2xl border border-base-300">
        <Mic className="w-12 h-12 text-primary mx-auto mb-3" />
        <h3 className="font-bold text-lg">Life-to-Skill Voice Module</h3>
        <p className="text-xs text-base-content/70">Connecting multilingual speech recognition & AI extraction...</p>
      </div>
    </div>
  );
}
