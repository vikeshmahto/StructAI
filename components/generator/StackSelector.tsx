"use client";

import { useGeneratorStore } from "@/store/useGeneratorStore";
import { motion } from "framer-motion";

const AVAILABLE_STACKS = [
  { id: "nextjs", label: "Next.js", icon: "▲" },
  { id: "express", label: "Express", icon: "⚡" },
  { id: "django", label: "Django", icon: "🐍" },
  { id: "fastapi", label: "FastAPI", icon: "⚡" },
  { id: "vite", label: "React + Vite", icon: "⚛" },
  { id: "supabase", label: "Supabase", icon: "⚡" },
  { id: "prisma", label: "Prisma", icon: "◆" },
  { id: "mongoose", label: "MongoDB", icon: "🍃" },
  { id: "tailwind", label: "Tailwind", icon: "🎨" },
  { id: "stripe", label: "Stripe", icon: "💳" },
  { id: "trpc", label: "tRPC", icon: "🔗" },
  { id: "redis", label: "Redis", icon: "🔴" },
  { id: "postgres", label: "PostgreSQL", icon: "🐘" },
];

export default function StackSelector() {
  const { selectedStack, toggleStack, isLoading } = useGeneratorStore();

  return (
    <div className="stack-selector">
      <label className="stack-label">
        <span className="stack-label-icon">⚙</span>
        Tech Stack <span className="stack-optional">(optional)</span>
      </label>
      <div className="stack-chips">
        {AVAILABLE_STACKS.map((stack, index) => {
          const isSelected = selectedStack.includes(stack.id);
          return (
            <motion.button
              key={stack.id}
              type="button"
              className={`stack-chip ${isSelected ? "stack-chip--selected" : ""}`}
              onClick={() => toggleStack(stack.id)}
              disabled={isLoading}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="stack-chip-icon">{stack.icon}</span>
              {stack.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
