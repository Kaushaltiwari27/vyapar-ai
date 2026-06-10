'use client'

import { useEffect, useState, MouseEvent } from 'react'
import { motion, useMotionValue, useMotionTemplate, animate } from 'framer-motion'

interface MetricCardProps {
  title: string
  value: number | string
  prefix?: string
  suffix?: string
  change?: string
  changePositive?: boolean
  gradient?: string
  icon?: React.ReactNode
  animate?: boolean
}

export default function MetricCard({
  title, value, prefix = '', suffix = '', change,
  changePositive = true, icon, animate: shouldAnimate = true
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(
    typeof value === 'number' && shouldAnimate ? '0' : new Intl.NumberFormat('en-IN').format(Number(value) || 0)
  );
  
  // Spotlight effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  useEffect(() => {
    if (!shouldAnimate || typeof value !== 'number') {
      setDisplayValue(new Intl.NumberFormat('en-IN').format(Number(value) || 0));
      return;
    }

    const controls = animate(0, value, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1], // Custom spring-like ease
      onUpdate(v) {
        setDisplayValue(new Intl.NumberFormat('en-IN').format(Math.round(v)));
      }
    });

    return () => controls.stop();
  }, [value, shouldAnimate]);

  return (
    <motion.div 
      onMouseMove={handleMouseMove}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group relative overflow-hidden bg-background border border-border rounded-xl p-5 premium-shadow transition-shadow hover:premium-shadow-hover"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, hsl(var(--primary) / 0.1), transparent 80%)`,
        }}
      />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between pb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            {title}
          </p>
          {icon && (
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.2 }}
              className="text-primary/70"
            >
              {icon}
            </motion.div>
          )}
        </div>
        
        <div className="text-3xl font-bold text-foreground tracking-tight mt-1">
          {prefix}{typeof value === 'string' && !shouldAnimate ? value : displayValue}{suffix}
        </div>
        
        {change && (
          <div className={`mt-3 flex items-center text-sm font-semibold ${changePositive ? 'text-emerald-600 dark:text-emerald-500' : 'text-destructive'}`}>
            <span className={`mr-1.5 px-1 py-0.5 rounded text-[10px] ${changePositive ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-destructive/10'}`}>
              {changePositive ? '↑' : '↓'}
            </span>
            {change}
          </div>
        )}
      </div>
    </motion.div>
  )
}
