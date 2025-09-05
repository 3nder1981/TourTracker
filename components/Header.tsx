import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';

const Header: React.FC = () => {
  const { t } = useLanguage();

  return (
    <header className="bg-slate-950/50 backdrop-blur-sm border-b border-slate-700/50 p-4 shadow-lg sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
            {t('appTitle')}
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            {t('appSubtitle')}
          </p>
        </div>
        <LanguageSelector />
      </div>
    </header>
  );
};

export default Header;