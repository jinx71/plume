import cn from '../utils/cn';

// Indeterminate loading spinner. Inherits color via currentColor so it reads
// indigo on light surfaces and white inside buttons.
const Spinner = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn('animate-spin', className)}
    role="status"
    aria-label="Loading"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
    <path
      d="M22 12a10 10 0 0 1-10 10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export default Spinner;
