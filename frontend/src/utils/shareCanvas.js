import { STATUSES } from '../constants';

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const SVG_LOGO = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs><g id="bl"><path d="M100,20 C130,25 150,45 150,70 C150,95 125,105 110,100 C130,95 135,75 125,60 C115,45 100,35 100,20 Z"/></g></defs>
  <g fill="white" stroke="black" stroke-width="2">
    <use href="#bl" transform="rotate(0 100 100)"/>
    <use href="#bl" transform="rotate(30 100 100)"/>
    <use href="#bl" transform="rotate(60 100 100)"/>
    <use href="#bl" transform="rotate(90 100 100)"/>
    <use href="#bl" transform="rotate(120 100 100)"/>
    <use href="#bl" transform="rotate(150 100 100)"/>
    <use href="#bl" transform="rotate(180 100 100)"/>
    <use href="#bl" transform="rotate(210 100 100)"/>
    <use href="#bl" transform="rotate(240 100 100)"/>
    <use href="#bl" transform="rotate(270 100 100)"/>
    <use href="#bl" transform="rotate(300 100 100)"/>
    <use href="#bl" transform="rotate(330 100 100)"/>
  </g>
  <circle cx="100" cy="100" r="28" fill="white"/>
  <circle cx="100" cy="100" r="12" fill="black"/>
</svg>`;

const loadSvgImage = () =>
  new Promise((resolve) => {
    const blob = new Blob([SVG_LOGO], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const el = new Image();
    el.onload = () => { URL.revokeObjectURL(url); resolve(el); };
    el.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    el.src = url;
    setTimeout(() => resolve(null), 3000);
  });

const fetchAsBlob = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.status);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => { URL.revokeObjectURL(blobUrl); resolve(el); };
    el.onerror = () => { URL.revokeObjectURL(blobUrl); reject(); };
    el.src = blobUrl;
    setTimeout(reject, 10000);
  });
};

const loadGameCover = async (imageUrl) => {
  const hiRes = imageUrl.replace(/\/t_[a-z0-9_]+\//, '/t_cover_big_2x/');
  return fetchAsBlob(hiRes).catch(() => fetchAsBlob(imageUrl));
};

export const buildShareCanvas = async (game) => {
  const W = 1080, H = 1920;
  const PAD = 80;
  const F = 'system-ui, -apple-system, "Segoe UI", BlinkMacSystemFont, sans-serif';

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  roundRect(ctx, 0, 0, W, H, 60);
  ctx.clip();

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#18181b');
  bg.addColorStop(1, '#000000');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  if (game.image) {
    try {
      const img = await loadGameCover(game.image);
      const s = Math.max(W / img.width, H / img.height);
      ctx.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
    } catch { }
  }

  const overlay = ctx.createLinearGradient(0, 0, 0, H);
  overlay.addColorStop(0, 'rgba(0,0,0,0)');
  overlay.addColorStop(0.42, 'rgba(0,0,0,0.5)');
  overlay.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, W, H);

  const svgImg = await loadSvgImage();

  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  let y = H - PAD;

  const LOGO = 110;
  const logoCY = y - LOGO / 2;
  ctx.shadowBlur = 0;

  if (svgImg) {
    ctx.drawImage(svgImg, PAD, y - LOGO, LOGO, LOGO);
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 58px ${F}`;
  ctx.textBaseline = 'middle';
  ctx.fillText('Absolute', PAD + LOGO + 28, logoCY);

  y -= LOGO + 44;

  const statusObj = STATUSES.find((s) => s.id === game.status) ?? STATUSES[0];
  const badgeColors = { 'to-play': '#6b7280', playing: '#635BFF', beaten: '#10b981' };
  const bColor = badgeColors[game.status] ?? '#6b7280';

  ctx.font = `600 52px ${F}`;
  const BH = 88, BP = 42;
  const BW = ctx.measureText(statusObj.label).width + BP * 2;
  y -= BH;

  ctx.shadowBlur = 0;
  ctx.fillStyle = bColor + '33';
  roundRect(ctx, PAD, y, BW, BH, BH / 2);
  ctx.fill();
  ctx.strokeStyle = bColor;
  ctx.lineWidth = 3;
  roundRect(ctx, PAD, y, BW, BH, BH / 2);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(statusObj.label, PAD + BP, y + BH / 2);
  y -= 36;

  if (game.status === 'beaten' && game.rating > 0) {
    ctx.font = `88px ${F}`;
    ctx.fillStyle = '#facc15';
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';
    ctx.shadowBlur = 14;
    ctx.fillText('★'.repeat(game.rating) + '☆'.repeat(5 - game.rating), PAD, y);
    y -= 108;
  }

  if (game.genre) {
    ctx.font = `52px ${F}`;
    ctx.fillStyle = '#d1d5db';
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';
    ctx.shadowBlur = 8;
    ctx.fillText(game.genre, PAD, y);
    y -= 70;
  }

  ctx.font = `900 108px ${F}`;
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'bottom';
  ctx.textAlign = 'left';
  ctx.shadowBlur = 24;

  const TW = W - PAD * 2;
  const words = (game.title ?? '').split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > TW && line) {
      lines.push(line);
      line = word;
      if (lines.length === 1) { line += ' …'; break; }
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  for (let i = lines.length - 1; i >= 0; i--) {
    ctx.fillText(lines[i], PAD, y);
    y -= 124;
  }

  return canvas;
};

export const buildShareText = (game) => {
  const stars = game.rating ? '\n' + '⭐'.repeat(game.rating) : '';
  const genre = game.genre ? ` — ${game.genre}` : '';
  return `${game.title}${genre}${stars}\n\n📱 Absolute`;
};

export const capacitorShare = async (base64, title) => {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const { Share } = await import('@capacitor/share');
      const fname = `game-card-${Date.now()}.png`;
      const { uri } = await Filesystem.writeFile({ path: fname, data: base64, directory: Directory.Cache });
      await Share.share({ title, files: [uri], dialogTitle: 'Share your game card' });
      try { await Filesystem.deleteFile({ path: fname, directory: Directory.Cache }); } catch { }
      return { ok: true };
    }
  } catch (err) {
    if (err?.message?.includes('cancel') || err?.errorMessage?.includes('cancel')) {
      return { ok: true, cancelled: true };
    }
    return { ok: false, err };
  }
  return { ok: false, web: true };
};
