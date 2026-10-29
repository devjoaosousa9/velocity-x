import { gsap } from 'gsap';
import { SCRIPT, SHOTS, type SectionScript } from '@/config/shots';
import { notifySceneTarget, sceneTarget, shotToTarget } from './sceneTarget';

export interface SectionRange {
  section: string;
  start: number;
  end: number;
}

/**
 * One centralised, paused GSAP timeline holds the whole narrative. Sections never
 * own tweens - they only seek this timeline - so two systems can never fight over
 * the same property.
 */
export function buildMasterTimeline(script: SectionScript[] = SCRIPT) {
  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: 'power2.inOut' },
    onUpdate: notifySceneTarget,
  });
  const ranges: SectionRange[] = [];

  // Pin initial values so seeking back to 0 restores the first shot.
  tl.set(sceneTarget, shotToTarget(SHOTS[script[0]!.keys[0]!]), 0);

  for (const part of script) {
    const start = tl.duration();
    part.keys.forEach((key, i) => {
      if (i === 0) {
        if (part.hold > 0) tl.to({}, { duration: part.hold / 2 });
        return;
      }
      tl.to(sceneTarget, { ...shotToTarget(SHOTS[key]), duration: 1 });
      if (part.hold > 0) tl.to({}, { duration: part.hold });
    });
    ranges.push({ section: part.section, start, end: tl.duration() });
  }
  return { tl, ranges };
}
