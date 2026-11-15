import { Link } from 'react-router-dom';
import { useApp } from '../context/App';

// The supplied SCOPE 13 campaign mark is the logo; an uploaded logo (Admin → Settings → Logo) replaces it.
export const DEFAULT_LOGO = '/images/scope13-logo.jpg';

// Emblem: a thin ring around a point, echoing the lens in "SCOPE".
export function Emblem({ size = 28, className = '', glow = false }) {
  return (
    <svg className={`emblem ${glow ? 'glow' : ''} ${className}`} width={size} height={size} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <circle cx="32" cy="32" r="26" /><circle cx="32" cy="32" r="14" /><path d="M32 2v10M32 52v10M2 32h10M52 32h10" /><circle cx="32" cy="32" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LogoTile({ size = 38 }) {
  return <span className="logo-tile" style={{ width: size, height: size }}><Emblem size={Math.round(size * 0.62)} /></span>;
}

export default function Wordmark({ to = '/', className = '', onClick }) {
  const { site } = useApp();
  const logo = site.branding?.logo || DEFAULT_LOGO;
  return (
    <Link to={to} onClick={onClick} className={`wordmark has-logo ${className}`} aria-label="SCOPE 13 — home" data-cursor="HOME">
      <img className="wm-logo" src={logo} fetchpriority="high" decoding="async" alt="SCOPE 13, a clothing era" />
      <span className="wm-text" aria-hidden="true"><b>SCOPE</b><i>13</i></span>
    </Link>
  );
}
