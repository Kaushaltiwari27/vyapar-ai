"use client";

import { motion } from "framer-motion";

export default function PageWrapper({ 
  children, 
  title 
}: { 
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="min-h-screen"
    >
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {title && (
          <motion.h1 
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="text-3xl font-extrabold text-foreground tracking-tight mb-8"
          >
            {title}
          </motion.h1>
        )}
        
        {/* Child elements can be staggered if they are wrapped in motion components, 
            but standard layout wrapper ensures no more GSAP glitches. */}
        {children}
      </div>
    </motion.div>
  );
}
