"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="header-brand">
          <span className="header-logo">✦</span>
          <h1 className="header-title">
            Struct<span className="header-title-accent">AI</span>
          </h1>
        </Link>
        
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
                <Link href="/login" className="nav-link">Sign In</Link>
                <Link href="/signup" className="nav-button">Get Started</Link>
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
                <button onClick={logout} className="logout-button">Logout</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
