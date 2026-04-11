"use client";

import { useGeneratorStore } from "@/store/useGeneratorStore";
import { useState } from "react";
import { motion } from "framer-motion";

export default function SetupCommands() {
  const { project } = useGeneratorStore();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!project || !project.setup_commands || project.setup_commands.length === 0)
    return null;

  const copyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <motion.div
      className="setup-commands"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="setup-commands-title">
        <span>⚡</span> Setup Commands
      </h3>
      <div className="setup-commands-list">
        {project.setup_commands.map((cmd, i) => (
          <div key={i} className="setup-command-item">
            <span className="setup-command-number">{i + 1}</span>
            <code className="setup-command-code">{cmd}</code>
            <button
              className="setup-command-copy"
              onClick={() => copyCommand(cmd, i)}
              title="Copy command"
            >
              {copiedIndex === i ? "✓" : "📋"}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
