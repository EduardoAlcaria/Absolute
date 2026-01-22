import { useState, useRef, useEffect } from 'react';
import { Gamepad2, Star } from 'lucide-react';
import { buildShareCanvas, buildShareText, capacitorShare } from '../utils/shareCanvas';
import Spinner from './Spinner';
import eye_logo from '../../svg/eye_logo.svg';

const tryWebShare = async (payload) => {
  try {
    await navigator.share(payload);
    return true;
  } catch (err) {
    return err.name === 'AbortError';
  }
};

const ShareSheet = ({ game, onClose }) => {
  const [captureState, setCaptureState] = useState('capturing');
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');
  const imageFile = useRef(null);
  const base64Ref = useRef(null);

  const shareText = buildShareText(game);

  useEffect(() => {
    let cancelled = false;

    buildShareCanvas(game)
      .then((canvas) =>
        new Promise((res, rej) =>
          canvas.toBlob((b) => (b ? res(b) : rej(new Error('null blob'))), 'image/png')
        )
      )
      .then((blob) => {
        if (cancelled) return;
        imageFile.current = new File([blob], 'game-card.png', { type: 'image/png' });
        return new Promise((res, rej) => {
          const r = new FileReader();
          r.onloadend = () => res(r.result.split(',')[1]);
          r.onerror = rej;
          r.readAsDataURL(blob);
        });
      })
      .then((b64) => {
        if (cancelled) return;
        base64Ref.current = b64;
        setCaptureState('ready');
      })
      .catch(() => { if (!cancelled) setCaptureState('failed'); });

    return () => { cancelled = true; };
  }, []);

  const canShareFile = () =>
    imageFile.current != null && navigator.canShare?.({ files: [imageFile.current] }) === true;

  const handleSaveImage = () => {
    if (!imageFile.current) return;
    const url = URL.createObjectURL(imageFile.current);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-card.png';
    a.click();
    URL.revokeObjectURL(url);
  };

  const doShare = async () => {
    setShareError('');
    if (captureState !== 'ready') {
      setShareError('Image still processing, please wait a moment.');
      return false;
    }
    if (base64Ref.current) {
      const result = await capacitorShare(base64Ref.current, game.title);
      if (result.ok) return true;
      if (!result.web) { setShareError('Could not share. Try "Save Image" instead.'); return false; }
    }
    if (canShareFile()) { await tryWebShare({ files: [imageFile.current], title: game.title }); return true; }
    setShareError('Image sharing is not supported on this browser. Use "Save Image".');
    return false;
  };

  const handleShare = async () => {
    const ok = await doShare();
    if (ok) onClose();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };

  const isReady = captureState !== 'capturing';

  const platforms = [
    {
      id: 'instagram',
      label: 'Instagram',
      bg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
        </svg>
      ),
      onTap: handleShare,
      needsCapture: true,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      bg: 'bg-[#25D366]',
      icon: (
        <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      ),
      onTap: handleShare,
      needsCapture: true,
    },
    {
      id: 'twitter',
      label: 'Twitter',
      bg: 'bg-black',
      icon: (
        <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      onTap: handleShare,
      needsCapture: true,
    },
    {
      id: 'messages',
      label: 'Messages',
      bg: 'bg-gradient-to-br from-green-400 to-blue-500',
      icon: (
        <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      ),
      onTap: handleShare,
      needsCapture: false,
    },
    {
      id: 'copy',
      label: copied ? 'Copied!' : 'Copy',
      bg: copied ? 'bg-emerald-500' : 'bg-[#2C2C30]',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          {copied
            ? <path d="M20 6L9 17l-5-5" />
            : <>
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </>
          }
        </svg>
      ),
      onTap: handleCopy,
      needsCapture: false,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center gt-fadein" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#151517] rounded-t-3xl overflow-hidden gt-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-zinc-700 rounded-full" />
        </div>

        <div className="mx-4 mt-2 mb-4 bg-[#1C1C1F] rounded-2xl overflow-hidden flex gap-3 p-3">
          {game.image
            ? <img
                src={game.image}
                alt={game.title}
                className="w-16 h-20 rounded-xl object-cover shrink-0"
              />
            : <div className="w-16 h-20 rounded-xl bg-[#2C2C30] flex items-center justify-center shrink-0">
                <Gamepad2 size={22} className="text-zinc-700" />
              </div>
          }
          <div className="flex flex-col justify-center min-w-0">
            <p className="text-white font-bold text-base leading-tight line-clamp-1">{game.title}</p>
            {game.genre && <p className="text-zinc-500 text-xs mt-0.5">{game.genre}</p>}
            {game.rating > 0 && (
              <div className="flex gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={12} className={s <= game.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'} />
                ))}
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-400 capitalize">
                {(game.status ?? '').replace('-', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <img src={eye_logo} alt="" className="w-4 h-4 opacity-60" />
              <span className="text-zinc-600 text-[10px]">Absolute</span>
            </div>
          </div>
        </div>

        <div className="px-4 pb-2">
          <p className="text-zinc-500 text-xs font-medium mb-3">Share to</p>
          <div className="flex justify-between mb-6">
            {platforms.map(({ id, label, bg, icon, onTap, needsCapture }) => {
              const showSpinner = needsCapture && !isReady;
              return (
                <button
                  key={id}
                  onClick={onTap}
                  disabled={showSpinner}
                  className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform disabled:opacity-60 disabled:pointer-events-none"
                >
                  <div className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center shadow-lg`}>
                    {showSpinner ? <Spinner /> : icon}
                  </div>
                  <span className="text-zinc-400 text-[11px]">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {shareError && (
          <div className="mx-4 mb-3 px-4 py-2.5 bg-red-500/15 border border-red-500/30 rounded-xl gt-slidedwn">
            <p className="text-red-400 text-xs text-center">{shareError}</p>
          </div>
        )}

        <div className="px-4 pb-10 flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 h-12 rounded-2xl bg-[#2C2C30] text-zinc-300 font-medium text-sm active:scale-95 transition-all"
          >
            More options
          </button>
          {captureState === 'ready' && (
            <button
              onClick={handleSaveImage}
              className="h-12 px-4 rounded-2xl bg-[#2C2C30] text-zinc-300 font-medium text-sm active:scale-95 transition-all"
            >
              Save Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareSheet;
