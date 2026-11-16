import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Modal from '../Modal';
import {
  BRAND, DEFAULT_LABEL_SIZES, getAllLabelSizes, getStoredBarcodeSettings, saveStoredBarcodeSettings, renderBarcodeSvg, printLabels,
  createCustomSize, deleteCustomSize, loadCustomSizes, onSizesChange, rupees,
} from '../../lib/barcode';
import { inr } from '../../lib/format';

// Re-renders when the shared list of custom label sizes changes.
export function useLabelSizes() {
  const [sizes, setSizes] = useState(getAllLabelSizes());
  useEffect(() => { loadCustomSizes().then(() => setSizes(getAllLabelSizes())); return onSizesChange(() => setSizes(getAllLabelSizes())) }, []);
  return sizes;
}

export function BarcodeSvg({ value, width = 1.4, height = 34, fontSize = 10, displayValue = true, className = '' }) {
  const ref = useRef();
  useEffect(() => { if (ref.current && value) renderBarcodeSvg(ref.current, value, { width, height, fontSize, displayValue, margin: 0, font: 'Arial, sans-serif', textMargin: 1.5 }) }, [value, width, height, fontSize, displayValue]);
  return <svg ref={ref} className={className} />;
}

// On-screen sticker preview, in the shape of the chosen label.
export function LabelPreview({ productName, variantName, barcodeValue, price, mrp, header = BRAND, widthMm = 50, heightMm = 30, tag }) {
  const small = heightMm <= 25, large = heightMm >= 40;
  const bh = Math.max(16, Math.round(heightMm * 0.32 * 3.78)), bw = Math.max(0.8, Math.min(1.7, Math.round(((Math.max(30, (widthMm - 4) * 3.78)) / 120) * 100) / 100));
  return (
    <div className="bc-sticker" style={{ width: `${widthMm}mm`, height: `${heightMm}mm`, padding: small ? '.6mm 1.2mm' : large ? '1.5mm 2.2mm' : '1mm 1.6mm' }}>
      <div className="bc-st-head"><b style={{ fontSize: small ? 7.5 : large ? 11 : 9 }}>{header}</b><span style={{ fontSize: small ? 6.5 : large ? 9.5 : 8 }}>{productName}{variantName ? ` (${variantName})` : ''}</span></div>
      <div className="bc-st-bars"><BarcodeSvg value={barcodeValue} width={bw} height={bh} fontSize={small ? 6 : 8} /></div>
      <div className="bc-st-foot" style={{ fontSize: small ? 6 : 7.5 }}>
        {mrp && mrp > price ? <s>MRP {inr(mrp)}</s> : <i>{tag || `${BRAND} RETAIL`}</i>}<b style={{ fontSize: small ? 8.5 : large ? 12 : 10 }}>{inr(price)}</b>
      </div>
    </div>
  );
}

