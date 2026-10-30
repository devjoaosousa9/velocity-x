import { MODEL } from './product';

export type Dimension = 'length' | 'height' | 'width';

export interface TourStep {
  id: 'side' | 'heel' | 'top' | 'front';
  title: string;
  body: string;
  /** Callout pinned to the model (scene units, product space). */
  callout: { label: string; at: [number, number, number] };
  /** Measured dimension drawn on the model during this step. */
  dimension?: Dimension;
}

export const TOUR: TourStep[] = [
  {
    id: 'side',
    title: 'One knit, two overlays',
    body: `The upper is a single engineered knit with two fused overlays across the midfoot. Heel to toe it measures ${MODEL.lengthMm} mm, straight off the scan.`,
    callout: { label: 'Fused overlays', at: [0.15, 0.62, 0.56] },
    dimension: 'length',
  },
  {
    id: 'heel',
    title: 'Pull loops, front and back',
    body: 'A fabric loop at the heel and another on the tongue get the shoe on without crushing the collar. The collar is padded and lined in black.',
    callout: { label: 'Heel pull loop', at: [-1.2, 1.12, 0.04] },
  },
  {
    id: 'top',
    title: 'Laces that wrap the midfoot',
    body: `Round laces run through four reinforced eyelets a side, held centred by the tongue loop. The widest point is ${MODEL.widthMm} mm across the forefoot.`,
    callout: { label: 'Tongue loop', at: [-0.24, 1.4, 0] },
    dimension: 'width',
  },
  {
    id: 'front',
    title: 'Foam from heel to toe',
    body: `A one-piece foam midsole with a rounded toe. From the ground to the top of the heel loop the shoe stands ${MODEL.heightMm} mm tall.`,
    callout: { label: 'Foam midsole', at: [1.2, 0.2, 0.42] },
    dimension: 'height',
  },
];
