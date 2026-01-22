const MultiSelectBar = ({ count, total, onDelete, onTag, onCancel, bottom = 'bottom-20' }) => (
  <div className={`fixed left-4 right-4 z-40 ${bottom} bg-[#1C1C1F] rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-2xl border border-[#2C2C30] gt-slidedwn`}>
    <button onClick={onCancel} className="text-zinc-400 text-sm font-medium active:text-zinc-200 transition-colors">
      Cancel
    </button>
    <span className="text-zinc-300 text-sm font-semibold">{count} / {total} selected</span>
    <div className="flex items-center gap-4">
      {onTag && (
        <button
          onClick={onTag}
          disabled={count === 0}
          className="text-[#635BFF] text-sm font-semibold disabled:opacity-30 active:opacity-60 transition-opacity"
        >
          Tag
        </button>
      )}
      <button
        onClick={onDelete}
        disabled={count === 0}
        className="text-red-400 text-sm font-semibold disabled:opacity-30 active:text-red-300 transition-colors"
      >
        Delete
      </button>
    </div>
  </div>
);

export default MultiSelectBar;
