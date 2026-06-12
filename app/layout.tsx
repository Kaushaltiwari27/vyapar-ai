import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "VyaparAI - Smart Business Management for Indian SMBs",
  description: "AI-powered CRM and invoicing for small and medium businesses in India. Bilingual support in Hindi and English.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
