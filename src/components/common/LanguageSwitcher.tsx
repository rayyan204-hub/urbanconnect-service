import { useState, useRef, useEffect } from 'react';
import { useLanguage, LanguageCode } from '../../context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

export interface LanguageSwitcherProps {
  variant?: 'pill' | 'segmented' | 'dropdown' | 'modal';
  className?: string;
  showLabel?: boolean;
  onLanguageChanged?: (lang: LanguageCode) => void;
}

export function LanguageSwitcher({
  variant = 'pill',
  className = '',
  showLabel = false,
  onLanguageChanged,
}: LanguageSwitcherProps) {
  const { language, setLanguage, languages, currentLanguageInfo, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle language switch
  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
    if (onLanguageChanged) {
      onLanguageChanged(code);
    }
  };

  // Variant 1: Segmented 3-Way Button Group (e.g. for Settings & Modals)
  if (variant === 'segmented') {
    return (
      <div
        id="language-switcher-segmented"
        className={`inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xs ${className}`}
        role="group"
        aria-label="Language selection"
      >
        {languages.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              id={`btn-lang-segmented-${lang.code}`}
              type="button"
              onClick={() => handleSelectLanguage(lang.code)}
              aria-pressed={isActive}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <span className="font-extrabold text-[11px] font-mono tracking-tight uppercase">
                {lang.badge}
              </span>
              <span>{lang.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Variant 2: Full List Modal Cards (Used in Profile Modal)
  if (variant === 'modal') {
    return (
      <div id="language-switcher-modal-cards" className={`space-y-2 ${className}`}>
        {languages.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              id={`btn-lang-modal-${lang.code}`}
              type="button"
              onClick={() => handleSelectLanguage(lang.code)}
              aria-pressed={isActive}
              className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between border ${
                isActive
                  ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200 shadow-2xs'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs font-mono transition-colors ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {lang.badge}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                      {lang.name}
                    </span>
                    {lang.code !== 'en' && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        ({lang.englishName})
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {lang.description}
                  </span>
                </div>
              </div>

              {isActive && (
                <div className="p-1 rounded-full bg-teal-600 text-white shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Variant 3: Compact Pill with Dropdown (Default for Top Bar & Headers)
  return (
    <div
      ref={containerRef}
      id="language-switcher-container"
      className={`relative inline-block text-left ${className}`}
    >
      <button
        id="btn-language-switcher-pill"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Current language: ${currentLanguageInfo.name}. Click to change language.`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 border border-slate-200/80 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs"
        title="Change Language (English / मराठी / हिंदी)"
      >
        <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
        <span className="font-extrabold text-[11px] font-mono tracking-tight text-teal-800 dark:text-teal-300">
          {currentLanguageInfo.badge}
        </span>
        {showLabel && (
          <span className="hidden sm:inline text-xs font-semibold">
            {currentLanguageInfo.name}
          </span>
        )}
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="language-switcher-dropdown"
          className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t('lang_select_title', 'Select Language')}
            </span>
            <span className="text-[9px] font-mono font-bold text-teal-600 dark:text-teal-400">
              3 Langs
            </span>
          </div>

          <div className="p-1 space-y-0.5">
            {languages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  id={`dropdown-lang-item-${lang.code}`}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  role="menuitem"
                  className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[10px] font-black ${
                        isSelected
                          ? 'bg-teal-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {lang.badge}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold">{lang.name}</span>
                        {lang.code !== 'en' && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({lang.englishName})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="px-3 pt-1 pb-0.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
            {t('lang_hint', 'Instant update across screens')}
          </div>
        </div>
      )}
    </div>
  );
}
