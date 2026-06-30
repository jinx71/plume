import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loginRequest, registerRequest, fetchMe } from '../api/auth';
import { setToken, clearToken, getToken } from '../api/client';

const AuthContext = createContext(null);

// Holds the current user and the auth actions. The JWT lives in localStorage
// (simple for a portfolio app) — a comment in the API client notes httpOnly
// cookies are the more secure production choice. On first load we re-hydrate
// the session from the stored token by hitting /auth/me.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const me = await fetchMe();
        if (active) setUser(me);
      } catch {
        clearToken();
      } finally {
        if (active) setLoading(false);
      }
    };
    hydrate();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const { token, user: u } = await loginRequest(credentials);
    setToken(token);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (payload) => {
    const { token, user: u } = await registerRequest(payload);
    setToken(token);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  // Lets other parts of the app (follow actions, profile edits) patch the
  // cached user — e.g. to keep the `following` id list in sync for the feed.
  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = { user, loading, login, register, logout, updateUser, isAuthenticated: !!user };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export default AuthContext;
