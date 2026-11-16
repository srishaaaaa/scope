import { useEffect, useRef, useState } from 'react';
import { useReduced } from '../../lib/hooks';

// Counts a number up from 0 when it scrolls into view. Non-numeric values (e.g. "India") are shown as they are.
export default function CountUp({ value, duration = 1400 }) {
  const n = /^\d+$/.test(String(value)) ? Number(value) : null;
  const reduced = useReduced();
  const ref = useRef();
  const [v, setV] = useState(n === null || reduced ? value : 0);
  useEffect(() => {
    if (n === null || reduced) { setV(value); return }
    const el = ref.current; let raf, started = false;
    const run = () => {
      const t0 = performance.now();
      const tick = t => { const k = Math.min(1, (t - t0) / duration); setV(Math.round((1 - Math.pow(1 - k, 3)) * n)); if (k < 1) raf = requestAnimationFrame(tick) };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) { started = true; run(); io.disconnect() } }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf) };
  }, [value]); // eslint-disable-line
  return <span ref={ref}>{v}</span>;
}
