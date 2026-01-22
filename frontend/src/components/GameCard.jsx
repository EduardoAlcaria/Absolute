import { useRef } from 'react';
import { Star, Share2, Info, Gamepad2, Check, Lock } from 'lucide-react';
import { STATUSES, PROTECTED_TITLES } from '../constants';

const GameCard = ({ game, assignedCats = [], onStatusChange, onRatingChange, onShare, onInfo, onDelete, selectMode, isSelected, onSelect }) => {
  const status = STATUSES.find((s) => s.id === game.status) ?? STATUSES[0];
  const badgeClass = `bg-gradient-to-r ${status.color}`;
  const pressTimer = useRef(null);
  const didMove = useRef(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const isProtected = PROTECTED_TITLES.has(game.title?.toLowerCase().trim());

  const startPress = (e) => {
    if (selectMode) return;
    didMove.current = false;
    if (e.touches) touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    pressTimer.current = setTimeout(() => {
      if (!didMove.current) { navigator.vibrate?.(40); onDelete(game); }
    }, 600);
  };

  const onTouchMove = (e) => {
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    if (Math.hypot(dx, dy) > 8) { didMove.current = true; clearTimeout(pressTimer.current); }
  };

  const endPress = () => clearTimeout(pressTimer.current);

  return (
    <div
      className={`bg-[#151517] rounded-3xl overflow-hidden select-none relative transition-all duration-150 ${
        selectMode ? 'cursor-pointer' : ''
      } ${isSelected ? 'ring-2 ring-[#635BFF] scale-[0.97]' : ''}`}
      onTouchStart={startPress}
      onTouchMove={onTouchMove}
      onTouchEnd={() => { endPress(); if (selectMode && !isProtected) onSelect?.(game.id); }}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
    >
      <div className="relative w-full overflow-hidden rounded-t-3xl">
        {game.image ? (
          <img src={game.image} alt={game.title} loading="lazy" className="w-full h-auto block" />
        ) : (
          <div className="w-full aspect-[3/4] bg-[#1C1C1F] flex flex-col items-center justify-center gap-2">
            <Gamepad2 size={36} className="text-zinc-800" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151517]/90 via-transparent to-transparent" />
        <span className={`absolute top-3 right-3 ${badgeClass} text-white text-[11px] font-semibold px-2.5 py-1 rounded-full`}>
          {status.label}
        </span>

        {selectMode && (
          <div className={`absolute inset-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#635BFF]/25' : 'bg-black/35'}`}>
            {isProtected ? (
              <div className="w-9 h-9 rounded-full bg-black/60 flex items-center justify-center">
                <Lock size={18} className="text-zinc-400" />
              </div>
            ) : (
              <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#635BFF] border-[#635BFF]' : 'bg-black/40 border-white/60'}`}>
                {isSelected && <Check size={18} className="text-white" />}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`p-4 transition-opacity duration-150 ${selectMode ? 'opacity-40 pointer-events-none' : ''}`}>
        <h3 className="text-white font-semibold text-base leading-snug mb-0.5 line-clamp-1">{game.title}</h3>
        <p className="text-zinc-500 text-xs mb-2">{game.genre}</p>

        {assignedCats.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {assignedCats.map((cat) => (
              <span key={cat.id} className={`text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r ${cat.color} text-white font-medium`}>
                {cat.label}
              </span>
            ))}
          </div>
        )}

        {game.status === 'beaten' && (
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={() => onRatingChange(game.id, star)}
                className="p-0.5 active:scale-90 transition-transform"
              >
                <Star size={18} className={star <= (game.rating || 0) ? 'fill-amber-400 text-amber-400 glow-star' : 'text-zinc-700'} />
              </button>
            ))}
          </div>
        )}

        <select
          value={game.status}
          onChange={(e) => onStatusChange(game.id, e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="w-full h-10 bg-[#1C1C1F] text-zinc-300 px-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#635BFF] mb-3 border-0 appearance-none"
        >
          {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>

        <div className="flex gap-2">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={() => onInfo(game)}
            className="flex-1 h-10 flex items-center justify-center gap-1.5 bg-[#1C1C1F] text-zinc-400 rounded-xl text-xs font-medium active:scale-95 active:brightness-75 transition-all"
          >
            <Info size={14} /> Info
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={() => onShare(game)}
            className="flex-1 h-10 flex items-center justify-center gap-1.5 bg-[#1C1C1F] text-zinc-400 rounded-xl text-xs font-medium active:scale-95 active:brightness-75 transition-all"
          >
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
