import JsBarcode from 'jsbarcode';
import { api } from './api';

// Barcode helpers ported from the Mahalashmi POS: CODE128 rendering, thermal-dot-accurate label barcodes, label sizes,
// A4 label-sheet layout and the per-device printing settings.

/** Normalise any scanned or typed barcode to one consistent UPPERCASE, trimmed string. */
export const normalizeBarcode = code => (code ?? '').trim().toUpperCase();

export const BRAND = 'SCOPE 13';
export const BRAND_MONOGRAM = 'S13';

export const DEFAULT_LABEL_SIZES = [
  { id: '1_35x22', name: '35 × 22 mm (Compact Tag)', labelsPerRow: 1, widthMm: 35, heightMm: 22, horizontalGapMm: 0 },
  { id: '2_38x25', name: '38 × 25 mm (Tag / Jewelry)', labelsPerRow: 1, widthMm: 38, heightMm: 25, horizontalGapMm: 0 },
  { id: '1_50x25', name: '50 × 25 mm (Standard Compact)', labelsPerRow: 1, widthMm: 50, heightMm: 25, horizontalGapMm: 0 },
  { id: '2_50x25', name: '50 × 38 mm (Retail Standard)', labelsPerRow: 1, widthMm: 50, heightMm: 38, horizontalGapMm: 0 },
  { id: '1_60x40', name: '60 × 40 mm (Shipping / Product)', labelsPerRow: 1, widthMm: 60, heightMm: 40, horizontalGapMm: 0 },
  { id: '1_100x50', name: '100 × 50 mm (Large Carton / Box)', labelsPerRow: 1, widthMm: 100, heightMm: 50, horizontalGapMm: 0 },
  // Rolls with 2 or 3 labels side by side: the page is the full roll width, one row of stickers per page.
  { id: '2up_35x22', name: '35 × 22 mm × 2-Up (Roll, side-by-side)', labelsPerRow: 2, widthMm: 35, heightMm: 22, horizontalGapMm: 0 },
  { id: '2up_50x25', name: '50 × 25 mm × 2-Up (Roll, side-by-side)', labelsPerRow: 2, widthMm: 50, heightMm: 25, horizontalGapMm: 2 },
  { id: '3up_35x22', name: '35 × 22 mm × 3-Up (Roll, side-by-side)', labelsPerRow: 3, widthMm: 35, heightMm: 22, horizontalGapMm: 0 },
  // A4 sheets of die-cut labels, printed on a normal printer
  { id: 'a4_4x48x25', name: 'A4 Sheet — 4 columns × 48 × 25 mm', labelsPerRow: 4, widthMm: 48, heightMm: 25, horizontalGapMm: 2.5, sheet: 'A4' },
  { id: 'a4_4x48x30', name: 'A4 Sheet — 4 columns × 48 × 30 mm', labelsPerRow: 4, widthMm: 48, heightMm: 30, horizontalGapMm: 2.5, sheet: 'A4' },
  { id: 'a4_3x63x38', name: 'A4 Sheet — 3 columns × 63 × 38 mm', labelsPerRow: 3, widthMm: 63, heightMm: 38, horizontalGapMm: 2.5, sheet: 'A4' },
  { id: 'a4_2x99x34', name: 'A4 Sheet — 2 columns × 99 × 34 mm (Address label)', labelsPerRow: 2, widthMm: 99, heightMm: 34, horizontalGapMm: 2.5, sheet: 'A4' },
];

