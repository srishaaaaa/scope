import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../lib/api';
import { useApp } from '../../context/App';
import { inr } from '../../lib/format';
import { BRAND, getStoredBarcodeSettings, newItemCode, normalizeBarcode, printLabels, isValidBarcodeValue } from '../../lib/barcode';
import { BarcodeSettingsDrawer, BarcodeSvg, SheetPreviewModal, useLabelSizes } from './BarcodeParts';

const vName = v => [v.size, v.color && v.color !== 'Default' ? v.color : null].filter(Boolean).join(' / ');

// Barcode Generator: pick an item and size, give it a code (or assign one), queue it, then generate + print the labels. Generating saves the
// barcode against the item (and, if ticked, receives that many pieces into stock in the same step).
export default function CreateBarcodeModal({ products, preselect, onClose, onDone }) {
  const { toast } = useApp();
  const sizes = useLabelSizes();
  const [settings, setSettings] = useState(getStoredBarcodeSettings());
  const [drawer, setDrawer] = useState(false); const [preview, setPreview] = useState(null);
  const [updateStock, setUpdateStock] = useState(false);
  const [assigned, setAssigned] = useState({}); // variantId -> barcode already registered
  const [prod, setProd] = useState(null); const [search, setSearch] = useState(''); const [open, setOpen] = useState(false);
  const [vid, setVid] = useState(null);
  const [code, setCode] = useState(''); const [labels, setLabels] = useState('1');
  const [header, setHeader] = useState(BRAND); const [l1, setL1] = useState(''); const [l2, setL2] = useState(''); const [l3, setL3] = useState('Discount: 0%'); const [l4, setL4] = useState('');
  const [queue, setQueue] = useState([]); const [msg, setMsg] = useState(null); const [busy, setBusy] = useState(false);
  const box = useRef();
  const size = sizes.find(s => s.id === settings.selectedSizeId) || sizes[0];

  useEffect(() => { api('/admin/barcodes?limit=500').then(r => setAssigned(Object.fromEntries(r.filter(x => x.isActive).map(x => [x.variantId, x.barcodeValue])))).catch(() => {}) }, []);
  useEffect(() => { const k = e => e.key === 'Escape' && !drawer && !preview && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [drawer, preview, onClose]);
  useEffect(() => { const c = e => box.current && !box.current.contains(e.target) && setOpen(false); document.addEventListener('mousedown', c); return () => document.removeEventListener('mousedown', c) }, []);

  const pick = (p, variantId) => {
    setProd(p); setSearch(p.name); setOpen(false);
    const v = (p.variants || []).find(x => x.id === variantId) || p.variants?.[0];
    setVid(v?.id ?? null); fill(p, v);
  };
  const fill = (p, v) => {
    setCode(assigned[v?.id] || newItemCode());
    setL1(p.name); setL2(v ? `Size: ${vName(v)}` : (p.category || ''));
    setL3(settings.showDiscount ? 'Discount: 0%' : `Price: ${inr(v?.priceOverride ?? p.price)}`);
  };
  useEffect(() => { if (preselect) { const p = products.find(x => x.id === preselect.productId); if (p) pick(p, preselect.variantId) } }, [preselect, products]); // eslint-disable-line
  const variant = prod?.variants?.find(v => v.id === vid) || null;
  const price = variant ? (variant.priceOverride ?? prod.price) : prod?.price ?? 0;
  const existing = variant ? assigned[variant.id] : null;

  const list = useMemo(() => { const t = search.trim().toLowerCase(); return products.filter(p => !t || p.name.toLowerCase().includes(t) || (p.category || '').toLowerCase().includes(t) || p.variants?.some(v => (v.sku || '').toLowerCase().includes(t))).slice(0, 60) }, [products, search]);

  const add = () => {
    if (!prod || !variant) return setMsg({ t: 'err', x: 'Please select an item first' });
    if (existing) return setMsg({ t: 'err', x: `Barcode already exists for this item (${existing}). You can print it from the stock list.` });
    const c = normalizeBarcode(code);
    if (!c) return setMsg({ t: 'err', x: 'Item Code / Barcode is required' });
    if (!isValidBarcodeValue(c)) return setMsg({ t: 'err', x: 'A barcode is 4 to 32 letters, numbers, dashes or underscores' });
    if (queue.some(q => q.variantId === variant.id)) return setMsg({ t: 'err', x: `${prod.name} (${vName(variant)}) is already in the queue.` });
    const dup = queue.find(q => q.barcodeValue === c);
    if (dup) return setMsg({ t: 'err', x: `Barcode ${c} is already used for ${dup.productName} in the queue. Click "Assign Code" for a fresh one.` });
    setQueue(q => [...q, { id: `${Date.now()}${Math.random()}`, productId: prod.id, productName: prod.name, variantId: variant.id, variantName: vName(variant), barcodeValue: c, price, count: Math.max(1, parseInt(labels, 10) || 1), header: header.trim(), tag: l2.trim(), selected: true, title: `${prod.name}${vName(variant) ? ` (${vName(variant)})` : ''}` }]);
    setMsg(null); setLabels('1'); setCode(newItemCode());
  };
  const sel = queue.filter(q => q.selected); const total = sel.reduce((n, q) => n + q.count, 0);
  const patch = (id, p) => setQueue(q => q.map(x => x.id === id ? { ...x, ...p } : x));

  const generate = async () => {
    if (!sel.length) return setMsg({ t: 'err', x: 'Please add and select at least one item to generate barcodes' });
    setBusy(true); setMsg(null);
    try {
      for (const it of sel) await api('/admin/barcodes/receive', { method: 'POST', body: { variantId: it.variantId, quantity: updateStock ? it.count : 0, customBarcode: it.barcodeValue, note: updateStock ? `Barcode Generator (${it.count} labels)` : 'Barcode assigned' } });
      setAssigned(a => ({ ...a, ...Object.fromEntries(sel.map(i => [i.variantId, i.barcodeValue])) }));
      setMsg({ t: 'ok', x: `Barcodes saved for ${sel.length} item${sel.length > 1 ? 's' : ''} (${total} labels)${updateStock ? ' and stock updated' : ''}.` });
      toast(`Barcodes saved for ${sel.length} item${sel.length > 1 ? 's' : ''}.`); onDone?.(); setPreview(sel);
    } catch (e) { setMsg({ t: 'err', x: e.message }) } finally { setBusy(false) }
  };
  const doPrint = items => printLabels(items, size, settings);

  return createPortal(
    <div className="dpos-modal bc-gen-ov" role="dialog" aria-modal="true" aria-label="Barcode Generator" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="dpos-sheet wide bc-gen">
        <div className="dpos-mhead bc-gen-h"><div><b style={{ fontSize: 17 }}>Barcode Generator</b></div>
          <div className="bc-gen-meta"><span>Printer <b>{settings.printerType === 'label' ? 'Label Printer' : 'Regular Printer'}</b></span><span>Size <b>{size.name}</b></span>
            <button type="button" aria-label="Barcode settings" onClick={() => setDrawer(true)}>⚙</button><button type="button" aria-label="Close" onClick={onClose}>✕</button></div></div>

        <div className="bc-gen-b">
          <section className="bc-panel">
            <div className="bc-form">
              <h4>ENTER ITEM DETAILS TO ADD FOR BARCODE</h4>
              <div className="bc-fg">
                <div className="f bc-dd" ref={box}><span>ITEM NAME *</span>
                  <input value={search} placeholder="Enter / Select Item Name" onFocus={() => setOpen(true)} onChange={e => { setSearch(e.target.value); setOpen(true) }} />
                  {open && <ul className="bc-dd-list" role="listbox">{list.length ? list.map(p => <li key={p.id}><button type="button" onClick={() => pick(p)}><b>{p.name}</b><small>{p.category || 'Uncategorised'} · {p.variants?.length || 0} size{p.variants?.length === 1 ? '' : 's'} · {inr(p.price)}</small></button></li>) : <li className="muted" style={{ padding: 10 }}>No items found</li>}</ul>}
                </div>
                {prod && prod.variants?.length > 0 && <label className="f"><span>SIZE / VARIANT</span><select value={vid ?? ''} onChange={e => { const v = prod.variants.find(x => x.id === +e.target.value); setVid(v.id); fill(prod, v) }}>{prod.variants.map(v => <option key={v.id} value={v.id}>{vName(v)}{assigned[v.id] ? ' ✓' : ''}</option>)}</select></label>}
                <div className="f bc-code-row"><span>ITEM CODE *</span><div><input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Enter Item Code" /><button type="button" className="dpos-btn ghost sm" onClick={() => setCode(newItemCode())}>Assign Code</button></div></div>
                <label className="f"><span>NO OF LABELS *</span><input inputMode="numeric" value={labels} onChange={e => setLabels(e.target.value.replace(/[^0-9]/g, ''))} /></label>
                <label className="f"><span>HEADER</span><input value={header} onChange={e => setHeader(e.target.value)} placeholder={BRAND} /></label>
                <label className="f"><span>LINE 1</span><input value={l1} onChange={e => setL1(e.target.value)} placeholder="Enter Line 1" /></label>
                <label className="f"><span>LINE 2 (shown on the label)</span><input value={l2} onChange={e => setL2(e.target.value)} placeholder="Enter Line 2" /></label>
                <label className="f"><span>LINE 3</span><input value={l3} onChange={e => setL3(e.target.value)} placeholder="Enter Line 3" /></label>
                <label className="f"><span>LINE 4</span><input value={l4} onChange={e => setL4(e.target.value)} placeholder="Enter Line 4" /></label>
              </div>
              {existing && <p className="bc-note">This item already has barcode <b>{existing}</b>.</p>}
            </div>
            <div className="bc-prev">
              <div className="bc-row"><h4>LIVE PREVIEW</h4><span className="bc-pill">{size.widthMm} × {size.heightMm} mm</span></div>
              <div className="bc-prev-box"><div className="bc-sticker" style={{ width: `${Math.min(size.widthMm, 60) * 3.78}px`, height: `${Math.min(size.widthMm, 60) / size.widthMm * size.heightMm * 3.78}px` }}>
                <div className="bc-st-head">{settings.showCompanyName && <b>{header || BRAND}</b>}{settings.showItemName && <span>{l1 || 'Item Name'}</span>}</div>
                <div className="bc-st-bars"><BarcodeSvg value={code.trim() || `${BRAND.replace(/\W/g, '').slice(0, 3)}0000000`} width={1.2} height={Math.max(20, size.heightMm * 0.9)} fontSize={9} /></div>
                <div className="bc-st-foot"><i>{l2 || `${BRAND} RETAIL`}</i>{settings.showSalePrice && <b>{inr(price)}</b>}</div></div></div>
              <small className="muted">{settings.printerType === 'label' ? 'Thermal Roll' : 'A4'} • {size.labelsPerRow > 1 ? `${size.labelsPerRow} barcodes per row` : '1 barcode per page'} • {size.name}</small>
              <button type="button" className="bc-add" onClick={add}>+ ADD FOR BARCODE</button>
            </div>
          </section>

          {msg && <p className={`bc-msg ${msg.t}`} role={msg.t === 'err' ? 'alert' : 'status'}>{msg.t === 'ok' ? '✓ ' : '⚠ '}{msg.x}</p>}

          <section className="bc-queue">
            <div className="bc-queue-h"><b>ITEM DETAILS ({queue.length})</b>
              {queue.length > 0 && <label><input type="checkbox" checked={queue.every(q => q.selected)} onChange={e => setQueue(q => q.map(x => ({ ...x, selected: e.target.checked })))} /> Select all</label>}</div>
            {!queue.length ? <p className="bc-empty">✦ Items you add for barcode appear here</p> : (
              <div className="dpos-tw"><table><thead><tr><th /><th>Item</th><th>Barcode</th><th className="r">Labels</th><th className="r">Price</th><th /></tr></thead><tbody>
                {queue.map(q => <tr key={q.id}><td><input type="checkbox" aria-label={`Select ${q.productName}`} checked={q.selected} onChange={e => patch(q.id, { selected: e.target.checked })} /></td>
                  <td><b>{q.productName}</b><div className="muted small">{q.variantName}</div></td><td><code>{q.barcodeValue}</code></td>
                  <td className="r"><input className="bc-n" inputMode="numeric" value={q.count} onChange={e => patch(q.id, { count: Math.max(1, parseInt(e.target.value.replace(/\D/g, ''), 10) || 1) })} /></td>
                  <td className="r">{inr(q.price)}</td><td><button type="button" className="dpos-trash" aria-label="Remove" onClick={() => setQueue(l => l.filter(x => x.id !== q.id))}>✕</button></td></tr>)}</tbody></table></div>)}
          </section>
        </div>

        <div className="bc-gen-f">
          <button type="button" className="dpos-btn ghost" onClick={onClose}>Close</button>
          <label className="bc-us"><input type="checkbox" checked={updateStock} onChange={e => setUpdateStock(e.target.checked)} /> Update Stock</label>
          <button type="button" className="dpos-btn ghost" disabled={!sel.length} onClick={() => setPreview(sel)}>Preview</button>
          <button type="button" className="dpos-btn" disabled={busy || !sel.length} onClick={generate}>{busy ? 'Saving…' : `🖨 Generate & Print (${total})`}</button>
        </div>
      </div>
      {drawer && <BarcodeSettingsDrawer settings={settings} onChange={setSettings} onClose={() => setDrawer(false)} />}
      {preview && <SheetPreviewModal items={preview} size={size} onClose={() => setPreview(null)} onPrint={() => doPrint(preview)} />}
    </div>, document.body);
}
