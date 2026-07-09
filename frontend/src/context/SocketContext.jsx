import { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { getSocket } from '../sockets/socket';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [socket, setSocket] = useState(getSocket());
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  useEffect(() => {
    // The socket is created by AuthContext on login/rehydration; here we
    // just grab the reference once it exists and wire presence tracking.
    const activeSocket = getSocket();
    setSocket(activeSocket);

    if (!activeSocket) return;

    const handleUserOnline = ({ userId }) => {
      setOnlineUserIds((prev) => new Set(prev).add(userId));
    };

    const handleUserOffline = ({ userId }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    activeSocket.on('user online', handleUserOnline);
    activeSocket.on('user offline', handleUserOffline);

    return () => {
      activeSocket.off('user online', handleUserOnline);
      activeSocket.off('user offline', handleUserOffline);
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, onlineUserIds }}>{children}</SocketContext.Provider>
  );
};
