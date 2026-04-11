"use client";

import { useGeneratorStore } from "@/store/useGeneratorStore";
import { motion } from "framer-motion";

export default function PromptInput() {
  const { prompt, setPrompt, isLoading } = useGeneratorStore();

  return (
    <div className="prompt-input-wrapper">
      <label htmlFor="project-prompt" className="prompt-label">
        <span className="prompt-label-icon">✦</span>
        Describe your project
      </label>
      <div className="prompt-textarea-container">
        <motion.textarea
          id="project-prompt"
          className="prompt-textarea"
          placeholder="Build a SaaS dashboard with Next.js, Supabase auth, Stripe billing, and a REST API..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
          rows={4}
          maxLength={2000}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        />
        <div className="prompt-char-count">
          {prompt.length}/2000
        </div>
      </div>
    </div>
  );
}
