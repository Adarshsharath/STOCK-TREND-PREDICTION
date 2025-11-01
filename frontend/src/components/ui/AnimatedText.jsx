import React from 'react'
import { motion } from 'framer-motion'

/**
 * Animated Text Component - Text rises up with fade-in effect
 * Use for headings, paragraphs, and any text content
 */
const AnimatedText = ({ 
  children, 
  as = 'p', 
  className = '', 
  delay = 0,
  duration = 0.6,
  y = 20,
  ...props 
}) => {
  const Component = motion[as] || motion.p

  return (
    <Component
      initial={{ opacity: 0, y: y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: duration,
        delay: delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  )
}

// Pre-configured variants for common use cases
export const AnimatedHeading = ({ children, className = '', delay = 0, ...props }) => (
  <AnimatedText 
    as="h1" 
    className={className} 
    delay={delay}
    duration={0.7}
    y={30}
    {...props}
  >
    {children}
  </AnimatedText>
)

export const AnimatedH2 = ({ children, className = '', delay = 0, ...props }) => (
  <AnimatedText 
    as="h2" 
    className={className} 
    delay={delay}
    duration={0.6}
    y={25}
    {...props}
  >
    {children}
  </AnimatedText>
)

export const AnimatedH3 = ({ children, className = '', delay = 0, ...props }) => (
  <AnimatedText 
    as="h3" 
    className={className} 
    delay={delay}
    duration={0.5}
    y={20}
    {...props}
  >
    {children}
  </AnimatedText>
)

export const AnimatedParagraph = ({ children, className = '', delay = 0, ...props }) => (
  <AnimatedText 
    as="p" 
    className={className} 
    delay={delay}
    duration={0.6}
    y={15}
    {...props}
  >
    {children}
  </AnimatedText>
)

export const AnimatedDiv = ({ children, className = '', delay = 0, ...props }) => (
  <AnimatedText 
    as="div" 
    className={className} 
    delay={delay}
    {...props}
  >
    {children}
  </AnimatedText>
)

// Stagger children animation wrapper
export const StaggerContainer = ({ children, staggerDelay = 0.1, className = '' }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Individual stagger item
export const StaggerItem = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1]
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedText
