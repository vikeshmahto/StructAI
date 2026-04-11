"use client";

import { useGeneratorStore } from "@/store/useGeneratorStore";
import { motion } from "framer-motion";

export default function EnvVariables() {
  const { project } = useGeneratorStore();

  if (!project || !project.env_variables || project.env_variables.length === 0)
    return null;

  return (
    <motion.div
      className="env-variables"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="env-variables-title">
        <span>🔑</span> Environment Variables
      </h3>
      <div className="env-variables-list">
        {project.env_variables.map((envVar) => (
          <div key={envVar.key} className="env-variable-item">
            <div className="env-variable-header">
              <code className="env-variable-key">{envVar.key}</code>
              <div className="env-variable-badges">
                {envVar.required && (
                  <span className="env-badge env-badge--required">required</span>
                )}
                {envVar.sensitive && (
                  <span className="env-badge env-badge--sensitive">sensitive</span>
                )}
              </div>
            </div>
            <p className="env-variable-desc">{envVar.description}</p>
            <code className="env-variable-example">{envVar.example}</code>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
