import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ConcertFiltersProps {
  countries: string[];
  countryFilter: string;
  setCountryFilter: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const FilterSelect: React.FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
}> = ({ label, value, onChange, children }) => (
    <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
        <select
            value={value}
            onChange={onChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
        >
            {children}
        </select>
    </div>
);


const ConcertFilters: React.FC<ConcertFiltersProps> = ({ 
    countries, 
    countryFilter, 
    setCountryFilter, 
    dateFilter, 
    setDateFilter,
    onRefresh,
    isLoading 
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-slate-800/50 p-6 rounded-lg shadow-md border border-slate-700">
      <h2 className="text-xl font-semibold text-slate-100 mb-4">{t('filtersAndActions')}</h2>
      <div className="space-y-4">
        <FilterSelect label={t('filterByStatus')} value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <option value="all">{t('allUpcoming')}</option>
            <option value="favorites">{t('favoritesOnly')}</option>
            <option value="30days">{t('next30Days')}</option>
            <option value="90days">{t('next90Days')}</option>
        </FilterSelect>

        <FilterSelect label={t('filterByCountry')} value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
          <option value="all">{t('allCountries')}</option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </FilterSelect>

        <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:bg-indigo-800 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('checkingShows')}
                </>
            ) : (
                t('refreshConcerts')
            )}
        </button>
      </div>
    </div>
  );
};

export default ConcertFilters;