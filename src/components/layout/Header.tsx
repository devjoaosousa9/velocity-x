'use client';

import { useEffect, useRef, useState } from 'react';
import { NAV } from '@/config/site';
import { selectCartCount, useExperience } from '@/store/useExperience';
import { Logo } from './Logo';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const count = useExperience(selectCartCount);
  const setCartOpen = useExperience((s) => s.setCartOpen);
  const motionPaused = useExperience((s) => s.motionPaused);
  const systemReduced = useExperience((s) => s.systemReducedMotion);
  const toggleMotion = useExperience((s) => s.toggleMotion);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.dataset.lock = 'true';
    return () => {
      document.removeEventListener('keydown', onKey);
      delete document.body.dataset.lock;
    };
  }, [menuOpen]);

  const motionOff = motionPaused || systemReduced;

  return (
    <header className="site-header">
      <div className="progress" aria-hidden="true">
        <span className="progress__bar" data-progress-bar />
      </div>
      <div className="site-header__inner">
        <a href="#hero" className="brand" aria-label="Velocity X — back to top">
          <Logo />
        </a>

        <nav aria-label="Primary" className="nav-desktop">
          <ul>
            {NAV.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="nav-link">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <span className="chapter mono" aria-hidden="true">
            <span data-progress-index>01</span> / 08
          </span>
          <button
            type="button"
            className="icon-btn"
            aria-pressed={motionOff}
            onClick={toggleMotion}
            disabled={systemReduced}
            title={systemReduced ? 'Reduced motion is set by your system' : motionOff ? 'Resume motion' : 'Pause motion'}
            aria-label={motionOff ? 'Resume animations' : 'Pause animations'}
          >
            {motionOff ? (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M8 5.5v13l10-6.5z" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor" />
              </svg>
            )}
          </button>
          <button type="button" className="bag-btn" onClick={() => setCartOpen(true)} aria-label={`Open bag, ${count} item${count === 1 ? '' : 's'}`}>
            <span className="bag-btn__label">Bag</span>
            <span className="bag-btn__count tabular" data-filled={count > 0}>
              {count}
            </span>
          </button>
          <button
            ref={menuButton}
            type="button"
            className="menu-btn"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <span className="menu-btn__lines" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className="mobile-menu" data-open={menuOpen} hidden={!menuOpen}>
        <nav aria-label="Mobile">
          <ol>
            {NAV.map((item, i) => (
              <li key={item.id} style={{ ['--i' as string]: i }}>
                <a href={`#${item.id}`} onClick={() => setMenuOpen(false)}>
                  <span className="mono">0{i + 2}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </header>
  );
}
