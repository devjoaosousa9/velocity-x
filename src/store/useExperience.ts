import { create } from 'zustand';
import { DEFAULT_CONFIG, getColor, isCombinationAvailable, priceFor, SIZES } from '@/config/product';
import type { CartItem, ColorId, ProductConfig, WidthId } from '@/types/product';

export type QualityTier = 'high' | 'medium' | 'low';
export type RenderStatus = 'pending' | 'ready' | 'unsupported' | 'error';
export type StageMode = 'cinematic' | 'configure';

export interface Turntable {
  yaw: number;
  pitch: number;
  zoom: number;
}

export const TURNTABLE_LIMITS = { pitch: 0.45, zoomMin: 0.75, zoomMax: 1.5 } as const;
const DEFAULT_TURNTABLE: Turntable = { yaw: 0, pitch: 0, zoom: 1 };

interface ExperienceState {
  config: ProductConfig;
  notice: string | null;
  cart: CartItem[];
  cartOpen: boolean;

  systemReducedMotion: boolean;
  motionPaused: boolean;
  quality: QualityTier;
  renderStatus: RenderStatus;
  renderError: string | null;
  /** Model download progress, 0-100. */
  loadProgress: number;

  mode: StageMode;
  /** Index of the active step in the scroll tour (-1 when outside it). */
  tourStep: number;
  turntable: Turntable;
  /** Bumped on every colourway change so the stage can play its reaction. */
  colorChanges: number;

  setColor: (color: ColorId) => void;
  setWidth: (width: WidthId) => void;
  setSize: (size: string) => void;
  resetConfig: () => void;
  clearNotice: () => void;

  addToBag: () => boolean;
  updateQuantity: (key: string, quantity: number) => void;
  removeFromBag: (key: string) => void;
  setCartOpen: (open: boolean) => void;

  setSystemReducedMotion: (value: boolean) => void;
  toggleMotion: () => void;
  setQuality: (tier: QualityTier) => void;
  setRenderStatus: (status: RenderStatus, error?: string) => void;
  setLoadProgress: (progress: number) => void;

  setMode: (mode: StageMode) => void;
  setTourStep: (step: number) => void;
  rotateBy: (dYaw: number, dPitch?: number) => void;
  zoomBy: (factor: number) => void;
  resetView: () => void;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const cartKey = (c: ProductConfig) => `${c.color}:${c.width}:${c.size}`;

export const useExperience = create<ExperienceState>()((set, get) => ({
  config: { ...DEFAULT_CONFIG },
  notice: null,
  cart: [],
  cartOpen: false,

  systemReducedMotion: false,
  motionPaused: false,
  quality: 'high',
  renderStatus: 'pending',
  renderError: null,
  loadProgress: 0,

  mode: 'cinematic',
  tourStep: -1,
  turntable: { ...DEFAULT_TURNTABLE },
  colorChanges: 0,

  setColor: (color) => {
    const { config, colorChanges } = get();
    if (color === config.color) return;
    if (!isCombinationAvailable(config.width, color)) {
      // Keep the colour the person asked for; fall back to the width it is made in.
      set({
        config: { ...config, color, width: 'regular' },
        colorChanges: colorChanges + 1,
        notice: `${getColor(color).name} comes in Regular width only, so we switched you to Regular.`,
      });
      return;
    }
    set({ config: { ...config, color }, colorChanges: colorChanges + 1, notice: null });
  },
  setWidth: (width) => {
    const { config } = get();
    if (!isCombinationAvailable(width, config.color)) {
      set({ notice: `Wide isn't made in ${getColor(config.color).name}. Pick Midnight or Street for Wide.` });
      return;
    }
    set({ config: { ...config, width }, notice: null });
  },
  setSize: (size) => {
    const option = SIZES.find((s) => s.value === size);
    if (!option || !option.inStock) {
      set({ notice: `US ${size} is sold out right now.` });
      return;
    }
    set((s) => ({ config: { ...s.config, size }, notice: null }));
  },
  resetConfig: () =>
    set((s) => ({
      config: { ...DEFAULT_CONFIG },
      notice: null,
      turntable: { ...DEFAULT_TURNTABLE },
      colorChanges: s.config.color === DEFAULT_CONFIG.color ? s.colorChanges : s.colorChanges + 1,
    })),
  clearNotice: () => set({ notice: null }),

  addToBag: () => {
    const { config, cart } = get();
    if (!config.size) {
      set({ notice: 'Choose a size to add Velocity X to your bag.' });
      return false;
    }
    const key = cartKey(config);
    const existing = cart.find((i) => i.key === key);
    const next = existing
      ? cart.map((i) => (i.key === key ? { ...i, quantity: Math.min(9, i.quantity + 1) } : i))
      : [...cart, { key, config: { ...config, size: config.size }, quantity: 1, unitPrice: priceFor(config) }];
    set({ cart: next, notice: null, cartOpen: true });
    return true;
  },
  updateQuantity: (key, quantity) =>
    set((s) => ({
      cart:
        quantity <= 0
          ? s.cart.filter((i) => i.key !== key)
          : s.cart.map((i) => (i.key === key ? { ...i, quantity: clamp(quantity, 1, 9) } : i)),
    })),
  removeFromBag: (key) => set((s) => ({ cart: s.cart.filter((i) => i.key !== key) })),
  setCartOpen: (cartOpen) => set({ cartOpen }),

  setSystemReducedMotion: (systemReducedMotion) => set({ systemReducedMotion }),
  toggleMotion: () => set((s) => ({ motionPaused: !s.motionPaused })),
  setQuality: (quality) => set({ quality }),
  setRenderStatus: (renderStatus, error) => set({ renderStatus, renderError: error ?? null }),
  setLoadProgress: (loadProgress) => set({ loadProgress }),

  setMode: (mode) => set({ mode }),
  setTourStep: (tourStep) => set((s) => (s.tourStep === tourStep ? s : { tourStep })),
  rotateBy: (dYaw, dPitch = 0) =>
    set((s) => ({
      turntable: {
        ...s.turntable,
        yaw: s.turntable.yaw + dYaw,
        pitch: clamp(s.turntable.pitch + dPitch, -TURNTABLE_LIMITS.pitch, TURNTABLE_LIMITS.pitch),
      },
    })),
  zoomBy: (factor) =>
    set((s) => ({
      turntable: {
        ...s.turntable,
        zoom: clamp(s.turntable.zoom * factor, TURNTABLE_LIMITS.zoomMin, TURNTABLE_LIMITS.zoomMax),
      },
    })),
  resetView: () => set({ turntable: { ...DEFAULT_TURNTABLE } }),
}));

/** True when continuous / decorative motion must stop. */
export const selectMotionReduced = (s: ExperienceState) => s.systemReducedMotion || s.motionPaused;
export const selectCartCount = (s: ExperienceState) => s.cart.reduce((n, i) => n + i.quantity, 0);
export const selectCartTotal = (s: ExperienceState) => s.cart.reduce((n, i) => n + i.quantity * i.unitPrice, 0);
