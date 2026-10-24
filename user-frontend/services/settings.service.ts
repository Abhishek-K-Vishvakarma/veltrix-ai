import { apiGet, apiPatch, apiPost, apiPut } from "@/services/api";
import type { AuthUser } from "@/types/auth";

export interface UserPreferences {
  theme: "light" | "dark";
  language: "en";
  analysis_detail: "concise" | "detailed";
  notifications: {
    analysis_completed: boolean;
    analysis_failed: boolean;
    weekly_summary: boolean;
  };
}

export interface PasswordChangePayload {
  current_password: string;
  new_password: string;
}

export function getUserPreferences(): Promise<UserPreferences> {
  return apiGet<UserPreferences>("/auth/preferences");
}

export function saveUserPreferences(
  preferences: UserPreferences,
): Promise<UserPreferences> {
  return apiPut<UserPreferences>("/auth/preferences", preferences);
}

export function saveUserProfile(fullName: string): Promise<AuthUser> {
  return apiPatch<AuthUser>("/auth/profile", { full_name: fullName });
}

export function changePassword(
  payload: PasswordChangePayload,
): Promise<{ message: string }> {
  return apiPost<{ message: string }>("/auth/change-password", payload);
}
