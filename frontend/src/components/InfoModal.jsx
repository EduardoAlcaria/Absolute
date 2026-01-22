import { useState, useEffect } from 'react';
import { X, Tag, Monitor, Clock } from 'lucide-react';
import LoadingDots from './LoadingDots';

const API_URL = 'http://127.0.0.1:8000';

const DetailRow = ({ icon, label, value }) =>
  value ? (
    <div className="flex items-start gap-3 py-3 border-b border-[#1C1C1F] last:border-0">
      <span className="text-zinc-600 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-zinc-500 text-xs mb-0.5 uppercase tracking-wider">{label}</p>
        <p className="text-zinc-200 text-sm leading-snug">{value}</p>
      </div>
    </div>
  ) : null;

const InfoModal = ({ game, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!game?.igdb_id) return;
    let cancelled = false;
    setDetails(null);
    setError(false);
    setLoading(true);
    fetch(`${API_URL}/games/${game.igdb_id}/details`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((d) => { if (!cancelled) { setDetails(d); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [game?.igdb_id]);

  if (!game) return null;

  const fmtHrs = (h) => (h != null ? `${h}h` : null);
  const ttb = details?.time_to_beat;
  const hasTtb = ttb && Object.values(ttb).some((v) => v != null);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 gt-fadein" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#151517] rounded-t-3xl overflow-hidden shadow-2xl gt-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#2C2C30] rounded-full" />
        </div>
        <div className="relative h-28 overflow-hidden">
          {game.image && (
            <img src={game.image} alt={game.title} className="w-full h-full object-cover object-top" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#151517] via-black/50 to-transparent" />
          <div className="absolute bottom-3 left-4 right-12">
            <h2 className="text-white font-bold text-lg leading-tight line-clamp-1">{game.title}</h2>
            {game.genre && <p className="text-zinc-400 text-xs mt-0.5">{game.genre}</p>}
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center active:scale-90"
          >
            <X size={16} className="text-zinc-300" />
          </button>
        </div>
        <div className="px-4 pb-8 max-h-[60vh] overflow-y-auto scrollbar-none">
          {loading && (
            <div className="flex justify-center py-10">
              <LoadingDots />
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center py-10 gap-2">
              <p className="text-zinc-500 text-sm">Could not load details</p>
              <p className="text-zinc-700 text-xs">Check your server connection</p>
            </div>
          )}
          {!loading && !error && details && (
            <div className="pt-2">
              {details.summary && (
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">{details.summary}</p>
              )}
              <DetailRow icon={<Tag size={14} />}     label="Developer" value={details.developers?.join(', ')} />
              <DetailRow icon={<Tag size={14} />}     label="Publisher"  value={details.publishers?.join(', ')} />
              <DetailRow icon={<Monitor size={14} />} label="Platforms"  value={details.platforms?.join(', ')} />
              <div className="py-3 border-b border-[#1C1C1F]">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-zinc-600" />
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">How Long to Beat</p>
                </div>
                {hasTtb ? (
                  <div className="flex gap-2">
                    {[
                      { label: 'Main',   val: fmtHrs(ttb.main) },
                      { label: 'Rushed', val: fmtHrs(ttb.rushed) },
                      { label: '100%',   val: fmtHrs(ttb.completionist) },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex-1 bg-[#1C1C1F] rounded-xl p-2.5 text-center">
                        <p className="text-white text-sm font-semibold">{val ?? '—'}</p>
                        <p className="text-zinc-600 text-xs mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-600 text-xs">No data available</p>
                )}
              </div>
              <div className="py-3">
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={14} className="text-zinc-600" />
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">Steam Price</p>
                </div>
                {details.steam_price ? (
                  <span className="text-white font-semibold">{details.steam_price}</span>
                ) : (
                  <p className="text-zinc-600 text-xs">Not available on Steam</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
