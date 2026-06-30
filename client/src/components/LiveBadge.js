import { useSocket } from '../context/SocketContext';
import cn from '../utils/cn';

// The realtime heartbeat of the UI. The emerald dot pulses while the socket is
// connected and the label reports how many people are currently on Plume —
// proof, at a glance, that the feed is live and not polled.
const LiveBadge = ({ className = '', compact = false }) => {
  const { connected, presenceCount } = useSocket();

  const label = !connected
    ? 'Connecting…'
    : presenceCount <= 1
    ? "You're the only one here"
    : `${presenceCount} people here now`;

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'h-2.5 w-2.5 rounded-full',
          connected ? 'bg-live animate-live-pulse' : 'bg-muted/40'
        )}
      />
      {!compact && <span className="text-sm text-muted">{label}</span>}
    </span>
  );
};

export default LiveBadge;
