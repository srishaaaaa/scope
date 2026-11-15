import { contact } from '../config/content';

// Public-facing store details for SCOPE 13. The admin panel keeps reading the untouched server data;
// only the storefront gets the SCOPE 13 contact block and a map built from the same address.
// The map is searched by the street address alone: including the shop name made Google match an unrelated business.
// If the owner has set an exact pin in the admin (store.location), that pin wins.
export function publicSite(d) {
  if (typeof location !== 'undefined' && location.pathname.startsWith('/admin')) return d;
  const pin = d.store?.location;
  const address = [contact.address[0], contact.address[1], 'Madurai 625009', 'Tamil Nadu', 'India'].join(', ');
  const q = encodeURIComponent(pin ? `${pin.lat},${pin.lng}` : address);
  const ig = contact.instagram;
  return {
    ...d,
    store: { ...(d.store || {}), hours: null, name: contact.name, owner: contact.owner, phone: contact.phone, email: contact.email, address: contact.address },
    social: { ...(d.social || {}), instagram: { ...(d.social?.instagram || {}), url: ig.url, handle: ig.handle.replace(/^@/, '') }, links: [] },
    map: {
      embedUrl: `https://www.google.com/maps?q=${q}&z=17&output=embed`,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${q}`,
      placeUrl: `https://www.google.com/maps/search/?api=1&query=${q}`,
    },
  };
}
