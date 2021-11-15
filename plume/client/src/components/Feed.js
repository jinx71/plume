import { toast } from 'react-toastify';
import { toggleLike, deletePost } from '../api/posts';
import { errorMessage } from '../api/client';
import PostCard from './PostCard';
import NewPostsPill from './NewPostsPill';
import EmptyState from './EmptyState';
import Button from './Button';

const Skeleton = () => (
  <div className="flex gap-3 px-4 py-4">
    <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-line" />
    <div className="flex-1 space-y-2.5 py-1">
      <div className="h-3 w-1/3 animate-pulse rounded bg-line" />
      <div className="h-3 w-5/6 animate-pulse rounded bg-line" />
      <div className="h-3 w-2/3 animate-pulse rounded bg-line" />
    </div>
  </div>
);

const Divider = () => <div className="h-px bg-line" />;

// Renders a feed from a usePostFeed instance and owns the write actions so
// every feed behaves identically. Likes update optimistically and reconcile
// with the server; deletes remove immediately and the server broadcast clears
// the post from every other open feed in realtime.
const Feed = ({ feed, currentUser, empty }) => {
  const { posts, loading, loadingMore, error, hasMore } = feed;

  const handleToggleLike = async (post) => {
    const optimistic = {
      isLiked: !post.isLiked,
      likeCount: post.likeCount + (post.isLiked ? -1 : 1),
    };
    feed.patchPost(post.id, optimistic);
    try {
      const data = await toggleLike(post.id);
      feed.patchPost(post.id, { isLiked: data.isLiked, likeCount: data.likeCount });
    } catch (err) {
      feed.patchPost(post.id, { isLiked: post.isLiked, likeCount: post.likeCount });
      toast.error(errorMessage(err, 'Could not update your like'));
    }
  };

  const handleDelete = async (post) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Delete this plume? This cannot be undone.')) return;
    feed.removePost(post.id);
    try {
      await deletePost(post.id);
      toast.success('Plume deleted');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete the plume'));
      feed.reload();
    }
  };

  if (loading) {
    return (
      <div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <Skeleton />
            {i < 3 && <Divider />}
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="That didn't load"
        body="Something went wrong reaching the feed. Check your connection and try again."
        action={
          <Button variant="secondary" size="sm" onClick={feed.reload}>
            Try again
          </Button>
        }
      />
    );
  }

  if (posts.length === 0) {
    return <EmptyState title={empty.title} body={empty.body} action={empty.action} />;
  }

  return (
    <div>
      <NewPostsPill count={feed.pendingCount} onClick={feed.showPending} />
      {posts.map((post, i) => (
        <div key={post.id}>
          <PostCard
            post={post}
            currentUser={currentUser}
            onToggleLike={handleToggleLike}
            onDelete={handleDelete}
          />
          {i < posts.length - 1 && <Divider />}
        </div>
      ))}

      {hasMore && (
        <div className="flex justify-center p-5">
          <Button variant="secondary" size="sm" onClick={feed.loadMore} loading={loadingMore}>
            {loadingMore ? 'Loading' : 'Load more'}
          </Button>
        </div>
      )}

      {!hasMore && posts.length > 6 && (
        <p className="flex items-center justify-center p-6 text-sm text-muted">
          You've reached the end — the rest is yet to be written.
        </p>
      )}
    </div>
  );
};

export default Feed;
