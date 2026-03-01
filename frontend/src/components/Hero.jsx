import React from 'react';
import { motion } from 'framer-motion';
import { FileDown, Mail, GraduationCap, Sparkles, Briefcase, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { profileData } from '../mockData';

const timelineData = [
  {
    period: "Jan 2023 ~ Present",
    role: "Assistant Professor",
    organization: "Ajou University",
    department: "Dpt. Software",
    location: "South Korea",
    type: "academic",
    current: true
  },
  {
    period: "Mar 2021 ~ Dec 2022",
    role: "Assistant Professor",
    organization: "Soongsil University",
    department: "Dpt. Computer Engineering",
    location: "South Korea",
    type: "academic",
    current: false
  },
  {
    period: "Mar 2016 ~ Dec 2020",
    role: "PhD in AI",
    organization: "Ajou University",
    department: "Dpt. AI",
    location: "South Korea",
    type: "education",
    current: false
  },
  {
    period: "Jan 2009 ~ Dec 2015",
    role: "Network Operations Engineer",
    organization: "Liquid Telecom",
    department: "",
    location: "Zimbabwe",
    type: "industry",
    current: false
  },
  {
    period: "Aug 2006 ~ Aug 2010",
    role: "BSc Computer Science",
    organization: "NUST",
    department: "Dpt. Computer Science",
    location: "Zimbabwe",
    type: "education",
    current: false
  }
];

const Hero = () => {
  const getTypeColor = (type, current) => {
    if (current) return "bg-green-500";
    switch (type) {
      case "academic": return "bg-blue-500";
      case "education": return "bg-purple-500";
      case "industry": return "bg-amber-500";
      default: return "bg-slate-500";
    }
  };

  const getTypeBadgeColor = (type, current) => {
    if (current) return "bg-green-100 text-green-700 border-green-200";
    switch (type) {
      case "academic": return "bg-blue-100 text-blue-700 border-blue-200";
      case "education": return "bg-purple-100 text-purple-700 border-purple-200";
      case "industry": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <section id="home" className="relative min-h-screen pt-24 pb-16 px-6 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-teal-50/50" />
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/10 to-teal-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-400/10 to-blue-400/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Top Section: Profile Info */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 mb-16">
          {/* Profile Image */}
          <motion.div 
            className="flex-shrink-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-500 to-teal-400 rounded-full opacity-20 blur-xl animate-pulse" />
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-teal-400 rounded-full opacity-30" />
              
              <img
                src={profileData.profileImage}
                alt={profileData.name}
                className="relative w-48 h-48 lg:w-56 lg:h-56 rounded-full object-cover border-4 border-white shadow-2xl"
                data-testid="profile-image"
              />
              
              <motion.div 
                className="absolute -bottom-2 -right-2 bg-white rounded-full px-3 py-1.5 shadow-lg border border-slate-100 flex items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-slate-700">Open to Collaborate</span>
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
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-blue-100">
                <Sparkles size={16} />
                <span>Assistant Professor</span>
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-5xl font-bold text-slate-900 mb-3 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {profileData.name}
            </motion.h1>
            
            <motion.div 
              className="flex items-center justify-center lg:justify-start gap-2 mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <GraduationCap className="text-teal-600" size={22} />
              <p className="text-xl text-slate-600 font-medium">{profileData.title}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <p className="text-base text-slate-500 mb-1">{profileData.department}</p>
              <p className="text-base text-slate-500 mb-6">{profileData.university}</p>
            </motion.div>
            
            <motion.p 
              className="text-base text-slate-600 leading-relaxed mb-8 max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {profileData.bio}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Button 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-5 text-sm rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all duration-300"
                onClick={() => window.open(profileData.cv, '_blank')}
                data-testid="download-cv-btn"
              >
                <FileDown className="mr-2" size={18} />
                Download CV
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 px-6 py-5 text-sm rounded-xl transition-all duration-300"
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                data-testid="contact-btn"
              >
                <Mail className="mr-2" size={18} />
                Get in Touch
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Timeline Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8"
        >
          <div className="flex items-center gap-3 mb-8 justify-center lg:justify-start">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white">
              <Briefcase size={20} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Career Journey</h2>
          </div>

          {/* Timeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {timelineData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                className={`relative bg-white rounded-xl p-5 border shadow-sm hover:shadow-lg transition-all duration-300 ${
                  item.current ? 'border-green-200 ring-2 ring-green-100' : 'border-slate-100'
                }`}
              >
                {/* Current indicator */}
                {item.current && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Current
                  </div>
                )}
                
                {/* Type indicator dot */}
                <div className={`w-3 h-3 rounded-full ${getTypeColor(item.type, item.current)} mb-3`} />
                
                {/* Period */}
                <p className="text-xs font-medium text-slate-400 mb-2">{item.period}</p>
                
                {/* Role */}
                <h3 className="font-semibold text-slate-900 text-sm mb-1 leading-tight">{item.role}</h3>
                
                {/* Organization */}
                <p className="text-sm text-blue-600 font-medium mb-1">{item.organization}</p>
                
                {/* Department */}
                {item.department && (
                  <p className="text-xs text-slate-500 mb-2">{item.department}</p>
                )}
                
                {/* Location */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
                  <MapPin size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-500">{item.location}</span>
                </div>
                
                {/* Type badge */}
                <div className={`mt-3 inline-block text-xs font-medium px-2 py-1 rounded-full border ${getTypeBadgeColor(item.type, item.current)}`}>
                  {item.type === 'academic' ? 'Academic' : item.type === 'education' ? 'Education' : 'Industry'}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-slate-600">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-600">Academic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-slate-600">Education</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-600">Industry</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
