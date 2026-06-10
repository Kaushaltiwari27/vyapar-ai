"use client";

import { motion } from "framer-motion";

export default function DashboardLoading() {
  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center space-y-6">
      {/* 2026 Premium Spinner */}
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <motion.div
          className="absolute w-24 h-24 border-4 border-t-primary border-r-transparent border-b-primary/30 border-l-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner Ring */}
        <motion.div
          className="absolute w-16 h-16 border-4 border-t-transparent border-r-primary/50 border-b-transparent border-l-primary rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        {/* Center Dot */}
        <motion.div
          className="w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Modern Loading Text */}
      <div className="flex flex-col items-center">
        <motion.h3 
          className="text-lg font-bold text-foreground tracking-widest uppercase"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          Preparing Workspace
        </motion.h3>
        <div className="flex gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-primary/60 rounded-full"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
