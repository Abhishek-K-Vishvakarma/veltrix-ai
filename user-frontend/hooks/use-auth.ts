"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  authStore,
  useAuthStore,
} from "@/store/auth-store";

export function useAuth() {
  const auth = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    void authStore.initializeAuth();
  }, []);

  const refreshUser = useCallback(async () => {
    return authStore.initializeAuth();
  }, []);

  const setUser = useCallback(
    (user: Parameters<typeof authStore.setUser>[0]) => {
      authStore.setUser(user);
    },
    [],
  );

  const logout = useCallback(() => {
    authStore.clearUser();
  }, []);

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,

    refreshUser,
    setUser,
    logout,
  };
}