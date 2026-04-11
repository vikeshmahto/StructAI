// ─── validators/auth.validator.ts ────────────────────────
import { z } from "zod";

/**
 * Signup schema:
 * - name: min 2 characters
 * - email: valid email format
 * - password: min 8, must contain uppercase + number + special char
 */
export const signupSchema = z.object({
  name: z
    .string({ required_error: "Name is required." })
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be at most 100 characters.")
    .trim(),
  email: z
    .string({ required_error: "Email is required." })
    .email("Please provide a valid email address.")
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: "Password is required." })
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be at most 128 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character."
    ),
});

/**
 * Login schema:
 * - email: valid email
 * - password: non-empty string
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email("Please provide a valid email address.")
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: "Password is required." })
    .min(1, "Password is required."),
});

/**
 * Refresh token schema
 */
export const refreshSchema = z.object({
  refreshToken: z
    .string({ required_error: "Refresh token is required." })
    .min(1, "Refresh token is required."),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
