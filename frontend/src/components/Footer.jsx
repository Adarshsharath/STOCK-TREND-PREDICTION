import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Github, Twitter, Linkedin, Mail, TrendingUp, Heart } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:contact@finsight.ai', label: 'Email' }
  ]

  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Features', path: '/' },
        { name: 'Strategies', path: '/strategies' },
        { name: 'Predictions', path: '/predictions' },
        { name: 'Dashboard', path: '/dashboard' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Blog', path: '#' },
        { name: 'Careers', path: '#' },
        { name: 'Contact', path: '#' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', path: '#' },
        { name: 'API', path: '#' },
        { name: 'Support', path: '#' },
        { name: 'Status', path: '#' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy', path: '#' },
        { name: 'Terms', path: '#' },
        { name: 'Security', path: '#' },
        { name: 'Disclaimer', path: '#' }
      ]
    }
  ]

  return (
    <footer className="bg-dark-bg-secondary border-t border-dark-border">
      <div className="container mx-auto px-6 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center space-x-3 mb-4"
            >
              <div className="bg-gradient-to-br from-finsight-blue-500 via-finsight-teal-500 to-finsight-purple-500 p-2 rounded-xl shadow-neon-blue">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-finsight-blue-500 to-finsight-teal-500">
                FinSight AI
              </span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-dark-text-secondary mb-4 max-w-sm leading-relaxed"
            >
              AI-Powered Trading Intelligence Platform. Make smarter investment decisions with advanced analytics and ML predictions.
            </motion.p>
            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="
                      w-10 h-10 
                      bg-dark-bg-elevated 
                      border border-dark-border-light 
                      rounded-lg 
                      flex items-center justify-center 
                      hover:border-finsight-blue-500 
                      hover:shadow-neon-blue 
                      transition-all
                      group
                    "
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="w-5 h-5 text-dark-text-secondary group-hover:text-finsight-blue-400 transition-colors" />
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <h3 className="text-dark-text-primary font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.path.startsWith('#') ? (
                      <a 
                        href={link.path} 
                        className="text-dark-text-secondary hover:text-finsight-blue-400 transition-colors text-sm"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link 
                        to={link.path} 
                        className="text-dark-text-secondary hover:text-finsight-blue-400 transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="border-t border-dark-border pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
        >
          <p className="text-dark-text-muted text-sm">
            © {currentYear} FinSight AI. All rights reserved.
          </p>
          <div className="flex items-center space-x-1 text-dark-text-muted text-sm">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
            <span>using AI Technology</span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
