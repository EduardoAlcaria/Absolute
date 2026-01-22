import { useState, useRef, useEffect } from 'react';
import { Search, X, Info, Gamepad2 } from 'lucide-react';
import IconBtn from './IconBtn';
import InfoModal from './InfoModal';
import CategoryAssignSheet from './CategoryAssignSheet';

const API_URL = 'http://127.0.0.1:8000';

const searchGames = async (query) => {
  const res = await fetch(`${API_URL}/games/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return res.json();
};

const SearchPage = ({ onClose, onAddGame, onAssignCategories, categories = [], existingIgdbIds = new Set() }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());
  const [infoGame, setInfoGame] = useState(null);
  const [pickCatGame, setPickCatGame] = useState(null);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setSuggestions([]); setNoResults(false); return; }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const list = await searchGames(val);
        setSuggestions(list);
        setNoResults(list.length === 0);
      } catch {
        setSuggestions([]);
        setNoResults(false);
      }
      setIsSearching(false);
    }, 500);
  };

  const handleAdd = async (game) => {
    setAddedIds((prev) => new Set(prev).add(game.id));
    const saved = await onAddGame(game);
    if (categories.length > 0) setPickCatGame({ ...game, savedId: saved?.id });
  };

  const handleClose = () => {
    if (inputRef.current) inputRef.current.value = '';
    setSuggestions([]);
    setNoResults(false);
    setAddedIds(new Set());
    onClose();
  };

  return (
    <div className="flex flex-col bg-[#0B0B0C]" style={{ minHeight: '100dvh' }}>
      {pickCatGame && categories.length > 0 && (
        <CategoryAssignSheet
          categories={categories}
          gameIds={pickCatGame.savedId ? [pickCatGame.savedId] : []}
          gameCategoryIds={{}}
          onApply={(catIds) => { if (pickCatGame.savedId) onAssignCategories?.(pickCatGame.savedId, catIds); }}
          onClose={() => setPickCatGame(null)}
        />
      )}

      {infoGame && (
        <InfoModal
          game={{ igdb_id: infoGame.id, title: infoGame.name, image: infoGame.cover_url, genre: infoGame.genre }}
          onClose={() => setInfoGame(null)}
        />
      )}

      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              {[0, 0.15, 0.3].map((d, i) => (
                <div key={i} className="w-1 h-1 bg-[#635BFF] rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
          )}
          <input
            ref={inputRef}
            type="text"
            inputMode="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="Search games…"
            onInput={handleInput}
            className="w-full h-12 bg-[#1C1C1F] text-white pl-10 pr-10 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-[#635BFF] placeholder-zinc-600"
          />
        </div>
        <IconBtn onClick={handleClose}><X size={18} /></IconBtn>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-4">
        {suggestions.length > 0 && (
          <div className="bg-[#151517] rounded-2xl overflow-hidden">
            {suggestions.map((game, i) => {
              const added = addedIds.has(game.id);
              const owned = existingIgdbIds.has(game.id);
              return (
                <div
                  key={game.id}
                  className={`flex items-center gap-3 px-3 py-2.5 active:bg-[#1C1C1F] transition-colors ${i > 0 ? 'border-t border-[#1C1C1F]' : ''}`}
                >
                  <div className="w-20 h-12 rounded-xl overflow-hidden shrink-0 bg-[#1C1C1F]">
                    {game.cover_url
                      ? <img src={game.cover_url} alt={game.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Gamepad2 size={16} className="text-zinc-700" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{game.name}</p>
                    {game.genre && <p className="text-zinc-500 text-xs mt-0.5 truncate">{game.genre}</p>}
                  </div>
                  <button
                    onClick={() => setInfoGame(game)}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-[#1C1C1F] text-zinc-400 active:scale-95 transition-all"
                  >
                    <Info size={14} />
                  </button>
                  <button
                    onClick={() => !owned && handleAdd(game)}
                    disabled={added || owned}
                    className={`shrink-0 h-8 px-3 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                      added ? 'bg-emerald-500/20 text-emerald-400'
                      : owned ? 'bg-[#2C2C30] text-zinc-600 cursor-default'
                      : 'bg-[#635BFF] text-white'
                    }`}
                  >
                    {added ? '✓' : owned ? 'Owned' : 'Add'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {!isSearching && noResults && (
          <p className="text-zinc-600 text-sm text-center pt-8">No results found</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
