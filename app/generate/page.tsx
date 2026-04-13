"use client";

import PromptInput from "@/components/generator/PromptInput";
import DocumentUpload from "@/components/generator/DocumentUpload";
import StackSelector from "@/components/generator/StackSelector";
import GenerateButton from "@/components/generator/GenerateButton";
import FileTree from "@/components/tree/FileTree";
import FilePreview from "@/components/tree/FilePreview";
import ProjectMeta from "@/components/output/ProjectMeta";
import SetupCommands from "@/components/output/SetupCommands";
import EnvVariables from "@/components/output/EnvVariables";
import DownloadButton from "@/components/output/DownloadButton";
import Header from "@/components/layout/Header";
import { useGeneratorStore } from "@/store/useGeneratorStore";
import { motion, AnimatePresence } from "framer-motion";

export default function GeneratePage() {
  const { project, error, isLoading, generationStep, reset } = useGeneratorStore();

  return (
    <div className="app">
      {/* Ambient background effects */}
      <div className="bg-gradient" />
      <div className="bg-grid" />

      {/* Header */}
      <Header />

      <main className="main">
        {/* Hero Section - Input */}
        <AnimatePresence mode="wait">
          {!project && (
            <motion.section
              className="hero-section"
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="hero-content">
                <motion.h2
                  className="hero-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Describe your project.
                  <br />
                  <span className="hero-title-gradient">Get production-ready code.</span>
                </motion.h2>
                <motion.p
                  className="hero-subtitle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Type your idea in plain English or upload a requirements document (.pdf, .docx,
                  .txt, .md) → get a complete folder structure, boilerplate files, README, and .env
                  template — downloaded as a .zip in seconds.
                </motion.p>
              </div>

              <div className="generator-card">
                {/* Divider label for input mode */}
                <div className="input-mode-header">
                  <div className="input-mode-badge">
                    <span className="input-mode-badge-icon">✦</span>
                    Choose your input method
                  </div>
                  <p className="input-mode-hint">
                    Describe your project with text, upload a document, or both
                  </p>
                </div>

                <PromptInput />

                {/* OR Divider */}
                <div className="input-divider">
                  <div className="input-divider-line" />
                  <span className="input-divider-text">OR</span>
                  <div className="input-divider-line" />
                </div>

                <DocumentUpload />

                <StackSelector />
                <GenerateButton />

                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="error-message"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <span className="error-icon">⚠</span>
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Example prompts */}
              <motion.div
                className="examples"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="examples-label">Try an example:</p>
                <div className="examples-grid">
                  {EXAMPLE_PROMPTS.map((example, i) => (
                    <ExampleCard key={i} {...example} />
                  ))}
                </div>
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="loading-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="loading-card">
                <div className="loading-orb" />
                <div className="loading-steps">
                  <LoadingStep
                    step="thinking"
                    label="Analyzing requirements"
                    current={generationStep}
                  />
                  <LoadingStep
                    step="generating"
                    label="Generating structure with AI"
                    current={generationStep}
                  />
                  <LoadingStep
                    step="processing"
                    label="Validating & enriching"
                    current={generationStep}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Output Section */}
        <AnimatePresence>
          {project && !isLoading && (
            <motion.section
              className="output-section"
              key="output"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="output-header">
                <ProjectMeta />
                <div className="output-actions">
                  <DownloadButton />
                  <button className="reset-button" onClick={reset}>
                    ← Generate another
                  </button>
                </div>
              </div>

              <div className="output-workspace">
                <div className="output-sidebar">
                  <FileTree />
                </div>
                <div className="output-preview">
                  <FilePreview />
                </div>
              </div>

              <div className="output-details">
                <SetupCommands />
                <EnvVariables />
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          Built with <span className="footer-heart">✦</span> StructAI · AI-Powered Project
          Scaffolding
        </p>
      </footer>
    </div>
  );
}

// Loading step indicator component
function LoadingStep({ step, label, current }: { step: string; label: string; current: string }) {
  const steps = ["thinking", "generating", "processing"];
  const currentIndex = steps.indexOf(current);
  const stepIndex = steps.indexOf(step);

  let status: "pending" | "active" | "done" = "pending";
  if (stepIndex < currentIndex) status = "done";
  else if (stepIndex === currentIndex) status = "active";

  return (
    <div className={`loading-step loading-step--${status}`}>
      <span className="loading-step-indicator">
        {status === "done" ? "✓" : status === "active" ? "◉" : "○"}
      </span>
      <span className="loading-step-label">{label}</span>
    </div>
  );
}

// Example prompts
const EXAMPLE_PROMPTS = [
  {
    title: "SaaS Dashboard",
    description: "Next.js + Supabase + Stripe",
    prompt:
      "Build a SaaS dashboard with Next.js 14 App Router, Supabase auth and database, Stripe billing integration, and a Tailwind-styled admin panel",
  },
  {
    title: "REST API",
    description: "Express + MongoDB + JWT",
    prompt:
      "Create a REST API with Express.js, MongoDB with Mongoose, JWT authentication with refresh tokens, and Zod validation",
  },
  {
    title: "E-Commerce Store",
    description: "Next.js + Prisma + Stripe",
    prompt:
      "Build a full-stack e-commerce store with Next.js, Prisma ORM with PostgreSQL, Stripe payments, product catalog, cart, and user authentication",
  },
  {
    title: "Blog Platform",
    description: "Django + PostgreSQL",
    prompt:
      "Create a blog platform with Django, PostgreSQL, custom user model, REST API with DRF, markdown support, and admin interface",
  },
];

function ExampleCard({
  title,
  description,
  prompt,
}: {
  title: string;
  description: string;
  prompt: string;
}) {
  const { setPrompt } = useGeneratorStore();

  return (
    <motion.button
      className="example-card"
      onClick={() => setPrompt(prompt)}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="example-card-title">{title}</span>
      <span className="example-card-desc">{description}</span>
    </motion.button>
  );
}
