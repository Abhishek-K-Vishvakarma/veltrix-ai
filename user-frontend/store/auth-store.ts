"use client";

import { useSyncExternalStore } from "react";

import type { AuthState, AuthUser } from "@/types/auth";
import {
  getMe,
  isAuthenticated,
  logout as logoutService,
} from "@/services/auth.service";

/* =========================================================
   VELTRIX AI — AUTH STORE
   ========================================================= */

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

let state: AuthState = initialState;

const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function setState(nextState: Partial<AuthState>): void {
  state = {
    ...state,
    ...nextState,
  };

  emit();
}

/* =========================================================
   STORE SUBSCRIPTION
   ========================================================= */

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AuthState {
  return state;
}

/*
 * Server snapshot must remain stable.
 */
function getServerSnapshot(): AuthState {
  return initialState;
}

/* =========================================================
   AUTH ACTIONS
   ========================================================= */

async function initializeAuth(): Promise<AuthUser | null> {
  if (!isAuthenticated()) {
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    return null;
  }

  setState({
    isLoading: true,
  });

  try {
    const user = await getMe();

    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });

    return user;
  } catch {
    logoutService();

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    return null;
  }
}

function setUser(user: AuthUser): void {
  setState({
    user,
    isAuthenticated: true,
    isLoading: false,
  });
}

function clearUser(): void {
  logoutService();

  setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
}

/* =========================================================
   REACT HOOK
   ========================================================= */

export function useAuthStore(): AuthState {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
}

/* =========================================================
   STORE API
   ========================================================= */

export const authStore = {
  initializeAuth,
  setUser,
  clearUser,
  getState: getSnapshot,
};