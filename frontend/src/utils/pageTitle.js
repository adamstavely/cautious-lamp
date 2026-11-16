import { ADMIN_NAV, MAIN_NAV, isSectionActive } from '../navigation.js';

const SITE = 'DESIGN.COM';

/** "Color contrast · Tools · DESIGN.COM": the page, its section (unless it is the section's own page), the site */
export function pageTitle(title, path = '/') {
  const section = [...MAIN_NAV, ADMIN_NAV].find((item) => isSectionActive(item.path, path));
  const parts = [title];
  if (section && section.label.toLowerCase() !== String(title).toLowerCase()) parts.push(section.label);
  parts.push(SITE);
  return parts.filter(Boolean).join(' · ');
}

/** A readable name from a path's last segment, for pages without a hero ("/tools/png-to-ico" → "Png to ico") */
export function titleFromPath(path = '/') {
  const segment = path.split('/').filter(Boolean).pop();
  if (!segment) return '';
  const words = decodeURIComponent(segment).replace(/[-_]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Every page needs its own title (WCAG 2.4.2): the tab, history and screen readers all use it */
export function setPageTitle(title, path) {
  if (typeof document !== 'undefined') document.title = title ? pageTitle(title, path) : SITE;
}
