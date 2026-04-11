"use client";

import { useGeneratorStore } from "@/store/useGeneratorStore";
import { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-python";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-sql";
import { motion } from "framer-motion";

function getLanguage(fileName: string, language?: string): string {
  if (language) {
    const map: Record<string, string> = {
      typescript: "typescript",
      javascript: "javascript",
      json: "json",
      css: "css",
      markdown: "markdown",
      env: "bash",
      python: "python",
      yaml: "yaml",
      sql: "sql",
      text: "text",
    };
    return map[language] || language;
  }
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const extMap: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    json: "json",
    css: "css",
    md: "markdown",
    py: "python",
    yml: "yaml",
    yaml: "yaml",
    sql: "sql",
    env: "bash",
    sh: "bash",
    html: "markup",
  };
  return extMap[ext] || "text";
}

export default function FilePreview() {
  const { selectedFile, selectedFilePath } = useGeneratorStore();
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [selectedFile]);

  if (!selectedFile) {
    return (
      <div className="file-preview-empty">
        <div className="file-preview-empty-icon">📄</div>
        <p className="file-preview-empty-text">
          Select a file from the tree to preview its contents
        </p>
      </div>
    );
  }

  if (!selectedFile.content) {
    return (
      <div className="file-preview-empty">
        <div className="file-preview-empty-icon">📁</div>
        <p className="file-preview-empty-text">
          This file has no content preview
        </p>
      </div>
    );
  }

  const language = getLanguage(selectedFile.name, selectedFile.language);
  const lines = selectedFile.content.split("\n");

  return (
    <motion.div
      className="file-preview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      key={selectedFilePath}
    >
      <div className="file-preview-header">
        <span className="file-preview-filename">{selectedFilePath || selectedFile.name}</span>
        <div className="file-preview-meta">
          <span className="file-preview-lang">{language}</span>
          <span className="file-preview-lines">{lines.length} lines</span>
          <button
            className="file-preview-copy"
            onClick={() => navigator.clipboard.writeText(selectedFile.content || "")}
            title="Copy to clipboard"
          >
            📋 Copy
          </button>
        </div>
      </div>
      <div className="file-preview-body">
        <div className="file-preview-line-numbers">
          {lines.map((_, i) => (
            <span key={i} className="file-preview-line-number">
              {i + 1}
            </span>
          ))}
        </div>
        <pre className="file-preview-pre">
          <code ref={codeRef} className={`language-${language}`}>
            {selectedFile.content}
          </code>
        </pre>
      </div>
    </motion.div>
  );
}
