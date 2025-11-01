import React from 'react'
import { motion } from 'framer-motion'

const StatCard = ({ value, label, icon: Icon, gradient = true, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      className="
        bg-gradient-to-br from-finsight-blue-500/10 to-finsight-purple-500/10 
        backdrop-blur-glass 
        border border-finsight-blue-500/30 
        rounded-xl 
        p-6 
        text-center
        hover:border-finsight-blue-500/60
        transition-all duration-300
      "
    >
      {Icon && (
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-finsight-blue-500 to-finsight-teal-500 flex items-center justify-center shadow-neon-blue">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.2, duration: 0.5 }}
        className={`
          text-4xl md:text-5xl font-bold mb-2
          ${gradient 
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-finsight-blue-500 to-finsight-teal-500' 
            : 'text-dark-text-primary'
          }
        `}
      >
        {value}
      </motion.div>
      <div className="text-dark-text-secondary text-sm font-medium">
        {label}
      </div>
    </motion.div>
  )
}

export default StatCard
