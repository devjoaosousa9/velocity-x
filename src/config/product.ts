import type {
  ColorOption,
  MaterialOption,
  ProductConfig,
  SizeOption,
  VariantOption,
  ColorId,
  VariantId,
} from '@/types/product';

export const PRODUCT = {
  name: 'Velocity X',
  tagline: 'Beyond Motion',
  sku: 'VX-01',
  /** Demonstration price. No real checkout exists. */
  basePrice: 240,
  currency: 'USD',
} as const;

export const COLORS: ColorOption[] = [
  // `filter` re-tints the real photo for colourway previews (Volt is the photographed original).
  { id: 'volt', name: 'Volt Yellow', upper: '#c9f230', midsole: '#f1efe6', overlay: '#1f2240', accent: '#2f6bff', swatch: '#c9f230', filter: 'none' },
  { id: 'electric', name: 'Electric Blue', upper: '#2b6cf0', midsole: '#f1efe6', overlay: '#0d0f13', accent: '#9fc2ff', swatch: '#2b6cf0', filter: 'hue-rotate(140deg) saturate(1.15)' },
  { id: 'crimson', name: 'Crimson Red', upper: '#d0213a', midsole: '#f1efe6', overlay: '#16181d', accent: '#ff6a4d', swatch: '#d0213a', filter: 'hue-rotate(-78deg) saturate(1.25)' },
  { id: 'violet', name: 'Ultra Violet', upper: '#7b3cf0', midsole: '#f1efe6', overlay: '#16181d', accent: '#c7a6ff', swatch: '#7b3cf0', filter: 'hue-rotate(190deg) saturate(1.1)' },
  { id: 'aqua', name: 'Aqua Surge', upper: '#19c7b0', midsole: '#f1efe6', overlay: '#16181d', accent: '#2f6bff', swatch: '#19c7b0', filter: 'hue-rotate(95deg)' },
];

export const MATERIALS: MaterialOption[] = [
  {
    id: 'aeromesh',
    name: 'AeroMesh Knit',
    description: 'Engineered knit. Breathable, soft sheen.',
    roughness: 0.78,
    metalness: 0,
    clearcoat: 0,
    sheen: 0.9,
    relief: 1,
    pattern: 'knit',
  },
  {
    id: 'carbon',
    name: 'Carbon Shell',
    description: 'Woven composite with a lacquered clear coat.',
    roughness: 0.38,
    metalness: 0.15,
    clearcoat: 1,
    sheen: 0,
    relief: 0.6,
    pattern: 'weave',
  },
  {
    id: 'suede',
    name: 'Suede Tech',
    description: 'Brushed microfibre. Deep matte finish.',
    roughness: 0.95,
    metalness: 0,
    clearcoat: 0,
    sheen: 0.5,
    relief: 0,
    pattern: 'none',
  },
];

export const VARIANTS: VariantOption[] = [
  {
    id: 'road',
    name: 'Road',
    description: 'Balanced stack for daily speed.',
    lugScale: 1,
    stack: 1,
    outsoleColor: '#121317',
    glow: 1.2,
    priceDelta: 0,
    unavailableColors: [],
  },
  {
    id: 'trail',
    name: 'Trail',
    description: 'Aggressive 5 mm lugs for loose terrain.',
    lugScale: 1.9,
    stack: 1.06,
    outsoleColor: '#3a2f25',
    glow: 0.6,
    priceDelta: 20,
    unavailableColors: ['violet'],
  },
  {
    id: 'elite',
    name: 'Elite',
    description: 'Max stack with a full-length energy plate.',
    lugScale: 0.7,
    stack: 1.16,
    outsoleColor: '#0d0e11',
    glow: 2.6,
    priceDelta: 60,
    unavailableColors: ['crimson'],
  },
];

/** Demonstration stock. Some sizes are sold out to exercise the disabled state. */
export const SIZES: SizeOption[] = [
  '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13',
].map((value) => ({ value, inStock: !['7', '11.5', '13'].includes(value) }));

export const DEFAULT_CONFIG: ProductConfig = {
  color: 'volt',
  material: 'aeromesh',
  variant: 'road',
  size: null,
};

export const getColor = (id: ColorId) => COLORS.find((c) => c.id === id) ?? COLORS[0]!;
export const getMaterial = (id: ProductConfig['material']) =>
  MATERIALS.find((m) => m.id === id) ?? MATERIALS[0]!;
export const getVariant = (id: VariantId) => VARIANTS.find((v) => v.id === id) ?? VARIANTS[0]!;

export const isCombinationAvailable = (variant: VariantId, color: ColorId) =>
  !getVariant(variant).unavailableColors.includes(color);

export const priceFor = (config: Pick<ProductConfig, 'variant'>) =>
  PRODUCT.basePrice + getVariant(config.variant).priceDelta;

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: PRODUCT.currency, maximumFractionDigits: 0 }).format(value);
