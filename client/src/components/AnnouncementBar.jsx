import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { inr } from '../lib/format';
import { contact } from '../config/content';

// Slim bar above the header. The delivery line comes from the store's own delivery settings (never hard-coded).
export default function AnnouncementBar() {
  const [d, setD] = useState(null);
  useEffect(() => { let dead = false; api('/delivery-info').then(x => !dead && setD(x)).catch(() => {}); return () => { dead = true } }, []);
  const text = d?.freeOver ? `Free delivery on orders of ${inr(d.freeOver)} or more` : 'SCOPE 13 · Contemporary menswear';
  return (
    <div className="s13-ann">
      <div className="s13-ann-in">
        <span className="s13-ann-l hide-sm">Madurai, Tamil Nadu</span>
        <span className="s13-ann-c">{text}</span>
        <span className="s13-ann-r hide-sm"><a href={`tel:${contact.phone}`}>{contact.phone}</a><a href={contact.instagram.url} target="_blank" rel="noopener noreferrer">{contact.instagram.handle}</a></span>
      </div>
    </div>
  );
}
