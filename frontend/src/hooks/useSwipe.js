import { useRef, useCallback } from 'react';

const useSwipe = ({ onLeft, onRight, onDown } = {}, minDist = 65) => {
  const start = useRef({ x: 0, y: 0 });
  const cbRef = useRef({});
  cbRef.current = { onLeft, onRight, onDown };

  const onTouchStart = useCallback((e) => {
    start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const onTouchEnd = useCallback((e) => {
    const dx = e.changedTouches[0].clientX - start.current.x;
    const dy = e.changedTouches[0].clientY - start.current.y;
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (ax > ay && ax > minDist) {
      dx < 0 ? cbRef.current.onLeft?.() : cbRef.current.onRight?.();
    } else if (ay > ax && dy > minDist) {
      cbRef.current.onDown?.();
    }
  }, [minDist]);

  return { onTouchStart, onTouchEnd };
};

export default useSwipe;
