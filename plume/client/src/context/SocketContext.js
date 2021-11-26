import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Owns the one Socket.io connection for the app. Opened when the user is
// authenticated, torn down on logout. Exposes the live presence count and a
// stable `subscribe(event, handler)` that feed pages use to react to realtime
// post/like/delete broadcasts.
//
// Note: we create the socket synchronously during render (guarded by a ref)
// rather than in an effect. React runs child effects before parent effects, so
// creating it here guarantees the connection exists before a page's effect
// subscribes to it. On React 17 StrictMode does not double-invoke effects, and
// the ref guard prevents any duplicate connection regardless.
export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [presenceCount, setPresenceCount] = useState(0);
  const [connected, setConnected] = useState(false);

  if (isAuthenticated && !socketRef.current) {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }

  useEffect(() => {
    const socket = socketRef.current;
    if (!isAuthenticated || !socket) return undefined;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onPresence = (count) => setPresenceCount(count);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('presence:count', onPresence);
    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('presence:count', onPresence);
    };
  }, [isAuthenticated]);

  // Close the connection cleanly on logout.
  useEffect(() => {
    if (!isAuthenticated && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
      setPresenceCount(0);
    }
  }, [isAuthenticated]);

  const subscribe = useCallback((event, handler) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, []);

  const value = { socket: socketRef.current, presenceCount, connected, subscribe };
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
};

export default SocketContext;
