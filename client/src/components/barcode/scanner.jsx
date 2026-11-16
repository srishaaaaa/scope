import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { BrowserMultiFormatReader } from '@zxing/browser';
import Modal from '../Modal';
import { api } from '../../lib/api';
import { useApp } from '../../context/App';
import { inr } from '../../lib/format';
import { normalizeBarcode, BRAND } from '../../lib/barcode';

export const SCAN_EVENT = 'scope13:scan';

// Web Audio beep: a short high note for a good scan, a low buzz for a failed one.
export function beep(ok = true) {
  try {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const ctx = new C(), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = ok ? 'sine' : 'square'; o.frequency.setValueAtTime(ok ? 1800 : 300, ctx.currentTime);
    g.gain.setValueAtTime(0.15, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (ok ? 0.08 : 0.25));
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + (ok ? 0.08 : 0.25));
  } catch { /* audio is restricted until the first tap */ }
}

// Hardware (keyboard-wedge) scanners "type" the code very fast and finish with Enter. This tells that burst apart from a person typing
// (under ~45 ms between keys, at least 4 characters), removes the injected text from the field it landed in, and hands the code over.
export function useHardwareScanner(onScan, enabled = true) {
  const buf = useRef({ code: '', last: 0, input: null });
  const cb = useRef(onScan); cb.current = onScan;
  useEffect(() => {
    if (!enabled) return;
    const down = e => {
      const now = Date.now(), diff = now - buf.current.last, t = e.target;
      const field = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (e.key === 'Enter') {
        const code = buf.current.code.trim();
        if (code.length >= 4 && diff < 150) {
          e.preventDefault(); e.stopPropagation();
          const el = buf.current.input;
          if (field && el && el.value && el.value.endsWith(code)) { const proto = Object.getPrototypeOf(el); Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, el.value.slice(0, -code.length)); el.dispatchEvent(new Event('input', { bubbles: true })) }
          buf.current = { code: '', last: 0, input: null };
          cb.current(normalizeBarcode(code)); return;
        }
        buf.current = { code: '', last: 0, input: null }; return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (diff > 45) buf.current = { code: e.key, last: now, input: field ? t : null };
        else { buf.current.code += e.key; buf.current.last = now; if (field) buf.current.input = t }
      }
    };
    addEventListener('keydown', down, true);
    return () => removeEventListener('keydown', down, true);
  }, [enabled]);
}

export const lookup = code => api('/admin/barcodes/lookup?code=' + encodeURIComponent(code));

