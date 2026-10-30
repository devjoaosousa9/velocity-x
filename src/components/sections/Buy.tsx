'use client';

import { useRef } from 'react';
import { formatPrice, getColor, getMaterial, getVariant, priceFor, PRODUCT } from '@/config/product';
import { useExperience } from '@/store/useExperience';
import { ColorSwatches, Notice, SizeSelector } from '../ui/Options';
import { ProductVisual } from '../photo/ProductVisual';

export function Buy() {
  const config = useExperience((s) => s.config);
  const addToBag = useExperience((s) => s.addToBag);
  const details = useRef<HTMLDialogElement>(null);
  const price = priceFor(config);

  return (
    <section id="buy" className="buy" data-chapter="07" aria-labelledby="buy-title">
      <div className="container buy__grid">
        <ProductVisual crop="full" className="buy__fallback buy__photo" />
        <div className="glass-card buy__card">
          <p className="kicker mono">07 — Reserve</p>
          <h2 id="buy-title" className="heading-xl">
            {PRODUCT.name}
            <span className="muted"> {getVariant(config.variant).name}</span>
          </h2>
          <p className="body muted">
            Engineered knit upper, adaptive heel cushioning and a hex-lug outsole in one continuous silhouette.
          </p>
          <p className="price price--lg tabular">
            {formatPrice(price)}
            <span className="badge">Demonstration price</span>
          </p>

          <ColorSwatches compact />
          <SizeSelector />

          <dl className="summary" aria-label="Your configuration">
            <div><dt>Colour</dt><dd>{getColor(config.color).name}</dd></div>
            <div><dt>Material</dt><dd>{getMaterial(config.material).name}</dd></div>
            <div><dt>Variant</dt><dd>{getVariant(config.variant).name}</dd></div>
            <div><dt>Size</dt><dd>{config.size ? `US M ${config.size}` : '—'}</dd></div>
          </dl>

          <Notice />
          <div className="buy__actions">
            <button type="button" className="btn btn--primary" onClick={() => addToBag()}>
              Add to Bag
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => details.current?.showModal()}>
              View Details
            </button>
          </div>
        </div>
      </div>

      <dialog ref={details} className="modal" aria-labelledby="details-title" onClick={(e) => e.target === details.current && details.current?.close()}>
        <div className="modal__panel">
          <header className="drawer__head">
            <h2 id="details-title" className="drawer__title">Product details</h2>
            <button type="button" className="icon-btn" onClick={() => details.current?.close()} aria-label="Close details">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" /></svg>
            </button>
          </header>
          <ul className="spec-list spec-list--modal">
            <li><span>Model</span><span>{PRODUCT.sku}</span></li>
            <li><span>Upper</span><span>{getMaterial(config.material).name}</span></li>
            <li><span>Midsole</span><span>Adaptive foam, twin heel pods</span></li>
            <li><span>Outsole</span><span>Hex-lug rubber ({getVariant(config.variant).name} pattern)</span></li>
            <li><span>Weight</span><span className="tabular">212 g (US 9)</span></li>
            <li><span>Drop</span><span className="tabular">10 mm</span></li>
          </ul>
          <p className="fine-print">Velocity X is a fictional concept. Specifications are illustrative design targets.</p>
        </div>
      </dialog>
    </section>
  );
}
