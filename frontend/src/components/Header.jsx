import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = ['home', 'news', 'teaching', 'research', 'publications', 'lab', 'service', 'contact'];
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= element.offsetTop - 100) {
          setActiveSection(section);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'News', id: 'news' },
    { label: 'Teaching', id: 'teaching' },
    { label: 'Research', id: 'research' },
    { label: 'Publications', id: 'publications' },
    { label: 'Lab', id: 'lab' },
    { label: 'Service', id: 'service' },
    { label: 'Contact', id: 'contact' }
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'glass shadow-lg shadow-blue-500/5' 
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Name */}
          <motion.button
            onClick={() => scrollToSection('home')}
            className="group flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="header-logo"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg">
              PH
            </div>
            <span className="text-lg font-semibold text-slate-100 hidden sm:block group-hover:text-blue-400 transition-colors duration-300">
              Dr. Prince Hamandawana
            </span>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  activeSection === item.id 
                    ? 'text-blue-400' 
                    : 'text-slate-400 hover:text-slate-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-testid={`nav-${item.id}`}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-500/10 rounded-lg border border-blue-500/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden p-2 text-slate-300 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-800/50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
            data-testid="mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden mt-4 pb-4 overflow-hidden"
            >
              <div className="flex flex-col gap-2">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`text-left px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                      activeSection === item.id 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                        : 'text-slate-300 hover:bg-slate-800/50'
                    }`}
                    data-testid={`mobile-nav-${item.id}`}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

export default Header;
