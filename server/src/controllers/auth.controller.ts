// ─── controllers/auth.controller.ts ─────────────────────
import { Request, Response } from "express";
import supabase from "../lib/supabase";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { hashPassword, comparePassword } from "../lib/hash";
import { signupSchema, loginSchema, refreshSchema } from "../validators/auth.validator";
import type { DbUser, SafeUser, JwtPayload } from "../types/auth.types";
import { ZodError } from "zod";
import { TokenExpiredError } from "jsonwebtoken";

// ─── Safe fields to SELECT (never password_hash) ────────
const SAFE_USER_FIELDS = "id, name, email, role, is_verified, created_at, updated_at";

/**
 * Strips a DbUser down to safe fields only.
 */
function toSafeUser(user: DbUser): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_verified: user.is_verified,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

/**
 * Format Zod validation errors into our error shape.
 */
function formatZodError(err: ZodError): { fields: Record<string, string[]> } {
  const fields: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!fields[key]) fields[key] = [];
    fields[key].push(issue.message);
  }
  return { fields };
}

// ═══════════════════════════════════════════════════════════
// POST /api/auth/signup
// ═══════════════════════════════════════════════════════════
export async function signup(req: Request, res: Response): Promise<void> {
  try {
    // 1. Validate input
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed.",
          ...formatZodError(parsed.error),
        },
      });
      return;
    }

    const { name, email, password } = parsed.data;

    // 2. Check if email already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          code: "EMAIL_ALREADY_EXISTS",
          message: "This email is already registered.",
        },
      });
      return;
    }

    // 3. Hash password
    const password_hash = await hashPassword(password);

    // 4. Generate tokens
    const tokenPayload: JwtPayload = {
      id: "", // will be set after insert
      email,
      role: "user",
    };

    // 5. Insert user (get the ID first)
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        name,
        email,
        password_hash,
        role: "user",
        is_verified: false,
      })
      .select(SAFE_USER_FIELDS)
      .single();

    if (insertError || !newUser) {
      console.error("Supabase insert error:", insertError);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create user. Please try again.",
        },
      });
      return;
    }

    // 6. Generate tokens with actual user ID
    tokenPayload.id = newUser.id;
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // 7. Hash refresh token and store in DB
    const refreshTokenHash = await hashPassword(refreshToken);
    await supabase
      .from("users")
      .update({ refresh_token: refreshTokenHash })
      .eq("id", newUser.id);

    // 8. Return response
    res.status(201).json({
      success: true,
      data: {
        user: newUser as SafeUser,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
      },
    });
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/auth/login
// ═══════════════════════════════════════════════════════════
export async function login(req: Request, res: Response): Promise<void> {
  try {
    // 1. Validate input
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed.",
          ...formatZodError(parsed.error),
        },
      });
      return;
    }

    const { email, password } = parsed.data;

    // 2. Fetch user by email (need password_hash for comparison)
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("id, name, email, password_hash, role, is_verified, created_at, updated_at")
      .eq("email", email)
      .single();

    if (fetchError || !user) {
      res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        },
      });
      return;
    }

    // 3. Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        },
      });
      return;
    }

    // 4. Invalidate old refresh token + generate new tokens
    const tokenPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // 5. Hash refresh token and store in DB
    const refreshTokenHash = await hashPassword(refreshToken);
    await supabase
      .from("users")
      .update({ refresh_token: refreshTokenHash })
      .eq("id", user.id);

    // 6. Return response (strip password_hash)
    const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    res.status(200).json({
      success: true,
      data: {
        user: safeUser,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
      },
    });
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/auth/refresh
// ═══════════════════════════════════════════════════════════
export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    // 1. Validate input
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed.",
          ...formatZodError(parsed.error),
        },
      });
      return;
    }

    const { refreshToken: oldRefreshToken } = parsed.data;

    // 2. Verify refresh token signature
    let payload: JwtPayload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        res.status(401).json({
          success: false,
          error: {
            code: "TOKEN_EXPIRED",
            message: "Refresh token has expired. Please log in again.",
          },
        });
        return;
      }
      res.status(401).json({
        success: false,
        error: {
          code: "TOKEN_INVALID",
          message: "Invalid refresh token.",
        },
      });
      return;
    }

    // 3. Fetch user from Supabase
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("id, email, role, refresh_token")
      .eq("id", payload.id)
      .single();

    if (fetchError || !user) {
      res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found.",
        },
      });
      return;
    }

    // 4. Compare stored refresh token hash with provided token
    if (!user.refresh_token) {
      res.status(401).json({
        success: false,
        error: {
          code: "TOKEN_INVALID",
          message: "No active session. Please log in again.",
        },
      });
      return;
    }

    const isRefreshTokenValid = await comparePassword(
      oldRefreshToken,
      user.refresh_token
    );

    if (!isRefreshTokenValid) {
      // Possible token theft — invalidate all sessions
      await supabase
        .from("users")
        .update({ refresh_token: null })
        .eq("id", user.id);

      res.status(401).json({
        success: false,
        error: {
          code: "TOKEN_INVALID",
          message: "Invalid refresh token. All sessions have been revoked.",
        },
      });
      return;
    }

    // 5. Issue new tokens (rotation)
    const newTokenPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(newTokenPayload);
    const newRefreshToken = generateRefreshToken(newTokenPayload);

    // 6. Hash new refresh token and store
    const newRefreshTokenHash = await hashPassword(newRefreshToken);
    await supabase
      .from("users")
      .update({ refresh_token: newRefreshTokenHash })
      .eq("id", user.id);

    // 7. Return new tokens
    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
      },
    });
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/auth/logout
// ═══════════════════════════════════════════════════════════
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "TOKEN_INVALID",
          message: "Not authenticated.",
        },
      });
      return;
    }

    // Nullify refresh token in DB
    const { error } = await supabase
      .from("users")
      .update({ refresh_token: null })
      .eq("id", userId);

    if (error) {
      console.error("Logout DB error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to logout. Please try again.",
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        message: "Logged out successfully.",
      },
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
      },
    });
  }
}

// ═══════════════════════════════════════════════════════════
// GET /api/auth/me
// ═══════════════════════════════════════════════════════════
export async function me(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "TOKEN_INVALID",
          message: "Not authenticated.",
        },
      });
      return;
    }

    // Fetch full user (safe fields only)
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select(SAFE_USER_FIELDS)
      .eq("id", userId)
      .single();

    if (fetchError || !user) {
      res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found.",
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: user as SafeUser,
      },
    });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
      },
    });
  }
}
