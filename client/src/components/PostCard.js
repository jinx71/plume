import { useState } from 'react';
import { Link } from 'react-router-dom';
import cn from '../utils/cn';
import { timeAgo } from '../utils/time';
import Avatar from './Avatar';

const Heart = ({ filled }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
    <path
      d="M12 20s-7.5-4.6-10-9.3C.6 7.9 2 4.5 5.2 4.5c2 0 3.3 1.2 4 2.3.7-1.1 2-2.3 4-2.3 3.2 0 4.6 3.4 3.2 6.2C19.5 15.4 12 20 12 20z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const Dots = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
  </svg>
);

// A single plume. Presentational: the like count and liked state come from the
// feed (one source of truth), so realtime count changes and the viewer's own
// optimistic like both flow through props. `onToggleLike` / `onDelete` bubble
// the actions up to the feed.
const PostCard = ({ post, currentUser, onToggleLike, onDelete, isNew = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwn = currentUser && post.author?.id === currentUser.id;

  return (
    <article
      className={cn(
        'flex gap-3 px-4 py-4 transition-colors hover:bg-paper/60',
        isNew && 'animate-slide-down'
      )}
    >
      <Link to={`/u/${post.author?.username}`} className="shrink-0">
        <Avatar src={post.author?.avatar} name={post.author?.name} />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-sm">
          <Link
            to={`/u/${post.author?.username}`}
            className="truncate font-semibold text-ink hover:underline"
          >
            {post.author?.name}
          </Link>
          <span className="truncate text-muted">@{post.author?.username}</span>
          <span className="text-muted/60">·</span>
          <time className="shrink-0 text-muted" dateTime={post.createdAt}>
            {timeAgo(post.createdAt)}
          </time>

          {isOwn && (
            <div className="relative ml-auto">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-indigo-soft hover:text-indigo"
                aria-label="Plume options"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <Dots />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div
                    role="menu"
                    className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lift"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete?.(post);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-danger/5"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Delete plume
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink">
          {post.content}
        </p>

        <div className="mt-2.5 flex items-center">
          <button
            type="button"
            onClick={() => onToggleLike?.(post)}
            className={cn(
              'group inline-flex items-center gap-1.5 rounded-full py-1 pr-2 text-sm transition-colors',
              post.isLiked ? 'text-danger' : 'text-muted hover:text-danger'
            )}
            aria-pressed={post.isLiked}
            aria-label={post.isLiked ? 'Unlike' : 'Like'}
          >
            <span
              key={`${post.id}-${post.isLiked}`}
              className={cn('grid place-items-center', post.isLiked && 'animate-pop')}
            >
              <Heart filled={post.isLiked} />
            </span>
            <span className="tabular-nums">{post.likeCount > 0 ? post.likeCount : ''}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
