'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useState, type ReactNode } from 'react';
import { getColor } from '@/config/product';
import { useExperience, type QualityTier } from '@/store/useExperience';
import { probeWebGL } from '@/lib/webgl';
import { detectInitialTier, parseQualityOverride } from '@/lib/quality';

// The whole three.js / R3F graph is its own chunk and never renders on the server.
const Scene = dynamic(() => import('@/three/Scene'), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode; onError: (e: Error) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Fixed, transparent 3D layer between the page background (where the hero
 * wordmark lives) and the page content. Everything readable is server-rendered
 * HTML, so the site works whether or not WebGL starts.
 */
export function Stage() {
  const status = useExperience((s) => s.renderStatus);
  const setRenderStatus = useExperience((s) => s.setRenderStatus);
  const setQuality = useExperience((s) => s.setQuality);
  const [cap, setCap] = useState<QualityTier | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Capability probing needs the real browser, so it can only happen after mount.
    const probe = probeWebGL();
    if (!probe.supported) {
      setRenderStatus('unsupported');
      return;
    }
    const tier = parseQualityOverride(window.location.search) ?? detectInitialTier(probe.signals);
    setQuality(tier);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot client capability probe
    setCap(tier);
  }, [setQuality, setRenderStatus]);

  const failed = status === 'unsupported' || status === 'error';

  return (
    <>
      <div className="stage" data-status={status}>
        {cap && !failed && (
          <SceneBoundary key={attempt} onError={(e) => setRenderStatus('error', e.message)}>
            <Scene cap={cap} />
          </SceneBoundary>
        )}
      </div>
      {failed && (
        <div className="stage-notice" role="status">
          <span>
            {status === 'unsupported'
              ? 'This device can’t show the 3D model, so you’re seeing still renders of it.'
              : 'The 3D model stopped loading. You’re seeing still renders of it.'}
          </span>
          {status === 'error' && (
            <button
              type="button"
              className="btn btn--quiet"
              onClick={() => {
                setRenderStatus('pending');
                setAttempt((n) => n + 1);
              }}
            >
              Try 3D again
            </button>
          )}
        </div>
      )}
      <ModelDescription />
    </>
  );
}

/** Text alternative for the canvas, kept in sync with the selected colourway. */
function ModelDescription() {
  const config = useExperience((s) => s.config);
  const color = getColor(config.color);
  return (
    <p className="sr-only" aria-live="polite">
      3D model of the Velocity X knit runner in {color.name}: {color.description}
    </p>
  );
}

/** Still render of the selected colourway, shown only when the 3D view can't run. */
export function StillRender({ className = '' }: { className?: string }) {
  const status = useExperience((s) => s.renderStatus);
  const color = useExperience((s) => getColor(s.config.color));
  if (status !== 'unsupported' && status !== 'error') return null;
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export
    <img
      className={`still ${className}`}
      src={`${base}/renders/${color.id}.webp`}
      width={1200}
      height={760}
      alt={`Velocity X in ${color.name}, side view: ${color.description}`}
    />
  );
}

/** Real download progress of the model, shown in the hero until the first frame. */
export function LoadState() {
  const status = useExperience((s) => s.renderStatus);
  const progress = useExperience((s) => s.loadProgress);
  if (status !== 'pending') return null;
  return (
    <p className="load-state" role="status">
      <span className="load-state__bar" style={{ transform: `scaleX(${progress / 100})` }} aria-hidden="true" />
      Loading the 3D model ({Math.round(progress)}%)
    </p>
  );
}
