/** The three colourways shipped inside the scanned model (KHR_materials_variants). */
export type ColorId = 'midnight' | 'beach' | 'street';
export type WidthId = 'regular' | 'wide';

export interface ColorOption {
  id: ColorId;
  name: string;
  /** Material variant name inside the glTF file. */
  variant: string;
  description: string;
  /** Swatch colour sampled from the knit texture. */
  swatch: string;
  /** Page accent while this colourway is selected (also used for focus rings). */
  accent: string;
  /** Text colour that stays readable on the accent. */
  onAccent: string;
}

export interface WidthOption {
  id: WidthId;
  name: string;
  description: string;
}

export interface SizeOption {
  value: string;
  inStock: boolean;
}

export interface ProductConfig {
  color: ColorId;
  width: WidthId;
  size: string | null;
}

export interface CartItem {
  key: string;
  config: { color: ColorId; width: WidthId; size: string };
  quantity: number;
  unitPrice: number;
}
