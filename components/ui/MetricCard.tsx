'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

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

  useEffect(() => {
    if (!shouldAnimate || typeof value !== 'number') {
      setDisplayValue(new Intl.NumberFormat('en-IN').format(Number(value) || 0));
      return;
    }

    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate(v) {
        setDisplayValue(new Intl.NumberFormat('en-IN').format(Math.round(v)));
      }
    });

    return () => controls.stop();
  }, [value, shouldAnimate]);

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      className="relative overflow-hidden bg-background border border-border rounded-xl p-5 premium-shadow transition-shadow hover:premium-shadow-hover"
    >
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between pb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            {title}
          </p>
          {icon && <div className="text-muted-foreground/70">{icon}</div>}
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
