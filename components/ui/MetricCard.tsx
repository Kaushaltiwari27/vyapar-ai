'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

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
  changePositive = true, gradient, icon, animate = true
}: MetricCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!animate || typeof value !== 'number') return
    // GSAP counter animation
    const obj = { val: 0 }
    gsap.to(obj, {
      val: value,
      duration: 1.5,
      ease: 'power2.out',
      delay: 0.3,
      onUpdate: () => {
        if (valueRef.current) {
          valueRef.current.textContent = prefix +
            new Intl.NumberFormat('en-IN').format(Math.round(obj.val)) + suffix
        }
      }
    })
    
    // Card entrance
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.4)' }
      )
    }
  }, [value, animate, prefix, suffix])

  const handleMouseEnter = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: -4, scale: 1.02,
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        duration: 0.3, ease: 'power2.out'
      })
    }
  }
  const handleMouseLeave = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: 0, scale: 1,
        boxShadow: 'var(--card-shadow)',
        duration: 0.3, ease: 'power2.out'
      })
    }
  }

  return (
    <div 
      ref={cardRef}
      className="relative overflow-hidden bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl p-5"
      style={{ boxShadow: 'var(--card-shadow)' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Subtle background pattern */}
      {gradient && (
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl" style={{ background: gradient }} />
      )}
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between pb-2">
          <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          {icon && <div className="text-slate-400">{icon}</div>}
        </div>
        
        <div ref={valueRef} className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          {prefix}{typeof value === 'number' ? '0' : value}{suffix}
        </div>
        
        {change && (
          <div className={`mt-3 flex items-center text-sm font-semibold ${changePositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            <span className={`mr-1 px-1.5 py-0.5 rounded text-[10px] ${changePositive ? 'bg-emerald-100' : 'bg-rose-100'}`}>
              {changePositive ? '↑' : '↓'}
            </span>
            {change}
          </div>
        )}
      </div>
    </div>
  )
}
