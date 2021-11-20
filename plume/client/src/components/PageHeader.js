import cn from '../utils/cn';

// Sticky header for the center column. Keeps the current view's title (and any
// contextual control) pinned while the feed scrolls beneath it.
const PageHeader = ({ title, subtitle, left = null, right = null, className = '' }) => (
  <div
    className={cn(
      'sticky top-0 z-20 hidden items-center gap-3 border-b border-line bg-paper/85 px-4 py-3 backdrop-blur md:flex',
      className
    )}
  >
    {left}
    <div className="min-w-0 flex-1">
      <h1 className="truncate font-display text-lg font-semibold text-ink">{title}</h1>
      {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
    </div>
    {right}
  </div>
);

export default PageHeader;
