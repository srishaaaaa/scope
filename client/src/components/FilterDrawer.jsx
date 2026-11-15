import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useModal } from '../lib/hooks';
import { sortSizes } from '../lib/format';

// Slide-in filter drawer. It only reads and writes the existing URL filter state (useFilters), so server-side
// filtering, sorting and pagination behave exactly as before.
const toggle = (arr, v) => (arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

export function ActiveFilters({ f, set, clear, count }) {
  if (!count) return null;
  const chips = [
    ...f.size.map(v => ['Size ' + v, () => set({ size: f.size.filter(x => x !== v) })]),
    ...f.color.map(v => [v, () => set({ color: f.color.filter(x => x !== v) })]),
    ...f.material.map(v => [v, () => set({ material: f.material.filter(x => x !== v) })]),
    ...(f.min != null ? [[`From ₹${f.min}`, () => set({ min: null })]] : []),
    ...(f.max != null ? [[`Up to ₹${f.max}`, () => set({ max: null })]] : []),
    ...(f.stock ? [['In stock', () => set({ stock: false })]] : []),
  ];
  return (
    <div className="s13-active" role="region" aria-label="Active filters">
      {chips.map(([l, rm]) => <button key={l} className="s13-active-chip" onClick={rm} aria-label={`Remove filter ${l}`}>{l}<span aria-hidden="true">✕</span></button>)}
      <button className="link-u small" onClick={clear}>Clear all</button>
    </div>
  );
}

export default function FilterDrawer({ open, onClose, f, set, clear, count, facets, total }) {
  const ref = useRef();
  useModal(open, onClose, ref);
  const sizes = sortSizes(facets.sizes || []);
  const top = facets.maxPrice ? Math.ceil(facets.maxPrice / 100) : 0;
  return (
    <AnimatePresence>
      {open && (
        <div className="overlay-root">
          <motion.div className="scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside ref={ref} className="drawer glass s13-filter" role="dialog" aria-modal="true" aria-label="Filters"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}>
            <div className="drawer-head"><h2>Filters{count > 0 && <span className="s13-fcount">{count}</span>}</h2><button className="icon-btn" onClick={onClose} aria-label="Close filters">✕</button></div>
            <div className="drawer-body s13-filter-body">
              {sizes.length > 0 && <fieldset><legend className="eyebrow">Size</legend>
                <div className="chips">{sizes.map(s => <button key={s} className={`chip ${f.size.includes(s) ? 'on' : ''}`} aria-pressed={f.size.includes(s)} onClick={() => set({ size: toggle(f.size, s) })}>{s}</button>)}</div></fieldset>}
              {facets.colors?.length > 0 && <fieldset><legend className="eyebrow">Colour</legend>
                <div className="chips">{facets.colors.map(c => <button key={c} className={`chip ${f.color.includes(c) ? 'on' : ''}`} aria-pressed={f.color.includes(c)} onClick={() => set({ color: toggle(f.color, c) })}>{c}</button>)}</div></fieldset>}
              {facets.materials?.length > 0 && <fieldset><legend className="eyebrow">Fabric</legend>
                <div className="chips">{facets.materials.map(m => <button key={m} className={`chip ${f.material.includes(m) ? 'on' : ''}`} aria-pressed={f.material.includes(m)} onClick={() => set({ material: toggle(f.material, m) })}>{m}</button>)}</div></fieldset>}
              {top > 0 && <fieldset><legend className="eyebrow">Price (₹)</legend>
                <div className="price-row s13-price">
                  <label className="field"><span>Min</span><input type="number" inputMode="numeric" min="0" max={top} placeholder="0" value={f.min ?? ''} onChange={e => set({ min: e.target.value })} /></label>
                  <label className="field"><span>Max</span><input type="number" inputMode="numeric" min="0" max={top} placeholder={String(top)} value={f.max ?? ''} onChange={e => set({ max: e.target.value })} /></label>
                </div></fieldset>}
              <label className="check s13-stock"><input type="checkbox" checked={f.stock} onChange={e => set({ stock: e.target.checked })} /> Show only pieces in stock</label>
            </div>
            <div className="drawer-foot">
              <button className="btn solid wide" onClick={onClose}>SHOW {total} {total === 1 ? 'PIECE' : 'PIECES'}</button>
              {count > 0 && <button className="btn wide" onClick={clear}>CLEAR ALL</button>}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
