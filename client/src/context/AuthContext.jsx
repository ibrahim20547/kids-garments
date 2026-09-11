import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);

  const loadUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      loadAddresses();
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const data = await api.getAddresses();
      setAddresses(data.addresses || []);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setAuthToken(data.token);
    setUser(data.user);
    await loadAddresses();
    return data;
  };

  const register = async (fullName, email, password, phone) => {
    const data = await api.register(fullName, email, password, phone);
    setAuthToken(data.token);
    setUser(data.user);
    await loadAddresses();
    return data;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setAddresses([]);
  };

  const updateProfile = async (fullName, phone) => {
    const data = await api.updateProfile(fullName, phone);
    setUser(data.user);
    return data;
  };

  const addAddress = async (addressData) => {
    await api.createAddress(addressData);
    await loadAddresses();
  };

  const updateAddress = async (id, addressData) => {
    await api.updateAddress(id, addressData);
    await loadAddresses();
  };

  const deleteAddress = async (id) => {
    await api.deleteAddress(id);
    await loadAddresses();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        addresses,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        loadAddresses,
        addAddress,
        updateAddress,
        deleteAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
