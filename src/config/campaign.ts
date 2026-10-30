import type { Crop } from './photos';

/** Content for the campaign edition (EXPERIENCE = 'photo'). */

export const CAMPAIGN_NAV = [
  { id: 'tour', label: 'Experience' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'configure', label: 'Configure' },
  { id: 'drop', label: 'Drop list' },
] as const;

export const HERO_STATS = [
  { value: '212', unit: 'g', label: 'Race weight', x: 0.17, y: 0.36 },
  { value: '8', unit: 'mm', label: 'Heel-to-toe drop', x: 0.8, y: 0.3 },
  { value: '87', unit: '%', label: 'Energy return', x: 0.74, y: 0.7 },
] as const;

export interface TourShot {
  id: string;
  kicker: string;
  title: string;
  body: string;
  /** Desktop framing: photo point (fx, fy) placed at stage point (px, py), photo scaled z x base size. */
  desktop: Crop;
  mobile: Crop;
}

/** The scroll-driven "camera move" over the studio photo. Kept under ~1.7x zoom: the source is 860 px. */
export const TOUR: TourShot[] = [
  {
    id: 'profile',
    kicker: '01 — Profile',
    title: 'One continuous line.',
    body: 'From the pull tab to the rockered toe, nothing interrupts the silhouette.',
    desktop: { fx: 0.5, fy: 0.67, px: 0.6, py: 0.55, z: 1.05 },
    mobile: { fx: 0.5, fy: 0.67, px: 0.5, py: 0.38, z: 1 },
  },
  {
    id: 'heel',
    kicker: '02 — Heel lock',
    title: 'Locked at the heel.',
    body: 'A sculpted counter and padded collar hold the foot without pressure points.',
    desktop: { fx: 0.16, fy: 0.62, px: 0.62, py: 0.52, z: 1.7 },
    mobile: { fx: 0.16, fy: 0.62, px: 0.5, py: 0.38, z: 1.6 },
  },
  {
    id: 'knit',
    kicker: '03 — Engineered knit',
    title: 'Air, mapped.',
    body: 'Perforation zones open exactly where heat builds up — dense where you need lockdown.',
    desktop: { fx: 0.52, fy: 0.58, px: 0.62, py: 0.52, z: 1.75 },
    mobile: { fx: 0.52, fy: 0.58, px: 0.5, py: 0.38, z: 1.65 },
  },
  {
    id: 'foam',
    kicker: '04 — Midsole',
    title: 'Max cushion. Zero drag.',
    body: 'A tall, light foam stack that gives back what you put into every stride.',
    desktop: { fx: 0.42, fy: 0.8, px: 0.62, py: 0.5, z: 1.65 },
    mobile: { fx: 0.42, fy: 0.8, px: 0.5, py: 0.38, z: 1.55 },
  },
  {
    id: 'toe',
    kicker: '05 — Rocker',
    title: 'Rolls you forward.',
    body: 'An early toe-off curve keeps cadence high when the legs get heavy.',
    desktop: { fx: 0.78, fy: 0.74, px: 0.6, py: 0.5, z: 1.6 },
    mobile: { fx: 0.78, fy: 0.74, px: 0.5, py: 0.38, z: 1.5 },
  },
];

export const MARQUEE_ROWS = [
  ['Boston', 'Berlin', 'Tokyo', 'Chicago', 'London', 'New York', 'São Paulo', 'Sydney'],
  ['Engineered knit', '8 mm drop', '212 g', 'Rocker geometry', 'Max-cushion foam', 'Race-day fit', 'Heel lock', 'Rubber traction'],
];
