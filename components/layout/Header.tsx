"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="header-brand">
          <span className="header-logo">✦</span>
          <h1 className="header-title">
            Struct<span className="header-title-accent">AI</span>
          </h1>
        </Link>

        {/* Navigation (only show on landing page) */}
        {isLandingPage && (
          <nav className="header-nav">
            <Link href="#features" className="nav-link">
              Features
            </Link>
            <Link href="#how-it-works" className="nav-link">
              How It Works
            </Link>
            <Link href="/generate" className="nav-link">
              Generator
            </Link>
          </nav>
        )}

        <div className="header-actions">
          <AnimatePresence mode="wait">
            {!isAuthenticated ? (
              <motion.div
                key="guest"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="header-auth-group"
              >
                <Link href="/login" className="nav-link">
                  Sign In
                </Link>
                <Link href={isLandingPage ? "/generate" : "/signup"} className="nav-button">
                  {isLandingPage ? "Get Started" : "Sign Up"}
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="user"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="header-user-group"
              >
                <div className="user-profile">
                  <div className="user-avatar">{user?.name[0].toUpperCase()}</div>
                  <span className="user-name">{user?.name}</span>
                </div>
                <button onClick={logout} className="logout-button">
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