/** Lays stickers out on whole A4 pages: as many rows as fit, the grid centred on the page. */
export function buildA4SheetPages(stickers, size) {
  const cols = Math.max(1, size.labelsPerRow);
  const gap = size.horizontalGapMm || 0;
  const rows = Math.max(1, Math.floor((297 - 10) / size.heightMm));
  const perPage = cols * rows;
  const sideMm = Math.max(0, (210 - cols * size.widthMm - (cols - 1) * gap) / 2);
  const topMm = Math.max(0, (297 - rows * size.heightMm) / 2);
  const pages = [];
  for (let i = 0; i < stickers.length; i += perPage) pages.push(`<div class="a4-sheet-page">${stickers.slice(i, i + perPage).join('')}</div>`);
  const css = `
    .a4-sheet-page { width: 210mm; height: 297mm; padding: ${topMm.toFixed(2)}mm ${sideMm.toFixed(2)}mm 0 ${sideMm.toFixed(2)}mm; display: grid;
      grid-template-columns: repeat(${cols}, ${size.widthMm}mm); grid-auto-rows: ${size.heightMm}mm; column-gap: ${gap}mm; row-gap: 0; align-content: start;
      overflow: hidden; break-after: page; page-break-after: always; }
    .a4-sheet-page:last-child { break-after: auto; page-break-after: auto; }`;
  return { html: pages.join(''), css };
}

export const DEFAULT_BARCODE_SETTINGS = { printerType: 'label', selectedSizeId: '2_38x25', showSalePrice: true, showCompanyName: true, showItemName: true, showDiscount: false };
const SETTINGS_KEY = 'scope13_barcode_settings';

export function getStoredBarcodeSettings() {
  try { const raw = localStorage.getItem(SETTINGS_KEY); if (raw) return { ...DEFAULT_BARCODE_SETTINGS, ...JSON.parse(raw) } } catch { /* ignore */ }
  return { ...DEFAULT_BARCODE_SETTINGS };
}
export function saveStoredBarcodeSettings(s) { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)) } catch { /* ignore */ } }

// Custom label sizes live on the server (shared by every device); a local copy keeps the sync lookups below instant.
let customSizes = [];
const listeners = new Set();
export const getStoredCustomSizes = () => customSizes;
export const getAllLabelSizes = () => [...DEFAULT_LABEL_SIZES, ...customSizes];
export const onSizesChange = fn => { listeners.add(fn); return () => listeners.delete(fn) };
const setSizes = list => { customSizes = list; listeners.forEach(f => f(list)) };
export const loadCustomSizes = () => api('/admin/barcodes/sizes').then(l => { setSizes(l); return l }).catch(() => customSizes);
export const createCustomSize = async size => { const s = await api('/admin/barcodes/sizes', { method: 'POST', body: size }); setSizes([...customSizes.filter(x => x.id !== s.id), s]); return s };
export const deleteCustomSize = async id => { await api('/admin/barcodes/sizes/' + id, { method: 'DELETE' }); setSizes(customSizes.filter(x => x.id !== id)) };

/** Render a CODE128 barcode straight into an <svg> element. */
export function renderBarcodeSvg(svg, value, o = {}) {
  if (!svg || !value) return;
  try {
    JsBarcode(svg, String(value).trim(), { format: 'CODE128', width: o.width ?? 1.5, height: o.height ?? 36, displayValue: o.displayValue ?? true, fontSize: o.fontSize ?? 11, font: o.font ?? 'monospace',
      textMargin: o.textMargin ?? 1, margin: o.margin ?? 4, lineColor: o.lineColor ?? '#000000', background: o.background ?? '#ffffff' });
  } catch (e) { console.error('[renderBarcodeSvg]', e) }
}

/** One printer dot at 203 dpi (most thermal label printers). */
const THERMAL_DOT_MM = 25.4 / 203;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export const escapeHtml = esc;

/**
 * Barcode markup for a printed label: bars drawn at an exact size in mm, every bar a whole number of 203-dpi printer dots, so scanners
 * read it reliably. The number is printed as text under the bars so it stays sharp.
 */
