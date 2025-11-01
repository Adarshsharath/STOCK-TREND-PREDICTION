import React from 'react'
import { motion } from 'framer-motion'

/**
 * FinSight AI Section Header Component
 * Consistent section headers with gradient text and animations
 */
const SectionHeader = ({ 
  title, 
  subtitle, 
  badge,
  icon: Icon,
  align = 'left', // left, center
  gradient = true,
  className = '',
}) => {
  const alignClasses = align === 'center' ? 'text-center items-center' : 'text-left items-start'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col ${alignClasses} ${className}`}
    >
      {/* Badge/Icon */}
      {(badge || Icon) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mb-4"
        >
          {Icon ? (
            <div className="
              w-14 h-14 
              rounded-xl 
              bg-gradient-to-br from-finsight-blue-500 to-finsight-teal-500 
              flex items-center justify-center 
              shadow-neon-blue
            ">
              <Icon className="w-7 h-7 text-white" />
            </div>
          ) : (
            <span className="
              px-4 py-1.5 
              bg-finsight-blue-500/20 
              border border-finsight-blue-500/50 
              text-finsight-blue-400 
              text-sm font-semibold 
              rounded-full 
              backdrop-blur-sm
            ">
              {badge}
            </span>
          )}
        </motion.div>
      )}

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className={`
          text-4xl md:text-5xl font-bold mb-4
          ${gradient 
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-finsight-blue-500 via-finsight-teal-500 to-finsight-purple-500' 
            : 'text-dark-text-primary'
          }
        `}
      >
        {title}
      </motion.h2>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-lg md:text-xl text-dark-text-secondary max-w-3xl"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  )
}

export default SectionHeader
