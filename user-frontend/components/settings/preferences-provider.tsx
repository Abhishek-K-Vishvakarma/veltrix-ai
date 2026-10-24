"use client";

import { useEffect } from "react";

import { getStoredAccessToken } from "@/services/api";
import {
  getUserPreferences,
  type UserPreferences,
} from "@/services/settings.service";

function applyTheme(theme: UserPreferences["theme"]) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function PreferencesProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    const loadPreferences = () => {
      if (!getStoredAccessToken()) {
        applyTheme("light");
        return;
      }
      getUserPreferences()
        .then((preferences) => applyTheme(preferences.theme))
        .catch((error: unknown) => {
          console.error("Could not load saved VELTRIX appearance settings.", error);
        });
    };
    loadPreferences();

    const handlePreferencesUpdated = (event: Event) => {
      const preferences = (event as CustomEvent<UserPreferences>).detail;
      if (preferences?.theme) applyTheme(preferences.theme);
    };
    window.addEventListener(
      "veltrix:preferences-updated",
      handlePreferencesUpdated,
    );
    window.addEventListener("veltrix:auth-changed", loadPreferences);
    return () => {
      window.removeEventListener(
        "veltrix:preferences-updated",
        handlePreferencesUpdated,
      );
      window.removeEventListener("veltrix:auth-changed", loadPreferences);
    };
  }, []);

  return children;
}
