"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    quote: "VyaparAI has completely transformed how we handle our daily billing and inventory. It feels like having a dedicated accountant who never sleeps.",
    name: "Sanjay Rastogi",
    company: "Rastogi Enterprises",
    initials: "SR",
  },
  {
    quote: "The WhatsApp OS feature is a game changer. We close deals 3x faster now because we reply to customers instantly using AI.",
    name: "Priya Sharma",
    company: "Sharma Boutique",
    initials: "PS",
  },
  {
    quote: "Managing employee attendance and payroll used to take days. Now it happens automatically on the 1st of every month. Incredible!",
    name: "Rahul Verma",
    company: "Verma Logistics",
    initials: "RV",
  },
  {
    quote: "Generating GST-compliant invoices takes literally seconds. The interface is in English but our AI assistant understands pure Hindi.",
    name: "Amit Desai",
    company: "Desai Electronics",
    initials: "AD",
  },
  {
    quote: "I can track stock across my 3 godowns right from my phone. It alerts me before an item goes out of stock. Super helpful.",
    name: "Mohammed Tariq",
    company: "Tariq Traders",
    initials: "MT",
  },
  {
    quote: "We shifted from manual ledgers to VyaparAI in just 2 days. The onboarding was smooth and the customer support is fantastic.",
    name: "Neha Gupta",
    company: "Gupta Sweets & Snacks",
    initials: "NG",
  },
  {
    quote: "Managing vendors and purchase orders has never been this organized. I get a clear 360-degree view of my entire business.",
    name: "Vikram Singh",
    company: "Singh Hardware",
    initials: "VS",
  },
  {
    quote: "The AI Chat assistant is like magic. I just type 'kal ki sales report dikhao' and it generates a beautiful chart instantly.",
    name: "Anjali Mehta",
    company: "Mehta Garments",
    initials: "AM",
  },
  {
    quote: "Compliance used to give me nightmares. VyaparAI automatically calculates TDS and GST. Truly built for Indian businesses.",
    name: "Rajiv Menon",
    company: "Menon Consulting",
    initials: "RM",
  },
  {
    quote: "Affordable, incredibly fast, and very premium looking. My staff learned how to use the POS and CRM without any training.",
    name: "Deepak Chawla",
    company: "Chawla Supermart",
    initials: "DC",
  }
];

export function AuthTestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000); // Changed to 4 seconds to allow reading, 2 seconds is too fast to read 2 sentences.

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[160px] w-full max-w-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-white/60 backdrop-blur-md border border-white p-6 rounded-2xl shadow-xl flex flex-col justify-between"
        >
          <p className="text-slate-700 italic font-medium line-clamp-3 text-sm sm:text-base">
            &quot;{testimonials[currentIndex].quote}&quot;
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" 
              style={{ background: 'var(--grad-button)' }}
            >
              {testimonials[currentIndex].initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-slate-900 font-bold text-sm truncate">{testimonials[currentIndex].name}</p>
              <p className="text-blue-700 text-xs font-bold truncate">{testimonials[currentIndex].company}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
