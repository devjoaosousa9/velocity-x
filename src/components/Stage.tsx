'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useState, type ReactNode } from 'react';
import { getColor, getMaterial, getVariant } from '@/config/product';
import { useExperience, type QualityTier } from '@/store/useExperience';
import { probeWebGL } from '@/lib/webgl';
import { detectInitialTier, parseQualityOverride } from '@/lib/quality';

// The entire three.js / R3F graph is split into its own chunk and never rendered on the server.
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
 * Fixed full-viewport 3D stage that sits behind the document. All page content is
 * plain, server-rendered HTML above it, so the site stays readable and indexable
 * whether or not WebGL starts.
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
        {cap && status !== 'unsupported' && status !== 'error' && (
          <SceneBoundary key={attempt} onError={(e) => setRenderStatus('error', e.message)}>
            <Scene cap={cap} />
          </SceneBoundary>
        )}
      </div>
      <StageLoader visible={status === 'pending'} />
      <ModelDescription />
      {failed && (
        <div className="stage-notice" role="status">
          <span>
            {status === 'unsupported'
              ? 'Interactive 3D is unavailable on this device — showing the 2D edition.'
              : '3D view stopped unexpectedly — showing the 2D edition.'}
          </span>
          {status === 'error' && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setRenderStatus('pending');
                setAttempt((n) => n + 1);
              }}
            >
              Retry 3D
            </button>
          )}
        </div>
      )}
    </>
  );
}

function StageLoader({ visible }: { visible: boolean }) {
  return (
    <div className="stage-loader" data-visible={visible} aria-hidden={!visible}>
      <span className="stage-loader__bar" />
      <span className="stage-loader__label">Initialising render engine</span>
    </div>
  );
}

/** Text alternative for the canvas, kept in sync with the configuration. */
function ModelDescription() {
  const config = useExperience((s) => s.config);
  return (
    <p className="sr-only" aria-live="polite">
      3D model: Velocity X {getVariant(config.variant).name} in {getColor(config.color).name}, {getMaterial(config.material).name}
      {config.size ? `, US size ${config.size}` : ''}.
    </p>
  );
}
