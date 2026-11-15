// Typographic brand panel in the logo colours. Used wherever a campaign photograph is expected but none has been supplied
// yet (Admin → Storefront images, or product photography). It is a design element, not the logo image.
export default function BrandPanel({ className = '', big = false }) {
  return (
    <div className={`s13-brandpanel ${big ? 'big' : ''} ${className}`} role="img" aria-label="SCOPE 13, contemporary menswear">
      <span className="bp-grid" aria-hidden="true" />
      <b aria-hidden="true">SCOPE<br />13</b>
      <small aria-hidden="true">CONTEMPORARY MENSWEAR</small>
    </div>
  );
}
