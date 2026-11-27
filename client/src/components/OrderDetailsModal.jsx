import { useEffect } from 'react';
import { inr } from '../lib/format';
import BillSummary from './BillSummary';

const PAY = { cash: 'Cash', upi: 'GPay / UPI', card: 'Card', split: 'Split' };

// The three figures at the top: what the order came to, what has been paid, and what matters next (balance due, a refund,
// or how it was paid). Without the saved bill only the facts that are known are shown.
function figures({ bill, total, items, source }) {
  const pieces = items.reduce((n, i) => n + (i.qty || 0), 0);
  if (!bill) return [['Order total', inr(total || 0)], ['Pieces', pieces], ['Source', String(source || 'offline').toUpperCase()]];
  const whole = ['Grand total', inr(bill.total ?? total ?? 0)];
  if (bill.status === 'voided' || bill.status === 'cancelled') return [whole, ['Pieces', pieces], ['Status', bill.status === 'voided' ? 'Voided' : 'Cancelled', 'bad']];
  if (!bill.invoiceNo && bill.balance > 0) return [whole, ['Deposit paid', inr(bill.deposit || 0), 'ok'], ['Balance due', inr(bill.balance), 'bad']];
  const refunded = (bill.returns || []).reduce((n, r) => n + r.total, 0);
  const mode = PAY[bill.paymentMode] || (bill.paymentMode ? String(bill.paymentMode).toUpperCase() : '—');
  return [whole, ['Amount paid', inr(bill.total ?? total ?? 0), 'ok'], refunded > 0 ? ['Refunded', inr(refunded), 'bad'] : ['Paid by', mode]];
}

// The eye button on every admin order list: a clean read-only "Order Details" sheet, laid out like "Bill Generated".
// bill (+ sale for a billed advance order): shows the complete split-up (discounts, GST, delivery, payments, dates) instead of the short totals.
// rows: extra summary lines [{ label, value, tone }] shown between Discount and TOTAL (e.g. Advance paid).
export default function OrderDetailsModal({ no, customer, phone, address, source, isGst, when, items = [], subtotal, discount = 0, delivery = 0, total, rows = [], notes, loading, onClose, bill, sale }) {
  useEffect(() => { const k = e => e.key === 'Escape' && onClose(); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k) }, [onClose]);
  const dt = when ? new Date(when) : null;
  const sub = subtotal ?? items.reduce((t, i) => t + i.total, 0);
  const facts = [['Customer', customer || 'Walk-in Customer'], ['Contact', phone || 'N/A'], ['Date & time', dt && !isNaN(dt) ? dt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'],
    ['Source', String(source || 'offline').toUpperCase()], ...(address ? [['Address', address, 'wide']] : [])];
  return (
    <div className="dpos-modal" role="dialog" aria-modal="true" aria-label="Order details" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="dpos-sheet dpos-done od-done">
        <div className="dpos-done-head">
          <div><h2>Order Details <span className="dpos-tag solid">{isGst ? 'GST' : 'NON-GST'}</span></h2><p className="oid">{no ? `#${no}` : ''}</p></div>
          <button type="button" className="dpos-btn" onClick={onClose} aria-label="Close">✕ Close</button>
        </div>
        {loading ? <p className="od-load">Loading…</p> : <>
          <section className="dpos-done-card">
            {figures({ bill: bill && (sale && !bill.invoiceNo ? sale : bill), total, items, source }).map(([label, value, tone], n) => (
              <div key={label} className={n < 2 ? `dpos-done-row ${tone || ''}` : tone === 'bad' ? 'adv-bal' : 'dpos-done-bal'}><span>{label}</span><b>{value}</b></div>))}
          </section>
          <section className="dpos-done-card items d-items od-facts">
            <dl>{facts.map(([k, v, wide]) => <div key={k} className={wide || ''}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </section>
          <section className="dpos-done-card items d-items">
            <p className="dpos-done-l">ORDER ITEMS</p>
            {items.map((i, n) => <div key={n} className="dpos-done-item"><span><b>{i.name}</b> <small className="muted">{i.note ? `${i.note} · ` : ''}{i.qty} × {inr(i.unit)}</small></span><span>{inr(i.total)}</span></div>)}
          </section>
          <section className="dpos-done-card items d-split">
            <p className="dpos-done-l">BILL SPLIT-UP</p>
            {bill ? <><BillSummary bill={bill} sale={sale} />{rows.length > 0 && <div className="bsum">{rows.map((r, n) => <div key={n} className={`od-extra ${r.tone || ''}`}><span>{r.label}</span><b>{r.value}</b></div>)}</div>}</> : (
              <div className="bsum">
                <div><span>Subtotal</span><b>{inr(sub)}</b></div>
                {discount > 0 && <div><span>Discount</span><b>−{inr(discount)}</b></div>}
                {delivery > 0 && <div><span>Delivery</span><b>{inr(delivery)}</b></div>}
                {rows.map((r, n) => <div key={n} className={`od-extra ${r.tone || ''}`}><span>{r.label}</span><b>{r.value}</b></div>)}
                <div className="bsum-total"><span>TOTAL</span><b>{inr(total)}</b></div>
              </div>)}
          </section>
          {notes && <p className="od-note od-note2">Note: {notes}</p>}
        </>}
      </div>
    </div>
  );
}
