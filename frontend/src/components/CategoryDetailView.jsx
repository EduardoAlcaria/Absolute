import { Star, Gamepad2, Tag, ChevronLeft } from 'lucide-react';
import { STATUSES, CAT_BANNER_GRADIENTS } from '../constants';
import useSwipe from '../hooks/useSwipe';

const CategoryDetailView = ({ category, games, gameCategoryIds, catBanners, onStatusChange, onBack }) => {
  const assignedGames = games.filter((g) => (gameCategoryIds[String(g.id)] ?? []).includes(category.id));
  const banner = catBanners?.[category.id];
  const fallback = CAT_BANNER_GRADIENTS[0];
  const swipe = useSwipe({ onDown: onBack });

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh' }} {...swipe}>
      <div className={`relative h-40 w-full ${!banner ? `bg-gradient-to-r ${fallback}` : ''}`}>
        {banner && <img src={banner} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-9 h-9 bg-black/50 rounded-xl flex items-center justify-center active:scale-90 transition-transform z-10"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-2 mb-0.5">
            <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${category.color}`} />
            <h1 className="text-white font-bold text-xl">{category.label}</h1>
          </div>
          <p className="text-white/60 text-xs">{assignedGames.length} game{assignedGames.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 pt-4 pb-28">
        {assignedGames.length === 0 ? (
          <div className="text-center py-16 gt-fadein">
            <Tag size={36} className="text-zinc-800 mx-auto mb-3" />
            <p className="text-zinc-600 text-sm">No games tagged with this category yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignedGames.map((game) => {
              const status = STATUSES.find((s) => s.id === game.status) ?? STATUSES[0];
              return (
                <div key={game.id} className="bg-[#151517] rounded-2xl flex items-center gap-3 p-3">
                  {game.image ? (
                    <img src={game.image} alt={game.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#1C1C1F] flex items-center justify-center shrink-0">
                      <Gamepad2 size={20} className="text-zinc-700" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{game.title}</p>
                    {game.genre && <p className="text-zinc-500 text-xs mt-0.5 truncate">{game.genre}</p>}
                    {game.status === 'beaten' && game.rating > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={10} className={s <= game.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'} />
                        ))}
                      </div>
                    )}
                    <select
                      value={game.status}
                      onChange={(e) => onStatusChange?.(game.id, e.target.value)}
                      className="mt-1.5 h-7 bg-[#1C1C1F] text-zinc-400 px-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#635BFF] border-0 appearance-none"
                    >
                      {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDetailView;
