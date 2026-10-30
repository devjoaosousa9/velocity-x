import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, priceFor } from '@/config/product';
import { selectCartCount, selectCartTotal, TURNTABLE_LIMITS, useExperience } from '@/store/useExperience';

const reset = () =>
  useExperience.setState({
    config: { ...DEFAULT_CONFIG },
    cart: [],
    notice: null,
    cartOpen: false,
    colorChanges: 0,
    turntable: { yaw: 0, pitch: 0, zoom: 1 },
  });

describe('configurator state', () => {
  beforeEach(reset);

  it('selects a colourway and counts the change for the stage reaction', () => {
    useExperience.getState().setColor('street');
    expect(useExperience.getState().config.color).toBe('street');
    expect(useExperience.getState().colorChanges).toBe(1);
    useExperience.getState().setColor('street');
    expect(useExperience.getState().colorChanges).toBe(1);
  });

  it('falls back to Regular when a colourway is not made in Wide', () => {
    const s = useExperience.getState();
    s.setWidth('wide');
    expect(useExperience.getState().config.width).toBe('wide');
    s.setColor('beach'); // Beach is Regular only
    const { config, notice } = useExperience.getState();
    expect(config.color).toBe('beach');
    expect(config.width).toBe('regular');
    expect(notice).toMatch(/Regular width only/);
  });

  it('refuses Wide in a colourway that does not ship in it', () => {
    const s = useExperience.getState();
    s.setColor('beach');
    s.setWidth('wide');
    expect(useExperience.getState().config.width).toBe('regular');
    expect(useExperience.getState().notice).toMatch(/Wide isn't made in Beach/);
  });

  it('selects in-stock sizes and rejects sold-out ones', () => {
    const s = useExperience.getState();
    s.setSize('9');
    expect(useExperience.getState().config.size).toBe('9');
    s.setSize('13');
    expect(useExperience.getState().config.size).toBe('9');
    expect(useExperience.getState().notice).toMatch(/sold out/);
  });

  it('starts over from the original configuration', () => {
    const s = useExperience.getState();
    s.setColor('street');
    s.setWidth('wide');
    s.setSize('10');
    s.rotateBy(1.2, 0.3);
    s.resetConfig();
    expect(useExperience.getState().config).toEqual(DEFAULT_CONFIG);
    expect(useExperience.getState().turntable).toEqual({ yaw: 0, pitch: 0, zoom: 1 });
  });

  it('clamps turntable tilt and zoom to safe limits', () => {
    const s = useExperience.getState();
    s.rotateBy(0, 10);
    s.zoomBy(100);
    expect(useExperience.getState().turntable.pitch).toBe(TURNTABLE_LIMITS.pitch);
    expect(useExperience.getState().turntable.zoom).toBe(TURNTABLE_LIMITS.zoomMax);
    s.zoomBy(0.0001);
    expect(useExperience.getState().turntable.zoom).toBe(TURNTABLE_LIMITS.zoomMin);
  });
});

describe('demo bag', () => {
  beforeEach(reset);

  it('requires a size before adding', () => {
    expect(useExperience.getState().addToBag()).toBe(false);
    expect(useExperience.getState().cart).toHaveLength(0);
    expect(useExperience.getState().notice).toMatch(/Choose a size/);
  });

  it('adds, merges identical pairs and totals correctly', () => {
    const s = useExperience.getState();
    s.setSize('9');
    s.addToBag();
    s.addToBag();
    s.setWidth('wide');
    s.addToBag();
    const state = useExperience.getState();
    expect(state.cart).toHaveLength(2);
    expect(selectCartCount(state)).toBe(3);
    expect(selectCartTotal(state)).toBe(priceFor({ width: 'regular' }) * 2 + priceFor({ width: 'wide' }));
    expect(state.cartOpen).toBe(true);
  });

  it('keeps quantity between 1 and 9 and removes at zero', () => {
    const s = useExperience.getState();
    s.setSize('9');
    s.addToBag();
    const key = useExperience.getState().cart[0]!.key;
    s.updateQuantity(key, 20);
    expect(useExperience.getState().cart[0]!.quantity).toBe(9);
    s.updateQuantity(key, 0);
    expect(useExperience.getState().cart).toHaveLength(0);
  });
});
