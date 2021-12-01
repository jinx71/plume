import { useCallback, useEffect, useState } from 'react';
import { getExplore } from '../api/posts';
import { searchUsers } from '../api/users';
import { useAuth } from '../context/AuthContext';
import usePostFeed from '../hooks/usePostFeed';
import PageHeader from '../components/PageHeader';
import Feed from '../components/Feed';
import LiveBadge from '../components/LiveBadge';
import UserCard from '../components/UserCard';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
    <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// Explore shows every plume on Plume, live. The search box at the top switches
// the view to people results (debounced) so you can find accounts to follow.
const Explore = () => {
  const { user } = useAuth();

  const fetcher = useCallback((page) => getExplore(page), []);
  const feed = usePostFeed({ fetcher, isRelevant: () => true, currentUserId: user?.id });

  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const query = q.trim();

  // Debounced user search.
  useEffect(() => {
    if (!query) {
      setResults([]);
      setSearching(false);
      return undefined;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const found = await searchUsers(query);
        setResults(found);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <>
      <PageHeader title="Explore" right={<LiveBadge compact />} />

      <div className="border-b border-line p-3">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 focus-within:border-indigo focus-within:ring-2 focus-within:ring-indigo/20">
          <span className="text-muted">
            <SearchIcon />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search people"
            aria-label="Search people"
            className="h-10 w-full bg-transparent text-sm text-ink placeholder:text-muted/70 focus:outline-none"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ('')}
              className="text-muted hover:text-ink"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {query ? (
        <div className="px-4">
          {searching ? (
            <div className="flex justify-center py-10 text-indigo">
              <Spinner />
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              title="No people found"
              body={`Nobody matches “${query}”. Try a different name or handle.`}
            />
          ) : (
            <div className="divide-y divide-line py-1">
              {results.map((u) => (
                <UserCard key={u.id} user={u} showBio />
              ))}
            </div>
          )}
        </div>
      ) : (
        <Feed
          feed={feed}
          currentUser={user}
          empty={{
            title: 'No plumes yet',
            body: 'Be the first to post something light into the world.',
          }}
        />
      )}
    </>
  );
};

export default Explore;
