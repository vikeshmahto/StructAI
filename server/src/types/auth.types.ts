// ─── types/auth.types.ts ────────────────────────────────

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  is_verified: boolean;
  refresh_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

// ─── Extend Express Request ────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
