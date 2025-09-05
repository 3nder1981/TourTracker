import React, { useState } from 'react';
import type { Band } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { StarIcon as StarSolid } from './icons/StarSolid';
import { StarIcon as StarOutline } from './icons/StarOutline';
import { XCircleIcon } from './icons/XCircleIcon';
import { FolderPlusIcon } from './icons/FolderPlusIcon';


interface LibraryManagerProps {
  bands: Band[];
  onAddBand: (name: string) => void;
  onRemoveBand: (name: string) => void;
  onToggleFavorite: (name: string) => void;
  onOpenImportModal: () => void;
}

const LibraryManager: React.FC<LibraryManagerProps> = ({ bands, onAddBand, onRemoveBand, onToggleFavorite, onOpenImportModal }) => {
  const [newBand, setNewBand] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBand(newBand.trim());
    setNewBand('');
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-lg shadow-md border border-slate-700">
      <h2 className="text-xl font-semibold text-slate-100 mb-4">{t('myMusicLibrary')}</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
        <input
          type="text"
          value={newBand}
          onChange={(e) => setNewBand(e.target.value)}
          placeholder={t('addBandPlaceholder')}
          className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
        />
        <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-md transition duration-200">
          {t('add')}
        </button>
      </form>
      <button 
        onClick={onOpenImportModal}
        className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-4 rounded-md transition duration-200 mb-4 text-sm"
      >
        <FolderPlusIcon className="w-5 h-5" />
        {t('addFromLibrary')}
      </button>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {bands.length > 0 ? (
          bands.map((band) => (
            <div key={band.name} className="flex items-center justify-between bg-slate-700/50 p-2 rounded-md group">
              <span className="text-slate-300">{band.name}</span>
              <div className="flex items-center gap-3">
                <button onClick={() => onToggleFavorite(band.name)} title={t('toggleFavorite')}>
                  {band.isFavorite ? <StarSolid className="w-5 h-5 text-yellow-400" /> : <StarOutline className="w-5 h-5 text-slate-400 group-hover:text-yellow-400 transition" />}
                </button>
                <button onClick={() => onRemoveBand(band.name)} title={t('removeBand')}>
                  <XCircleIcon className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-400 text-center py-4">{t('libraryEmpty')}</p>
        )}
      </div>
    </div>
  );
};

export default LibraryManager;