import cn from '../utils/cn';

// A circular gauge that fills as the plume is typed and shifts indigo -> amber
// -> red as the 280-character limit approaches. The remaining count appears
// inside the ring only in the final stretch, keeping the composer calm until
// it actually matters. This is the composer's signature micro-interaction.
const CharRing = ({ value, max }) => {
  const remaining = max - value;
  const pct = Math.min(value / max, 1);
  const r = 9;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  const near = remaining <= 40;
  const over = remaining < 0;
  const color = over ? '#E5484D' : near ? '#F5A524' : '#4F46E5';

  return (
    <span className="relative inline-grid place-items-center" title={`${remaining} characters left`}>
      <svg width="28" height="28" viewBox="0 0 24 24" className="-rotate-90">
        <circle cx="12" cy="12" r={r} fill="none" stroke="#E9E9F2" strokeWidth="2.5" />
        <circle
          cx="12"
          cy="12"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-150"
        />
      </svg>
      {near && (
        <span
          className={cn(
            'absolute text-[10px] font-semibold tabular-nums',
            over ? 'text-danger' : 'text-amber-500'
          )}
        >
          {remaining}
        </span>
      )}
    </span>
  );
};

export default CharRing;
