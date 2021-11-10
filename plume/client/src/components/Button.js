import cn from '../utils/cn';
import Spinner from './Spinner';

const VARIANTS = {
  primary:
    'bg-indigo text-white shadow-lift hover:bg-indigo-deep active:translate-y-px disabled:bg-indigo/50',
  secondary:
    'bg-white text-ink border border-line hover:border-indigo/40 hover:bg-indigo-soft/40 disabled:opacity-50',
  ghost: 'bg-transparent text-muted hover:bg-indigo-soft hover:text-indigo disabled:opacity-50',
  danger:
    'bg-white text-danger border border-danger/30 hover:bg-danger hover:text-white disabled:opacity-50',
};

const SIZES = {
  sm: 'h-9 px-3.5 text-sm rounded-lg gap-1.5',
  md: 'h-11 px-5 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2',
};

// The one button used across Plume. `loading` swaps the label for a spinner and
// blocks clicks; `fullWidth` stretches it for forms.
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={cn(
      'inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:cursor-not-allowed',
      VARIANTS[variant],
      SIZES[size],
      fullWidth && 'w-full',
      className
    )}
    {...props}
  >
    {loading && <Spinner size={size === 'lg' ? 20 : 16} />}
    {children}
  </button>
);

export default Button;
