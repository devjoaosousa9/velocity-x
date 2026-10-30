import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { frameShot } from '@/components/campaign/ScrollTour';
import { DropCta } from '@/components/campaign/DropCta';
import { Marquee } from '@/components/campaign/Marquee';
import { ProductDashboard } from '@/components/campaign/ProductDashboard';
import { TOUR, MARQUEE_ROWS } from '@/config/campaign';
import { DEFAULT_CONFIG } from '@/config/product';
import { useExperience } from '@/store/useExperience';

beforeEach(() => {
  useExperience.setState({ config: { ...DEFAULT_CONFIG }, cart: [], notice: null, cartOpen: false });
});

describe('scroll tour framing', () => {
  it('places each focal point exactly where the shot asks for it', () => {
    for (const shot of TOUR) {
      const W = 1366;
      const H = 748;
      const f = frameShot(shot, W, H);
      expect(f.x + shot.desktop.fx * f.size).toBeCloseTo(shot.desktop.px * W, 6);
      expect(f.y + shot.desktop.fy * f.size).toBeCloseTo(shot.desktop.py * H, 6);
    }
  });

  it('uses the portrait framing on phones', () => {
    const shot = TOUR[1]!;
    const f = frameShot(shot, 370, 824);
    expect(f.x + shot.mobile.fx * f.size).toBeCloseTo(shot.mobile.px * 370, 6);
  });

  it('never zooms past what the 860 px source can hold', () => {
    TOUR.forEach((s) => expect(Math.max(s.desktop.z, s.mobile.z)).toBeLessThanOrEqual(1.8));
  });
});

describe('marquee', () => {
  it('duplicates each row for a seamless loop, hiding the copy from assistive tech', () => {
    render(<Marquee />);
    const lists = document.querySelectorAll('.marquee__list');
    expect(lists).toHaveLength(MARQUEE_ROWS.length * 2);
    expect(document.querySelectorAll('.marquee__list[aria-hidden="true"]')).toHaveLength(MARQUEE_ROWS.length);
  });
});

describe('drop list form', () => {
  it('validates the email and confirms without sending anything', async () => {
    render(<DropCta />);
    await userEvent.click(screen.getByRole('button', { name: 'Join the drop' }));
    expect(screen.getByRole('alert')).toHaveTextContent('valid email');
    await userEvent.type(screen.getByLabelText('Email address'), 'runner@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Join the drop' }));
    expect(screen.getByRole('status')).toHaveTextContent(/on the list/);
    expect(screen.getByRole('status')).toHaveTextContent(/Demo only/);
  });
});

describe('product dashboard', () => {
  it('drives the configuration and adds it to the bag', async () => {
    render(<ProductDashboard />);
    const summary = screen.getByLabelText('Your configuration');
    await userEvent.click(screen.getByRole('radio', { name: 'Electric Blue' }));
    await userEvent.click(screen.getByRole('radio', { name: /Elite/ }));
    expect(within(summary).getByText('Electric Blue')).toBeInTheDocument();
    expect(within(summary).getByText('Elite')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Add to Bag' }));
    expect(useExperience.getState().cart).toHaveLength(0);
    await userEvent.click(screen.getByRole('radio', { name: 'US 9' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add to Bag' }));
    expect(useExperience.getState().cart).toHaveLength(1);

    await userEvent.click(screen.getByRole('button', { name: 'Restore original' }));
    expect(useExperience.getState().config).toEqual(DEFAULT_CONFIG);
  });
});
