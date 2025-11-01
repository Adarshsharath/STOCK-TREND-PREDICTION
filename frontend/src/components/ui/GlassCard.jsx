import React from 'react'
import { motion } from 'framer-motion'

/**
 * FinSight AI Glassmorphism Card Component
 * Professional, futuristic card with backdrop blur and glow effects
 */
const GlassCard = ({ 
  children, 
  className = '', 
  hover = true,
  glow = false,
  glowColor = 'blue', // blue, teal, purple, cyan
  onClick,
  animate = true,
  ...props 
}) => {
  const glowClasses = {
    blue: 'hover:shadow-neon-blue hover:border-finsight-blue-500',
    teal: 'hover:shadow-neon-teal hover:border-finsight-teal-500',
    purple: 'hover:shadow-neon-purple hover:border-finsight-purple-500',
    cyan: 'hover:shadow-neon-cyan hover:border-neon-cyan',
  }

  const baseClasses = `
    bg-dark-bg-glass 
    backdrop-blur-glass 
    border border-dark-border 
    rounded-2xl 
    shadow-glass
    transition-all duration-300
  `

  const hoverClasses = hover ? `
    ${glow ? glowClasses[glowColor] : 'hover:shadow-glass-hover hover:border-dark-border-light'}
    hover:-translate-y-1
  ` : ''

  const Component = animate ? motion.div : 'div'
  
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  } : {}

  return (
    <Component
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  )
}

export default GlassCard
