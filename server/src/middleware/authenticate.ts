// ─── middleware/authenticate.ts ──────────────────────────
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt";
import { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";

/**
 * Express middleware that verifies the Bearer access token
 * from the Authorization header and attaches req.user.
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: {
        code: "TOKEN_INVALID",
        message: "No token provided.",
      },
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: "TOKEN_INVALID",
        message: "No token provided.",
      },
    });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: {
          code: "TOKEN_EXPIRED",
          message: "Token expired.",
        },
      });
      return;
    }

    if (err instanceof JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: {
          code: "TOKEN_INVALID",
          message: "Invalid token.",
        },
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: {
        code: "TOKEN_INVALID",
        message: "Invalid token.",
      },
    });
  }
}