export function labelBarcodeHtml(value, { labelWidthMm, barHeightMm, sidePaddingMm = 1.5, fontSizePt = 6.5 }) {
  if (typeof document === 'undefined' || !value) return '';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  renderBarcodeSvg(svg, value, { width: 1, height: 100, margin: 0, displayValue: false });
  const modules = parseFloat(svg.getAttribute('width') || '') || 0;
  if (!modules) return '';
  const availableMm = Math.max(8, labelWidthMm - 2 * Math.max(sidePaddingMm, 1.5) - 0.2);
  const dotsPerModule = Math.max(1, Math.min(3, Math.floor(availableMm / (modules * THERMAL_DOT_MM))));
  const widthMm = modules * dotsPerModule * THERMAL_DOT_MM;
  svg.setAttribute('viewBox', `0 0 ${modules} 100`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.removeAttribute('width'); svg.removeAttribute('height');
  svg.setAttribute('style', `display:block;flex:none;margin:0 auto;width:${widthMm.toFixed(3)}mm;min-width:${widthMm.toFixed(3)}mm;height:${barHeightMm.toFixed(2)}mm;max-width:none;max-height:none;`);
  return `<div style="display:flex;flex-direction:column;align-items:center;flex:none;">${svg.outerHTML}<div style="font-family:Arial,sans-serif;font-size:${fontSizePt}pt;font-weight:700;letter-spacing:0.4px;line-height:1;margin-top:0.3mm;color:#000;text-align:center;white-space:nowrap;">${esc(String(value).trim())}</div></div>`;
}

/** Prices are held in paise everywhere; labels show rupees. */
export const rupees = p => (Math.round(Number(p) || 0) / 100).toFixed(2).replace(/\.00$/, '');
export const isValidBarcodeValue = v => /^[A-Z0-9_-]{4,32}$/i.test(String(v).trim());
export const newItemCode = () => `${BRAND_MONOGRAM}${Math.floor(1000000 + Math.random() * 9000000)}`;

/**
 * Prints labels through a hidden iframe. `items` = [{ barcodeValue, title, header, tag, price, mrp, count }].
 * Thermal rolls get one page per row of stickers (full roll width for 2-up/3-up), A4 sheets get whole A4 pages, a regular printer a dashed A4 grid.
 */
export function printLabels(items, size, settings, title = `${BRAND} Barcode Labels`) {
  const isSheet = size.sheet === 'A4';
  const isThermal = !isSheet && settings.printerType === 'label';
  const isSmall = size.heightMm <= 25, isLarge = size.heightMm >= 40, isNarrow = size.widthMm < 45;
  const f = { header: isNarrow ? '5.2pt' : isSmall ? '7pt' : isLarge ? '10.5pt' : '8.5pt', title: isNarrow ? '5.5pt' : isSmall ? '6pt' : isLarge ? '9pt' : '7.5pt',
    tag: isNarrow ? '4.5pt' : isSmall ? '5.5pt' : isLarge ? '8.5pt' : '7pt', price: isNarrow ? '7.5pt' : isSmall ? '8pt' : isLarge ? '12pt' : '9.5pt' };
  const barHeightMm = Math.max(5, size.heightMm * 0.3);
  const stickers = [];
  for (const it of items) {
    const bars = labelBarcodeHtml(it.barcodeValue, { labelWidthMm: size.widthMm, barHeightMm, sidePaddingMm: isSmall ? 1.2 : 1.6, fontSizePt: isSmall ? 6 : 7.5 });
    const html = `<div class="label-sticker">
      ${settings.showCompanyName ? `<div class="header">${esc(it.header || BRAND)}</div>` : ''}
      ${settings.showItemName ? `<div class="prod-title">${esc(it.title)}</div>` : ''}
      <div class="barcode-box">${bars}</div>
      <div class="footer"><span>${it.tag ? `<span class="tag">${esc(it.tag)}</span>` : (isNarrow ? '' : `<span class="tag">${BRAND} RETAIL</span>`)}${settings.showDiscount && it.mrp && it.mrp > it.price ? `<span class="mrp"> MRP ₹${rupees(it.mrp)}</span>` : ''}</span>
        ${settings.showSalePrice ? `<span class="price">₹${rupees(it.price)}</span>` : ''}</div></div>`;
    for (let i = 0; i < Math.max(1, it.count || 1); i++) stickers.push(html);
  }
  if (!stickers.length) return;
  const columns = isThermal ? Math.max(1, size.labelsPerRow || 1) : 1;
  const gapMm = size.horizontalGapMm || 0;
  const rowW = (size.widthMm * columns + gapMm * (columns - 1)).toFixed(2);
  let body = '', sheetCss = '';
  if (isThermal) { const rows = []; for (let i = 0; i < stickers.length; i += columns) rows.push(`<div class="page-wrapper"><div class="sticker-row">${stickers.slice(i, i + columns).join('')}</div></div>`); body = rows.join('') }
  else if (isSheet) { const s = buildA4SheetPages(stickers, size); body = s.html; sheetCss = s.css }
  else body = `<div class="a4-container">${stickers.join('')}</div>`;

  const doc = `<!DOCTYPE html><html><head><title>${esc(title)}</title><style>
    @page { ${isThermal ? `size: ${rowW}mm ${size.heightMm}mm; margin: 0;` : isSheet ? 'size: A4 portrait; margin: 0;' : 'size: A4 portrait; margin: 10mm;'} }
    ${sheetCss}
    * { box-sizing: border-box; margin: 0; padding: 0 }
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact }
    .a4-container { display: flex; flex-wrap: wrap; align-content: flex-start; gap: 3mm 4mm }
    .page-wrapper { display: block; width: ${rowW}mm; height: ${size.heightMm}mm; overflow: hidden; page-break-after: always; break-after: page }
    .sticker-row { display: flex; flex-direction: row; align-items: center; justify-content: ${isThermal ? 'space-between' : 'flex-start'}; gap: ${isThermal ? 0 : gapMm}mm; width: ${rowW}mm; height: ${isThermal ? size.heightMm + 'mm' : 'auto'}; break-inside: avoid; page-break-inside: avoid }
    .label-sticker { width: ${size.widthMm}mm; height: ${size.heightMm}mm; max-width: ${size.widthMm}mm; max-height: ${size.heightMm}mm; padding: ${isSmall ? '0.8mm 2mm' : '1.2mm 2.5mm'}; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; overflow: hidden; flex-shrink: 0; background: #fff; ${!isThermal && !isSheet ? 'border: 0.2mm dashed #bbb;' : ''} }
    .header { width: 100%; font-size: ${f.header}; font-weight: 900; letter-spacing: ${isNarrow ? 0 : 0.3}px; text-transform: uppercase; color: #000; line-height: 1.1 }
    .prod-title { width: 100%; font-size: ${f.title}; font-weight: 700; margin-top: 0.3mm; color: #111; line-height: 1.1 }
    .barcode-box { width: 100%; flex: 1; min-height: 0; display: flex; justify-content: center; align-items: center; margin: 0.4mm 0; overflow: hidden }
    .footer { width: 100%; display: flex; justify-content: space-between; align-items: center; border-top: 0.6pt solid #000; padding-top: 0.5mm; line-height: 1; flex-shrink: 0 }
    .tag { font-size: ${f.tag}; font-weight: 800; color: #444 } .mrp { text-decoration: line-through; color: #555; font-size: ${f.tag}; font-weight: 600 }
    .price { font-size: ${f.price}; font-weight: 900; color: #000; flex-shrink: 0; white-space: nowrap; margin-left: 1mm }
    .header, .prod-title, .tag, .mrp { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100% }
    .footer > span:first-child { min-width: 0; overflow: hidden }
  </style></head><body data-gramm="false">${body}</body></html>`;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
  iframe.setAttribute('aria-hidden', 'true'); iframe.tabIndex = -1;
  document.body.appendChild(iframe);
  const d = iframe.contentWindow?.document;
  if (!d) { iframe.remove(); return }
  d.open(); d.write(doc); d.close();
  const cleanup = () => { try { iframe.remove() } catch { /* already gone */ } };
  setTimeout(() => {
    try { iframe.contentWindow.onafterprint = cleanup; iframe.contentWindow.focus(); iframe.contentWindow.print() } catch (e) { console.warn('print failed', e) } finally { setTimeout(cleanup, 4000) }
  }, 250);
}
