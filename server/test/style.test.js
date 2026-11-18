import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../config.js';
import { createDb, migrate } from '../db/index.js';
import { seed } from '../db/seed.js';
import { createApp } from '../app.js';

const cfg = loadConfig({ NODE_ENV: 'test', JWT_SECRET: 'test-secret-test-secret-123456', PGLITE_DIR: 'memory', ADMIN_EMAIL: 'owner@test.dev', ADMIN_PASSWORD: 'OwnerPass123!' });
let db, server, base;

function client() {
  const jar = new Map();
  return async (method, path, body) => {
    const r = await fetch(base + path, {
      method, body: body && JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'dhanya', Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join('; ') },
    });
    for (const c of r.headers.getSetCookie()) { const [kv] = c.split(';'); const [k, v] = kv.split('='); v ? jar.set(k, v) : jar.delete(k) }
    return { status: r.status, body: await r.json().catch(() => null) };
  };
}

before(async () => {
  db = await createDb(cfg); await migrate(db, () => {}); await seed(db, cfg, () => {});
  server = createApp({ db, cfg, payments: {} }).listen(0); base = `http://localhost:${server.address().port}/api`;
});
after(async () => { server.close(); await db.close() });

test('product styles: staff set a style, the shop lists the styles of a category and filters by them', async () => {
  const pub = client();
  const owner = client(); await owner('POST', '/auth/login', { email: 'owner@test.dev', password: 'OwnerPass123!' });
  const list = (await owner('GET', '/admin/pos/products?q=kurta')).body;
  assert.ok(list.length >= 2, 'sample kurtas exist');
  const [a, b] = list.filter(p => p.categorySlug === 'kurtas');
  const patch = (p, style) => owner('PATCH', `/admin/pos/products/${p.id}`, { name: p.name, price: p.price, costPrice: p.costPrice ?? 0, taxRate: p.taxRate, categorySlug: p.categorySlug, status: p.status, style });
  assert.equal((await patch(a, 'Checks')).status, 200);
  assert.equal((await patch(b, 'Printed')).status, 200);

  const shop = (await pub('GET', '/products?category=kurtas&facets=1')).body;
  assert.deepEqual(shop.facets.styles.map(s => s.name).sort(), ['Checks', 'Printed'], 'the category offers its styles');
  assert.equal((await pub('GET', '/products?category=sarees&facets=1')).body.facets.styles.length, 0, 'a category with no styles shows none');
  assert.equal((await pub('GET', '/products?facets=1')).body.facets.styles.length, 0, 'styles only appear once one category is picked');

  const checks = (await pub('GET', '/products?category=kurtas&style=Checks')).body.items;
  assert.deepEqual(checks.map(p => p.slug), [a.slug], 'filtering by a style lists only those pieces');
  assert.equal(checks[0].style, 'Checks');
  assert.ok([401, 403].includes((await pub('PATCH', `/admin/pos/products/${a.id}`, { name: a.name, price: a.price, taxRate: a.taxRate, status: 'active', style: 'x' })).status), 'visitors cannot set styles');

  assert.equal((await patch(a, '')).status, 200);
  assert.deepEqual((await pub('GET', '/products?category=kurtas&facets=1')).body.facets.styles.map(s => s.name), ['Printed'], 'clearing a style removes it');
});
