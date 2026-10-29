export const SITE = {
  name: 'VELOCITY X — Beyond Motion',
  description:
    'A cinematic, real-time 3D launch experience for Velocity X, a fictional high-performance running shoe. Built with Next.js, React Three Fiber and GSAP.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://devjoaosousa9.github.io/velocity-x',
};

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
