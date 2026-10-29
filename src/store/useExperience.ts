import { create } from 'zustand';
import { DEFAULT_CONFIG, getVariant, isCombinationAvailable, priceFor, SIZES, VARIANTS } from '@/config/product';
import type { CartItem, ColorId, MaterialId, ProductConfig, VariantId } from '@/types/product';

export type QualityTier = 'high' | 'medium' | 'low';
export type RenderStatus = 'pending' | 'ready' | 'unsupported' | 'error';
export type StageMode = 'cinematic' | 'configure';
export type HotspotId = 'cushioning' | 'aeromesh' | 'grip';

export interface Turntable {
  yaw: number;
  pitch: number;
  zoom: number;
}

export const TURNTABLE_LIMITS = { pitch: 0.6, zoomMin: 0.7, zoomMax: 1.45 } as const;
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

  mode: StageMode;
  activeHotspot: HotspotId | null;
  /** null = scroll drives the exploded view; 0/1 = user override via button. */
  explodeOverride: number | null;
  turntable: Turntable;

  setColor: (color: ColorId) => void;
  setMaterial: (material: MaterialId) => void;
  setVariant: (variant: VariantId) => void;
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

  setMode: (mode: StageMode) => void;
  setActiveHotspot: (id: HotspotId | null) => void;
  setExplodeOverride: (value: number | null) => void;
  rotateBy: (dYaw: number, dPitch?: number) => void;
  zoomBy: (factor: number) => void;
  resetView: () => void;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const cartKey = (c: ProductConfig) => `${c.variant}:${c.color}:${c.material}:${c.size}`;

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

  mode: 'cinematic',
  activeHotspot: null,
  explodeOverride: null,
  turntable: { ...DEFAULT_TURNTABLE },

  setColor: (color) => {
    const { config } = get();
    if (!isCombinationAvailable(config.variant, color)) {
      // Keep the colour (the user asked for it) and fall back to the first variant that ships in it.
      const fallback = VARIANTS.find((v) => isCombinationAvailable(v.id, color));
      if (!fallback) {
        set({ notice: 'This colour is not available in any variant.' });
        return;
      }
      set({
        config: { ...config, color, variant: fallback.id },
        notice: `${getVariant(config.variant).name} is not produced in this colour — switched to ${fallback.name}.`,
      });
      return;
    }
    set({ config: { ...config, color }, notice: null });
  },
  setMaterial: (material) => set((s) => ({ config: { ...s.config, material }, notice: null })),
  setVariant: (variant) => {
    const { config } = get();
    if (!isCombinationAvailable(variant, config.color)) {
      set({ notice: `${getVariant(variant).name} is not available in the selected colour.` });
      return;
    }
    set({ config: { ...config, variant }, notice: null });
  },
  setSize: (size) => {
    const option = SIZES.find((s) => s.value === size);
    if (!option || !option.inStock) {
      set({ notice: `Size ${size} is currently out of stock.` });
      return;
    }
    set((s) => ({ config: { ...s.config, size }, notice: null }));
  },
  resetConfig: () =>
    set({ config: { ...DEFAULT_CONFIG }, notice: null, turntable: { ...DEFAULT_TURNTABLE } }),
  clearNotice: () => set({ notice: null }),

  addToBag: () => {
    const { config, cart } = get();
    if (!config.size) {
      set({ notice: 'Select a size to add Velocity X to your bag.' });
      return false;
    }
    const key = cartKey(config);
    const existing = cart.find((i) => i.key === key);
    const next = existing
      ? cart.map((i) => (i.key === key ? { ...i, quantity: Math.min(9, i.quantity + 1) } : i))
      : [
          ...cart,
          {
            key,
            config: { ...config, size: config.size },
            quantity: 1,
            unitPrice: priceFor(config),
          },
        ];
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

  setMode: (mode) => set({ mode }),
  setActiveHotspot: (activeHotspot) => set({ activeHotspot }),
  setExplodeOverride: (explodeOverride) => set({ explodeOverride }),
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
export const selectCartTotal = (s: ExperienceState) =>
  s.cart.reduce((n, i) => n + i.quantity * i.unitPrice, 0);
