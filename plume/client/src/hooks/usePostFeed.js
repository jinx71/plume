import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';

// The realtime engine behind every feed (Home, Explore, Profile). It owns the
// post list, pagination, and the live wiring to Socket.io:
//
//   • post:new    -> if relevant and not already shown, buffer it so a
//                    "N new plumes" pill can offer it without yanking the
//                    user's scroll position. Their own posts are prepended
//                    optimistically elsewhere and de-duplicated here.
//   • post:like   -> patch the like count in place so numbers tick live.
//   • post:delete -> drop the post from the list and buffer.
//
// `isRelevant(post)` lets Home show only followed authors while Explore shows
// everything — both share this one hook.
const usePostFeed = ({ fetcher, isRelevant = () => true, currentUserId = null }) => {
  const { subscribe } = useSocket();

  const [posts, setPosts] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const pageRef = useRef(1);
  const seenIds = useRef(new Set());
  const isRelevantRef = useRef(isRelevant);
  const currentUserIdRef = useRef(currentUserId);
  isRelevantRef.current = isRelevant;
  currentUserIdRef.current = currentUserId;

  const registerIds = (list) => list.forEach((p) => seenIds.current.add(p.id));

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    seenIds.current = new Set();
    pageRef.current = 1;
    try {
      const data = await fetcher(1);
      registerIds(data.posts);
      setPosts(data.posts);
      setHasMore(!!data.hasMore);
      setPending([]);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = pageRef.current + 1;
      const data = await fetcher(next);
      pageRef.current = next;
      const fresh = data.posts.filter((p) => !seenIds.current.has(p.id));
      registerIds(fresh);
      setPosts((prev) => [...prev, ...fresh]);
      setHasMore(!!data.hasMore);
    } catch {
      // Keep what we have; the page can surface a toast if it wants to.
    } finally {
      setLoadingMore(false);
    }
  }, [fetcher, hasMore, loadingMore]);

  // Prepend the current user's freshly posted plume immediately (optimistic).
  const prependOwn = useCallback((post) => {
    if (seenIds.current.has(post.id)) return;
    seenIds.current.add(post.id);
    setPosts((prev) => [post, ...prev]);
  }, []);

  // Flush buffered live plumes to the top of the feed.
  const showPending = useCallback(() => {
    setPending((buffered) => {
      if (buffered.length) setPosts((prev) => [...buffered, ...prev]);
      return [];
    });
  }, []);

  // Patch a single post (used for optimistic like + realtime count updates).
  const patchPost = useCallback((postId, patch) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...patch } : p)));
    setPending((prev) => prev.map((p) => (p.id === postId ? { ...p, ...patch } : p)));
  }, []);

  const removePost = useCallback((postId) => {
    seenIds.current.delete(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setPending((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  // Realtime subscriptions — attached once; handlers read the latest relevance
  // rule and user id through refs to avoid stale closures.
  useEffect(() => {
    const offNew = subscribe('post:new', (post) => {
      if (!post || seenIds.current.has(post.id)) return;
      if (post.author && post.author.id === currentUserIdRef.current) return;
      if (!isRelevantRef.current(post)) return;
      seenIds.current.add(post.id);
      setPending((prev) => [post, ...prev]);
    });

    const offLike = subscribe('post:like', ({ postId, likeCount }) => {
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likeCount } : p)));
      setPending((prev) => prev.map((p) => (p.id === postId ? { ...p, likeCount } : p)));
    });

    const offDelete = subscribe('post:delete', ({ postId }) => {
      seenIds.current.delete(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setPending((prev) => prev.filter((p) => p.id !== postId));
    });

    return () => {
      offNew();
      offLike();
      offDelete();
    };
  }, [subscribe]);

  return {
    posts,
    pending,
    pendingCount: pending.length,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    showPending,
    prependOwn,
    patchPost,
    removePost,
    reload: loadInitial,
  };
};

export default usePostFeed;
