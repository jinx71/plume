import { useState } from 'react';
import { toast } from 'react-toastify';
import { createPost } from '../api/posts';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import Button from './Button';
import CharRing from './CharRing';

export const MAX_LENGTH = 280;

// The composer. Submits through the REST API; on success the page prepends the
// returned plume optimistically (via onPosted) and the server broadcasts it to
// everyone else's feed over Socket.io. The post button stays disabled while the
// field is empty or over the limit.
const Composer = ({ onPosted }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const trimmed = content.trim();
  const over = content.length > MAX_LENGTH;
  const canPost = trimmed.length > 0 && !over && !submitting;

  const submit = async () => {
    if (!canPost) return;
    setSubmitting(true);
    try {
      const post = await createPost(trimmed);
      setContent('');
      if (onPosted) onPosted(post);
      toast.success('Plume posted');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not post your plume'));
    } finally {
      setSubmitting(false);
    }
  };

  // Cmd/Ctrl + Enter to post — a small power-user nicety.
  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
  };

  return (
    <div className="flex gap-3 p-4">
      <Avatar src={user?.avatar} name={user?.name} />
      <div className="flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          placeholder="Share a light thought…"
          className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-ink placeholder:text-muted/70 focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between border-t border-line pt-3">
          <span className="text-xs text-muted">
            {trimmed.length > 0 ? `${content.length}/${MAX_LENGTH}` : 'Up to 280 characters'}
          </span>
          <div className="flex items-center gap-3">
            <CharRing value={content.length} max={MAX_LENGTH} />
            <Button size="sm" onClick={submit} loading={submitting} disabled={!canPost}>
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Composer;
