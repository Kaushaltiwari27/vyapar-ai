"use client";

import { motion } from "framer-motion";

export default function RootLoading() {
  return (
    <div className="w-full h-screen bg-background flex flex-col items-center justify-center space-y-8 z-[9999] fixed inset-0">
      {/* 2026 Premium Brand Loader */}
      <div className="relative">
        <motion.div 
          className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)]"
          animate={{ 
            rotate: [0, 90, 180, 270, 360],
            borderRadius: ["20%", "50%", "20%", "50%", "20%"]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-white font-bold text-3xl">V</span>
        </motion.div>

        {/* Orbiting element */}
        <motion.div
          className="absolute -top-4 -right-4 w-4 h-4 bg-foreground rounded-full"
          animate={{
            rotate: 360,
            originX: -1,
            originY: 2
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Loading Text */}
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center">
          Vyapar<span className="text-primary">AI</span>
        </h2>
        <motion.div 
          className="h-1 bg-primary/20 rounded-full w-32 overflow-hidden"
        >
          <motion.div 
            className="h-full bg-primary rounded-full"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </div>
  );
}
