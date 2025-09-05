import React from 'react';
import type { Concert } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import ConcertCard from './ConcertCard';
import Spinner from './Spinner';

interface ConcertListProps {
  concerts: Concert[];
  isLoading: boolean;
  error: string | null;
  onSetReminder: (concertId: string, days: number | null) => void;
  onToggleTicketPurchased: (concertId: string) => void;
}

const ConcertList: React.FC<ConcertListProps> = ({ concerts, isLoading, error, onSetReminder, onToggleTicketPurchased }) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-slate-800/30 rounded-lg">
        <Spinner />
        <p className="mt-4 text-slate-300">{t('scanningDates')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-red-900/20 border border-red-500/50 text-red-300 p-6 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-semibold mb-2">{t('errorTitle')}</h3>
        <p className="text-center">{t(error)}</p>
      </div>
    );
  }

  if (concerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-slate-800/30 rounded-lg p-6">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <h3 className="text-xl font-semibold text-slate-300 mb-2">{t('noConcertsTitle')}</h3>
        <p className="text-slate-400 text-center">{t('noConcertsMessage')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {concerts.map((concert) => (
        <ConcertCard 
          key={concert.id} 
          concert={concert}
          onSetReminder={onSetReminder}
          onToggleTicketPurchased={onToggleTicketPurchased}
        />
      ))}
    </div>
  );
};

export default ConcertList;
