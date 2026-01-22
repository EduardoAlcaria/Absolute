import { useState } from 'react';
import { Check } from 'lucide-react';

const CategoryAssignSheet = ({ categories, gameIds, gameCategoryIds, onApply, onClose }) => {
  const [checked, setChecked] = useState(() => {
    const set = new Set();
    categories.forEach((cat) => {
      if (gameIds.every((id) => (gameCategoryIds[String(id)] ?? []).includes(cat.id))) {
        set.add(cat.id);
      }
    });
    return set;
  });

  const toggle = (id) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 gt-fadein"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#151517] rounded-t-3xl overflow-hidden shadow-2xl gt-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#2C2C30] rounded-full" />
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1C1C1F]">
          <button onClick={onClose} className="text-zinc-400 text-sm active:text-zinc-200">Cancel</button>
          <span className="text-white text-sm font-semibold">Assign Categories</span>
          <button
            onClick={() => { onApply([...checked]); onClose(); }}
            className="text-[#635BFF] text-sm font-semibold active:opacity-60"
          >
            Apply
          </button>
        </div>
        <div className="overflow-y-auto scrollbar-none max-h-[50vh] px-4 py-3 pb-10">
          {categories.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-8">No categories yet. Create one in the Categories tab.</p>
          ) : (
            categories.map((cat) => {
              const on = checked.has(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggle(cat.id)}
                  className="w-full flex items-center gap-3 py-3.5 border-b border-[#1C1C1F] last:border-0 active:bg-[#1C1C1F] rounded-xl px-2 transition-colors"
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${on ? 'bg-[#635BFF] border-[#635BFF]' : 'border-[#2C2C30]'}`}>
                    {on && <Check size={14} className="text-white" />}
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${cat.color} shrink-0`} />
                  <span className="text-zinc-200 text-sm font-medium">{cat.label}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryAssignSheet;
