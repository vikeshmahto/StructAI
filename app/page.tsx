import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import TechStack from "@/components/landing/TechStack";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import Header from "@/components/layout/Header";

export default function Home() {
  return (
    <div className="app">
      {/* Ambient background effects */}
      <div className="bg-gradient" />
      <div className="bg-grid" />

      {/* Header */}
      <Header />

      {/* Landing Page Sections */}
      <Hero />
      <Features />
      <HowItWorks />
      <TechStack />
      <CTA />
      <Footer />
    </div>
  );
}
