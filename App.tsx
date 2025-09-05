import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Band, Concert } from './types';
import { fetchConcertsForBands } from './services/geminiService';
import Header from './components/Header';
import LibraryManager from './components/LibraryManager';
import ConcertFilters from './components/ConcertFilters';
import ConcertList from './components/ConcertList';
import ImportModal from './components/ImportModal';

const INITIAL_BANDS: Band[] = [
  { name: 'Radiohead', isFavorite: true },
  { name: 'Tame Impala', isFavorite: false },
  { name: 'Arctic Monkeys', isFavorite: true },
  { name: 'The Strokes', isFavorite: false },
];

const App: React.FC = () => {
  const [bands, setBands] = useState<Band[]>(INITIAL_BANDS);
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const getConcerts = useCallback(async () => {
    if (bands.length === 0) {
      setConcerts([]);
      setIsLoading(false);
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

      setConcerts(concertsWithFavorites);
    } catch (err) {
      console.error(err);
      setError('fetchError');
    } finally {
      setIsLoading(false);
    }
  }, [bands]);

  useEffect(() => {
    getConcerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bands]);

  const uniqueCountries = useMemo(() => {
    const countries = new Set(concerts.map(c => c.country));
    return Array.from(countries).sort();
  }, [concerts]);

  const filteredConcerts = useMemo(() => {
    return concerts
      .filter(concert => {
        if (countryFilter === 'all') return true;
        return concert.country === countryFilter;
      })
      .filter(concert => {
        if (dateFilter === 'all') return true;
        const concertDate = new Date(concert.date);
        const now = new Date();
        const futureDate = new Date();
        
        if (dateFilter === '30days') {
          futureDate.setDate(now.getDate() + 30);
        } else if (dateFilter === '90days') {
          futureDate.setDate(now.getDate() + 90);
        } else if (dateFilter === 'favorites') {
          return concert.isFavorite;
        }
        
        if (dateFilter !== 'favorites') {
            return concertDate >= now && concertDate <= futureDate;
        }
        return true;

      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [concerts, countryFilter, dateFilter]);

  const addBand = (name: string) => {
    if (name && !bands.some(b => b.name.toLowerCase() === name.toLowerCase())) {
      setBands(prev => [...prev, { name, isFavorite: false }]);
    }
  };

  const addBands = (names: string[]) => {
    const newBands = names
      .filter(name => name && !bands.some(b => b.name.toLowerCase() === name.toLowerCase()))
      .map(name => ({ name, isFavorite: false }));
    
    if (newBands.length > 0) {
      setBands(prev => [...prev, ...newBands]);
    }
  };

  const removeBand = (name: string) => {
    setBands(prev => prev.filter(b => b.name.toLowerCase() !== name.toLowerCase()));
  };

  const toggleFavorite = (name: string) => {
    setBands(prev => 
      prev.map(b => 
        b.name.toLowerCase() === name.toLowerCase() ? { ...b, isFavorite: !b.isFavorite } : b
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1 space-y-8">
            <LibraryManager 
              bands={bands} 
              onAddBand={addBand} 
              onRemoveBand={removeBand} 
              onToggleFavorite={toggleFavorite}
              onOpenImportModal={() => setIsImportModalOpen(true)}
            />
            <ConcertFilters 
              countries={uniqueCountries}
              countryFilter={countryFilter}
              setCountryFilter={setCountryFilter}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              onRefresh={getConcerts}
              isLoading={isLoading}
            />
          </aside>
          <div className="lg:col-span-2">
            <ConcertList 
              concerts={filteredConcerts} 
              isLoading={isLoading} 
              error={error} 
            />
          </div>
        </div>
      </main>
      {isImportModalOpen && (
        <ImportModal 
          onClose={() => setIsImportModalOpen(false)}
          onAddBands={addBands}
        />
      )}
    </div>
  );
};

export default App;