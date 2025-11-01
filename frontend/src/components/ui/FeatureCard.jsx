import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  link, 
  onClick,
  delay = 0,
  glowColor = 'blue' // blue, teal, purple
}) => {
  const glowClasses = {
    blue: 'group-hover:shadow-neon-blue group-hover:border-finsight-blue-500',
    teal: 'group-hover:shadow-neon-teal group-hover:border-finsight-teal-500',
    purple: 'group-hover:shadow-neon-purple group-hover:border-finsight-purple-500',
  }

  const iconGradients = {
    blue: 'from-finsight-blue-500 to-finsight-teal-500',
    teal: 'from-finsight-teal-500 to-finsight-cyan',
    purple: 'from-finsight-purple-500 to-finsight-blue-500',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -8 }}
      className={`
        group
        bg-dark-bg-glass 
        backdrop-blur-glass 
        border border-dark-border 
        rounded-2xl 
        p-8 
        transition-all duration-300
        cursor-pointer
        ${glowClasses[glowColor]}
      `}
      onClick={onClick}
    >
      {/* Icon */}
      {Icon && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: delay + 0.2, duration: 0.4 }}
          className="mb-6"
        >
          <div className={`
            w-16 h-16 
            rounded-xl 
            bg-gradient-to-br ${iconGradients[glowColor]}
            flex items-center justify-center 
            shadow-neon-${glowColor}
            group-hover:scale-110
            transition-transform duration-300
          `}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </motion.div>
      )}

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.3, duration: 0.4 }}
        className="text-2xl font-bold text-dark-text-primary mb-3 group-hover:text-finsight-blue-400 transition-colors"
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.4, duration: 0.4 }}
        className="text-dark-text-secondary leading-relaxed mb-4"
      >
        {description}
      </motion.p>

      {/* Link/Arrow */}
      {link && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: delay + 0.5, duration: 0.4 }}
          className="flex items-center space-x-2 text-finsight-blue-400 font-semibold group-hover:space-x-3 transition-all"
        >
          <span>{link}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.div>
      )}
    </motion.div>
  )
}

export default FeatureCard
