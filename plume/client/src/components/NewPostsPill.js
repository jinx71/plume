import cn from '../utils/cn';

// Appears at the top of a feed when new plumes arrive live while you're
// reading. Clicking it flushes the buffered posts in — so the feed stays live
// without ever yanking your scroll position out from under you.
const NewPostsPill = ({ count, onClick, className = '' }) => {
  if (!count) return null;
  return (
    <div className={cn('pointer-events-none sticky top-3 z-20 flex justify-center', className)}>
      <button
        type="button"
        onClick={onClick}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-indigo px-4 py-2 text-sm font-medium text-white shadow-lift animate-pill-in hover:bg-indigo-deep"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {count} new {count === 1 ? 'plume' : 'plumes'}
      </button>
    </div>
  );
};

export default NewPostsPill;
