export type ColorId = 'volt' | 'electric' | 'crimson' | 'violet' | 'aqua';
export type MaterialId = 'aeromesh' | 'carbon' | 'suede';
export type VariantId = 'road' | 'trail' | 'elite';
export type PartId =
  | 'outsole'
  | 'midsole'
  | 'insole'
  | 'upper'
  | 'tongue'
  | 'laces'
  | 'heelCounter';

export interface ColorOption {
  id: ColorId;
  name: string;
  /** Upper base colour (sRGB hex). */
  upper: string;
  /** Midsole foam colour. */
  midsole: string;
  /** Welded midfoot cage straps. */
  overlay: string;
  /** Accent: laces, heel counter tint, energy line. */
  accent: string;
  /** Swatch used in the UI. */
  swatch: string;
  /** CSS filter that re-tints the product photo (photo mode). */
  filter: string;
}

export interface MaterialOption {
  id: MaterialId;
  name: string;
  description: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
  sheen: number;
  /** Strength of the procedural micro-relief map (0 disables it). */
  relief: number;
  pattern: 'knit' | 'weave' | 'none';
}

export interface VariantOption {
  id: VariantId;
  name: string;
  description: string;
  /** Multiplier for outsole lug height. */
  lugScale: number;
  /** Midsole stack multiplier. */
  stack: number;
  outsoleColor: string;
  /** Emissive intensity of the energy line. */
  glow: number;
  priceDelta: number;
  /** Colours this variant is NOT produced in (drives the "unavailable" state). */
  unavailableColors: ColorId[];
}

export interface SizeOption {
  value: string;
  inStock: boolean;
}

export interface ProductConfig {
  color: ColorId;
  material: MaterialId;
  variant: VariantId;
  size: string | null;
}

export interface CartItem {
  key: string;
  config: Required<{ [K in keyof ProductConfig]: NonNullable<ProductConfig[K]> }>;
  quantity: number;
  unitPrice: number;
}
