import React from 'react';
import { motion } from 'framer-motion';
import { FileDown, Mail, GraduationCap, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { profileData } from '../mockData';

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 pb-16 px-6 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-teal-50/50" />
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/10 to-teal-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-400/10 to-blue-400/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Profile Image */}
          <motion.div 
            className="flex-shrink-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              {/* Decorative rings */}
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-500 to-teal-400 rounded-full opacity-20 blur-xl animate-pulse" />
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-teal-400 rounded-full opacity-30" />
              
              <img
                src={profileData.profileImage}
                alt={profileData.name}
                className="relative w-56 h-56 lg:w-72 lg:h-72 rounded-full object-cover border-4 border-white shadow-2xl"
                data-testid="profile-image"
              />
              
              {/* Status badge */}
              <motion.div 
                className="absolute -bottom-2 -right-2 bg-white rounded-full px-4 py-2 shadow-lg border border-slate-100 flex items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-slate-700">Open to Collaborate</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-100">
                <Sparkles size={16} />
                <span>Assistant Professor</span>
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {profileData.name}
            </motion.h1>
            
            <motion.div 
              className="flex items-center justify-center lg:justify-start gap-2 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <GraduationCap className="text-teal-600" size={24} />
              <p className="text-xl lg:text-2xl text-slate-600 font-medium">{profileData.title}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <p className="text-lg text-slate-500 mb-1">{profileData.department}</p>
              <p className="text-lg text-slate-500 mb-8">{profileData.university}</p>
            </motion.div>
            
            <motion.p 
              className="text-lg text-slate-600 leading-relaxed mb-10 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {profileData.bio}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Button 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 text-base rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
                onClick={() => window.open(profileData.cv, '_blank')}
                data-testid="download-cv-btn"
              >
                <FileDown className="mr-2" size={18} />
                Download CV
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 px-8 py-6 text-base rounded-xl transition-all duration-300"
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                data-testid="contact-btn"
              >
                <Mail className="mr-2" size={18} />
                Get in Touch
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
