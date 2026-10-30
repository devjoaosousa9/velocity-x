import type { ColorId, ColorOption, ProductConfig, SizeOption, WidthId, WidthOption } from '@/types/product';

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const PRODUCT = {
  name: 'Velocity X',
  /** Demonstration price. No real checkout exists. */
  basePrice: 165,
  currency: 'USD',
} as const;

/**
 * The real 3D asset. Measurements are read straight off the scan's bounding box,
 * so the numbers on the page are the model's own.
 */
export const MODEL = {
  url: `${base}/models/shoe.glb`,
  /** Scene units per metre: the scan is in metres, the scene works in ~3-unit shoes. */
  scale: 10,
  /** Shift that centres the scan on the origin (metres), sole resting on y = 0. */
  offset: [-0.0016, 0, -0.0049] as const,
  lengthMm: 298,
  heightMm: 152,
  widthMm: 116,
  triangles: 22_700,
  credit: {
    title: 'Materials Variants Shoe',
    author: 'Shopify',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    sourceUrl: 'https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe',
  },
} as const;

export const COLORS: ColorOption[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    variant: 'midnight',
    description: 'Ocean-blue knit, navy overlays, black laces.',
    swatch: '#11679f',
    accent: '#0f5f93',
    onAccent: '#ffffff',
  },
  {
    id: 'beach',
    name: 'Beach',
    variant: 'beach',
    description: 'Dusty-rose knit, tonal overlays, black laces.',
    swatch: '#b48a8e',
    accent: '#8f5f66',
    onAccent: '#ffffff',
  },
  {
    id: 'street',
    name: 'Street',
    variant: 'street',
    description: 'Black knit, red overlays, white foam.',
    swatch: '#1c1d21',
    accent: '#c41e3a',
    onAccent: '#ffffff',
  },
];

export const WIDTHS: WidthOption[] = [
  { id: 'regular', name: 'Regular', description: 'Standard D fit' },
  { id: 'wide', name: 'Wide', description: '2E, more room at the forefoot' },
];

/** Demonstration stock. Some sizes are sold out to exercise the disabled state. */
export const SIZES: SizeOption[] = ['6', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12', '13'].map(
  (value) => ({ value, inStock: !['6', '11', '13'].includes(value) }),
);

/** Wide is not made in every colourway: drives the "unavailable combination" state. */
export const WIDE_COLORS: ColorId[] = ['midnight', 'street'];

export const DEFAULT_CONFIG: ProductConfig = { color: 'midnight', width: 'regular', size: null };

export const getColor = (id: ColorId) => COLORS.find((c) => c.id === id) ?? COLORS[0]!;
export const getWidth = (id: WidthId) => WIDTHS.find((w) => w.id === id) ?? WIDTHS[0]!;
export const isCombinationAvailable = (width: WidthId, color: ColorId) =>
  width === 'regular' || WIDE_COLORS.includes(color);

export const priceFor = (config: Pick<ProductConfig, 'width'>) => PRODUCT.basePrice + (config.width === 'wide' ? 10 : 0);

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: PRODUCT.currency, maximumFractionDigits: 0 }).format(
    value,
  );
