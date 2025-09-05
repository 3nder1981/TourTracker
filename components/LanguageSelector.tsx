import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const getButtonClass = (lang: 'es' | 'ca') => {
    const baseClass = "px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200";
    if (language === lang) {
      return `${baseClass} bg-sky-600 text-white`;
    }
    return `${baseClass} bg-slate-700/50 text-slate-300 hover:bg-slate-600/50`;
  };

  return (
    <div className="flex items-center space-x-2 bg-slate-800/60 p-1 rounded-lg">
      <button onClick={() => setLanguage('es')} className={getButtonClass('es')}>
        ES
      </button>
      <button onClick={() => setLanguage('ca')} className={getButtonClass('ca')}>
        CA
      </button>
    </div>
  );
};

export default LanguageSelector;
