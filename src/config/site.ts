export const SITE = {
  name: 'VELOCITY X — Beyond Motion',
  description:
    'A cinematic launch campaign for Velocity X, a high-performance racing shoe concept: campaign carousel, scroll storytelling, configurator and demo bag. Built with Next.js and GSAP.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://devjoaosousa9.github.io/velocity-x',
};

/**
 * 'photo' shows real product photography (campaign carousel, art-directed crops).
 * '3d'    mounts the real-time WebGL scene (procedural model, exploded view).
 * The 3D chunk is never downloaded in photo mode.
 */
export const EXPERIENCE: 'photo' | '3d' = 'photo';

export const PHOTO_CREDIT =
  'Product photography: reference image of a third-party running shoe, used for portfolio demonstration only. Trademarks and designs belong to their owners.';

export const NAV = [
  { id: 'technology', label: 'Technology' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'anatomy', label: 'Anatomy' },
  { id: 'customize', label: 'Customize' },
  { id: 'story', label: 'Story' },
  { id: 'buy', label: 'Buy' },
] as const;

/** Edit these to point at real profiles. `null` hides the link. */
export const SOCIALS: { label: string; href: string | null }[] = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'YouTube', href: 'https://youtube.com' },
  { label: 'X', href: 'https://x.com' },
  { label: 'GitHub', href: 'https://github.com/devjoaosousa9/velocity-x' },
];