// Printer, label size and which fields appear on the label. Saved on this device.
export function BarcodeSettingsDrawer({ onClose, settings, onChange }) {
  const sizes = useLabelSizes();
  const [custom, setCustom] = useState(false);
  const upd = p => { const n = { ...settings, ...p }; saveStoredBarcodeSettings(n); onChange(n) };
  useEffect(() => { const k = e => e.key === 'Escape' && !custom && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [custom, onClose]);
  return createPortal(
    <div className="bc-drawer-ov" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <aside className="bc-drawer" role="dialog" aria-modal="true" aria-label="Barcode settings">
        <div className="bc-drawer-h"><b>Barcode Settings</b><button type="button" aria-label="Close" onClick={onClose}>✕</button></div>
        <div className="bc-drawer-b">
          <section><div className="bc-row"><h4>Printer</h4><em>Select any 1 option</em></div>
            <div className="bc-box">
              <label><input type="radio" name="bc-printer" checked={settings.printerType === 'label'} onChange={() => upd({ printerType: 'label' })} /> Label Printer (Thermal)</label>
              <label><input type="radio" name="bc-printer" checked={settings.printerType === 'regular'} onChange={() => upd({ printerType: 'regular' })} /> Regular Printer (A4 Sheet)</label>
            </div></section>
          <section><div className="bc-row"><h4>Size</h4><em>Select any 1 option</em></div>
            <div className="bc-box">
              {sizes.map(s => (
                <label key={s.id}><input type="radio" name="bc-size" checked={settings.selectedSizeId === s.id} onChange={() => upd({ selectedSizeId: s.id })} /> <span>{s.name}</span>
                  {s.isCustom && <><span className="bc-tag">Custom</span><button type="button" className="bc-x" aria-label={`Delete ${s.name}`} onClick={async e => { e.preventDefault(); if (confirm(`Delete the size "${s.name}"?`)) { await deleteCustomSize(s.id); if (settings.selectedSizeId === s.id) upd({ selectedSizeId: DEFAULT_LABEL_SIZES[1].id }) } }}>✕</button></>}
                </label>))}
              <button type="button" className="bc-link" onClick={() => setCustom(true)}>+ Create Custom Size ⓘ</button>
            </div></section>
          <section><div className="bc-row"><h4>Additional Fields</h4></div>
            <div className="bc-box">
              <label><input type="checkbox" checked={settings.showSalePrice} onChange={() => upd({ showSalePrice: !settings.showSalePrice })} /> Sale Price (₹)</label>
              <label><input type="checkbox" checked={settings.showCompanyName} onChange={() => upd({ showCompanyName: !settings.showCompanyName })} /> Company Name ({BRAND})</label>
              <label><input type="checkbox" checked={settings.showItemName} onChange={() => upd({ showItemName: !settings.showItemName })} /> Item Name</label>
              <label><input type="checkbox" checked={settings.showDiscount} onChange={() => upd({ showDiscount: !settings.showDiscount })} /> Discount / MRP</label>
            </div></section>
        </div>
        <div className="bc-drawer-f"><button type="button" className="bc-done" onClick={onClose}>✓ DONE</button></div>
      </aside>
      {custom && <CustomSizeModal onClose={() => setCustom(false)} onCreated={s => upd({ selectedSizeId: s.id })} />}
    </div>, document.body);
}

export function CustomSizeModal({ onClose, onCreated }) {
  const [f, setF] = useState({ name: '', perRow: 1, w: '50', h: '25', gap: '2' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const w = parseFloat(f.w) || 50, h = parseFloat(f.h) || 25, gap = parseFloat(f.gap) || 0, n = Number(f.perRow);
  const save = async e => {
    e.preventDefault(); setErr('');
    if (!f.name.trim()) return setErr('Please enter a custom size name');
    if (!(parseFloat(f.w) > 0) || !(parseFloat(f.h) > 0)) return setErr('Please enter valid width and height dimensions in mm');
    setBusy(true);
    try { const s = await createCustomSize({ name: f.name.trim(), labelsPerRow: n, widthMm: parseFloat(f.w), heightMm: parseFloat(f.h), horizontalGapMm: gap }); onCreated(s); onClose() } catch (x) { setErr(x.message) } finally { setBusy(false) }
  };
  const k = Math.min(1, 280 / (w * n + gap * (n - 1)), 120 / h);
  return createPortal(
    <Modal title="Create Custom Size" onClose={onClose} wide>
      <form onSubmit={save} className="bc-cs">
        <p className="bc-info">ⓘ For best results in the generic flow, configure labels in Printer Settings as well.</p>
        {err && <p className="dpos-err" role="alert">{err}</p>}
        <div className="bc-cs-grid">
          <div>
            <label className="f">Custom Size Name<input autoFocus required placeholder="e.g. custom 50x38" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></label>
            <label className="f">Labels Per Row<select value={f.perRow} onChange={e => setF({ ...f, perRow: e.target.value })}>{[1, 2, 3, 4].map(x => <option key={x} value={x}>{x}</option>)}</select></label>
            <label className="f">Label Width (mm)<input type="number" step="0.1" required value={f.w} onChange={e => setF({ ...f, w: e.target.value })} /></label>
            <label className="f">Label Height (mm)<input type="number" step="0.1" required value={f.h} onChange={e => setF({ ...f, h: e.target.value })} /></label>
            {n > 1 && <label className="f">Gap between labels (mm)<input type="number" step="0.1" value={f.gap} onChange={e => setF({ ...f, gap: e.target.value })} /></label>}
          </div>
          <div className="bc-cs-prev"><h4>Preview</h4>
            <div className="bc-cs-roll" style={{ display: 'flex', gap: gap * k * 3.78 }}>
              {Array.from({ length: n }, (_, i) => <div key={i} style={{ width: w * k * 3.78, height: h * k * 3.78 }} className="bc-cs-lbl">{w} × {h}</div>)}
            </div>
            <small className="muted">{(w * n + gap * (n - 1)).toFixed(1)} × {h} mm printed page</small></div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}><button type="button" className="dpos-btn ghost" onClick={onClose}>Cancel</button><button className="dpos-btn" disabled={busy}>{busy ? 'Saving…' : 'Save size'}</button></div>
      </form>
    </Modal>, document.body);
}

// Print preview of every label, then print.
export function SheetPreviewModal({ items, size, onClose, onPrint }) {
  const labels = items.flatMap(it => Array.from({ length: Math.max(1, it.count || 1) }, () => it));
  const k = Math.min(4.8, 195 / size.widthMm), cw = Math.max(130, Math.round(size.widthMm * k)), ch = Math.max(85, Math.round(size.heightMm * k));
  return createPortal(
    <Modal title="Print Preview" sub={`${labels.length} labels · ${size.name} · ${size.widthMm} × ${size.heightMm} mm`} onClose={onClose} wide
      footer={<><button type="button" className="dpos-btn ghost" onClick={onClose}>Close</button><button type="button" className="dpos-btn" onClick={onPrint}>🖨 Print {labels.length} labels</button></>}>
      <div className="bc-sheet">{labels.map((it, i) => (
        <div key={i} className="bc-card" style={{ width: cw, height: ch }}>
          <b>{it.header || BRAND}</b><span>{it.title}</span>
          <BarcodeSvg value={it.barcodeValue} width={Math.max(0.8, Math.min(1.85, (cw * 0.85) / 115))} height={Math.max(22, Math.round(ch * 0.46))} fontSize={Math.max(7, Math.round(ch * 0.08))} displayValue={false} />
          <small>{it.barcodeValue}</small><div className="bc-card-f"><i>{it.tag || `${BRAND} RETAIL`}</i><strong>₹{rupees(it.price)}</strong></div>
        </div>))}</div>
    </Modal>, document.body);
}

// Print the labels of one item (product + variant already has its barcode).
export function BarcodePrintModal({ item, onClose }) {
  const sizes = useLabelSizes();
  const [settings, setSettings] = useState(getStoredBarcodeSettings());
  const [qty, setQty] = useState(String(item.defaultQuantity || 1));
  const [sizeId, setSizeId] = useState(settings.selectedSizeId);
  const [copied, setCopied] = useState(false);
  const size = sizes.find(s => s.id === sizeId) || sizes[0];
  const title = `${item.productName}${item.variantName ? ` (${item.variantName})` : ''}`;
  const set = p => { const n = { ...settings, ...p }; saveStoredBarcodeSettings(n); setSettings(n) };
  const print = () => printLabels([{ barcodeValue: item.barcodeValue, title, header: BRAND, tag: item.tag, price: item.price, mrp: item.mrp, count: Math.max(1, parseInt(qty, 10) || 1) }], size, settings, `Print Barcode - ${item.barcodeValue}`);
  return createPortal(
    <Modal title={`Print Barcode Labels (${BRAND})`} sub="Generate physical retail stickers for this item" onClose={onClose} wide
      footer={<><button type="button" className="dpos-btn ghost" onClick={onClose}>Close</button><button type="button" className="dpos-btn" onClick={print}>🖨 Print {Math.max(1, parseInt(qty, 10) || 1)} label{(parseInt(qty, 10) || 1) > 1 ? 's' : ''}</button></>}>
      <div className="bc-print">
        <div className="bc-print-info"><div><small>PRODUCT / SKU</small><h3>{item.productName}</h3>{item.variantName && <span className="bc-chip">Variant: {item.variantName}</span>}</div>
          <div className="bc-code"><code>{item.barcodeValue}</code><button type="button" onClick={() => { navigator.clipboard?.writeText(item.barcodeValue); setCopied(true); setTimeout(() => setCopied(false), 1800) }}>{copied ? '✓' : '⧉'}</button></div></div>
        <div className="bc-print-grid">
          <div><label className="f">Target printer</label>
            <div className="bc-seg"><button type="button" className={settings.printerType === 'label' ? 'on' : ''} onClick={() => set({ printerType: 'label' })}>Thermal (Roll)</button><button type="button" className={settings.printerType === 'regular' ? 'on' : ''} onClick={() => set({ printerType: 'regular' })}>Desktop (A4)</button></div>
            <small className="muted">{settings.printerType === 'label' ? `Roll label printer (${(size.labelsPerRow || 1) > 1 ? `${size.labelsPerRow} labels per page` : '1 label per page'})` : 'A4 sheet printer'}</small></div>
          <label className="f">Label size<select value={sizeId} onChange={e => { setSizeId(e.target.value); set({ selectedSizeId: e.target.value }) }}>{sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label className="f">Number of labels<input inputMode="numeric" value={qty} onChange={e => setQty(e.target.value.replace(/[^0-9]/g, ''))} /></label>
        </div>
        <div className="bc-print-prev"><small>LIVE PREVIEW</small><LabelPreview productName={item.productName} variantName={item.variantName} barcodeValue={item.barcodeValue} price={item.price} mrp={item.mrp} widthMm={size.widthMm} heightMm={size.heightMm} /></div>
      </div>
    </Modal>, document.body);
}
