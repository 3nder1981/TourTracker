import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Band } from '../types';

interface ConcertFiltersProps {
  bands: Band[];
  showFavorites: boolean;
  setShowFavorites: (show: boolean) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  availableCountries: string[];
}

const ConcertFilters: React.FC<ConcertFiltersProps> = ({
  showFavorites,
  setShowFavorites,
  selectedCountry,
  setSelectedCountry,
  availableCountries,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-slate-800/50 p-4 rounded-lg shadow-md border border-slate-700 flex flex-col sm:flex-row gap-4 items-center">
      <div className="flex-shrink-0">
        <span className="text-sm font-medium text-slate-300 mr-2">{t('filterBy')}:</span>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setShowFavorites(false)}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
              !showFavorites
                ? 'bg-sky-600 text-white border border-sky-600'
                : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
            }`}
          >
            {t('allBands')}
          </button>
          <button
            type="button"
            onClick={() => setShowFavorites(true)}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
              showFavorites
                ? 'bg-sky-600 text-white border border-sky-600'
                : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
            }`}
          >
            {t('favoritesOnly')}
          </button>
        </div>
      </div>
      <div className="w-full sm:w-auto sm:flex-grow">
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          aria-label={t('filterByCountry')}
        >
          <option value="">{t('allCountries')}</option>
          {availableCountries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ConcertFilters;
