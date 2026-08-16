import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function WelcomeLanguagePage() {
  const { user } = useAuth();
  const { language, setLanguage, languages, t } = useLanguage();
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState(language || 'en');

  const handleContinue = () => {
    setLanguage(selectedLang);
    localStorage.setItem('sh_language', selectedLang);

    if (user?.role === 'senior') {
      navigate('/senior/onboarding');
    } else if (user?.role === 'company') {
      navigate('/company');
    } else {
      navigate('/store');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="card bg-base-100 border border-base-300 shadow-2xl rounded-3xl max-w-2xl w-full p-6 sm:p-10 space-y-6 animate-in fade-in zoom-in duration-200">

        {/* Welcome Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Welcome to SilverHands
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-base-content tracking-tight">
            Welcome
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 max-w-md mx-auto">
            Choose your preferred language. SilverHands is fully localized to guide you in your mother tongue throughout your journey.
          </p>
        </div>

        {/* 11 Indian Languages Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {languages.map((l) => {
            const isSelected = selectedLang === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => setSelectedLang(l.code)}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-1.5 group ${isSelected
                    ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/20'
                    : 'border-base-300 bg-base-100 hover:border-primary/40 hover:bg-base-200/50'
                  }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg font-black text-base-content group-hover:text-primary transition-colors">
                    {l.native}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-primary fill-primary/20" />
                  )}
                </div>
                <span className="text-xs font-medium text-base-content/60">
                  {l.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="pt-4 border-t border-base-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-base-content/60 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span>You can change your language anytime from the top navigation bar.</span>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="btn btn-primary text-white rounded-2xl font-extrabold px-8 gap-2 shadow-lg w-full sm:w-auto"
          >
            Continue Journey <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
