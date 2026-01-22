export const STATUSES = [
  { id: 'to-play', label: 'To Play', color: 'from-zinc-600 to-zinc-700' },
  { id: 'playing', label: 'Playing', color: 'from-indigo-500 to-violet-500' },
  { id: 'beaten',  label: 'Beaten',  color: 'from-emerald-500 to-teal-500' },
];

export const CATEGORY_COLORS = [
  'from-zinc-600 to-zinc-700',
  'from-indigo-500 to-violet-500',
  'from-emerald-500 to-teal-500',
  'from-violet-500 to-purple-600',
  'from-orange-500 to-amber-500',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
  'from-red-500 to-rose-600',
];

export const CAT_BANNER_GRADIENTS = [
  'from-violet-600 to-indigo-700',
  'from-emerald-600 to-teal-700',
  'from-orange-500 to-rose-600',
  'from-blue-600 to-cyan-700',
  'from-pink-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-sky-500 to-blue-600',
];

export const PROTECTED_TITLES = new Set(['beaten', 'playing', 'to play']);

export const VIEWS = ['games', 'categories', 'config'];

export const GC_KEY = 'gt_game_categories';

export const loadGCMap = () => {
  try { return JSON.parse(localStorage.getItem(GC_KEY) || '{}'); }
  catch { return {}; }
};

export const saveGCMap = (map) => localStorage.setItem(GC_KEY, JSON.stringify(map));

export const STYLES = `
  @keyframes gt-fadein   { from { opacity:0 }                           to { opacity:1 } }
  @keyframes gt-slideup  { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
  @keyframes gt-slidedwn { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }
  @keyframes gt-scaleup  { from { opacity:0; transform:scale(.92) }     to { opacity:1; transform:scale(1) } }
  @keyframes gt-sheet    { from { transform:translateY(100%) }           to { transform:translateY(0) } }
  .gt-fadein   { animation: gt-fadein   .35s ease-out both }
  .gt-slideup  { animation: gt-slideup  .4s  ease-out both }
  .gt-slidedwn { animation: gt-slidedwn .3s  ease-out both }
  .gt-scaleup  { animation: gt-scaleup  .35s ease-out both }
  .gt-sheet    { animation: gt-sheet    .32s cubic-bezier(.22,1,.36,1) both }
  .glow-star   { filter: drop-shadow(0 0 4px rgba(250,204,21,.6)) }
  .scrollbar-none::-webkit-scrollbar { display:none }
  .scrollbar-none { -ms-overflow-style:none; scrollbar-width:none }
`;
