import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Band, Concert } from './types';
import { fetchConcertsForBands } from './services/geminiService';
import useLocalStorage from './hooks/useLocalStorage';
import Header from './components/Header';
import LibraryManager from './components/LibraryManager';
import ConcertFilters from './components/ConcertFilters';
import ConcertList from './components/ConcertList';
import ImportModal from './components/ImportModal';

const App: React.FC = () => {
  const [bands, setBands] = useLocalStorage<Band[]>('tourtracker-bands', []);
  const [allConcerts, setAllConcerts] = useState<Concert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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
        isFavorite: bands.find(b => b.name === concert.bandName)?.isFavorite || false,
      }));
      setAllConcerts(concertsWithFavorites);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [bands]);

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
    setBands(bands.map(b => b.name === name ? { ...b, isFavorite: !b.isFavorite } : b));
  };
  
  const availableCountries = useMemo(() => {
    const countries = new Set(allConcerts.map(c => c.country));
    return Array.from(countries).sort();
  }, [allConcerts]);

  const filteredConcerts = useMemo(() => {
    return allConcerts
      .filter(concert => !showFavorites || concert.isFavorite)
      .filter(concert => !selectedCountry || concert.country === selectedCountry)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allConcerts, showFavorites, selectedCountry]);

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
              bands={bands}
              showFavorites={showFavorites}
              setShowFavorites={setShowFavorites}
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
