// ─── routes/auth.routes.ts ──────────────────────────────
import { Router } from "express";
import { signup, login, refresh, logout, me } from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";
import rateLimit from "express-rate-limit";

// Rate limiter: 10 requests per 15 minutes per IP for auth routes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please try again in 15 minutes.",
    },
  },
});

const router = Router();

// Apply rate limiter to all auth routes
router.use(authRateLimiter);

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refresh);

// Protected routes (require valid access token)
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);

export default router;
