import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { adaptShotForAspect, SCRIPT, SHOTS } from '@/config/shots';
import { buildMasterTimeline } from '@/animation/buildMasterTimeline';
import { sceneTarget } from '@/animation/sceneTarget';
import { COLORS, MODEL } from '@/config/product';
import { TOUR } from '@/config/tour';
import { detectInitialTier, stepTier } from '@/lib/quality';

describe('central timeline', () => {
  it('gives every scripted section a contiguous one-unit slice', () => {
    const { ranges, tl } = buildMasterTimeline();
    expect(ranges.map((r) => r.section)).toEqual(SCRIPT.map((s) => s.section));
    ranges.forEach((r, i) => {
      expect(r.end - r.start).toBeCloseTo(1, 6);
      if (i > 0) expect(r.start).toBeCloseTo(ranges[i - 1]!.end, 6);
    });
    tl.kill();
  });

  it('lands exactly on each tour shot at its step centre', () => {
    const { ranges, tl } = buildMasterTimeline();
    const tour = ranges.find((r) => r.section === 'tour')!;
    const script = SCRIPT.find((s) => s.section === 'tour')!;
    script.keys.forEach((key, i) => {
      tl.time(tour.start + script.marks[i]!);
      expect(sceneTarget.camX).toBeCloseTo(SHOTS[key].cam[0], 5);
      expect(sceneTarget.tgtY).toBeCloseTo(SHOTS[key].target[1], 5);
    });
    tl.time(0);
    expect(sceneTarget.camZ).toBeCloseTo(SHOTS.hero.cam[2], 5);
    tl.kill();
  });

  it('has one tour mark per tour step', () => {
    const script = SCRIPT.find((s) => s.section === 'tour')!;
    expect(script.keys).toHaveLength(TOUR.length);
    expect(script.marks).toEqual(TOUR.map((_, i) => (i + 0.5) / TOUR.length));
  });
});

describe('responsive framing', () => {
  it('leaves wide screens untouched', () => {
    expect(adaptShotForAspect(SHOTS.side, 1.9)).toBe(SHOTS.side);
  });
  it('re-centres the product and pulls the camera back on phones', () => {
    const phone = adaptShotForAspect(SHOTS.configure, 0.44);
    expect(Math.abs(phone.target[0])).toBeLessThan(0.01);
    const dist = (s: typeof phone) => Math.hypot(...s.cam.map((c, i) => c - s.target[i]!));
    expect(dist(phone)).toBeGreaterThan(dist(SHOTS.configure) * 1.8);
  });
});

describe('the real model', () => {
  const glb = readFileSync(resolve(__dirname, '../../public/models/shoe.glb'));
  const json = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12)).toString());

  it('ships one material variant per colourway', () => {
    const names = json.extensions.KHR_materials_variants.variants.map((v: { name: string }) => v.name);
    expect(names).toEqual(COLORS.map((c) => c.variant));
  });

  it('is compressed for the web (meshopt geometry, WebP textures) and stays under 2 MB', () => {
    expect(json.extensionsUsed).toEqual(expect.arrayContaining(['EXT_meshopt_compression', 'EXT_texture_webp']));
    expect(glb.length).toBeLessThan(2 * 1024 * 1024);
  });

  it('quotes measurements that match the scan', () => {
    // Bounding box of the source scan in metres (Khronos sample asset).
    const length = 0.15055 - -0.14733;
    const width = 0.06275 - -0.05305;
    expect(MODEL.lengthMm).toBe(Math.round(length * 1000));
    expect(MODEL.widthMm).toBe(Math.round(width * 1000));
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
