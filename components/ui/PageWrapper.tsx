'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function PageWrapper({ children, title }: { children: React.ReactNode, title?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    // Page enter animation
    const tl = gsap.timeline()
    
    if (wrapperRef.current) {
      tl.fromTo(wrapperRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      )
    }
    
    if (titleRef.current) {
      tl.fromTo(titleRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' },
        '-=0.2'
      )
    }
    
    // Stagger all cards with the animate-card class
    tl.fromTo('.animate-card',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' },
      '-=0.2'
    )
  }, [])

  return (
    <div ref={wrapperRef} className="opacity-0 min-h-screen">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {title && (
          <h1 ref={titleRef} className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
            {title}
          </h1>
        )}
        {children}
      </div>
    </div>
  )
}
