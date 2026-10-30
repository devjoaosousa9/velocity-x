import { TOUR } from '@/config/tour';

/**
 * Scroll tour: the camera walks around the shoe (side, heel, top, front) while
 * each step's copy sits in the empty half of the screen. The section is exactly
 * four equal steps so every camera shot lands on its step's centre. Steps are a
 * real sequence, so they are numbered.
 */
export function Tour() {
  return (
    <section id="tour" className="tour" aria-labelledby="tour-title">
      {TOUR.map((step, i) => (
        <article key={step.id} className="tour-step" data-tour-step={i} aria-labelledby={`tour-${step.id}`}>
          <div className="wrap">
            <div className="tour-step__text">
              {i === 0 && (
                <h2 id="tour-title" className="tour__heading">
                  Up close
                </h2>
              )}
              <p className="tour-step__count">
                <span className="tabular">{i + 1}</span> of {TOUR.length}
              </p>
              <h3 id={`tour-${step.id}`} className="tour-step__title">
                {step.title}
              </h3>
              <p className="tour-step__body">{step.body}</p>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
