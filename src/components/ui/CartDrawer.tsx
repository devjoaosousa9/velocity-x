'use client';

import { useEffect, useRef } from 'react';
import { formatPrice, getColor, getMaterial, getVariant, PRODUCT } from '@/config/product';
import { selectCartTotal, useExperience } from '@/store/useExperience';

/**
 * Demonstration bag held in client state only. There is no checkout: the
 * button is disabled and labelled as such rather than faking an order.
 */
export function CartDrawer() {
  const open = useExperience((s) => s.cartOpen);
  const cart = useExperience((s) => s.cart);
  const total = useExperience(selectCartTotal);
  const setCartOpen = useExperience((s) => s.setCartOpen);
  const updateQuantity = useExperience((s) => s.updateQuantity);
  const removeFromBag = useExperience((s) => s.removeFromBag);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className="drawer"
      aria-labelledby="bag-title"
      onClose={() => setCartOpen(false)}
      onClick={(e) => {
        if (e.target === dialog.current) setCartOpen(false);
      }}
    >
      <div className="drawer__panel">
        <header className="drawer__head">
          <h2 id="bag-title" className="drawer__title">
            Bag <span className="tabular">({cart.reduce((n, i) => n + i.quantity, 0)})</span>
          </h2>
          <button type="button" className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Close bag">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </header>

        {cart.length === 0 ? (
          <p className="drawer__empty">Your bag is empty. Configure your pair and add it here.</p>
        ) : (
          <ul className="drawer__list">
            {cart.map((item) => {
              const color = getColor(item.config.color);
              return (
                <li key={item.key} className="bag-item">
                  <span className="bag-item__swatch" style={{ background: color.swatch }} aria-hidden="true" />
                  <div className="bag-item__info">
                    <p className="bag-item__name">
                      {PRODUCT.name} {getVariant(item.config.variant).name}
                    </p>
                    <p className="bag-item__meta">
                      {color.name} · {getMaterial(item.config.material).name} · US {item.config.size}
                    </p>
                    <div className="qty" role="group" aria-label={`Quantity for ${color.name}, size ${item.config.size}`}>
                      <button type="button" onClick={() => updateQuantity(item.key, item.quantity - 1)} aria-label="Decrease quantity">
                        −
                      </button>
                      <span className="tabular" aria-live="polite">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        aria-label="Increase quantity"
                        disabled={item.quantity >= 9}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="bag-item__side">
                    <p className="tabular">{formatPrice(item.unitPrice * item.quantity)}</p>
                    <button type="button" className="link-btn" onClick={() => removeFromBag(item.key)}>
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <footer className="drawer__foot">
          <div className="drawer__total">
            <span>Subtotal</span>
            <span className="tabular">{formatPrice(total)}</span>
          </div>
          <button type="button" className="btn btn--primary btn--block" disabled aria-describedby="demo-note">
            Checkout unavailable
          </button>
          <p id="demo-note" className="fine-print">
            Demonstration store. Prices are illustrative; no payment or order is processed.
          </p>
        </footer>
      </div>
    </dialog>
  );
}
