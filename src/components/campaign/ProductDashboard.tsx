'use client';

import { formatPrice, getColor, getMaterial, getVariant, priceFor, PRODUCT } from '@/config/product';
import { useExperience } from '@/store/useExperience';
import { ColorSwatches, MaterialOptions, Notice, SizeSelector, VariantOptions } from '../ui/Options';
import { ProductVisual } from '../photo/ProductVisual';

const CUSHION: Record<string, number> = { road: 72, trail: 64, elite: 88 };

/**
 * Product "control room": the real shoe in the centre, glass widgets around it.
 * Every widget is a real control bound to the store (colour, material, variant,
 * size, bag) - the HUD look of the reference, with an actual job.
 */
export function ProductDashboard() {
  const config = useExperience((s) => s.config);
  const addToBag = useExperience((s) => s.addToBag);
  const resetConfig = useExperience((s) => s.resetConfig);
  const variant = getVariant(config.variant);
  const cushion = CUSHION[config.variant] ?? 72;

  return (
    <section id="configure" className="dash-section" aria-labelledby="configure-title">
      <div className="wrap">
        <header className="section-head" data-reveal>
          <p className="mono eyebrow">03 — Configure</p>
          <h2 id="configure-title" className="section-title">
            Make it yours.
            <br />
            <span className="dim">Every control is live.</span>
          </h2>
        </header>

        <div className="dash" data-reveal>
          <div className="dash__col dash__col--left">
            <div className="widget widget--gauge">
              <p className="widget__label mono">Cushion</p>
              <div className="gauge" style={{ ['--p' as string]: cushion }} aria-hidden="true">
                <span className="tabular">{cushion}%</span>
              </div>
              <p className="widget__note">{variant.name} stack</p>
            </div>
            <div className="widget">
              <ColorSwatches compact />
            </div>
            <div className="widget">
              <MaterialOptions />
            </div>
          </div>

          <div className="dash__center">
            <ProductVisual crop="full" className="dash__shoe" />
            <p className="dash__name" aria-hidden="true">
              VELOCITY X
            </p>
            <dl className="dash__summary" aria-label="Your configuration">
              <div>
                <dt>Colour</dt>
                <dd>{getColor(config.color).name}</dd>
              </div>
              <div>
                <dt>Material</dt>
                <dd>{getMaterial(config.material).name}</dd>
              </div>
              <div>
                <dt>Variant</dt>
                <dd>{variant.name}</dd>
              </div>
              <div>
                <dt>Size</dt>
                <dd>{config.size ? `US M ${config.size}` : '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="dash__col dash__col--right">
            <div className="widget">
              <VariantOptions />
            </div>
            <div className="widget">
              <SizeSelector />
            </div>
          </div>

          <div className="dash__bar">
            <div className="dash__price">
              <p className="tabular">{formatPrice(priceFor(config))}</p>
              <span className="mono">Demonstration price · {PRODUCT.name}</span>
            </div>
            <Notice />
            <div className="dash__actions">
              <button type="button" className="pill pill--ghost-dark" onClick={resetConfig}>
                Restore original
              </button>
              <button type="button" className="pill pill--volt" onClick={() => addToBag()}>
                Add to Bag
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
