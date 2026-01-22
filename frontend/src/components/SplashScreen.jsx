import { useEffect } from 'react';
import eye_logo_animated from '../../svg/eye_logo_animated.svg';

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0B0C] gt-fadein">
      <div className="gt-scaleup mb-6">
        <img src={eye_logo_animated} alt="Logo" className="w-40 h-40" />
      </div>
      <h1 className="text-3xl font-bold text-white tracking-tight gt-slideup mb-1" style={{ animationDelay: '0.15s' }}>
        Absolute
      </h1>
      <div className="flex gap-1.5 mt-10" style={{ animationDelay: '0.5s' }}>
        {[0, 0.15, 0.3].map((d, i) => (
          <div key={i} className="w-1.5 h-1.5 bg-[#635BFF] rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
