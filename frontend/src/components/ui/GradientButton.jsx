import React from 'react'
import { motion } from 'framer-motion'

/**
 * FinSight AI Gradient Button Component
 * Multiple variants: primary, ghost, glass
 */
const GradientButton = ({ 
  children, 
  variant = 'primary', // primary, ghost, glass, outline
  size = 'md', // sm, md, lg
  icon: Icon,
  iconPosition = 'left', // left, right
  onClick,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-finsight-blue-500 to-finsight-teal-500 
      text-white font-semibold 
      shadow-neon-blue 
      hover:shadow-neon-teal 
      hover:from-finsight-blue-600 hover:to-finsight-teal-600
    `,
    ghost: `
      border-2 border-finsight-blue-500 
      text-finsight-blue-500 
      font-semibold 
      hover:bg-finsight-blue-500 
      hover:text-white 
      hover:shadow-neon-blue
    `,
    glass: `
      bg-glass-white 
      backdrop-blur-glass 
      border border-dark-border 
      text-dark-text-primary 
      font-semibold 
      hover:bg-glass-white 
      hover:border-finsight-blue-500 
      hover:text-finsight-blue-500
    `,
    outline: `
      border-2 border-dark-border 
      text-dark-text-primary 
      font-semibold 
      hover:border-finsight-blue-500 
      hover:text-finsight-blue-500 
      hover:shadow-neon-blue
    `,
  }

  const baseClasses = `
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${fullWidth ? 'w-full' : ''}
    rounded-lg 
    transition-all duration-300
    flex items-center justify-center space-x-2
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
  `

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`${baseClasses} ${className}`}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
    </motion.button>
  )
}

export default GradientButton
