import { MARQUEE_ROWS } from '@/config/campaign';

/**
 * Two-row infinite marquee (opposite directions). Pure CSS: the track holds the
 * list twice and slides by exactly one copy, so the loop is seamless. Pauses on
 * hover and stops under reduced motion. The duplicate copy is hidden from AT.
 */
export function Marquee() {
  return (
    <section className="marquee" aria-label="Proven on the world's fastest courses">
      {MARQUEE_ROWS.map((row, r) => (
        <div key={r} className="marquee__row" data-direction={r % 2 ? 'right' : 'left'}>
          <div className="marquee__track">
            {[0, 1].map((copy) => (
              <ul key={copy} className="marquee__list" aria-hidden={copy === 1 || undefined}>
                {row.map((item) => (
                  <li key={item} className={r === 0 ? 'marquee__city' : 'marquee__tag'}>
                    {item}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
