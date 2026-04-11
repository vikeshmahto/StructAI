"use client";

import { useGeneratorStore } from "@/store/useGeneratorStore";
import { motion } from "framer-motion";

export default function ProjectMeta() {
  const { project } = useGeneratorStore();

  if (!project) return null;

  return (
    <motion.div
      className="project-meta"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="project-meta-name">{project.project_name}</h2>
      <p className="project-meta-description">{project.description}</p>

      <div className="project-meta-stack">
        {project.stack.map((tech) => (
          <span key={tech} className="project-meta-tech-chip">
            {tech}
          </span>
        ))}
      </div>

      <div className="project-meta-info">
        <div className="project-meta-info-item">
          <span className="project-meta-info-label">Package Manager</span>
          <span className="project-meta-info-value">{project.package_manager}</span>
        </div>
      </div>
    </motion.div>
  );
}
