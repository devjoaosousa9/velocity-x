/**
 * Real product photography (no 3D render). Every visual in "photo" mode is a
 * focal crop of a studio shot: (fx, fy) is the point of interest in the photo
 * (0-1), placed at (px, py) of the frame (0-1), with the photo scaled to
 * `z` x frame height. Mobile frames are portrait, so they get their own crop.
 *
 * To add more angles, drop files in public/product/ and add them here.
 */
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export interface Photo {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export const PHOTOS = {
  side: {
    src: `${base}/product/shoe-side.webp`,
    width: 860,
    height: 860,
    alt: 'Volt-yellow running shoe in lateral profile: engineered mesh upper with navy heel graphics, tall white foam midsole and a rockered toe.',
  },
} satisfies Record<string, Photo>;

/** Studio backdrop sampled from the photo, so frames blend seamlessly into it. */
export const PHOTO_BACKDROP = '#e3e6e3';

export interface Crop {
  fx: number;
  fy: number;
  px: number;
  py: number;
  z: number;
}

export interface FramedCrop {
  photo: Photo;
  desktop: Crop;
  mobile: Crop;
}

const side = PHOTOS.side;
const crop = (desktop: Crop, mobile: Partial<Crop> = {}): FramedCrop => ({
  photo: side,
  desktop,
  mobile: { ...desktop, px: 0.5, ...mobile },
});

export const CROPS = {
  full: crop({ fx: 0.5, fy: 0.67, px: 0.5, py: 0.61, z: 1.12 }, { py: 0.6, z: 0.95 }),
  heel: crop({ fx: 0.13, fy: 0.62, px: 0.6, py: 0.6, z: 1.9 }, { z: 1.6 }),
  knit: crop({ fx: 0.55, fy: 0.61, px: 0.6, py: 0.6, z: 2.1 }, { z: 1.7 }),
  lacing: crop({ fx: 0.46, fy: 0.56, px: 0.6, py: 0.62, z: 2 }, { z: 1.6 }),
  rocker: crop({ fx: 0.8, fy: 0.76, px: 0.58, py: 0.62, z: 1.8 }, { z: 1.5 }),
  foam: crop({ fx: 0.4, fy: 0.8, px: 0.58, py: 0.62, z: 1.9 }, { z: 1.55 }),
  outsole: crop({ fx: 0.62, fy: 0.85, px: 0.56, py: 0.55, z: 1.9 }, { z: 1.6 }),
} satisfies Record<string, FramedCrop>;

export type CropId = keyof typeof CROPS;

export const CAMPAIGN_SLIDES: { id: string; crop: CropId; kicker: string; title: string; body: string }[] = [
  { id: 'launch', crop: 'full', kicker: 'The launch', title: 'Built for race day.', body: 'Volt knit, white foam, one continuous line from heel to toe.' },
  { id: 'heel', crop: 'heel', kicker: 'Heel lock', title: 'Locked at the heel.', body: 'A sculpted counter and pull tab hold the foot without pressure points.' },
  { id: 'knit', crop: 'knit', kicker: 'Engineered knit', title: 'Air, mapped.', body: 'Perforation zones open exactly where heat builds up.' },
  { id: 'lacing', crop: 'lacing', kicker: 'Lacing', title: 'Lockdown in one pull.', body: 'A gusseted tongue and flat laces spread tension across the instep.' },
  { id: 'foam', crop: 'foam', kicker: 'Midsole', title: 'Max cushion. Zero drag.', body: 'A tall, light foam stack that gives back what you put in.' },
  { id: 'rocker', crop: 'rocker', kicker: 'Rocker', title: 'Rolls you forward.', body: 'An early toe-off curve keeps your cadence high when legs get heavy.' },
];

/** Technology chapter: one crop per story step (same order as STORY_STEPS). */
export const STORY_CROPS: CropId[] = ['full', 'knit', 'lacing', 'foam', 'outsole', 'rocker'];

/** Engineering hotspots: crop + where the marker sits on the photo. */
export const ENGINEERING_CROPS: Record<'cushioning' | 'aeromesh' | 'grip', CropId> = {
  cushioning: 'foam',
  aeromesh: 'knit',
  grip: 'outsole',
};

/** Anatomy callouts, positioned on the full side photo (fractions of the photo). */
export const ANATOMY_CALLOUTS: { id: string; name: string; detail: string; x: number; y: number; side: 'left' | 'right' }[] = [
  { id: 'tab', name: 'Heel tab', detail: 'Pull loop', x: 0.08, y: 0.47, side: 'right' },
  { id: 'counter', name: 'Heel counter', detail: 'Graphic-printed support', x: 0.09, y: 0.64, side: 'right' },
  { id: 'collar', name: 'Collar', detail: 'Padded, low cut', x: 0.21, y: 0.54, side: 'right' },
  { id: 'tongue', name: 'Tongue', detail: 'Gusseted', x: 0.46, y: 0.52, side: 'right' },
  { id: 'laces', name: 'Laces', detail: 'Flat-knit', x: 0.55, y: 0.56, side: 'right' },
  { id: 'upper', name: 'Upper', detail: 'Engineered mesh', x: 0.62, y: 0.64, side: 'right' },
  { id: 'midsole', name: 'Midsole', detail: 'High-stack foam', x: 0.5, y: 0.82, side: 'right' },
  { id: 'outsole', name: 'Outsole', detail: 'Rubber, rockered toe', x: 0.9, y: 0.8, side: 'left' },
];
