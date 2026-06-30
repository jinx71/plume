import { Link } from 'react-router-dom';
import { Wordmark } from '../components/Feather';
import Button from '../components/Button';

const NotFound = () => (
  <div className="grid min-h-screen place-items-center bg-paper px-6">
    <div className="text-center">
      <div className="mb-6 flex justify-center">
        <Wordmark />
      </div>
      <p className="font-display text-5xl font-semibold text-ink">404</p>
      <p className="mt-2 text-muted">This page drifted off somewhere.</p>
      <Link to="/" className="mt-6 inline-block">
        <Button>Back to your feed</Button>
      </Link>
    </div>
  </div>
);

export default NotFound;
