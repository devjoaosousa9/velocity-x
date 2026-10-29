/**
 * Per-frame values produced by the CameraRig and consumed by other scene
 * components (parts, labels, lights). Mutable on purpose: these change every
 * frame and must never trigger React renders.
 */
export const liveState = {
  /** Damped explode amount actually shown (0-1). */
  explode: 0,
  /** Intro reveal (0 -> 1) driving the light-up on first load. */
  reveal: 0,
};
