const BtnPrimary = ({ onClick, children, disabled, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center justify-center gap-2 h-12 px-5 rounded-2xl bg-[#635BFF] text-white text-sm font-semibold transition-all active:scale-95 active:brightness-90 disabled:opacity-40 disabled:pointer-events-none ${className}`}
  >
    {children}
  </button>
);

export default BtnPrimary;
