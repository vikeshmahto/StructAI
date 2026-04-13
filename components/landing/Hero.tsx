"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="landing-hero">
      <div className="landing-container">
        <motion.div
          className="landing-hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div
            className="landing-badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="landing-badge-icon" size={14} />
            <span>Production-Level Project Scaffolding</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="landing-hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Generate production-level
            <br />
            <span className="landing-gradient-text">folder structure instantly</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="landing-hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Give us your project requirements — we&apos;ll generate a complete, production-ready
            folder structure that eliminates initial setup hassles. Skip Milestone 1 entirely and
            start integrating your logic and ideas from day one.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="landing-hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/generate" className="landing-button-primary">
              <Zap size={18} />
              Start Building Now
              <ArrowRight size={18} />
            </Link>
            <Link href="#features" className="landing-button-secondary">
              See How It Works
            </Link>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            className="landing-hero-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="landing-stat">
              <div className="landing-stat-value">Zero</div>
              <div className="landing-stat-label">Setup Time</div>
            </div>
            <div className="landing-stat-divider" />
            <div className="landing-stat">
              <div className="landing-stat-value">&lt;30s</div>
              <div className="landing-stat-label">Generation Time</div>
            </div>
            <div className="landing-stat-divider" />
            <div className="landing-stat">
              <div className="landing-stat-value">100%</div>
              <div className="landing-stat-label">Production Ready</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          className="landing-hero-visual"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="landing-code-window">
            <div className="landing-code-header">
              <div className="landing-code-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <div className="landing-code-title">project-structure.txt</div>
            </div>
            <div className="landing-code-content">
              <pre>
                {`📦 my-awesome-app/
├── 📂 src/
│   ├── 📂 components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── 📂 pages/
│   │   ├── index.tsx
│   │   └── api/
│   ├── 📂 lib/
│   │   └── utils.ts
│   └── 📂 styles/
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 README.md
├── 📄 .env.example
└── 📄 .gitignore`}
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
