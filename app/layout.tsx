import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StructAI — AI-Powered Project Scaffolding Engine",
  description:
    "Describe your app idea in plain English and get a production-ready folder structure, boilerplate files, README, and env template — downloaded as a .zip in seconds.",
  keywords: [
    "AI",
    "project generator",
    "scaffolding",
    "boilerplate",
    "Next.js",
    "React",
    "developer tools",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
