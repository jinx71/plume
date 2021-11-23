import { useEffect, useState } from 'react';
import { getSuggestions } from '../api/users';
import Card from './Card';
import UserCard from './UserCard';
import Spinner from './Spinner';

// The "Who to follow" panel for the right rail. Self-contained: fetches its own
// data with loading and empty states, and drops people from the list once you
// follow them so it always shows fresh suggestions.
const Suggestions = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getSuggestions()
      .then((data) => active && setUsers(data))
      .catch(() => active && setUsers([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const handleFollowed = (followedUser) => {
    // Once followed, remove from suggestions.
    setUsers((prev) => prev.filter((u) => u.id !== followedUser.id));
  };

  return (
    <Card className="p-4">
      <h2 className="mb-1 font-display text-sm font-semibold text-ink">Who to follow</h2>
      {loading ? (
        <div className="flex justify-center py-6 text-indigo">
          <Spinner />
        </div>
      ) : users.length === 0 ? (
        <p className="py-3 text-sm text-muted">You're following everyone here. Quiet little place.</p>
      ) : (
        <div className="divide-y divide-line">
          {users.map((u) => (
            <UserCard key={u.id} user={u} onChange={handleFollowed} />
          ))}
        </div>
      )}
    </Card>
  );
};

export default Suggestions;
