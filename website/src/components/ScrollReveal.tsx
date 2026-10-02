import { motion, useInView } from 'motion/react'
import { useRef } from 'react'

import type { TargetAndTransition } from 'motion/react'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: Direction
  duration?: number
  once?: boolean
  amount?: number
  as?: 'div' | 'section' | 'li' | 'span'
}

// Use transform strings instead of independent x/y so Motion offloads to WAAPI (S-tier)
const hiddenState: Record<Direction, TargetAndTransition> = {
  up: { opacity: 0, transform: 'translateY(36px)' },
  down: { opacity: 0, transform: 'translateY(-36px)' },
  left: { opacity: 0, transform: 'translateX(36px)' },
  right: { opacity: 0, transform: 'translateX(-36px)' },
  none: { opacity: 0, transform: 'translateY(0px)' },
}

const visibleState: Record<Direction, TargetAndTransition> = {
  up: { opacity: 1, transform: 'translateY(0px)' },
  down: { opacity: 1, transform: 'translateY(0px)' },
  left: { opacity: 1, transform: 'translateX(0px)' },
  right: { opacity: 1, transform: 'translateX(0px)' },
  none: { opacity: 1, transform: 'translateY(0px)' },
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 0.7,
  once = true,
  amount = 0.15,
  as = 'div',
}: ScrollRevealProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, amount })

  const Component = motion[as] as typeof motion.div

  return (
    <Component
      ref={ref}
      className={className}
      initial={hiddenState[direction]}
      animate={isInView ? visibleState[direction] : hiddenState[direction]}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  )
}
