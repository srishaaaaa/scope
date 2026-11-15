import { useEffect, useRef, useState } from 'react';

// Horizontal scroller that is native on touch (momentum, swipe) and draggable with a mouse. Arrow buttons scroll by a
// card. It never captures the wheel, so vertical page scrolling is never fought.
export default function Scroller({ children, className = '', label, arrows = true }) {
  const ref = useRef();
  const [edge, setEdge] = useState({ start: true, end: false, can: false });
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let down = false, moved = false, sx = 0, sl = 0;
    const upd = () => setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4, can: el.scrollWidth > el.clientWidth + 8 });
    const pd = e => { if (e.pointerType !== 'mouse' || e.button !== 0) return; down = true; moved = false; sx = e.clientX; sl = el.scrollLeft };
    const pm = e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; el.classList.add('drag') } if (moved) el.scrollLeft = sl - dx };
    const pu = () => { down = false; el.classList.remove('drag') };
    const click = e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false } };
    el.addEventListener('pointerdown', pd); addEventListener('pointermove', pm); addEventListener('pointerup', pu);
    el.addEventListener('click', click, true); el.addEventListener('scroll', upd, { passive: true });
    const ro = new ResizeObserver(upd); ro.observe(el); upd();
    return () => { el.removeEventListener('pointerdown', pd); removeEventListener('pointermove', pm); removeEventListener('pointerup', pu); el.removeEventListener('click', click, true); el.removeEventListener('scroll', upd); ro.disconnect() };
  }, []);
  const go = d => { const el = ref.current; if (el) el.scrollBy({ left: d * Math.min(el.clientWidth * 0.8, 520), behavior: 'smooth' }) };
  return (
    <div className={`s13-scroller ${className}`}>
      <div className="s13-scroller-track" ref={ref} tabIndex={0} role="region" aria-label={label}>{children}</div>
      {arrows && edge.can && (
        <div className="s13-scroller-ctl">
          <button className="s13-round" onClick={() => go(-1)} disabled={edge.start} aria-label={`Previous ${label || 'items'}`}>←</button>
          <button className="s13-round" onClick={() => go(1)} disabled={edge.end} aria-label={`Next ${label || 'items'}`}>→</button>
        </div>
      )}
    </div>
  );
}
