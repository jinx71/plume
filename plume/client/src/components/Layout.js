import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import cn from '../utils/cn';
import { Wordmark, FeatherGlyph } from './Feather';
import Avatar from './Avatar';
import Card from './Card';
import LiveBadge from './LiveBadge';
import Suggestions from './Suggestions';

const HomeIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} aria-hidden="true">
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);
const ExploreIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7.2" stroke="currentColor" strokeWidth="1.8" />
    <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    {active && <circle cx="11" cy="11" r="3" fill="currentColor" />}
  </svg>
);
const ProfileIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} aria-hidden="true">
    <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.8" />
    <path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const railLink = ({ isActive }) =>
  cn(
    'flex items-center gap-4 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors',
    isActive ? 'bg-indigo-soft text-indigo' : 'text-ink hover:bg-paper'
  );

const RailNav = ({ profilePath }) => (
  <nav className="space-y-1">
    <NavLink to="/" end className={railLink}>
      {({ isActive }) => (
        <>
          <HomeIcon active={isActive} />
          <span className="hidden lg:inline">Home</span>
        </>
      )}
    </NavLink>
    <NavLink to="/explore" className={railLink}>
      {({ isActive }) => (
        <>
          <ExploreIcon active={isActive} />
          <span className="hidden lg:inline">Explore</span>
        </>
      )}
    </NavLink>
    <NavLink to={profilePath} className={railLink}>
      {({ isActive }) => (
        <>
          <ProfileIcon active={isActive} />
          <span className="hidden lg:inline">Profile</span>
        </>
      )}
    </NavLink>
  </nav>
);

const tabLink = ({ isActive }) =>
  cn('grid place-items-center py-2.5 transition-colors', isActive ? 'text-indigo' : 'text-muted');

// The shell every authenticated page renders inside: a left nav rail (icons on
// tablet, icons + labels on desktop), the feed column, a right panel with the
// live presence card and follow suggestions, and a bottom tab bar on mobile.
const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profilePath = user ? `/u/${user.username}` : '/';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-3 backdrop-blur md:hidden">
        <Link to="/" aria-label="Plume home">
          <Wordmark size="sm" />
        </Link>
        <LiveBadge compact />
      </header>

      <div className="mx-auto flex w-full max-w-6xl justify-center">
        {/* Left rail (md+) */}
        <aside className="sticky top-0 hidden h-screen w-[88px] shrink-0 flex-col justify-between px-3 py-5 md:flex lg:w-[250px]">
          <div>
            <Link to="/" className="mb-6 block px-2" aria-label="Plume home">
              <span className="hidden lg:block">
                <Wordmark />
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo text-white shadow-lift lg:hidden">
                <FeatherGlyph size={22} strokeWidth={2.25} />
              </span>
            </Link>
            <RailNav profilePath={profilePath} />
          </div>

          <div className="space-y-2">
            <Link
              to={profilePath}
              className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-paper"
            >
              <Avatar src={user?.avatar} name={user?.name} size="sm" />
              <span className="hidden min-w-0 lg:block">
                <span className="block truncate text-sm font-semibold text-ink">{user?.name}</span>
                <span className="block truncate text-xs text-muted">@{user?.username}</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-paper hover:text-danger"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 12H4m0 0 3.5-3.5M4 12l3.5 3.5M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden lg:inline">Log out</span>
            </button>
          </div>
        </aside>

        {/* Center feed column */}
        <main className="w-full max-w-feed border-line pb-20 md:border-x md:pb-0">
          <Outlet />
        </main>

        {/* Right panel (lg+) */}
        <aside className="sticky top-0 hidden h-screen w-[300px] shrink-0 space-y-4 overflow-y-auto px-4 py-5 lg:block scroll-slim">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-ink">Live on Plume</h2>
            </div>
            <div className="mt-2">
              <LiveBadge />
            </div>
            <p className="mt-2 text-xs text-muted">
              New plumes and likes arrive here the moment they happen — no refresh.
            </p>
          </Card>
          <Suggestions />
          <p className="px-2 text-xs text-muted/70">Plume · a quiet place for short thoughts</p>
        </aside>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-paper/95 backdrop-blur md:hidden">
        <NavLink to="/" end className={tabLink} aria-label="Home">
          {({ isActive }) => <HomeIcon active={isActive} />}
        </NavLink>
        <NavLink to="/explore" className={tabLink} aria-label="Explore">
          {({ isActive }) => <ExploreIcon active={isActive} />}
        </NavLink>
        <NavLink to={profilePath} className={tabLink} aria-label="Profile">
          {({ isActive }) => <ProfileIcon active={isActive} />}
        </NavLink>
        <button type="button" onClick={handleLogout} className="grid place-items-center py-2.5 text-muted" aria-label="Log out">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 12H4m0 0 3.5-3.5M4 12l3.5 3.5M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
