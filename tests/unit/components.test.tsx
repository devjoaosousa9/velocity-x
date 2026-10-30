import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_CONFIG } from '@/config/product';
import { useExperience } from '@/store/useExperience';
import { ColorSwatches, SizeSelector } from '@/components/ui/Options';
import { Buy } from '@/components/sections/Buy';
import { CartDrawer } from '@/components/ui/CartDrawer';
import { Stage } from '@/components/Stage';
import { FallbackSlot } from '@/components/fallback/FallbackSlot';
import { useMotionPreference } from '@/hooks/useMotionPreference';

vi.mock('next/dynamic', () => ({ default: () => () => null }));

beforeEach(() => {
  useExperience.setState({
    config: { ...DEFAULT_CONFIG },
    cart: [],
    notice: null,
    cartOpen: false,
    renderStatus: 'pending',
    systemReducedMotion: false,
    motionPaused: false,
  });
});

describe('colour swatches', () => {
  it('changes the colour on click and reflects it with aria-checked', async () => {
    render(<ColorSwatches />);
    await userEvent.click(screen.getByRole('radio', { name: 'Electric Blue' }));
    expect(useExperience.getState().config.color).toBe('electric');
    expect(screen.getByRole('radio', { name: 'Electric Blue' })).toHaveAttribute('aria-checked', 'true');
  });

  it('supports arrow-key navigation (radiogroup pattern)', async () => {
    render(<ColorSwatches />);
    const first = screen.getByRole('radio', { name: 'Volt Yellow' });
    first.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(useExperience.getState().config.color).toBe('electric');
    expect(screen.getByRole('radio', { name: 'Electric Blue' })).toHaveFocus();
  });
});

describe('size selector', () => {
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

describe('purchase flow', () => {
  it('summarises the configuration and adds it to the demo bag', async () => {
    render(
      <>
        <Buy />
        <CartDrawer />
      </>,
    );
    expect(screen.getByText('Demonstration price')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Add to Bag' }));
    expect(useExperience.getState().cart).toHaveLength(0);
    expect(screen.getAllByRole('status')[0]).toHaveTextContent(/Select a size/);

    await userEvent.click(screen.getAllByRole('radio', { name: 'US 10' })[0]!);
    const summary = screen.getByLabelText('Your configuration');
    expect(within(summary).getByText('US M 10')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Add to Bag' }));
    expect(useExperience.getState().cart).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Checkout unavailable' })).toBeDisabled();
  });
});

describe('WebGL fallback', () => {
  it('switches to the 2D edition when WebGL is unavailable', async () => {
    render(
      <>
        <Stage />
        <FallbackSlot />
      </>,
    );
    expect(await screen.findByText(/Interactive 3D is unavailable/)).toBeInTheDocument();
    expect(useExperience.getState().renderStatus).toBe('unsupported');
    expect(screen.getByRole('img', { name: /Side view of Velocity X/ })).toBeInTheDocument();
  });

  it('offers a retry after a render error', async () => {
    act(() => useExperience.getState().setRenderStatus('error', 'boom'));
    render(<FallbackSlot />);
    expect(screen.getByRole('img', { name: /Side view/ })).toBeInTheDocument();
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
