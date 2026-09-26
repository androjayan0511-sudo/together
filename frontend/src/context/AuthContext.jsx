import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { socket } from '../services/socket.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [couple, setCouple] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('tm_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const initAuth = useCallback(async (authToken) => {
    if (!authToken) {
      setUser(null);
      setCouple(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getMe();
      if (res?.data?.user) {
        setUser(res.data.user);
        setCouple(res.data.couple);
        socket.connect(authToken);
      } else {
        throw new Error('User not found');
      }
    } catch (err) {
      console.error('[Auth Init Error]:', err);
      localStorage.removeItem('tm_token');
      setToken(null);
      setUser(null);
      setCouple(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth(token);
  }, [initAuth, token]);

  const login = async (credentials) => {
    setError(null);
    const res = await api.login(credentials);
    const newToken = res.data.token;
    localStorage.setItem('tm_token', newToken);
    setToken(newToken);
    setUser(res.data.user);
    setCouple(res.data.couple);
    socket.connect(newToken);
    return res.data;
  };

  const register = async (userData) => {
    setError(null);
    const res = await api.register(userData);
    const newToken = res.data.token;
    localStorage.setItem('tm_token', newToken);
    setToken(newToken);
    setUser(res.data.user);
    setCouple(res.data.couple);
    socket.connect(newToken);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('tm_token');
    socket.disconnect();
    setToken(null);
    setUser(null);
    setCouple(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.getMe();
      if (res?.data?.user) {
        setUser(res.data.user);
        setCouple(res.data.couple);
      }
    } catch (err) {
      console.error('[Refresh User Error]:', err);
    }
  };

  const createCouple = async (data) => {
    const res = await api.createCouple(data);
    await refreshUser();
    return res.data;
  };

  const joinCouple = async (pairingCode) => {
    const res = await api.joinCouple({ pairingCode });
    await refreshUser();
    return res.data;
  };

  const leaveCouple = async () => {
    await api.leaveCouple();
    await refreshUser();
  };

  // Derive partner
  let partner = null;
  if (couple && user) {
    if (couple.user_one_id === user.id) {
      partner = couple.user_two;
    } else {
      partner = couple.user_one;
    }
  }

  const isConnected = !!(couple && couple.user_one_id && couple.user_two_id);

  return (
    <AuthContext.Provider
      value={{
        user,
        couple,
        partner,
        token,
        isConnected,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshUser,
        createCouple,
        joinCouple,
        leaveCouple,
        setUser,
        setCouple
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
