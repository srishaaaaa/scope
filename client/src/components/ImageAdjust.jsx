import { decodePos, encodePos, coverStyle, ZOOMS } from '../lib/imgPos';

// Admin image framing: a preview in the shape it is shown on the site. Click (or drag) to choose which part stays in
// view, and use the zoom slider to crop in. `fit="contain"` previews cut-out figures (hero model) instead of cropping.
export default function ImageAdjust({ src, pos, aspect = 3 / 4, fit = 'cover', onChange, busy }) {
  const d = decodePos(pos);
  const pick = e => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)), y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
    onChange(encodePos(x, y, d.k));
  };
  return (
    <div className="adj">
      <div className="adj-box" style={{ aspectRatio: String(aspect) }} onPointerDown={pick} onPointerMove={e => e.buttons === 1 && pick(e)} role="img" aria-label="Preview. Click to choose the part of the photo that stays in view.">
        <img src={src} alt="" draggable={false} style={fit === 'cover' ? coverStyle(pos) : { objectFit: 'contain', objectPosition: 'center bottom', transformOrigin: `${d.x}% 100%`, transform: d.z > 1 ? `scale(${d.z})` : undefined }} />
        <span className="adj-dot" style={{ left: `${d.x}%`, top: `${d.y}%` }} aria-hidden="true" />
      </div>
      <label className="adj-zoom"><span>Zoom <b>{d.z.toFixed(1)}×</b></span>
        <input type="range" min="0" max={ZOOMS.length - 1} step="1" value={d.k} disabled={busy} onChange={e => onChange(encodePos(d.x, d.y, +e.target.value))} aria-label="Zoom" /></label>
      <div className="adj-row"><span className="muted small">Click the photo to choose what stays in view, then zoom to fit.</span>{pos && <button type="button" className="link-u small" onClick={() => onChange(null)}>Reset</button>}</div>
    </div>
  );
}
