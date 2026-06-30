import cn from '../utils/cn';

// The Plume mark — a single feather. Used as the brand glyph and, faintly,
// as the watermark in empty states. Stroke inherits currentColor so it can be
// tinted indigo on light surfaces or white on the auth screens.
export const FeatherGlyph = ({ size = 24, className = '', strokeWidth = 2 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
    <line x1="16" y1="8" x2="2" y2="22" />
    <line x1="17.5" y1="15" x2="9" y2="15" />
  </svg>
);

// The full wordmark: glyph in an indigo tile + "Plume" set in the display face.
export const Wordmark = ({ className = '', size = 'md' }) => {
  const tile = size === 'sm' ? 'h-8 w-8 rounded-lg' : 'h-10 w-10 rounded-xl';
  const glyph = size === 'sm' ? 18 : 22;
  const text = size === 'sm' ? 'text-xl' : 'text-2xl';
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className={cn('grid place-items-center bg-indigo text-white shadow-lift', tile)}>
        <FeatherGlyph size={glyph} strokeWidth={2.25} />
      </span>
      <span className={cn('font-display font-semibold tracking-tight text-ink', text)}>Plume</span>
    </span>
  );
};

export default FeatherGlyph;
