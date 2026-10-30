import { beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCarousel } from '@/components/photo/ProductCarousel';
import { ProductVisual } from '@/components/photo/ProductVisual';
import { CAMPAIGN_SLIDES, PHOTOS } from '@/config/photos';
import { DEFAULT_CONFIG } from '@/config/product';
import { useExperience } from '@/store/useExperience';

beforeEach(() => {
  useExperience.setState({ config: { ...DEFAULT_CONFIG }, systemReducedMotion: false, motionPaused: false });
});

const activeSlide = () => document.querySelector('.carousel__slide[data-active="true"]');

describe('campaign carousel', () => {
  it('renders every slide from real photography, only one visible', () => {
    render(<ProductCarousel />);
    expect(document.querySelectorAll('.carousel__slide')).toHaveLength(CAMPAIGN_SLIDES.length);
    expect(document.querySelectorAll('.carousel__slide[aria-hidden="true"]')).toHaveLength(CAMPAIGN_SLIDES.length - 1);
    const img = screen.getByRole('img', { name: PHOTOS.side.alt });
    expect(img).toHaveAttribute('src', PHOTOS.side.src);
  });

  it('navigates with buttons, dots and arrow keys, wrapping around', async () => {
    render(<ProductCarousel />);
    await userEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(activeSlide()).toHaveAttribute('aria-label', expect.stringMatching(/^2 of/));
    await userEvent.click(screen.getByRole('button', { name: 'Previous slide' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous slide' }));
    expect(activeSlide()).toHaveAttribute('aria-label', expect.stringMatching(new RegExp(`^${CAMPAIGN_SLIDES.length} of`)));
    await userEvent.click(screen.getByRole('button', { name: /Show slide 3/ }));
    expect(screen.getByRole('button', { name: /Show slide 3/ })).toHaveAttribute('aria-current', 'true');
    fireEvent.keyDown(screen.getByRole('region', { name: 'Velocity X campaign' }), { key: 'ArrowRight' });
    expect(activeSlide()).toHaveAttribute('aria-label', expect.stringMatching(/^4 of/));
  });

  it('auto-advances when the progress animation ends, and stops under reduced motion', () => {
    render(<ProductCarousel />);
    const fill = () => document.querySelector('[aria-current="true"] .carousel__dot-fill')!;
    expect(fill()).toHaveAttribute('data-playing', 'true');
    fireEvent.animationEnd(fill());
    expect(activeSlide()).toHaveAttribute('aria-label', expect.stringMatching(/^2 of/));
    act(() => useExperience.setState({ systemReducedMotion: true }));
    expect(fill()).toHaveAttribute('data-playing', 'false');
  });
});

describe('product photo', () => {
  it('re-tints the photo for other colourways and labels it as simulated', () => {
    render(<ProductVisual crop="full" />);
    expect(screen.queryByText(/simulated colourway/)).toBeNull();
    act(() => useExperience.getState().setColor('crimson'));
    expect(screen.getByText('Crimson Red · simulated colourway')).toBeInTheDocument();
    const crop = document.querySelector('.photo-crop') as HTMLElement;
    expect(crop.style.getPropertyValue('--filter')).toContain('hue-rotate');
  });
});
