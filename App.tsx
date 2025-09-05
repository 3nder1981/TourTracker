import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Band, Concert } from './types';
import { fetchConcertsForBands } from './services/geminiService';
import useLocalStorage from './hooks/useLocalStorage';
import Header from './components/Header';
import LibraryManager from './components/LibraryManager';
import ConcertFilters from './components/ConcertFilters';
import ConcertList from './components/ConcertList';
import ImportModal from './components/ImportModal';
import { useLanguage } from './contexts/LanguageContext';

type FilterStatus = 'all' | 'favorites' | 'purchased';

const App: React.FC = () => {
  const [bands, setBands] = useLocalStorage<Band[]>('tourtracker-bands', []);
  const [allConcerts, setAllConcerts] = useLocalStorage<Concert[]>('tourtracker-concerts', []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Effect to schedule notifications
  useEffect(() => {
    const timeoutIds: NodeJS.Timeout[] = [];
    if (Notification.permission === 'granted') {
      allConcerts.forEach(concert => {
        if (concert.reminderDays !== null) {
          const concertDate = new Date(concert.date).getTime();
          const reminderTime = concertDate - concert.reminderDays * 24 * 60 * 60 * 1000;
          const now = Date.now();
          
          if (reminderTime > now) {
            const timeoutId = setTimeout(() => {
              new Notification(t('reminderNotificationTitle'), {
                body: t('reminderNotificationBody', { 
                  bandName: concert.bandName, 
                  days: concert.reminderDays 
                }),
              });
            }, reminderTime - now);
            timeoutIds.push(timeoutId);
          }
        }
      });
    }
    // Cleanup timeouts on unmount or when concerts change
    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, [allConcerts, t]);

  const getConcerts = useCallback(async () => {
    if (bands.length === 0) {
      setAllConcerts([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const bandNames = bands.map(b => b.name);
      const fetchedConcerts = await fetchConcertsForBands(bandNames);
      const concertsWithFavorites = fetchedConcerts.map(concert => ({
        ...concert,
        isFavorite: bands.find(b => b.name.toLowerCase() === concert.bandName.toLowerCase())?.isFavorite || false,
      }));
      setAllConcerts(concertsWithFavorites);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [bands, setAllConcerts]);

  useEffect(() => {
    getConcerts();
  }, [getConcerts]);

  const handleAddBand = (name: string) => {
    if (name && !bands.find(b => b.name.toLowerCase() === name.toLowerCase())) {
      setBands([...bands, { name, isFavorite: false }]);
    }
  };
  
  const handleAddBands = (names: string[]) => {
    const newBands = names
      .filter(name => name && !bands.some(b => b.name.toLowerCase() === name.toLowerCase()))
      .map(name => ({ name, isFavorite: false }));
    if (newBands.length > 0) {
      setBands([...bands, ...newBands]);
    }
  };

  const handleRemoveBand = (name: string) => {
    setBands(bands.filter(b => b.name !== name));
  };

  const handleToggleFavorite = (name: string) => {
    const lowerCaseName = name.toLowerCase();
    setBands(bands.map(b => b.name.toLowerCase() === lowerCaseName ? { ...b, isFavorite: !b.isFavorite } : b));
    setAllConcerts(allConcerts.map(c => c.bandName.toLowerCase() === lowerCaseName ? { ...c, isFavorite: !c.isFavorite } : c));
  };
  
  const handleSetReminder = (concertId: string, days: number | null) => {
    setAllConcerts(allConcerts.map(c => c.id === concertId ? { ...c, reminderDays: days } : c));
  };
  
  const handleToggleTicketPurchased = (concertId: string) => {
    setAllConcerts(allConcerts.map(c => c.id === concertId ? { ...c, ticketPurchased: !c.ticketPurchased } : c));
  };

  const availableCountries = useMemo(() => {
    const countries = new Set(allConcerts.map(c => c.country));
    return Array.from(countries).sort();
  }, [allConcerts]);

  const filteredConcerts = useMemo(() => {
    return allConcerts
      .filter(concert => {
        if (filterStatus === 'favorites') return concert.isFavorite;
        if (filterStatus === 'purchased') return concert.ticketPurchased;
        return true;
      })
      .filter(concert => !selectedCountry || concert.country === selectedCountry)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allConcerts, filterStatus, selectedCountry]);

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <LibraryManager
              bands={bands}
              onAddBand={handleAddBand}
              onRemoveBand={handleRemoveBand}
              onToggleFavorite={handleToggleFavorite}
              onOpenImportModal={() => setIsImportModalOpen(true)}
            />
            <ConcertFilters
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              availableCountries={availableCountries}
            />
          </div>
          <div className="lg:col-span-2">
            <ConcertList
              concerts={filteredConcerts}
              isLoading={isLoading}
              error={error}
              onSetReminder={handleSetReminder}
              onToggleTicketPurchased={handleToggleTicketPurchased}
            />
          </div>
        </div>
      </main>
      {isImportModalOpen && (
        <ImportModal 
          onClose={() => setIsImportModalOpen(false)}
          onAddBands={handleAddBands}
        />
      )}
    </div>
  );
};

export default App;