// Camera scanner (phones and laptops): decodes barcodes with ZXing and stops every camera track when closed.
function CameraScanner({ onCode, onClose }) {
  const video = useRef(), controls = useRef(), stream = useRef();
  const [devices, setDevices] = useState([]); const [deviceId, setDeviceId] = useState(''); const [err, setErr] = useState('');
  const stop = useCallback(() => {
    try { controls.current?.stop() } catch { /* already stopped */ } controls.current = null;
    const s = stream.current || video.current?.srcObject; try { s?.getTracks().forEach(t => { t.stop(); t.enabled = false }) } catch { /* ignore */ }
    stream.current = null; if (video.current) video.current.srcObject = null;
  }, []);
  useEffect(() => {
    let alive = true; const reader = new BrowserMultiFormatReader();
    BrowserMultiFormatReader.listVideoInputDevices().then(d => { if (!alive) return; setDevices(d); if (!deviceId) { const back = d.find(x => /back|rear|environment/i.test(x.label)); if (back) setDeviceId(back.deviceId) } }).catch(() => {});
    reader.decodeFromVideoDevice(deviceId || undefined, video.current, r => { if (alive && r?.getText()) { stop(); onCode(r.getText()) } })
      .then(c => { if (!alive) c.stop(); else { controls.current = c; stream.current = video.current?.srcObject } })
      .catch(e => alive && setErr(e?.name === 'NotAllowedError' ? 'Camera permission was denied. Allow camera access in your browser and try again.' : 'Could not start the camera on this device.'));
    return () => { alive = false; stop() };
  }, [deviceId]); // eslint-disable-line
  return createPortal(
    <Modal title="Scan with camera" sub="Hold a barcode inside the frame" onClose={() => { stop(); onClose() }}>
      <div className="bc-cam"><video ref={video} muted playsInline /><span className="bc-cam-frame" aria-hidden="true" /></div>
      {err && <p className="dpos-err" role="alert">{err}</p>}
      {devices.length > 1 && <label className="f">Camera<select value={deviceId} onChange={e => setDeviceId(e.target.value)}>{devices.map((d, i) => <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${i + 1}`}</option>)}</select></label>}
    </Modal>, document.body);
}

// Scan bar for the billing screen: hardware scanner, typed/pasted code, or camera. A found item goes to onItem; an unknown code to onUnknown.
export function BarcodeScannerInput({ onItem, onUnknown }) {
  const [val, setVal] = useState(''); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(null); const [cam, setCam] = useState(false);
  const input = useRef(); const timer = useRef();
  const process = useCallback(async raw => {
    const code = normalizeBarcode(raw); if (!code) return;
    setBusy(true); setMsg(null);
    try {
      const r = await lookup(code);
      if (!r.found) { beep(false); onUnknown ? onUnknown(code) : setMsg({ t: 'err', x: `Barcode "${code}" is not in the ${BRAND} catalog` }); return }
      const it = r.item;
      if (!it.sellable) { beep(false); return setMsg({ t: 'err', x: `${it.name} is not on sale` }) }
      if (it.stock <= 0) { beep(false); return setMsg({ t: 'err', x: `"${it.name}${it.size ? ` (${it.size})` : ''}" is out of stock` }) }
      beep(true); setMsg({ t: 'ok', x: `${it.name}${it.size ? ` (${[it.size, it.color !== 'Default' ? it.color : ''].filter(Boolean).join(' / ')})` : ''} · ${inr(it.price)}` }); onItem(it); setVal('');
      clearTimeout(timer.current); timer.current = setTimeout(() => setMsg(null), 3500);
    } catch (e) { beep(false); setMsg({ t: 'err', x: e.message || 'Could not look up the barcode' }) } finally { setBusy(false) }
  }, [onItem, onUnknown]);
  useHardwareScanner(process);
  // a scan from another admin page that redirected here
  useEffect(() => { const h = e => process(e.detail); addEventListener(SCAN_EVENT, h); return () => removeEventListener(SCAN_EVENT, h) }, [process]);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div className="bc-scan">
      <div className="bc-scan-bar">
        <svg className="bc-scan-ic" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8V5.5A1.5 1.5 0 0 1 4.5 4H8M16 4h3.5A1.5 1.5 0 0 1 21 5.5V8M21 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H4.5A1.5 1.5 0 0 1 3 18.5V16" /><path d="M7 12h10" /></svg>
        <input ref={input} value={val} disabled={busy} placeholder="Scan barcode with machine, camera, or type code…" aria-label="Scan or type a barcode"
          onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && val.trim()) { e.preventDefault(); process(val) } }} />
        <button type="button" className="bc-scan-cam" aria-label="Scan with camera" onClick={() => setCam(true)}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.3-2h6.4L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" /><circle cx="12" cy="13" r="3.4" /></svg></button>
      </div>
      {msg && <p className={`bc-msg ${msg.t}`} role={msg.t === 'err' ? 'alert' : 'status'}>{msg.t === 'ok' ? '✓ ' : '⚠ '}{msg.x}</p>}
      {cam && <CameraScanner onClose={() => setCam(false)} onCode={c => { setCam(false); process(c) }} />}
    </div>
  );
}

// Attach a scanned (unknown) code to an existing item so it scans from now on.
export function AssignBarcodeModal({ code, onClose, onDone }) {
  const { toast } = useApp();
  const [q, setQ] = useState(''); const [res, setRes] = useState([]); const [busy, setBusy] = useState(''); const [err, setErr] = useState('');
  useEffect(() => { const t = setTimeout(() => api('/admin/pos/catalog?q=' + encodeURIComponent(q) + '&limit=30').then(setRes).catch(e => setErr(e.message)), 200); return () => clearTimeout(t) }, [q]);
  const assign = async v => {
    setBusy(String(v.variantId)); setErr('');
    try { await api('/admin/barcodes/receive', { method: 'POST', body: { variantId: v.variantId, quantity: 0, customBarcode: code, note: 'Assigned from scan' } }); toast(`${code} now belongs to ${v.name}.`); onDone?.(v); onClose() }
    catch (e) { setErr(e.message) } finally { setBusy('') }
  };
  return createPortal(
    <Modal title="Barcode not recognised" sub={code} onClose={onClose}>
      <p className="bc-info">⚠ This code is not in the catalog yet. Pick the item it belongs to and it will scan from now on.</p>
      <label className="f">Find the item<input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, size or SKU" /></label>
      {err && <p className="dpos-err" role="alert">{err}</p>}
      <ul className="bc-assign">{res.map(v => <li key={v.variantId}><div><b>{v.name}</b><small>{[v.size, v.color !== 'Default' ? v.color : null].filter(Boolean).join(' · ')} · {v.category || 'Uncategorised'} · stock {v.stock}</small></div>
        <button type="button" className="dpos-btn sm" disabled={!!busy} onClick={() => assign(v)}>{busy === String(v.variantId) ? '…' : 'Assign'}</button></li>)}
        {!res.length && <li className="muted" style={{ padding: 10 }}>No items found</li>}</ul>
    </Modal>, document.body);
}

// A scan on any other admin page: offer to jump to Billing and add it there (the original's "Barcode scanned" prompt).
export function GlobalScanListener() {
  const nav = useNavigate(); const loc = useLocation();
  const [pending, setPending] = useState(null);
  const onBilling = loc.pathname === '/admin/billing' || loc.pathname.startsWith('/admin/billing') && !loc.pathname.includes('/inventory') && !loc.pathname.includes('/settings');
  const onInv = loc.pathname.includes('/inventory');
  useHardwareScanner(code => { if (!onBilling && !onInv) setPending(code) }, !onBilling);
  useEffect(() => { if (onBilling && pending) { /* nothing */ } }, [onBilling, pending]);
  if (!pending) return null;
  const go = () => { const c = pending; setPending(null); nav('/admin/billing'); setTimeout(() => dispatchEvent(new CustomEvent(SCAN_EVENT, { detail: c })), 900) };
  return createPortal(
    <Modal title="Barcode scanned" sub={pending} onClose={() => setPending(null)}
      footer={<><button type="button" className="dpos-btn ghost" onClick={() => setPending(null)}>Cancel</button><button type="button" className="dpos-btn" onClick={go}>Go to Billing &amp; add it</button></>}>
      <p className="bc-info">⚠ You scanned a barcode outside the Billing screen. Open Billing to add this item to the bill?</p>
    </Modal>, document.body);
}
