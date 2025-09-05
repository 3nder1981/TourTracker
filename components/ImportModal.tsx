import React, { useState, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { extractBandsFromText, extractBandsFromUrl } from '../services/geminiService';
import Spinner from './Spinner';
import { XCircleIcon } from './icons/XCircleIcon';
import { ClipboardPasteIcon } from './icons/ClipboardPasteIcon';
import { FolderPlusIcon } from './icons/FolderPlusIcon';
import { LinkIcon } from './icons/LinkIcon';

interface ImportModalProps {
  onClose: () => void;
  onAddBands: (names: string[]) => void;
}

type View = 'options' | 'loading' | 'results';
type ImportMethod = 'text' | 'folder' | 'url';

const ImportModal: React.FC<ImportModalProps> = ({ onClose, onAddBands }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ImportMethod>('text');
  const [view, setView] = useState<View>('options');
  
  const [libraryText, setLibraryText] = useState('');
  const [libraryUrl, setLibraryUrl] = useState('');
  const [foundBands, setFoundBands] = useState<string[]>([]);
  const [selectedBands, setSelectedBands] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleTextImport = async () => {
    if (!libraryText.trim()) return;
    setView('loading');
    setError(null);
    try {
      const bands = await extractBandsFromText(libraryText);
      if (bands.length === 0) {
        setError(t('extractionError'));
        setView('options');
        return;
      }
      setFoundBands(bands);
      setSelectedBands(new Set(bands));
      setView('results');
    } catch (err) {
      console.error(err);
      setError(t('extractionError'));
      setView('options');
    }
  };

  const handleUrlImport = async () => {
    if (!libraryUrl.trim()) return;
    setView('loading');
    setError(null);
    try {
        const bands = await extractBandsFromUrl(libraryUrl);
        if (bands.length === 0) {
            setError(t('urlError'));
            setView('options');
            return;
        }
        setFoundBands(bands);
        setSelectedBands(new Set(bands));
        setView('results');
    } catch (err) {
        console.error(err);
        setError(t('urlError'));
        setView('options');
    }
  };

  const handleFolderImport = async () => {
    // @ts-ignore
    if (!window.showDirectoryPicker) {
      setError(t('directoryPickerError'));
      return;
    }
    setView('loading');
    setError(null);
    try {
      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker();
      const bands = new Set<string>();
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'directory') {
          bands.add(entry.name);
        }
      }
      const bandArray = Array.from(bands);
      if (bandArray.length === 0) {
         setView('options');
         return;
      }
      setFoundBands(bandArray);
      setSelectedBands(new Set(bandArray));
      setView('results');
    } catch (err) {
      console.error(err);
      setError(t('directoryPickerError'));
      setView('options');
    }
  };

  const handleSelectionChange = (bandName: string) => {
    setSelectedBands(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bandName)) {
        newSet.delete(bandName);
      } else {
        newSet.add(bandName);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => setSelectedBands(new Set(foundBands));
  const handleDeselectAll = () => setSelectedBands(new Set());
  
  const handleAddSelected = () => {
    onAddBands(Array.from(selectedBands));
    onClose();
  };
  
  const getLoadingMessage = () => {
    switch (activeTab) {
        case 'text': return t('processing');
        case 'folder': return t('scanning');
        case 'url': return t('analyzingUrl');
        default: return t('processing');
    }
  }
  
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center p-8 h-64">
        <Spinner />
        <p className="mt-4 text-slate-300">
            {getLoadingMessage()}
        </p>
    </div>
  );

  const renderResults = () => (
    <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-3">{t('bandsFound')}</h3>
        <div className="flex gap-2 mb-3">
            <button onClick={handleSelectAll} className="text-xs bg-slate-600 hover:bg-slate-500 px-2 py-1 rounded">{t('selectAll')}</button>
            <button onClick={handleDeselectAll} className="text-xs bg-slate-600 hover:bg-slate-500 px-2 py-1 rounded">{t('deselectAll')}</button>
        </div>
        <div className="max-h-60 overflow-y-auto space-y-2 bg-slate-900/50 p-3 rounded-md border border-slate-700">
            {foundBands.map(band => (
                <label key={band} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-700/50 cursor-pointer">
                    <input 
                        type="checkbox"
                        checked={selectedBands.has(band)}
                        onChange={() => handleSelectionChange(band)}
                        className="w-4 h-4 bg-slate-600 border-slate-500 rounded text-sky-500 focus:ring-sky-600"
                    />
                    <span className="text-slate-300">{band}</span>
                </label>
            ))}
        </div>
        <button onClick={handleAddSelected} className="mt-4 w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-md transition">
            {t('addSelectedToLibrary')} ({selectedBands.size})
        </button>
    </div>
  );

  const renderOptions = () => (
    <>
        <div className="flex border-b border-slate-700">
            <TabButton icon={<ClipboardPasteIcon />} text={t('pasteFromText')} isActive={activeTab === 'text'} onClick={() => setActiveTab('text')} />
            <TabButton icon={<LinkIcon />} text={t('importFromUrl')} isActive={activeTab === 'url'} onClick={() => setActiveTab('url')} />
            <TabButton icon={<FolderPlusIcon />} text={t('scanLocalFolder')} isActive={activeTab === 'folder'} onClick={() => setActiveTab('folder')} />
        </div>

        <div className="p-6">
            {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md mb-4 text-sm">{error}</p>}
            {activeTab === 'text' && (
                <div className="space-y-4">
                    <p className="text-sm text-slate-400">{t('pasteInstructions')}</p>
                    <textarea 
                        value={libraryText}
                        onChange={(e) => setLibraryText(e.target.value)}
                        rows={8}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button onClick={handleTextImport} disabled={!libraryText.trim()} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition disabled:bg-indigo-800 disabled:cursor-not-allowed">
                        {t('processText')}
                    </button>
                </div>
            )}
            {activeTab === 'url' && (
                <div className="space-y-4">
                    <p className="text-sm text-slate-400">{t('urlInstructions')}</p>
                    <input 
                        type="url"
                        value={libraryUrl}
                        onChange={(e) => setLibraryUrl(e.target.value)}
                        placeholder="https://music.apple.com/..."
                        className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button onClick={handleUrlImport} disabled={!libraryUrl.trim()} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition disabled:bg-indigo-800 disabled:cursor-not-allowed">
                        {t('processUrl')}
                    </button>
                </div>
            )}
            {activeTab === 'folder' && (
                 <div className="space-y-4 text-center">
                    <p className="text-sm text-slate-400">{t('scanInstructions')}</p>
                    <button onClick={handleFolderImport} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition">
                       {t('scanFolderButton')}
                    </button>
                </div>
            )}
        </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <header className="flex justify-between items-center p-4 border-b border-slate-700">
                <h2 className="text-xl font-semibold text-slate-100">{t('importBandsTitle')}</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-white">
                    <XCircleIcon className="w-7 h-7" />
                </button>
            </header>
            
            {view === 'options' && renderOptions()}
            {view === 'loading' && renderLoading()}
            {view === 'results' && renderResults()}
        </div>
    </div>
  );
};

const TabButton: React.FC<{icon: React.ReactNode, text: string, isActive: boolean, onClick: () => void}> = ({ icon, text, isActive, onClick }) => (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 p-4 text-sm font-medium transition-colors ${isActive ? 'bg-slate-800 text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:bg-slate-700/50'}`}>
        <div className="w-5 h-5">{icon}</div>
        {text}
    </button>
);


export default ImportModal;