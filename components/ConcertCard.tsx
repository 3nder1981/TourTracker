import React, { useState, useEffect, useRef } from 'react';
import type { Concert } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { StarIcon } from './icons/StarSolid';

interface ConcertCardProps {
  concert: Concert;
}

const ConcertCard: React.FC<ConcertCardProps> = ({ concert }) => {
  const { bandName, date, city, country, venue, isFavorite } = concert;
  const { language, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const formatDate = (isoDate: string) => {
    const locale = language === 'ca' ? 'ca-ES' : 'es-ES';
    return new Date(isoDate).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const cardBorderClass = isFavorite 
    ? 'border-yellow-400/50' 
    : 'border-slate-700';

  const vendors = [
    { name: 'Live Nation', searchUrl: (query: string) => `https://www.livenation.es/search?keyword=${query}` },
    { name: 'El Corte Inglés', searchUrl: (query: string) => `https://www.elcorteingles.es/entradas/search/?q=${query}` },
    { name: 'Entradas.com', searchUrl: (query: string) => `https://www.entradas.com/search/?search_string=${query}` },
    { name: 'Ticketmaster', searchUrl: (query: string) => `https://www.ticketmaster.es/search?keyword=${query}` }
  ];

  const searchQuery = encodeURIComponent(`${bandName} ${city}`);

  return (
    <div className={`bg-slate-800/50 p-4 sm:p-5 rounded-lg shadow-lg border-l-4 ${cardBorderClass} transition-all duration-300 hover:shadow-sky-500/10 hover:border-sky-500/80`}>
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {isFavorite && <StarIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />}
            <h3 className="text-xl sm:text-2xl font-bold text-sky-400">{bandName}</h3>
          </div>
          <p className="text-slate-300 font-medium">{venue}</p>
          <p className="text-slate-400 text-sm">{`${city}, ${country}`}</p>
        </div>
        <div className="flex flex-col sm:items-end sm:text-right mt-2 sm:mt-0 flex-shrink-0">
          <p className="text-lg font-semibold text-slate-100">{formatDate(date)}</p>
          
          <div ref={menuRef} className="relative inline-block text-left mt-2">
            <div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="inline-block bg-slate-700 hover:bg-slate-600 text-sky-300 font-bold py-2 px-4 rounded-md text-sm transition duration-200"
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
              >
                {t('findTickets')}
              </button>
            </div>

            {isMenuOpen && (
              <div
                className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-slate-600"
                role="menu"
                aria-orientation="vertical"
              >
                <div className="py-1" role="none">
                  {vendors.map(vendor => (
                     <a
                       href={vendor.searchUrl(searchQuery)}
                       target="_blank"
                       rel="noopener noreferrer"
                       key={vendor.name}
                       className="block px-4 py-2 text-sm text-slate-200 hover:bg-sky-600 hover:text-white w-full text-left"
                       role="menuitem"
                     >
                       {`${language === 'ca' ? 'Cercar a' : 'Buscar en'} ${vendor.name}`}
                     </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcertCard;