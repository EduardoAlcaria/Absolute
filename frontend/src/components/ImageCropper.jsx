import { useState, useRef } from 'react';

const ImageCropper = ({ src, aspectRatio = 3.2, onCrop, onCancel }) => {
  const wrapRef = useRef(null);
  const imgRef = useRef(null);
  const dragRef = useRef(null);
  const sr = useRef({ naturalSize: { w: 1, h: 1 }, pos: { x: 0, y: 0 }, scale: 1, boxW: 300 });
  const [, setTick] = useState(0);
  const forceRender = () => setTick((t) => t + 1);

  const clamp = (x, y, s) => {
    const { boxW: bw, naturalSize: ns } = sr.current;
    const bh = Math.round(bw / aspectRatio);
    return {
      x: Math.min(0, Math.max(x, bw - ns.w * s)),
      y: Math.min(0, Math.max(y, bh - ns.h * s)),
    };
  };

  const onImgLoad = () => {
    const img = imgRef.current;
    const wrap = wrapRef.current;
    if (!img || !wrap) return;
    const bw = wrap.clientWidth - 32;
    const bh = Math.round(bw / aspectRatio);
    const s = Math.max(bw / img.naturalWidth, bh / img.naturalHeight);
    const ns = { w: img.naturalWidth, h: img.naturalHeight };
    sr.current = { naturalSize: ns, scale: s, boxW: bw, pos: clamp((bw - ns.w * s) / 2, (bh - ns.h * s) / 2, s) };
    forceRender();
  };

  const move = (cx, cy) => {
    if (!dragRef.current) return;
    sr.current = {
      ...sr.current,
      pos: clamp(cx - dragRef.current.ox, cy - dragRef.current.oy, sr.current.scale),
    };
    forceRender();
  };

  const handleCrop = () => {
    const { pos: p, scale: s, boxW: bw } = sr.current;
    const bh = Math.round(bw / aspectRatio);
    const outW = 960;
    const outH = Math.round(outW / aspectRatio);
    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    canvas.getContext('2d').drawImage(imgRef.current, -p.x / s, -p.y / s, bw / s, bh / s, 0, 0, outW, outH);
    onCrop(canvas.toDataURL('image/jpeg', 0.9));
  };

  const { naturalSize, pos, scale, boxW } = sr.current;
  const boxH = Math.round(boxW / aspectRatio);

  return (
    <div className="fixed inset-0 bg-black/85 z-[60] flex flex-col items-center justify-center gt-fadein px-4">
      <div ref={wrapRef} className="w-full max-w-sm bg-[#151517] rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1C1C1F]">
          <button onClick={onCancel} className="text-zinc-400 text-sm active:text-zinc-200">Cancel</button>
          <span className="text-white text-sm font-semibold">Crop Image</span>
          <button onClick={handleCrop} className="text-[#635BFF] text-sm font-semibold active:opacity-60">Use</button>
        </div>
        <div
          className="relative overflow-hidden bg-black cursor-grab active:cursor-grabbing"
          style={{ height: boxH + 32 }}
          onTouchStart={(e) => { dragRef.current = { ox: e.touches[0].clientX - pos.x, oy: e.touches[0].clientY - pos.y }; }}
          onTouchMove={(e) => { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchEnd={() => { dragRef.current = null; }}
          onMouseDown={(e) => { dragRef.current = { ox: e.clientX - pos.x, oy: e.clientY - pos.y }; }}
          onMouseMove={(e) => move(e.clientX, e.clientY)}
          onMouseUp={() => { dragRef.current = null; }}
          onMouseLeave={() => { dragRef.current = null; }}
        >
          <img
            ref={imgRef}
            src={src}
            alt=""
            onLoad={onImgLoad}
            draggable={false}
            style={{
              position: 'absolute',
              userSelect: 'none',
              pointerEvents: 'none',
              left: 16 + pos.x,
              top: 16 + pos.y,
              width: naturalSize.w * scale,
              height: naturalSize.h * scale,
            }}
          />
          <div
            className="absolute border-2 border-white/80 rounded-xl pointer-events-none"
            style={{ left: 16, top: 16, width: boxW, height: boxH }}
          />
        </div>
        <p className="text-zinc-600 text-xs text-center py-3">Drag to reposition</p>
      </div>
    </div>
  );
};

export default ImageCropper;
