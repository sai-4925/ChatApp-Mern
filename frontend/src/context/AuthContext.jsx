import { createContext, useState, useEffect, useCallback } from 'react';
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  getCurrentUserRequest,
} from '../services/authService';
import { setTokens, clearTokens, setRememberMe, getAccessToken } from '../utils/tokenStorage';
import { connectSocket, disconnectSocket } from '../sockets/socket';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, if a token exists, verify it and restore the session.
  useEffect(() => {
    const rehydrate = async () => {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await getCurrentUserRequest();
        setUser(data.user);
        connectSocket(token);
      } catch (error) {
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    rehydrate();
  }, []);

  const login = useCallback(async ({ email, password, rememberMe }) => {
    setRememberMe(!!rememberMe);
    const { data } = await loginRequest({ email, password, rememberMe });
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    setUser(data.user);
    connectSocket(data.accessToken);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await registerRequest(payload);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (error) {
      // Even if the server call fails, clear the local session
    } finally {
      clearTokens();
      disconnectSocket();
      setUser(null);
    }
  }, []);

  const updateLocalUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, updateLocalUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
