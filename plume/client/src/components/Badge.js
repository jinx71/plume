import cn from '../utils/cn';

const TONES = {
  neutral: 'bg-indigo-soft/60 text-muted',
  indigo: 'bg-indigo-soft text-indigo',
  live: 'bg-live/10 text-live',
};

// Small status pill. Used for follow state and the realtime "live" marker.
const Badge = ({ children, tone = 'neutral', className = '' }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
      TONES[tone],
      className
    )}
  >
    {children}
  </span>
);

export default Badge;
