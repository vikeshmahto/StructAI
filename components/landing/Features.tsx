"use client";

import { motion } from "framer-motion";
import { Code2, FileText, Zap, Package, Shield, Layers } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Skip Milestone 1",
    description:
      "Eliminate the entire initial setup phase. Generate complete folder structures in under 30 seconds and jump straight to development.",
  },
  {
    icon: Code2,
    title: "Production-Level Structure",
    description:
      "Get industry-standard folder organization following best practices. Clean architecture ready for scaling and team collaboration.",
  },
  {
    icon: Layers,
    title: "Any Tech Stack",
    description:
      "From React to Django, Next.js to Flask — we support 50+ frameworks. Just describe your requirements and we&apos;ll handle the rest.",
  },
  {
    icon: FileText,
    title: "Start Coding Immediately",
    description:
      "Complete with README, setup scripts, and configuration files. Everything ready so you can integrate your logic from day one.",
  },
  {
    icon: Package,
    title: "Smart Configuration",
    description:
      "Pre-configured dependencies, build scripts, and tooling. No more hunting for the right packages or setup commands.",
  },
  {
    icon: Shield,
    title: "Best Practices Built-In",
    description:
      "Environment variables, security configs, .gitignore, and folder conventions — all following industry standards out of the box.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Features() {
  return (
    <section id="features" className="landing-section">
      <div className="landing-container">
        <motion.div
          className="landing-section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="landing-section-title">
            Everything you need to <span className="landing-gradient-text">ship faster</span>
          </h2>
          <p className="landing-section-subtitle">
            Stop wasting time on setup. Focus on building what matters.
          </p>
        </motion.div>

        <motion.div
          className="landing-features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} className="landing-feature-card" variants={itemVariants}>
              <div className="landing-feature-icon">
                <feature.icon size={24} />
              </div>
              <h3 className="landing-feature-title">{feature.title}</h3>
              <p className="landing-feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
