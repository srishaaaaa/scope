import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../config.js';
import { createDb, migrate } from '../db/index.js';
import { seed } from '../db/seed.js';
import { createApp } from '../app.js';

// In-memory database only (PGLITE_DIR=memory): this test never touches a real database.
const cfg = loadConfig({ NODE_ENV: 'test', JWT_SECRET: 'test-secret-test-secret-123456', PGLITE_DIR: 'memory', ADMIN_EMAIL: 'owner@test.dev', ADMIN_PASSWORD: 'OwnerPass123!' });
let db, server, base;
function client() {
  const jar = new Map();
  return async (method, path, body) => {
    const r = await fetch(base + path, { method, body: body && JSON.stringify(body), headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'dhanya', Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join('; ') } });
    for (const c of r.headers.getSetCookie()) { const [kv] = c.split(';'); const [k, v] = kv.split('='); v ? jar.set(k, v) : jar.delete(k) }
    return { status: r.status, body: await r.json().catch(() => null) };
  };
}
before(async () => { db = await createDb(cfg); await migrate(db, () => {}); await seed(db, cfg, () => {}); server = createApp({ db, cfg }).listen(0); base = `http://localhost:${server.address().port}/api` });
after(async () => { server.close(); await db.close() });
const login = async () => { const o = client(); await o('POST', '/auth/login', { email: 'owner@test.dev', password: 'OwnerPass123!' }); return o };

test('barcode: generate + receive stock, scan lookup, SKU fallback, duplicates, label sizes', async () => {
  const o = await login();
  const items = (await o('GET', '/admin/pos/catalog')).body;
  const a = items[0], b = items[1];
  const before = a.stock;

  const r1 = (await o('POST', '/admin/barcodes/receive', { variantId: a.variantId, quantity: 5 }));
  assert.equal(r1.status, 200);
  assert.match(r1.body.barcodeValue, /^PBV\d{8}$/);
  assert.equal(r1.body.isNew, true);
  assert.equal(r1.body.quantityAfter, before + 5);

  // receiving again reuses the same barcode and adds stock
  const r2 = (await o('POST', '/admin/barcodes/receive', { variantId: a.variantId, quantity: 2 })).body;
  assert.equal(r2.barcodeValue, r1.body.barcodeValue);
  assert.equal(r2.isNew, false);
  assert.equal(r2.quantityAfter, before + 7);

  // scan lookup is case-insensitive and resolves the variant
  const hit = (await o('GET', `/admin/barcodes/lookup?code=${r1.body.barcodeValue.toLowerCase()}`)).body;
  assert.equal(hit.found, true);
  assert.equal(hit.item.variantId, a.variantId);
  assert.equal(hit.item.stock, before + 7);

  // an existing SKU also scans
  assert.equal((await o('GET', `/admin/barcodes/lookup?code=${encodeURIComponent(b.sku)}`)).body.item.variantId, b.variantId);
  assert.equal((await o('GET', '/admin/barcodes/lookup?code=NOPE1234')).body.found, false);

  // a supplied barcode is stored upper-case; the same one cannot be given to another item
  const c1 = await o('POST', '/admin/barcodes/receive', { variantId: b.variantId, quantity: 0, customBarcode: 'shirt-0001' });
  assert.equal(c1.body.barcodeValue, 'SHIRT-0001');
  assert.equal(c1.body.quantityAfter, b.stock);
  assert.equal((await o('POST', '/admin/barcodes/receive', { variantId: a.variantId, quantity: 0, customBarcode: 'SHIRT-0001' })).status, 409);
  assert.equal((await o('POST', '/admin/barcodes/receive', { variantId: a.variantId, quantity: 0, customBarcode: 'x' })).status, 400);

  // registry lists them; deactivating stops the scan
  const reg = (await o('GET', '/admin/barcodes')).body;
  assert.ok(reg.length >= 2);
  const row = reg.find(x => x.barcodeValue === 'SHIRT-0001');
  assert.equal((await o('DELETE', `/admin/barcodes/${row.barcodeId}`)).status, 200);
  assert.equal((await o('GET', '/admin/barcodes/lookup?code=SHIRT-0001')).body.found, false);

  // custom label sizes
  const s = (await o('POST', '/admin/barcodes/sizes', { name: '40 × 30 mm', labelsPerRow: 2, widthMm: 40, heightMm: 30, horizontalGapMm: 2 })).body;
  assert.equal(s.isCustom, true);
  assert.equal((await o('GET', '/admin/barcodes/sizes')).body.length, 1);
  assert.equal((await o('DELETE', `/admin/barcodes/sizes/${s.id}`)).status, 200);

  // customers cannot use the staff barcode API
  const guest = client();
  assert.equal((await guest('GET', '/admin/barcodes/lookup?code=PBV10000001')).status, 401);
});
