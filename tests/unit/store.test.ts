import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, priceFor } from '@/config/product';
import { selectCartCount, selectCartTotal, TURNTABLE_LIMITS, useExperience } from '@/store/useExperience';

const reset = () =>
  useExperience.setState({
    config: { ...DEFAULT_CONFIG },
    cart: [],
    notice: null,
    cartOpen: false,
    turntable: { yaw: 0, pitch: 0, zoom: 1 },
  });

describe('configurator state', () => {
  beforeEach(reset);

  it('selects a colour', () => {
    useExperience.getState().setColor('electric');
    expect(useExperience.getState().config.color).toBe('electric');
  });

  it('switches to a valid variant when a colour is not produced in the current one', () => {
    const s = useExperience.getState();
    s.setVariant('trail');
    s.setColor('arctic'); // Trail is not made in Arctic White
    const { config, notice } = useExperience.getState();
    expect(config.color).toBe('arctic');
    expect(config.variant).toBe('road');
    expect(notice).toMatch(/switched to Road/);
  });

  it('refuses a variant that is unavailable in the selected colour', () => {
    const s = useExperience.getState();
    s.setColor('crimson');
    s.setVariant('elite');
    expect(useExperience.getState().config.variant).toBe('road');
    expect(useExperience.getState().notice).toMatch(/not available/);
  });

  it('selects in-stock sizes and rejects sold-out ones', () => {
    const s = useExperience.getState();
    s.setSize('9');
    expect(useExperience.getState().config.size).toBe('9');
    s.setSize('13');
    expect(useExperience.getState().config.size).toBe('9');
    expect(useExperience.getState().notice).toMatch(/out of stock/);
  });

  it('restores the original configuration', () => {
    const s = useExperience.getState();
    s.setColor('titanium');
    s.setMaterial('suede');
    s.setSize('10');
    s.rotateBy(1.2, 0.3);
    s.resetConfig();
    expect(useExperience.getState().config).toEqual(DEFAULT_CONFIG);
    expect(useExperience.getState().turntable).toEqual({ yaw: 0, pitch: 0, zoom: 1 });
  });

  it('clamps turntable pitch and zoom to safe limits', () => {
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
    expect(useExperience.getState().notice).toMatch(/Select a size/);
  });

  it('adds, merges identical configurations and totals correctly', () => {
    const s = useExperience.getState();
    s.setSize('9');
    s.addToBag();
    s.addToBag();
    s.setVariant('elite');
    s.addToBag();
    const state = useExperience.getState();
    expect(state.cart).toHaveLength(2);
    expect(selectCartCount(state)).toBe(3);
    expect(selectCartTotal(state)).toBe(priceFor({ variant: 'road' }) * 2 + priceFor({ variant: 'elite' }));
    expect(state.cartOpen).toBe(true);
  });

  it('updates quantity within 1-9 and removes at zero', () => {
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
