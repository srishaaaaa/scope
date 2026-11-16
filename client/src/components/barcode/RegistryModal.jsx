import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Modal from '../Modal';
import { api } from '../../lib/api';
import { inr } from '../../lib/format';
import { useApp } from '../../context/App';
import { BarcodePrintModal } from './BarcodeParts';

// Every barcode in the shop: search, print the labels again, or switch one off (a switched-off barcode no longer scans).
export default function RegistryModal({ onClose, onChanged }) {
  const { toast } = useApp();
  const [q, setQ] = useState(''); const [rows, setRows] = useState(null); const [err, setErr] = useState(''); const [print, setPrint] = useState(null);
  const load = useCallback(() => api('/admin/barcodes?limit=300&q=' + encodeURIComponent(q)).then(r => { setRows(r); setErr('') }).catch(e => setErr(e.message)), [q]);
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t) }, [load]);
  const off = async r => { if (!confirm(`Switch off barcode ${r.barcodeValue}? It will no longer scan.`)) return; try { await api('/admin/barcodes/' + r.barcodeId, { method: 'DELETE' }); toast('Barcode switched off.'); load(); onChanged?.() } catch (e) { setErr(e.message) } };
  const name = r => [r.size, r.color !== 'Default' ? r.color : null].filter(Boolean).join(' / ');
  return createPortal(
    <Modal title="Barcode registry" sub="Every barcode assigned to an item" onClose={onClose} wide>
      <label className="f"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by barcode, item or SKU" aria-label="Search barcodes" /></label>
      {err && <p className="dpos-err" role="alert">{err}</p>}
      <div className="dpos-tw bc-reg"><table><thead><tr><th>Barcode</th><th>Item</th><th className="r">Stock</th><th className="r">Price</th><th>Status</th><th /></tr></thead><tbody>
        {!rows ? <tr><td colSpan="6" className="muted">Loading…</td></tr> : !rows.length ? <tr><td colSpan="6" className="muted">No barcodes yet. Use Add Barcode to create some.</td></tr> :
          rows.map(r => <tr key={r.barcodeId}><td><code>{r.barcodeValue}</code></td><td><b>{r.name}</b><div className="muted small">{name(r)} · {r.category || 'Uncategorised'}</div></td><td className="r">{r.stock}</td><td className="r">{inr(r.price)}</td>
            <td>{r.isActive ? <span className="dpos-pill ok">Active</span> : <span className="dpos-pill bad">Off</span>}</td>
            <td className="r">{r.isActive && <><button type="button" className="link-u small" onClick={() => setPrint({ productName: r.name, variantName: name(r), barcodeValue: r.barcodeValue, price: r.price, defaultQuantity: 1 })}>Print</button>{' · '}<button type="button" className="link-u small" onClick={() => off(r)}>Switch off</button></>}</td></tr>)}
      </tbody></table></div>
      {print && <BarcodePrintModal item={print} onClose={() => setPrint(null)} />}
    </Modal>, document.body);
}
