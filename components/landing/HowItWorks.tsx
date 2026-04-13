"use client";

import { motion } from "framer-motion";
import { MessageSquare, Wand2, Download, Rocket } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    number: "01",
    title: "Share Your Requirements",
    description:
      "Describe your project needs in plain English or upload your requirements document. Be as detailed or brief as you like.",
  },
  {
    icon: Wand2,
    number: "02",
    title: "Get Production Structure",
    description:
      "Our AI analyzes your requirements and generates a complete, production-level folder structure with best practices built-in.",
  },
  {
    icon: Download,
    number: "03",
    title: "Download & Unzip",
    description:
      "Receive your project as a ready-to-use .zip file with organized folders, config files, and comprehensive documentation.",
  },
  {
    icon: Rocket,
    number: "04",
    title: "Start Integrating Logic",
    description:
      "Skip the entire setup milestone. Install dependencies and immediately start building your features and implementing your ideas.",
  },
];

const stepVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
    },
  }),
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="landing-section landing-section-alt">
      <div className="landing-container">
        <motion.div
          className="landing-section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="landing-section-title">
            From requirements to <span className="landing-gradient-text">production structure</span>
          </h2>
          <p className="landing-section-subtitle">
            No manual setup. No wasted time. Just share your needs and start building.
          </p>
        </motion.div>

        <div className="landing-steps">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="landing-step"
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={stepVariants}
            >
              <div className="landing-step-number">{step.number}</div>
              <div className="landing-step-icon">
                <step.icon size={28} />
              </div>
              <div className="landing-step-content">
                <h3 className="landing-step-title">{step.title}</h3>
                <p className="landing-step-description">{step.description}</p>
              </div>
              {index < steps.length - 1 && <div className="landing-step-connector" />}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
