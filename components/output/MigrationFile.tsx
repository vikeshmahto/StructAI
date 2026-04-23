"use client";

import { useGeneratorStore } from "@/store/useGeneratorStore";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MigrationFile() {
  const {
    project,
    migration,
    isMigrationLoading,
    migrationError,
    generateMigration,
    downloadMigration,
  } = useGeneratorStore();

  const [copied, setCopied] = useState(false);

  if (!project) return null;

  const copyContent = () => {
    if (!migration) return;
    navigator.clipboard.writeText(migration.migrationContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="migration-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="migration-header">
        <h3 className="migration-title">
          <span>🗄️</span> Database Migration
        </h3>
        {!migration && !isMigrationLoading && (
          <p className="migration-description">
            Generate a ready-to-run migration file based on your project's data models and database.
          </p>
        )}
      </div>

      {/* Generate button — shown when no migration yet */}
      {!migration && !isMigrationLoading && (
        <motion.button
          className="migration-generate-btn"
          onClick={generateMigration}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="migration-generate-btn-icon">⚡</span>
          Generate Migration File
        </motion.button>
      )}

      {/* Loading state */}
      <AnimatePresence>
        {isMigrationLoading && (
          <motion.div
            className="migration-loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="migration-loading-spinner" />
            <span>Analyzing data models and generating migration…</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      <AnimatePresence>
        {migrationError && !isMigrationLoading && (
          <motion.div
            className="migration-error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <span>⚠</span> {migrationError}
            <button className="migration-retry-btn" onClick={generateMigration}>
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {migration && !isMigrationLoading && (
          <motion.div
            className="migration-result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* DB type badge + file name */}
            <div className="migration-result-meta">
              <div className="migration-db-badge">
                <span className="migration-db-icon">🗃️</span>
                {migration.dbType}
              </div>
              <div className="migration-filename">
                <span className="migration-filename-icon">📄</span>
                <code>{migration.fileName}</code>
              </div>
            </div>

            {/* Migration file content */}
            <div className="migration-code-block">
              <div className="migration-code-toolbar">
                <span className="migration-code-label">Migration File</span>
                <div className="migration-code-actions">
                  <button
                    className="migration-code-btn"
                    onClick={copyContent}
                    title="Copy to clipboard"
                  >
                    {copied ? "✓ Copied" : "📋 Copy"}
                  </button>
                </div>
              </div>
              <pre className="migration-code-pre">
                <code>{migration.migrationContent}</code>
              </pre>
            </div>

            {/* Run instructions */}
            <div className="migration-instructions">
              <h4 className="migration-instructions-title">
                <span>🚀</span> How to run this migration
              </h4>
              <ol className="migration-instructions-list">
                {migration.runInstructions.map((step, i) => (
                  <li key={i} className="migration-instruction-item">
                    <span className="migration-instruction-number">{i + 1}</span>
                    <span className="migration-instruction-text">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Actions */}
            <div className="migration-actions">
              <motion.button
                className="migration-download-btn"
                onClick={downloadMigration}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>⬇️</span> Download {migration.fileName}
              </motion.button>
              <button className="migration-regenerate-btn" onClick={generateMigration}>
                ↺ Regenerate
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
