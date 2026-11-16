import { Router } from 'express';
import { z } from 'zod';
import { one, rows } from '../db/index.js';
import { HttpError, wrap } from '../lib/http.js';
import { lookupBarcode, receiveWithBarcode, registry } from '../lib/barcodes.js';

const sizeBody = z.object({
  id: z.string().trim().regex(/^[a-z0-9_-]{3,60}$/i).optional(), name: z.string().trim().min(1).max(80),
  labelsPerRow: z.number().int().min(1).max(6), widthMm: z.number().min(10).max(210), heightMm: z.number().min(8).max(297), horizontalGapMm: z.number().min(0).max(30).default(0),
});
const toSize = r => ({ id: r.id, name: r.name, labelsPerRow: r.labels_per_row, widthMm: +r.width_mm, heightMm: +r.height_mm, horizontalGapMm: +r.horizontal_gap_mm, isCustom: true });

// Barcodes: scan lookups (billing and stock staff), and barcode + stock-receive, registry and label sizes (owner, admin, stock staff).
export default function barcodes({ db, auth }) {
  const r = Router();
  const reader = auth.role('owner', 'admin', 'cashier', 'inventory');
  const stockers = auth.role('owner', 'admin', 'inventory');

  r.get('/barcodes/lookup', reader, wrap(async (req, res) => {
    const { code } = z.object({ code: z.string().trim().min(1).max(64) }).parse(req.query);
    const item = await lookupBarcode(db, code);
    res.json({ found: !!item, item });
  }));

  r.post('/barcodes/receive', stockers, wrap(async (req, res) => {
    const d = z.object({ variantId: z.number().int().positive(), quantity: z.number().int().min(0).max(100000).default(0), customBarcode: z.string().trim().max(32).nullable().optional(),
      unitCost: z.number().int().min(0).nullable().optional(), note: z.string().trim().max(60).optional() }).parse(req.body);
    res.json(await receiveWithBarcode(db, req.user, d));
  }));

  r.get('/barcodes', stockers, wrap(async (req, res) => {
    const d = z.object({ q: z.string().trim().max(80).default(''), limit: z.coerce.number().int().min(1).max(500).default(100), offset: z.coerce.number().int().min(0).default(0) }).parse(req.query);
    res.json(await registry(db, d));
  }));

  r.get('/barcodes/sizes', reader, wrap(async (_req, res) => res.json((await rows(db, 'SELECT * FROM barcode_custom_sizes ORDER BY created_at, id')).map(toSize))));
  r.post('/barcodes/sizes', stockers, wrap(async (req, res) => {
    const d = sizeBody.parse(req.body);
    const id = d.id || `custom_${Date.now().toString(36)}`;
    const row = await one(db, `INSERT INTO barcode_custom_sizes (id, name, labels_per_row, width_mm, height_mm, horizontal_gap_mm) VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, labels_per_row = EXCLUDED.labels_per_row, width_mm = EXCLUDED.width_mm, height_mm = EXCLUDED.height_mm, horizontal_gap_mm = EXCLUDED.horizontal_gap_mm RETURNING *`,
      [id, d.name, d.labelsPerRow, d.widthMm, d.heightMm, d.horizontalGapMm]);
    res.status(201).json(toSize(row));
  }));
  r.delete('/barcodes/sizes/:id', stockers, wrap(async (req, res) => { await db.query('DELETE FROM barcode_custom_sizes WHERE id = $1', [String(req.params.id).slice(0, 60)]); res.json({ ok: true }) }));

  r.delete('/barcodes/:id', stockers, wrap(async (req, res) => {
    const u = await db.query('UPDATE barcode_registry SET is_active = false, updated_at = now() WHERE id = $1 RETURNING id', [z.coerce.number().int().parse(req.params.id)]);
    if (!u.rows.length) throw new HttpError(404, 'Barcode not found');
    res.json({ ok: true });
  }));
  return r;
}
