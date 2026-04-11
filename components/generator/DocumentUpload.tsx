"use client";

import { useGeneratorStore } from "@/store/useGeneratorStore";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useCallback } from "react";

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const FILE_TYPE_ICONS: Record<string, string> = {
  ".pdf": "📄",
  ".docx": "📝",
  ".txt": "📃",
  ".md": "📋",
};

function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot !== -1 ? filename.slice(lastDot).toLowerCase() : "";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentUpload() {
  const {
    isLoading,
    documentFile,
    documentStatus,
    documentError,
    documentWordCount,
    setDocumentFile,
    removeDocument,
  } = useGeneratorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback(
    (file: File) => {
      const ext = getExtension(file.name);

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        useGeneratorStore.setState({
          documentError: `Unsupported file type "${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
          documentStatus: "error",
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        useGeneratorStore.setState({
          documentError: `File too large (${formatFileSize(file.size)}). Maximum size is 10MB.`,
          documentStatus: "error",
        });
        return;
      }

      setDocumentFile(file);
    },
    [setDocumentFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset input so the same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="document-upload-wrapper">
      <label className="document-upload-label">
        <span className="document-upload-label-icon">📎</span>
        Upload Requirements Document
        <span className="document-upload-label-optional">(optional)</span>
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md"
        onChange={handleInputChange}
        className="document-upload-hidden-input"
        disabled={isLoading}
      />

      <AnimatePresence mode="wait">
        {/* Idle / No file selected state */}
        {documentStatus === "idle" && (
          <motion.div
            key="dropzone"
            className={`document-dropzone ${isDragOver ? "document-dropzone--dragover" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            role="button"
            tabIndex={0}
            aria-label="Upload requirements document"
          >
            <div className="document-dropzone-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="document-dropzone-text">
              <span className="document-dropzone-primary">
                Drag & drop your document here
              </span>
              <span className="document-dropzone-secondary">
                or <span className="document-dropzone-browse">browse files</span>
              </span>
            </div>
            <div className="document-dropzone-formats">
              {ALLOWED_EXTENSIONS.map((ext) => (
                <span key={ext} className="document-format-badge">
                  {ext}
                </span>
              ))}
              <span className="document-size-limit">Max 10MB</span>
            </div>
          </motion.div>
        )}

        {/* Parsing state */}
        {documentStatus === "parsing" && (
          <motion.div
            key="parsing"
            className="document-status-card document-status-card--parsing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="document-status-spinner" />
            <div className="document-status-info">
              <span className="document-status-filename">
                {documentFile?.name}
              </span>
              <span className="document-status-message">
                Extracting text from document...
              </span>
            </div>
          </motion.div>
        )}

        {/* Success state */}
        {documentStatus === "success" && documentFile && (
          <motion.div
            key="success"
            className="document-status-card document-status-card--success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="document-status-left">
              <span className="document-file-icon">
                {FILE_TYPE_ICONS[getExtension(documentFile.name)] || "📄"}
              </span>
              <div className="document-status-info">
                <span className="document-status-filename">
                  {documentFile.name}
                </span>
                <span className="document-status-meta">
                  {formatFileSize(documentFile.size)}
                  {documentWordCount > 0 && (
                    <>
                      {" "}
                      · <span className="document-word-count">{documentWordCount.toLocaleString()} words</span>
                    </>
                  )}
                  {" "} · <span className="document-check">✓ Parsed</span>
                </span>
              </div>
            </div>
            <motion.button
              className="document-remove-button"
              onClick={(e) => {
                e.stopPropagation();
                removeDocument();
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={isLoading}
              aria-label="Remove document"
              title="Remove document"
            >
              ✕
            </motion.button>
          </motion.div>
        )}

        {/* Error state */}
        {documentStatus === "error" && (
          <motion.div
            key="error"
            className="document-status-card document-status-card--error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="document-status-left">
              <span className="document-error-icon">⚠</span>
              <div className="document-status-info">
                <span className="document-status-filename">Upload Failed</span>
                <span className="document-status-error-msg">
                  {documentError}
                </span>
              </div>
            </div>
            <motion.button
              className="document-retry-button"
              onClick={(e) => {
                e.stopPropagation();
                removeDocument();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
