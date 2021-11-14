import { FeatherGlyph } from './Feather';

// Shown when an async view succeeds but has nothing to display. Per the design
// guidance, an empty screen is an invitation to act, not an apology — so it
// leads with the feather mark and a clear next step.
const EmptyState = ({ title, body, action = null, icon = null }) => (
  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
    <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-soft text-indigo">
      {icon || <FeatherGlyph size={26} />}
    </div>
    <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
    {body && <p className="mt-1.5 max-w-xs text-sm text-muted">{body}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
