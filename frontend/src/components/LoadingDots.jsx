const LoadingDots = ({ size = 'md' }) => {
  const dot = size === 'sm' ? 'w-1 h-1' : size === 'lg' ? 'w-2 h-2' : 'w-1.5 h-1.5';
  return (
    <div className="flex gap-1">
      {[0, 0.15, 0.3].map((d, i) => (
        <div key={i} className={`${dot} bg-[#635BFF] rounded-full animate-bounce`} style={{ animationDelay: `${d}s` }} />
      ))}
    </div>
  );
};

export default LoadingDots;
