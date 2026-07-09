import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants';

let socket = null;

/**
 * Creates (or returns the existing) authenticated socket connection.
 * Call `connectSocket` once after login/app load, and `disconnectSocket`
 * on logout so a stale connection doesn't linger under the wrong user.
 */
export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
