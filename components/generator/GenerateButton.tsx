"use client";

import { useGeneratorStore } from "@/store/useGeneratorStore";
import { motion } from "framer-motion";

const STEP_MESSAGES: Record<string, string> = {
  thinking: "Analyzing your requirements...",
  generating: "Generating project structure with AI...",
  processing: "Validating and enriching output...",
};

export default function GenerateButton() {
  const { generate, isLoading, generationStep } = useGeneratorStore();

  return (
    <div className="generate-button-wrapper">
      <motion.button
        id="generate-button"
        className="generate-button"
        onClick={generate}
        disabled={isLoading}
        whileHover={!isLoading ? { scale: 1.02, y: -1 } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
      >
        {isLoading ? (
          <span className="generate-button-loading">
            <span className="generate-spinner" />
            <span>{STEP_MESSAGES[generationStep] || "Processing..."}</span>
          </span>
        ) : (
          <span className="generate-button-content">
            <span className="generate-button-icon">✦</span>
            Generate Project Structure
          </span>
        )}
      </motion.button>
    </div>
  );
}
