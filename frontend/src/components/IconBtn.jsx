const IconBtn = ({ onClick, children, active = false, className = '' }) => (
  <button
    onClick={onClick}
    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90 ${
      active ? 'bg-[#635BFF] text-white' : 'bg-[#1C1C1F] text-zinc-400 hover:text-white'
    } ${className}`}
  >
    {children}
  </button>
);

export default IconBtn;
