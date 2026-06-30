import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProfile, updateProfile, followUser, unfollowUser } from '../api/users';
import { getUserPosts } from '../api/posts';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import usePostFeed from '../hooks/usePostFeed';
import PageHeader from '../components/PageHeader';
import Feed from '../components/Feed';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { Input, TextArea } from '../components/Input';
import { fullDate } from '../utils/time';

const BackArrow = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Stat = ({ value, label }) => (
  <span className="text-sm text-muted">
    <span className="font-semibold text-ink">{value}</span> {label}
  </span>
);

// Inline editor for the signed-in user's own name and bio.
const EditPanel = ({ profile, onClose, onSaved }) => {
  const { updateUser } = useAuth();
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile({ name: name.trim(), bio: bio.trim() });
      updateUser({ name: updated.name, bio: updated.bio });
      onSaved(updated);
      toast.success('Profile updated');
      onClose();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save your profile'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-line bg-paper p-4">
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
      <TextArea
        label="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        maxLength={160}
        placeholder="Say a little about yourself"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{bio.length}/160</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={save} loading={saving}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const { username } = useParams();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  // Load (and reload on username change) the profile being viewed.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    setEditing(false);
    getProfile(username)
      .then((p) => {
        if (!active) return;
        setProfile(p);
        setFollowing(!!p.isFollowing);
      })
      .catch(() => active && setNotFound(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [username]);

  const fetcher = useCallback((page) => getUserPosts(username, page), [username]);
  const isRelevant = useCallback((post) => post.author?.username === username, [username]);
  // currentUserId left null so the user's own profile updates live even when
  // they post from another tab/device.
  const feed = usePostFeed({ fetcher, isRelevant, currentUserId: null });

  const isSelf = profile && user && profile.id === user.id;

  const toggleFollow = async () => {
    if (followBusy || !profile) return;
    const next = !following;
    setFollowBusy(true);
    setFollowing(next);
    setProfile((p) => ({ ...p, followerCount: Math.max(0, p.followerCount + (next ? 1 : -1)) }));
    try {
      await (next ? followUser(profile.id) : unfollowUser(profile.id));
      const currentFollowing = user?.following || [];
      updateUser({
        following: next
          ? [...currentFollowing, profile.id]
          : currentFollowing.filter((id) => id !== profile.id),
        followingCount: Math.max(0, (user?.followingCount || 0) + (next ? 1 : -1)),
      });
    } catch (err) {
      setFollowing(!next);
      setProfile((p) => ({ ...p, followerCount: Math.max(0, p.followerCount + (next ? -1 : 1)) }));
      toast.error(errorMessage(err, 'Could not update follow'));
    } finally {
      setFollowBusy(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Profile" left={<BackButton navigate={navigate} />} />
        <div className="flex justify-center py-20 text-indigo">
          <Spinner size={28} />
        </div>
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <PageHeader title="Profile" left={<BackButton navigate={navigate} />} />
        <EmptyState
          title="Account not found"
          body={`There's no one here with the handle @${username}.`}
          action={
            <Link to="/explore">
              <Button size="sm" variant="secondary">
                Back to Explore
              </Button>
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={profile.name}
        subtitle={`@${profile.username}`}
        left={<BackButton navigate={navigate} />}
      />

      {/* Banner + identity */}
      <div className="h-28 bg-gradient-to-br from-indigo to-indigo-deep" />
      <div className="px-4 pb-4">
        <div className="-mt-10 flex items-end justify-between">
          <span className="rounded-full border-4 border-white bg-white">
            <Avatar src={profile.avatar} name={profile.name} size="lg" />
          </span>
          {isSelf ? (
            <Button variant="secondary" size="sm" onClick={() => setEditing((e) => !e)}>
              {editing ? 'Close' : 'Edit profile'}
            </Button>
          ) : (
            <Button
              size="sm"
              variant={following ? 'secondary' : 'primary'}
              onClick={toggleFollow}
              loading={followBusy}
            >
              {following ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>

        <div className="mt-3">
          <h2 className="font-display text-xl font-semibold text-ink">{profile.name}</h2>
          <p className="text-sm text-muted">@{profile.username}</p>
        </div>

        {profile.bio && <p className="mt-3 text-[15px] leading-relaxed text-ink">{profile.bio}</p>}

        <p className="mt-3 text-sm text-muted">Joined {fullDate(profile.createdAt)}</p>

        <div className="mt-3 flex gap-5">
          <Stat value={profile.followingCount} label="Following" />
          <Stat value={profile.followerCount} label={profile.followerCount === 1 ? 'Follower' : 'Followers'} />
        </div>

        {isSelf && editing && (
          <EditPanel
            profile={profile}
            onClose={() => setEditing(false)}
            onSaved={(updated) => setProfile((p) => ({ ...p, name: updated.name, bio: updated.bio }))}
          />
        )}
      </div>

      <div className="border-t border-line">
        <div className="px-4 py-3">
          <h3 className="font-display text-sm font-semibold text-ink">Plumes</h3>
        </div>
        <Feed
          feed={feed}
          currentUser={user}
          empty={{
            title: isSelf ? 'You haven’t posted yet' : 'No plumes yet',
            body: isSelf
              ? 'Your plumes will show up here. Head home to write your first.'
              : `@${profile.username} hasn’t posted anything yet.`,
            action: isSelf ? (
              <Link to="/">
                <Button size="sm">Write a plume</Button>
              </Link>
            ) : null,
          }}
        />
      </div>
    </>
  );
};

// Back control reused in the profile header.
const BackButton = ({ navigate }) => (
  <button
    type="button"
    onClick={() => navigate(-1)}
    className="grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-indigo-soft hover:text-indigo"
    aria-label="Go back"
  >
    <BackArrow />
  </button>
);

export default Profile;
