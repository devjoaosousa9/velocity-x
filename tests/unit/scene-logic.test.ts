import { describe, expect, it } from 'vitest';
import { adaptShotForAspect, SCRIPT, SHOTS } from '@/config/shots';
import { buildMasterTimeline } from '@/animation/buildMasterTimeline';
import { sceneTarget } from '@/animation/sceneTarget';
import { PARTS, partProgress } from '@/config/parts';
import { detectInitialTier, stepTier } from '@/lib/quality';
import { halfWidth, hermite, midsoleTop, upperTop, yBottom } from '@/three/geometry/shoeProfile';

describe('central timeline', () => {
  it('gives every scripted section a contiguous, ordered slice', () => {
    const { ranges, tl } = buildMasterTimeline();
    expect(ranges.map((r) => r.section)).toEqual(SCRIPT.map((s) => s.section));
    ranges.forEach((r, i) => {
      expect(r.end).toBeGreaterThan(r.start);
      if (i > 0) expect(r.start).toBeCloseTo(ranges[i - 1]!.end, 6);
    });
    tl.kill();
  });

  it('lands exactly on each section key shot when seeked to its end', () => {
    const { ranges, tl } = buildMasterTimeline();
    ranges.forEach((r, i) => {
      tl.time(r.end);
      const last = SHOTS[SCRIPT[i]!.keys.at(-1)!];
      expect(sceneTarget.camZ).toBeCloseTo(last.cam[2], 5);
      expect(sceneTarget.explode).toBeCloseTo(last.explode, 5);
    });
    tl.time(0);
    expect(sceneTarget.camZ).toBeCloseTo(SHOTS.hero.cam[2], 5);
    tl.kill();
  });
});

describe('responsive framing', () => {
  it('leaves wide screens untouched', () => {
    expect(adaptShotForAspect(SHOTS.rotate, 1.9)).toBe(SHOTS.rotate);
  });
  it('re-centres the product and pulls back on portrait screens', () => {
    const phone = adaptShotForAspect(SHOTS.rotate, 0.44);
    expect(Math.abs(phone.pos[0])).toBeLessThan(0.01);
    expect(phone.cam[2]).toBeGreaterThan(SHOTS.rotate.cam[2] * 1.5);
  });
});

describe('exploded view staging', () => {
  it('keeps parts assembled at 0 and fully separated at 1', () => {
    PARTS.forEach((p) => {
      expect(partProgress(0, p.order)).toBe(0);
      expect(partProgress(1, p.order)).toBeCloseTo(1, 6);
    });
  });
  it('staggers later parts behind earlier ones', () => {
    expect(partProgress(0.4, 0)).toBeGreaterThan(partProgress(0.4, 6));
  });
});

describe('shoe profile', () => {
  it('rounds to zero width at heel and toe', () => {
    expect(halfWidth(0)).toBeCloseTo(0, 6);
    expect(halfWidth(1)).toBeCloseTo(0, 6);
    expect(halfWidth(0.75)).toBeGreaterThan(0.4);
  });
  it('stacks layers in the right order everywhere', () => {
    for (let t = 0.02; t < 1; t += 0.05) {
      expect(midsoleTop(t)).toBeGreaterThan(yBottom(t));
      expect(upperTop(t)).toBeGreaterThan(midsoleTop(t));
    }
  });
  it('hermite passes through its knots', () => {
    const k = [[0, 1], [0.5, 3], [1, 2]] as const;
    expect(hermite(k, 0.5)).toBeCloseTo(3, 6);
    expect(hermite(k, 1)).toBe(2);
  });
});

describe('adaptive quality', () => {
  it('treats software renderers and save-data as low tier', () => {
    expect(detectInitialTier({ renderer: 'Google SwiftShader' })).toBe('low');
    expect(detectInitialTier({ saveData: true, cores: 16 })).toBe('low');
  });
  it('does not rely on screen width: a strong touch device is medium, not low', () => {
    expect(detectInitialTier({ coarsePointer: true, cores: 8, memoryGb: 8, webgl2: true })).toBe('medium');
  });
  it('gives capable desktops the high tier', () => {
    expect(detectInitialTier({ cores: 12, memoryGb: 16, webgl2: true, maxTextureSize: 16384 })).toBe('high');
  });
  it('never steps above the device cap', () => {
    expect(stepTier('medium', 1, 'medium')).toBe('medium');
    expect(stepTier('high', -1, 'high')).toBe('medium');
    expect(stepTier('low', -1, 'high')).toBe('low');
  });
});
