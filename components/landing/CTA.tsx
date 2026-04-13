"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="landing-cta">
      <div className="landing-container">
        <motion.div
          className="landing-cta-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="landing-cta-glow" />

          <motion.div
            className="landing-cta-icon"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Sparkles size={40} />
          </motion.div>

          <h2 className="landing-cta-title">Ready to skip the setup and start building?</h2>

          <p className="landing-cta-subtitle">
            Join developers who eliminate Milestone 1 and focus on what matters — building great
            products.
          </p>

          <motion.div
            className="landing-cta-actions"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/generate" className="landing-button-primary landing-button-large">
              <Sparkles size={20} />
              Start Your First Project
              <ArrowRight size={20} />
            </Link>
          </motion.div>

          <motion.p
            className="landing-cta-note"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            No credit card required • Instant generation • Production-level structure
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
