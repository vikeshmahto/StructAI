"use client";

import { useGeneratorStore } from "@/store/useGeneratorStore";
import { motion } from "framer-motion";

export default function DownloadButton() {
  const { project, downloadZip } = useGeneratorStore();

  if (!project) return null;

  return (
    <motion.button
      id="download-button"
      className="download-button"
      onClick={downloadZip}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <span className="download-button-icon">📦</span>
      Download {project.project_name}.zip
    </motion.button>
  );
}
