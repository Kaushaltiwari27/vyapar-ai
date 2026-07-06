'use client'

import React, { useState, useEffect, useRef } from 'react'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(max-width: 767px)')
    setIsMobile(media.matches)

    const listener = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  return isMobile
}

export function useImageWidth(bgImage: string, sectionHeight: number) {
  const [renderWidth, setRenderWidth] = useState(0)

  useEffect(() => {
    if (!bgImage) return
    const img = new Image()
    img.src = bgImage
    img.onload = () => {
      if (img.naturalHeight > 0) {
        const width = img.naturalWidth * (sectionHeight / img.naturalHeight)
        setRenderWidth(width)
      }
    }
  }, [bgImage, sectionHeight])

  return renderWidth
}

export function useMaskPositions(
  containerRef: React.RefObject<HTMLElement | null>,
  cardRefs: React.RefObject<Array<HTMLElement | null>>
) {
  const [positions, setPositions] = useState<Array<{ x: number; y: number; sw: number; sh: number }>>([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const update = () => {
      const rect = container.getBoundingClientRect()
      const sw = rect.width
      const sh = rect.height

      const newPositions = (cardRefs.current || []).map((card) => {
        if (!card) return { x: 0, y: 0, sw: 0, sh: 0 }
        const cardRect = card.getBoundingClientRect()
        return {
          x: cardRect.left - rect.left,
          y: cardRect.top - rect.top,
          sw,
          sh
        }
      })
      setPositions(newPositions)
    }

    update()

    const observer = new ResizeObserver(() => {
      update()
    })
    observer.observe(container)

    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [containerRef, cardRefs])

  return positions
}

export function useStaggeredReveal(count: number, threshold = 0.15) {
  const [visible, setVisible] = useState(false)
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.unobserve(el)
      }
    }, { threshold })

    observer.observe(el)
    return () => {
      observer.disconnect()
    }
  }, [threshold])

  const getAnimStyle = (index: number) => {
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 120}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 120}ms`
    }
  }

  return { containerRef, getAnimStyle }
}

interface MaskedCardProps {
  bgImage: string
  position?: { x: number; y: number; sw: number; sh: number }
  imageWidth: number
  focalX?: number
  className?: string
  children?: React.ReactNode
  cardRef?: React.Ref<HTMLDivElement>
  style?: React.CSSProperties
  onClick?: () => void
}

export function MaskedCard({
  bgImage,
  position,
  imageWidth,
  focalX = 0.5,
  className = '',
  children,
  cardRef,
  style = {},
  onClick
}: MaskedCardProps) {
  if (!position || position.sw === 0 || position.sh === 0) {
    return (
      <div ref={cardRef} className={className} style={style} onClick={onClick}>
        {children}
      </div>
    )
  }

  const overflow = imageWidth > position.sw ? imageWidth - position.sw : 0
  const focalOffset = overflow * focalX

  const combinedStyle: React.CSSProperties = {
    ...style,
    backgroundImage: `url(${bgImage})`,
    backgroundSize: `auto ${position.sh}px`,
    backgroundPosition: `-${position.x + focalOffset}px -${position.y}px`,
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'scroll'
  }

  return (
    <div ref={cardRef} className={className} style={combinedStyle} onClick={onClick}>
      {children}
    </div>
  )
}
