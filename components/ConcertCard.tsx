import React from 'react';
import type { Concert } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { StarIcon } from './icons/StarSolid';

interface ConcertCardProps {
  concert: Concert;
}

const ConcertCard: React.FC<ConcertCardProps> = ({ concert }) => {
  const { bandName, date, city, country, venue, ticketUrl, isFavorite } = concert;
  const { language, t } = useLanguage();

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
          <a
            href={ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block bg-slate-700 hover:bg-slate-600 text-sky-300 font-bold py-2 px-4 rounded-md text-sm transition duration-200"
          >
            {t('findTickets')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ConcertCard;