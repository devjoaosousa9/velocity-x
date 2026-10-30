export const SITE = {
  name: 'Velocity X — the knit runner, in 3D',
  description:
    'Turn the Velocity X knit runner over in real-time 3D: a scanned model in three real colourways, with the measurements to match. A Next.js, React Three Fiber and GSAP portfolio piece.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://devjoaosousa9.github.io/velocity-x',
};

export const NAV = [
  { id: 'tour', label: 'Up close' },
  { id: 'colourways', label: 'Colourways' },
  { id: 'details', label: 'Details' },
] as const;

/** Edit these to point at real profiles. `null` hides the link. */
export const SOCIALS: { label: string; href: string | null }[] = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'GitHub', href: 'https://github.com/devjoaosousa9/velocity-x' },
];
