import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { profileData } from '../mockData';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="flex flex-col md:flex-row items-center justify-between gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Left - Logo & Copyright */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold">
              PH
            </div>
            <div>
              <p className="text-slate-300 font-medium">
                © {currentYear} {profileData.name}
              </p>
              <p className="text-slate-500 text-sm">
                All rights reserved.
              </p>
            </div>
          </div>

          {/* Center - Department */}
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              {profileData.department}
            </p>
            <p className="text-slate-500 text-sm">
              {profileData.university}
            </p>
          </div>

          {/* Right - Built with */}
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>Built with</span>
            <Heart size={14} className="text-red-500 fill-red-500" />
            <span>using React</span>
          </div>
        </motion.div>

        {/* Bottom line */}
        <motion.div 
          className="mt-8 pt-8 border-t border-slate-800 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-slate-500 text-xs">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
