import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { followUser, unfollowUser } from '../api/users';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import Button from './Button';

// A person you can follow — used in suggestions and follower/following lists.
// Toggling follow optimistically updates this row AND patches the signed-in
// user's `following` ids in context, so the Home feed's relevance rule
// immediately accepts that author's live plumes.
const UserCard = ({ user, onChange, showBio = false }) => {
  const { user: me, updateUser } = useAuth();
  const [following, setFollowing] = useState(!!user.isFollowing);
  const [busy, setBusy] = useState(false);

  const isSelf = user.isSelf || (me && me.id === user.id);

  const toggle = async () => {
    if (busy) return;
    const next = !following;
    setBusy(true);
    setFollowing(next);
    try {
      const updated = next ? await followUser(user.id) : await unfollowUser(user.id);
      const currentFollowing = me?.following || [];
      updateUser({
        following: next
          ? [...currentFollowing, user.id]
          : currentFollowing.filter((id) => id !== user.id),
        followingCount: Math.max(0, (me?.followingCount || 0) + (next ? 1 : -1)),
      });
      if (onChange) onChange(updated);
    } catch (err) {
      setFollowing(!next);
      toast.error(errorMessage(err, 'Could not update follow'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3 py-2.5">
      <Link to={`/u/${user.username}`} className="shrink-0">
        <Avatar src={user.avatar} name={user.name} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/u/${user.username}`} className="block truncate text-sm font-semibold text-ink hover:underline">
          {user.name}
        </Link>
        <p className="truncate text-xs text-muted">@{user.username}</p>
        {showBio && user.bio && <p className="mt-0.5 truncate text-xs text-muted/80">{user.bio}</p>}
      </div>
      {!isSelf && (
        <Button
          size="sm"
          variant={following ? 'secondary' : 'primary'}
          onClick={toggle}
          loading={busy}
          className="shrink-0"
        >
          {following ? 'Following' : 'Follow'}
        </Button>
      )}
    </div>
  );
};

export default UserCard;
