import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  if (!ACCESS_TOKEN_SECRET) throw new Error("ACCESS_TOKEN_SECRET is not defined");
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(payload: TokenPayload): string {
  if (!REFRESH_TOKEN_SECRET) throw new Error("REFRESH_TOKEN_SECRET is not defined");
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): TokenPayload {
  if (!ACCESS_TOKEN_SECRET) throw new Error("ACCESS_TOKEN_SECRET is not defined");
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  if (!REFRESH_TOKEN_SECRET) throw new Error("REFRESH_TOKEN_SECRET is not defined");
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
}
