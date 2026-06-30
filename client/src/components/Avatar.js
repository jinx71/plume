import { useState } from 'react';
import cn from '../utils/cn';

const SIZES = { sm: 'h-9 w-9 text-xs', md: 'h-11 w-11 text-sm', lg: 'h-20 w-20 text-2xl' };

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?';

// User avatar. Defaults to the Gravatar URL on the user record; if that image
// fails to load we fall back to initials on an indigo tint so the UI never
// shows a broken image.
const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const [broken, setBroken] = useState(false);
  const showImg = src && !broken;

  return (
    <span
      className={cn(
        'inline-grid place-items-center shrink-0 rounded-full bg-indigo-soft text-indigo font-semibold overflow-hidden',
        SIZES[size],
        className
      )}
    >
      {showImg ? (
        <img
          src={src}
          alt={name || 'avatar'}
          className="h-full w-full object-cover"
          onError={() => setBroken(true)}
          loading="lazy"
        />
      ) : (
        initials(name)
      )}
    </span>
  );
};

export default Avatar;
