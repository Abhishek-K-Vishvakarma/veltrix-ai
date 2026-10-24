export interface AuthUser {
  id: string | number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at?: string;
  last_login_at?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: AuthUser;
}

// Fixed: Using type alias instead of an empty interface
export type MeResponse = AuthUser;

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}