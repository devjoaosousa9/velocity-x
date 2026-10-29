export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`logo ${className}`}>
      <svg viewBox="0 0 32 20" width="30" height="19" aria-hidden="true">
        <path d="M1 2h7l8 9 8-9h7L19.5 14.5 16 19 12.5 14.5z" fill="currentColor" />
        <path d="M12 14.5L16 19l4-4.5" fill="var(--accent)" />
      </svg>
      <span className="logo__word">VELOCITY&nbsp;X</span>
    </span>
  );
}
