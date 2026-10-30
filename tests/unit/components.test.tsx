import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_CONFIG } from '@/config/product';
import { useExperience } from '@/store/useExperience';
import { ColourwayPicker, SizeSelector, WidthPicker } from '@/components/ui/Options';
import { Colourways } from '@/components/sections/Colourways';
import { CartDrawer } from '@/components/ui/CartDrawer';
import { Stage, StillRender, LoadState } from '@/components/Stage';
import { useMotionPreference } from '@/hooks/useMotionPreference';

vi.mock('next/dynamic', () => ({ default: () => () => null }));

beforeEach(() => {
  useExperience.setState({
    config: { ...DEFAULT_CONFIG },
    cart: [],
    notice: null,
    cartOpen: false,
    renderStatus: 'pending',
    loadProgress: 0,
    systemReducedMotion: false,
    motionPaused: false,
  });
});

describe('colourway picker', () => {
  it('switches between the three real colourways and reflects it with aria-checked', async () => {
    render(<ColourwayPicker />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    await userEvent.click(screen.getByRole('radio', { name: /Street/ }));
    expect(useExperience.getState().config.color).toBe('street');
    expect(screen.getByRole('radio', { name: /Street/ })).toHaveAttribute('aria-checked', 'true');
  });

  it('supports arrow-key navigation (radiogroup pattern)', async () => {
    render(<ColourwayPicker dots />);
    screen.getByRole('radio', { name: 'Midnight' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(useExperience.getState().config.color).toBe('beach');
    expect(screen.getByRole('radio', { name: 'Beach' })).toHaveFocus();
  });
});

describe('width and size', () => {
  it('marks Wide unavailable in Beach', async () => {
    useExperience.getState().setColor('beach');
    render(<WidthPicker />);
    expect(screen.getByRole('radio', { name: /Wide/ })).toHaveAttribute('aria-disabled', 'true');
  });

  it('marks sold-out sizes and ignores them', async () => {
    render(<SizeSelector />);
    const soldOut = screen.getByRole('radio', { name: 'US 13, sold out' });
    expect(soldOut).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(soldOut);
    expect(useExperience.getState().config.size).toBeNull();
    await userEvent.click(screen.getByRole('radio', { name: 'US 9.5' }));
    expect(useExperience.getState().config.size).toBe('9.5');
  });
});

describe('configurator to bag', () => {
  it('asks for a size, then adds the pair to the demo bag', async () => {
    render(
      <>
        <Colourways />
        <CartDrawer />
      </>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add to bag' }));
    expect(useExperience.getState().cart).toHaveLength(0);
    expect(screen.getAllByRole('status')[0]).toHaveTextContent(/Choose a size/);

    await userEvent.click(screen.getByRole('radio', { name: /Street/ }));
    await userEvent.click(screen.getByRole('radio', { name: 'US 10', exact: true } as never));
    await userEvent.click(screen.getByRole('button', { name: 'Add to bag' }));
    expect(useExperience.getState().cart).toHaveLength(1);
    const bag = screen.getByRole('dialog', { hidden: true });
    expect(within(bag).getByText('Velocity X, Street')).toBeInTheDocument();
    expect(within(bag).getByRole('button', { name: 'Checkout unavailable', hidden: true })).toBeDisabled();
  });

  it('turns the shoe from the toolbar', async () => {
    render(<Colourways />);
    await userEvent.click(screen.getByRole('button', { name: 'Turn right' }));
    expect(useExperience.getState().turntable.yaw).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('button', { name: 'Reset view' }));
    expect(useExperience.getState().turntable.yaw).toBe(0);
  });
});

describe('WebGL fallback and loading', () => {
  it('shows a still render of the selected colourway when WebGL is unavailable', async () => {
    useExperience.getState().setColor('beach');
    render(
      <>
        <Stage />
        <StillRender />
      </>,
    );
    expect(await screen.findByText(/can’t show the 3D model/)).toBeInTheDocument();
    const img = screen.getByRole('img', { name: /Velocity X in Beach/ });
    expect(img.getAttribute('src')).toMatch(/\/renders\/beach\.webp$/);
  });

  it('reports real loading progress until the model is ready', () => {
    act(() => useExperience.getState().setLoadProgress(42));
    const { rerender } = render(<LoadState />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading the 3D model (42%)');
    act(() => useExperience.getState().setRenderStatus('ready'));
    rerender(<LoadState />);
    expect(screen.queryByRole('status')).toBeNull();
  });
});

describe('reduced motion', () => {
  function Probe() {
    const reduced = useMotionPreference();
    return <span>{reduced ? 'reduced' : 'full'}</span>;
  }

  it('follows prefers-reduced-motion', () => {
    const original = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((q: string) => ({
      matches: q.includes('reduce'),
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    render(<Probe />);
    expect(screen.getByText('reduced')).toBeInTheDocument();
    expect(document.documentElement.dataset.motion).toBe('reduced');
    window.matchMedia = original;
  });

  it('can be paused by the user', () => {
    render(<Probe />);
    expect(screen.getByText('full')).toBeInTheDocument();
    act(() => useExperience.getState().toggleMotion());
    expect(screen.getByText('reduced')).toBeInTheDocument();
  });
});
