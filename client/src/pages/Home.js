import { useCallback, useMemo } from 'react';
import { getFeed } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import usePostFeed from '../hooks/usePostFeed';
import PageHeader from '../components/PageHeader';
import Composer from '../components/Composer';
import Feed from '../components/Feed';
import LiveBadge from '../components/LiveBadge';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

// The home timeline: the signed-in user's own plumes plus everyone they follow.
// New plumes from followed people stream in live (buffered behind the pill);
// the user's own posts are prepended instantly via the composer.
const Home = () => {
  const { user } = useAuth();

  const fetcher = useCallback((page) => getFeed(page), []);

  // A plume belongs in this feed if it's the user's own or by someone they
  // follow. Recomputed when the following list changes (e.g. after a follow).
  const followingSet = useMemo(() => new Set(user?.following || []), [user?.following]);
  const isRelevant = useCallback(
    (post) => post.author?.id === user?.id || followingSet.has(post.author?.id),
    [followingSet, user?.id]
  );

  const feed = usePostFeed({ fetcher, isRelevant, currentUserId: user?.id });

  const emptyFollowing = (user?.followingCount || 0) === 0;

  return (
    <>
      <PageHeader title="Home" right={<LiveBadge compact />} />

      <div className="border-b border-line">
        <Composer onPosted={feed.prependOwn} />
      </div>

      <Feed
        feed={feed}
        currentUser={user}
        empty={{
          title: emptyFollowing ? 'Your feed is waiting' : 'Nothing here yet',
          body: emptyFollowing
            ? 'Follow a few people to fill your timeline — or post the first plume yourself.'
            : 'The people you follow haven’t posted yet. Post something to get things moving.',
          action: emptyFollowing ? (
            <Link to="/explore">
              <Button size="sm">Find people to follow</Button>
            </Link>
          ) : null,
        }}
      />
    </>
  );
};

export default Home;
