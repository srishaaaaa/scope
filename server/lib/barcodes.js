import { one, rows } from '../db/index.js';
import { HttpError } from './http.js';
import { adjustStock } from './pos.js';
import { audit } from './orders.js';

const norm = c => String(c ?? '').trim().toUpperCase();
const ITEM_SQL = `
  SELECT v.id AS "variantId", p.id AS "productId", p.name, v.sku, v.size, v.color, c.name AS category,
         COALESCE(v.price_override, p.base_price) AS price, v.stock_quantity AS stock, p.tax_rate AS "taxRate", (v.active AND p.status = 'active') AS sellable,
         (SELECT image_url FROM product_images i WHERE i.product_id = p.id ORDER BY i.display_order, i.id LIMIT 1) AS image`;
const FROM_VARIANT = ` FROM product_variants v JOIN products p ON p.id = v.product_id LEFT JOIN categories c ON c.id = p.category_id`;

// Resolves a scanned / typed code: the barcode registry first, then a variant SKU (so existing SKUs also scan).
export async function lookupBarcode(q, code) {
  const value = norm(code);
  if (!value) return null;
  const viaRegistry = await one(q, `${ITEM_SQL}, b.barcode_value AS "barcodeValue", 'registry' AS source ${FROM_VARIANT}
    JOIN barcode_registry b ON b.variant_id = v.id WHERE upper(b.barcode_value) = $1 AND b.is_active`, [value]);
  if (viaRegistry) return viaRegistry;
  return one(q, `${ITEM_SQL}, v.sku AS "barcodeValue", 'sku' AS source ${FROM_VARIANT} WHERE upper(v.sku) = $1`, [value]);
}

// One atomic step: give the variant a barcode (reuse its active one, use the one supplied, or generate the next) and add received stock.
export async function receiveWithBarcode(db, user, { variantId, quantity, customBarcode, unitCost, note }) {
  const custom = norm(customBarcode) || null;
  if (custom && !/^[A-Z0-9_-]{4,32}$/.test(custom)) throw new HttpError(400, 'A barcode is 4 to 32 letters, numbers, dashes or underscores', 'bad_barcode');
  const qty = Math.max(0, Math.floor(Number(quantity) || 0));
  const out = await db.tx(async t => {
    const v = await one(t, `SELECT v.id, v.product_id AS "productId", p.name AS "productName", v.size, v.color, v.stock_quantity AS stock
      FROM product_variants v JOIN products p ON p.id = v.product_id WHERE v.id = $1`, [variantId]);
    if (!v) throw new HttpError(404, 'Variant not found');
    let reg;
    if (custom) {
      reg = await one(t, 'SELECT * FROM barcode_registry WHERE upper(barcode_value) = $1', [custom]);
      if (reg && reg.variant_id !== variantId) throw new HttpError(409, `Barcode ${custom} is already assigned to another item`, 'barcode_taken');
    } else {
      reg = await one(t, 'SELECT * FROM barcode_registry WHERE variant_id = $1 AND is_active ORDER BY id LIMIT 1', [variantId]);
    }
    let isNew = false;
    if (!reg) {
      const value = custom || `PBV${String((await one(t, "SELECT nextval('barcode_variant_seq') AS n")).n).padStart(8, '0')}`;
      reg = await one(t, `INSERT INTO barcode_registry (barcode_value, entity_type, product_id, variant_id, created_by_name) VALUES ($1,'variant',$2,$3,$4) RETURNING *`,
        [value, v.productId, variantId, String(user.name || user.email || 'Staff').slice(0, 80)]);
      isNew = true;
    } else if (!reg.is_active) await t.query('UPDATE barcode_registry SET is_active = true, updated_at = now() WHERE id = $1', [reg.id]);
    return { v, reg, isNew };
  });
  let stock = { before: out.v.stock, stock: out.v.stock };
  if (qty > 0) stock = await adjustStock(db, user, { variantId, type: 'restock', qty, note: `Barcode ${out.reg.barcode_value}${note ? ' · ' + note : ''}`.slice(0, 100) });
  await audit(db, user.id, 'barcode.receive', 'variant', variantId, { barcode: out.reg.barcode_value, qty, isNew: out.isNew, unitCost: unitCost ?? undefined });
  return {
    barcodeId: out.reg.id, barcodeValue: out.reg.barcode_value, isNew: out.isNew, variantId, productId: out.v.productId, productName: out.v.productName,
    variantName: [out.v.size, out.v.color].filter(Boolean).join(' / '), quantityBefore: stock.before, quantityReceived: qty, quantityAfter: stock.stock,
  };
}

export const registry = (db, { q = '', limit = 100, offset = 0 }) => {
  const like = `%${String(q).trim().replace(/[\\%_]/g, m => '\\' + m)}%`;
  return rows(db, `${ITEM_SQL}, b.id AS "barcodeId", b.barcode_value AS "barcodeValue", b.is_active AS "isActive", b.created_by_name AS "createdBy", b.created_at AS "createdAt"
    ${FROM_VARIANT} JOIN barcode_registry b ON b.variant_id = v.id
    WHERE $1 = '' OR b.barcode_value ILIKE $2 OR p.name ILIKE $2 OR v.sku ILIKE $2 ORDER BY b.created_at DESC, b.id DESC LIMIT $3 OFFSET $4`, [String(q).trim(), like, Math.min(limit, 500), offset]);
};
