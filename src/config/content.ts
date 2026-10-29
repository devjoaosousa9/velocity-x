import type { HotspotId } from '@/store/useExperience';

export const STORY_STEPS = [
  {
    kicker: '01 — Form',
    title: 'Form follows velocity.',
    body: 'Every surface of Velocity X was shaped in a virtual wind tunnel, then refined by hand until nothing was left to remove.',
    align: 'left',
  },
  {
    kicker: '02 — Orientation',
    title: 'Engineered from every angle.',
    body: 'A single continuous line runs from heel to toe. Turn it any way you like — the silhouette never breaks.',
    align: 'right',
  },
  {
    kicker: '03 — Detail',
    title: 'Closer than you think.',
    body: 'Laser-cut ventilation ports, a gusseted tongue and a seamless toe box. Precision you feel before you see.',
    align: 'left',
  },
  {
    kicker: '04 — Profile',
    title: 'A profile cut by the wind.',
    body: 'A rockered geometry rolls you forward. The energy line traces the path force takes through the foam.',
    align: 'left',
  },
  {
    kicker: '05 — Contact',
    title: 'Grip, mapped.',
    body: 'Hexagonal lugs are placed only where pressure maps say they matter. The arch channel saves weight and decouples heel from forefoot.',
    align: 'right',
  },
  {
    kicker: '06 — Balance',
    title: 'Nothing in excess.',
    body: '212 grams. 38 mm heel stack. 10 mm drop. Built around a single idea: motion without compromise.',
    align: 'center',
  },
] as const;

export const ENGINEERING: {
  id: HotspotId;
  index: string;
  title: string;
  short: string;
  body: string;
  stat: { value: string; label: string };
}[] = [
  {
    id: 'cushioning',
    index: '3.1',
    title: 'Adaptive Cushioning',
    short: 'Adaptive Cushioning',
    body: 'Twin sealed pods in the heel tune their response to your stride: soft at landing, firm at toe-off. A fictional system, rendered with real geometry.',
    stat: { value: '87%', label: 'Energy return (concept target)' },
  },
  {
    id: 'aeromesh',
    index: '3.2',
    title: 'AeroMesh Technology',
    short: 'AeroMesh',
    body: 'An engineered knit with zoned ventilation ports. Dense where you need lockdown, open where heat builds up.',
    stat: { value: '41 g', label: 'Upper weight (concept target)' },
  },
  {
    id: 'grip',
    index: '3.3',
    title: 'Precision Grip',
    short: 'Precision Grip',
    body: 'Hex lugs follow the pressure map of a forefoot strike. Each one is a separate instance on the GPU — the grip you see is the grip that is modelled.',
    stat: { value: '6', label: 'Directions of traction' },
  },
];
