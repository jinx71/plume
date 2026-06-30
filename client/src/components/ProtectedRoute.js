import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';
import { Wordmark } from './Feather';

// Guards the app routes. While the session is being restored from the stored
// token we show a centered brand splash rather than flashing the login screen;
// once resolved, unauthenticated visitors are sent to /login.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper">
        <div className="flex flex-col items-center gap-4">
          <Wordmark />
          <span className="text-indigo">
            <Spinner />
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
