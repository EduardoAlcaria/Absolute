import { useState, useRef } from 'react';
import { Plus, Check, Upload, Pencil, LayoutGrid, Lock } from 'lucide-react';
import { CATEGORY_COLORS, CAT_BANNER_GRADIENTS } from '../constants';
import ImageCropper from './ImageCropper';
import MultiSelectBar from './MultiSelectBar';

const CategoriesView = ({ categories, games, gameCategoryIds, catBanners, onSetBanner, onAddCategory, onDeleteCategories, onUpdateCategory, onEnterCategory, swipeHandlers }) => {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showNewCat, setShowNewCat] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [cropTargetId, setCropTargetId] = useState(null);
  const [editingCatId, setEditingCatId] = useState(null);
  const fileInputRef = useRef(null);
  const newLabelRef = useRef(null);
  const pressTimers = useRef({});

  const toggleSelect = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const startPress = (cat) => {
    if (selectMode) return;
    pressTimers.current[cat.id] = setTimeout(() => {
      navigator.vibrate?.(40);
      setSelectMode(true);
      setSelectedIds(new Set([cat.id]));
    }, 600);
  };

  const endPress = (catId) => clearTimeout(pressTimers.current[catId]);

  const cancelSelect = () => { setSelectMode(false); setSelectedIds(new Set()); };

  const handleDeleteSelected = async () => {
    await onDeleteCategories([...selectedIds]);
    cancelSelect();
  };

  const handleAdd = () => {
    const label = newLabelRef.current?.value?.trim();
    if (!label) return;
    onAddCategory({
      id: `cat_${Date.now()}`,
      label,
      color: CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length],
      isDefault: false,
    });
    if (newLabelRef.current) newLabelRef.current.value = '';
    setShowNewCat(false);
  };

  const openFilePicker = (catId) => {
    setCropTargetId(catId);
    fileInputRef.current?.click();
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
    e.target.value = '';
  };

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh' }} {...swipeHandlers}>
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          aspectRatio={3.2}
          onCrop={(dataUrl) => { onSetBanner(cropTargetId, dataUrl); setCropSrc(null); setCropTargetId(null); }}
          onCancel={() => setCropSrc(null)}
        />
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      <div className="sticky top-0 z-10 bg-[#0B0B0C]/95 backdrop-blur-sm px-4 pt-4 pb-3 border-b border-[#151517]">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-white font-bold text-xl tracking-tight">Categories</h1>
          <button
            onClick={() => setShowNewCat((v) => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#635BFF] text-white active:scale-90 transition-transform"
          >
            <Plus size={18} />
          </button>
        </div>
        {showNewCat && (
          <div className="flex gap-2 mt-3 gt-slidedwn">
            <input
              ref={newLabelRef}
              defaultValue=""
              autoFocus
              placeholder="Category name…"
              autoComplete="off"
              spellCheck={false}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1 h-11 bg-[#1C1C1F] text-zinc-200 px-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#635BFF] placeholder-zinc-700"
            />
            <button
              onClick={handleAdd}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#635BFF] text-white active:scale-95 shrink-0"
            >
              <Check size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 pt-4 pb-28 space-y-3">
        {categories.map((cat, i) => {
          const banner = catBanners[cat.id];
          const beatenCount = games.filter((g) => (gameCategoryIds[String(g.id)] ?? []).includes(cat.id) && g.status === 'beaten').length;
          const totalCount = games.filter((g) => (gameCategoryIds[String(g.id)] ?? []).includes(cat.id)).length;
          const isSelected = selectedIds.has(cat.id);
          const fallback = CAT_BANNER_GRADIENTS[i % CAT_BANNER_GRADIENTS.length];

          return (
            <div
              key={cat.id}
              className={`relative rounded-3xl overflow-hidden select-none transition-all duration-150 ${isSelected ? 'ring-2 ring-[#635BFF] scale-[0.98]' : ''}`}
              onTouchStart={() => startPress(cat)}
              onTouchMove={() => endPress(cat.id)}
              onTouchEnd={() => { endPress(cat.id); if (selectMode) toggleSelect(cat.id); else onEnterCategory?.(cat); }}
              onMouseDown={() => startPress(cat)}
              onMouseUp={() => endPress(cat.id)}
              onMouseLeave={() => endPress(cat.id)}
              onClick={() => { if (!selectMode) onEnterCategory?.(cat); }}
            >
              <div className={`relative h-32 w-full ${!banner ? `bg-gradient-to-r ${fallback}` : ''}`}>
                {banner && <img src={banner} alt="" className="w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                {!selectMode && (
                  <button
                    onClick={(e) => { e.stopPropagation(); openFilePicker(cat.id); }}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => { e.stopPropagation(); openFilePicker(cat.id); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Upload size={14} className="text-white/80" />
                  </button>
                )}

                {selectMode && (
                  <div className={`absolute inset-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#635BFF]/25' : 'bg-black/25'}`}>
                    <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#635BFF] border-[#635BFF]' : 'bg-black/40 border-white/60'}`}>
                      {isSelected && <Check size={18} className="text-white" />}
                    </div>
                  </div>
                )}

                <div className="absolute bottom-3 left-4 right-16 pointer-events-none">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${cat.color} shrink-0`} />
                    {editingCatId === cat.id ? (
                      <input
                        autoFocus
                        defaultValue={cat.label}
                        autoComplete="off"
                        spellCheck={false}
                        className="bg-transparent text-white font-bold text-lg leading-none focus:outline-none pointer-events-auto"
                        onBlur={(e) => { onUpdateCategory(cat.id, e.target.value); setEditingCatId(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { onUpdateCategory(cat.id, e.target.value); setEditingCatId(null); } }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-white font-bold text-lg leading-none">{cat.label}</span>
                    )}
                  </div>
                  <span className="text-white/60 text-xs">
                    {totalCount} game{totalCount !== 1 ? 's' : ''}{beatenCount > 0 ? ` · ${beatenCount} beaten` : ''}
                  </span>
                </div>

                {!selectMode && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingCatId(cat.id); }}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => { e.stopPropagation(); setEditingCatId(cat.id); }}
                    className="absolute bottom-3 right-3 w-8 h-8 bg-black/40 rounded-xl flex items-center justify-center active:scale-90"
                  >
                    <Pencil size={13} className="text-white/70" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="text-center py-16 gt-fadein">
            <LayoutGrid size={40} className="text-zinc-800 mx-auto mb-3" />
            <p className="text-zinc-600 text-sm">No categories yet</p>
          </div>
        )}
      </div>

      {selectMode && (
        <MultiSelectBar
          count={[...selectedIds].length}
          total={categories.length}
          onDelete={handleDeleteSelected}
          onCancel={cancelSelect}
          bottom="bottom-20"
        />
      )}
    </div>
  );
};

export default CategoriesView;
