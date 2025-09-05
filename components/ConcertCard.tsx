import React, { useState, useEffect, useRef } from 'react';
import type { Concert } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { StarIcon } from './icons/StarSolid';
import { BellIcon as BellOutline } from './icons/BellIcon';
import { TicketIcon as TicketOutline } from './icons/TicketIcon';


interface ConcertCardProps {
  concert: Concert;
  onSetReminder: (concertId: string, days: number | null) => void;
  onToggleTicketPurchased: (concertId: string) => void;
}

const ConcertCard: React.FC<ConcertCardProps> = ({ concert, onSetReminder, onToggleTicketPurchased }) => {
  const { id, bandName, date, city, country, venue, isFavorite, reminderDays, ticketPurchased } = concert;
  const { language, t } = useLanguage();
  const [isTicketsMenuOpen, setIsTicketsMenuOpen] = useState(false);
  const [isReminderMenuOpen, setIsReminderMenuOpen] = useState(false);

  const ticketsMenuRef = useRef<HTMLDivElement>(null);
  const reminderMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ticketsMenuRef.current && !ticketsMenuRef.current.contains(event.target as Node)) {
        setIsTicketsMenuOpen(false);
      }
      if (reminderMenuRef.current && !reminderMenuRef.current.contains(event.target as Node)) {
        setIsReminderMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const reminderOptions = [
    { label: t('reminder1day'), value: 1 },
    { label: t('reminder7days'), value: 7 },
    { label: t('reminder15days'), value: 15 },
    { label: t('reminder1month'), value: 30 },
  ];

  return (
    <div className={`bg-slate-800/50 p-4 sm:p-5 rounded-lg shadow-lg border-l-4 ${cardBorderClass} transition-all duration-300 hover:shadow-sky-500/10 hover:border-sky-500/80`}>
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {/* FIX: Wrapped StarIcon in a span and moved the 'title' prop to resolve a TypeScript error. */}
            {isFavorite && <span title={t('toggleFavorite')}><StarIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" /></span>}
            <h3 className="text-xl sm:text-2xl font-bold text-sky-400">{bandName}</h3>
          </div>
          <p className="text-slate-300 font-medium">{venue}</p>
          <p className="text-slate-400 text-sm">{`${city}, ${country}`}</p>
        </div>
        <div className="flex flex-col sm:items-end sm:text-right mt-2 sm:mt-0 flex-shrink-0">
          <p className="text-lg font-semibold text-slate-100">{formatDate(date)}</p>
          
          <div className="flex items-center gap-2 mt-2">
             <button onClick={() => onToggleTicketPurchased(id)} title={t('toggleTicketPurchased')} className="p-2 rounded-full hover:bg-slate-700 transition-colors w-10 h-10 flex justify-center items-center">
                {ticketPurchased 
                  ? <span className="text-xl" role="img" aria-label={t('ticketPurchasedLabel')}>🎟️</span>
                  : <TicketOutline className="w-6 h-6 text-slate-500" />
                }
            </button>

            <div ref={reminderMenuRef} className="relative">
                <button onClick={() => setIsReminderMenuOpen(prev => !prev)} title={t('setReminder')}  className="p-2 rounded-full hover:bg-slate-700 transition-colors w-10 h-10 flex justify-center items-center">
                    {reminderDays !== null 
                      ? <span className="text-xl" role="img" aria-label={t('reminderSetLabel')}>🔔</span>
                      : <BellOutline className="w-6 h-6 text-slate-500" />
                    }
                </button>
                {isReminderMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-slate-600">
                    <div className="py-1">
                      {reminderOptions.map(opt => (
                        <a href="#" onClick={(e) => { e.preventDefault(); onSetReminder(id, opt.value); setIsReminderMenuOpen(false); }} key={opt.value} className="block px-4 py-2 text-sm text-slate-200 hover:bg-sky-600 hover:text-white">{opt.label}</a>
                      ))}
                      <div className="border-t border-slate-600 my-1"></div>
                      <a href="#" onClick={(e) => { e.preventDefault(); onSetReminder(id, null); setIsReminderMenuOpen(false); }} className="block px-4 py-2 text-sm text-slate-200 hover:bg-sky-600 hover:text-white">{t('noReminder')}</a>
                    </div>
                  </div>
                )}
            </div>

            <div ref={ticketsMenuRef} className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setIsTicketsMenuOpen(prev => !prev)}
                className="inline-block bg-slate-700 hover:bg-slate-600 text-sky-300 font-bold py-2 px-4 rounded-md text-sm transition duration-200"
              >
                {t('findTickets')}
              </button>
              {isTicketsMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-slate-600">
                  <div className="py-1">
                    {vendors.map(vendor => (
                       <a
                         href={vendor.searchUrl(searchQuery)}
                         target="_blank"
                         rel="noopener noreferrer"
                         key={vendor.name}
                         className="block px-4 py-2 text-sm text-slate-200 hover:bg-sky-600 hover:text-white w-full text-left"
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
    </div>
  );
};

export default ConcertCard;