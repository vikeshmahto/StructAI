// ─── lib/jwt.ts ─────────────────────────────────────────
import jwt from "jsonwebtoken";
import type { JwtPayload } from "../types/auth.types";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error(
    "Missing ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET environment variables."
  );
}

/**
 * Generate a short-lived access token (15 minutes).
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
    issuer: "structai-auth",
    subject: payload.id,
  });
}

/**
 * Generate a long-lived refresh token (7 days).
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
    issuer: "structai-auth",
    subject: payload.id,
  });
}

/**
 * Verify an access token. Returns decoded payload or throws.
 */
export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as jwt.JwtPayload;
  return {
    id: decoded.id as string,
    email: decoded.email as string,
    role: decoded.role as string,
  };
}

/**
 * Verify a refresh token. Returns decoded payload or throws.
 */
export function verifyRefreshToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as jwt.JwtPayload;
  return {
    id: decoded.id as string,
    email: decoded.email as string,
    role: decoded.role as string,
  };
}
