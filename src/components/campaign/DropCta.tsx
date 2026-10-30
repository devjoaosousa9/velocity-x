'use client';

import { useId, useState, type FormEvent } from 'react';

/** Closing call to action. The form is a client-side demo: nothing is sent anywhere. */
export function DropCta() {
  const [state, setState] = useState<'idle' | 'error' | 'done'>('idle');
  const id = useId();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email') ?? '');
    setState(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'done' : 'error');
  };

  return (
    <section id="drop" className="drop" aria-labelledby="drop-title">
      <div className="wrap drop__inner" data-reveal>
        <p className="mono eyebrow">04 — The drop</p>
        <h2 id="drop-title" className="drop__title">
          Run beyond
          <br />
          <span className="volt-text">motion.</span>
        </h2>
        <p className="drop__text">Join the drop list to hear first when Velocity X lands.</p>
        {state === 'done' ? (
          <p className="drop__done" role="status">
            You&apos;re on the list. (Demo only — no email was sent or stored.)
          </p>
        ) : (
          <form className="drop__form" onSubmit={onSubmit} noValidate>
            <label htmlFor={id} className="sr-only">
              Email address
            </label>
            <input
              id={id}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={state === 'error' || undefined}
              aria-describedby={state === 'error' ? `${id}-err` : undefined}
              onInput={() => state === 'error' && setState('idle')}
            />
            <button type="submit" className="pill pill--volt">
              Join the drop
            </button>
            {state === 'error' && (
              <p id={`${id}-err`} className="drop__error" role="alert">
                Enter a valid email address.
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
