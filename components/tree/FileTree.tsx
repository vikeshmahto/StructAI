"use client";

import { useGeneratorStore } from "@/store/useGeneratorStore";
import type { FileSystemNode } from "@/types/project";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function getFileIcon(name: string, type: string): string {
  if (type === "folder") return "📁";
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const icons: Record<string, string> = {
    ts: "🔷",
    tsx: "⚛️",
    js: "🟨",
    jsx: "⚛️",
    json: "📋",
    md: "📝",
    css: "🎨",
    html: "🌐",
    py: "🐍",
    env: "🔑",
    yml: "⚙️",
    yaml: "⚙️",
    toml: "⚙️",
    prisma: "◆",
    sql: "🗄️",
    gitignore: "🚫",
    dockerfile: "🐳",
    lock: "🔒",
  };
  return icons[ext] || "📄";
}

function TreeNode({
  node,
  depth = 0,
  parentPath = "",
}: {
  node: FileSystemNode;
  depth?: number;
  parentPath?: string;
}) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const { selectFile, selectedFilePath } = useGeneratorStore();
  const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
  const isFolder = node.type === "folder";
  const isSelected = selectedFilePath === currentPath;

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      selectFile(node, currentPath);
    }
  };

  return (
    <div className="tree-node-wrapper">
      <motion.div
        className={`tree-node ${isSelected ? "tree-node--selected" : ""} ${isFolder ? "tree-node--folder" : "tree-node--file"}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: depth * 0.02, duration: 0.15 }}
      >
        {isFolder && (
          <span className={`tree-chevron ${isOpen ? "tree-chevron--open" : ""}`}>
            ›
          </span>
        )}
        <span className="tree-icon">{getFileIcon(node.name, node.type)}</span>
        <span className="tree-name">{node.name}</span>
      </motion.div>

      <AnimatePresence>
        {isFolder && isOpen && node.children && (
          <motion.div
            className="tree-children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children
              .sort((a, b) => {
                // Folders first, then files, alphabetically
                if (a.type !== b.type)
                  return a.type === "folder" ? -1 : 1;
                return a.name.localeCompare(b.name);
              })
              .map((child) => (
                <TreeNode
                  key={child.name}
                  node={child}
                  depth={depth + 1}
                  parentPath={currentPath}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FileTree() {
  const { project } = useGeneratorStore();

  if (!project) return null;

  // Count total files
  function countFiles(nodes: FileSystemNode[]): number {
    let count = 0;
    for (const node of nodes) {
      if (node.type === "file") count++;
      if (node.children) count += countFiles(node.children);
    }
    return count;
  }

  const totalFiles = countFiles(project.folders);

  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <span className="file-tree-title">
          📂 {project.project_name}
        </span>
        <span className="file-tree-count">{totalFiles} files</span>
      </div>
      <div className="file-tree-content">
        {project.folders
          .sort((a, b) => {
            if (a.type !== b.type)
              return a.type === "folder" ? -1 : 1;
            return a.name.localeCompare(b.name);
          })
          .map((node) => (
            <TreeNode key={node.name} node={node} />
          ))}
      </div>
    </div>
  );
}
