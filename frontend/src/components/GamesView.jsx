import { Search, Plus, Gamepad2 } from 'lucide-react';
import { STATUSES, PROTECTED_TITLES } from '../constants';
import IconBtn from './IconBtn';
import GameCard from './GameCard';
import MultiSelectBar from './MultiSelectBar';
import LoadingDots from './LoadingDots';

const GamesView = ({
  games,
  categories,
  gameCategoryIds,
  isLoading,
  selectMode,
  selectedIds,
  librarySearch,
  showLibrarySearch,
  activeTab,
  onSetActiveTab,
  onSetLibrarySearch,
  onToggleLibrarySearch,
  onOpenSearch,
  onStatusChange,
  onRatingChange,
  onShare,
  onInfo,
  onGameLongPress,
  onToggleSelect,
  onDeleteSelected,
  onTag,
  onCancelSelect,
}) => {
  const tabs = [
    { id: 'all', label: 'All', count: games.length },
    ...STATUSES.map((s) => ({ id: s.id, label: s.label, count: games.filter((g) => g.status === s.id).length })),
  ];

  const sorted = [...games].sort((a, b) => {
    const order = { beaten: 0, playing: 1, 'to-play': 2 };
    if (a.status !== b.status) return (order[a.status] ?? 9) - (order[b.status] ?? 9);
    if (a.status === 'beaten') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  const q = librarySearch.toLowerCase();
  const filtered = sorted.filter((g) =>
    ((g.title ?? '').toLowerCase().includes(q) || (g.genre ?? '').toLowerCase().includes(q)) &&
    (activeTab === 'all' || g.status === activeTab)
  );

  const deletableCount = filtered.filter((g) => !PROTECTED_TITLES.has((g.title ?? '').toLowerCase().trim())).length;

  return (
    <>
      <div className="sticky top-0 z-10 bg-[#0B0B0C]/95 backdrop-blur-sm px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white font-bold text-xl tracking-tight">Absolute</h1>
          <div className="flex items-center gap-2">
            <IconBtn onClick={onToggleLibrarySearch} active={showLibrarySearch}>
              <Search size={18} />
            </IconBtn>
            <button
              onClick={onOpenSearch}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#635BFF] text-white active:scale-90 active:brightness-90 transition-all"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {showLibrarySearch && (
          <div className="relative mb-2 gt-slidedwn">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
            <input
              type="text"
              placeholder="Search library…"
              value={librarySearch}
              onChange={(e) => onSetLibrarySearch(e.target.value)}
              className="w-full h-10 bg-[#1C1C1F] text-zinc-200 pl-9 pr-4 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#635BFF] placeholder-zinc-700"
            />
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSetActiveTab(tab.id)}
              className={`shrink-0 h-8 px-3 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                activeTab === tab.id ? 'bg-[#635BFF] text-white' : 'bg-[#1C1C1F] text-zinc-500'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 ${activeTab === tab.id ? 'text-indigo-200' : 'text-zinc-700'}`}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3 pb-28 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-16">
            <LoadingDots size="lg" />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((game, i) => (
            <div key={game.id} className="gt-slideup" style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}>
              <GameCard
                game={game}
                assignedCats={(gameCategoryIds[String(game.id)] ?? []).map((id) => categories.find((c) => c.id === id)).filter(Boolean)}
                onStatusChange={onStatusChange}
                onRatingChange={onRatingChange}
                onShare={onShare}
                onInfo={onInfo}
                onDelete={onGameLongPress}
                selectMode={selectMode}
                isSelected={selectedIds.has(game.id)}
                onSelect={onToggleSelect}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16 gt-fadein">
            <Gamepad2 size={40} className="text-zinc-800 mx-auto mb-3" />
            <p className="text-zinc-600 text-sm">No games here yet</p>
            {activeTab !== 'all' && (
              <button onClick={() => onSetActiveTab('all')} className="text-[#635BFF] text-xs mt-2">
                Show all
              </button>
            )}
          </div>
        )}
      </div>

      {selectMode && (
        <MultiSelectBar
          count={[...selectedIds].length}
          total={deletableCount}
          onDelete={onDeleteSelected}
          onTag={onTag}
          onCancel={onCancelSelect}
          bottom="bottom-20"
        />
      )}
    </>
  );
};

export default GamesView;
