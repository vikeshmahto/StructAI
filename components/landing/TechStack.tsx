"use client";

import { motion } from "framer-motion";

const techStacks = [
  { name: "React", icon: "⚛️" },
  { name: "Next.js", icon: "▲" },
  { name: "Vue", icon: "🟢" },
  { name: "Angular", icon: "🅰️" },
  { name: "Node.js", icon: "🟩" },
  { name: "Python", icon: "🐍" },
  { name: "Django", icon: "🎸" },
  { name: "Flask", icon: "🌶️" },
  { name: "Express", icon: "🚂" },
  { name: "NestJS", icon: "🐈" },
  { name: "TypeScript", icon: "📘" },
  { name: "Tailwind", icon: "🎨" },
  { name: "PostgreSQL", icon: "🐘" },
  { name: "MongoDB", icon: "🍃" },
  { name: "Redis", icon: "🔴" },
  { name: "Docker", icon: "🐳" },
];

export default function TechStack() {
  return (
    <section className="landing-section">
      <div className="landing-container">
        <motion.div
          className="landing-section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="landing-section-title">
            Works with your <span className="landing-gradient-text">favorite stack</span>
          </h2>
          <p className="landing-section-subtitle">
            Support for 50+ frameworks, libraries, and tools
          </p>
        </motion.div>

        <motion.div
          className="landing-tech-grid"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, staggerChildren: 0.05 }}
        >
          {techStacks.map((tech, index) => (
            <motion.div
              key={index}
              className="landing-tech-card"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.03, duration: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <span className="landing-tech-icon">{tech.icon}</span>
              <span className="landing-tech-name">{tech.name}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          className="landing-tech-note"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          And many more... Don&apos;t see your stack? Just ask in your prompt!
        </motion.p>
      </div>
    </section>
  );
}
