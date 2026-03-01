import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Clock, ExternalLink, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { profileData } from '../mockData';

const Contact = () => {
  return (
    <section id="contact" className="py-24 px-6 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/5 to-teal-400/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-purple-400/5 to-blue-400/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-sm font-semibold text-blue-600 tracking-wider uppercase mb-4">Get in Touch</span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Contact</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Interested in collaboration or have questions? Feel free to reach out.</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border border-slate-100 shadow-lg bg-white h-full">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Send className="text-blue-600" size={20} />
                  </div>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div 
                  className="flex items-start gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100 hover:bg-blue-50 transition-colors"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="text-blue-600" size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">Email</p>
                    <a 
                      href={`mailto:${profileData.email}`} 
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      data-testid="contact-email"
                    >
                      {profileData.email}
                    </a>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-start gap-4 p-4 rounded-xl bg-teal-50/50 border border-teal-100 hover:bg-teal-50 transition-colors"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-teal-600" size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">Office</p>
                    <p className="text-slate-600">{profileData.office}</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-start gap-4 p-4 rounded-xl bg-purple-50/50 border border-purple-100 hover:bg-purple-50 transition-colors"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="text-purple-600" size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">Office Hours</p>
                    <p className="text-slate-600">{profileData.officeHours}</p>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Academic Profiles */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border border-slate-100 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">Academic Profiles</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  {profileData.socialLinks.googleScholar !== '#' && (
                    <Button 
                      variant="outline" 
                      className="justify-start text-left border-slate-200 hover:bg-slate-50 hover:border-slate-300" 
                      asChild
                    >
                      <a href={profileData.socialLinks.googleScholar} target="_blank" rel="noopener noreferrer" data-testid="link-scholar">
                        <ExternalLink className="mr-2" size={16} />
                        Google Scholar
                      </a>
                    </Button>
                  )}
                  {profileData.socialLinks.researchGate !== '#' && (
                    <Button 
                      variant="outline" 
                      className="justify-start text-left border-slate-200 hover:bg-slate-50 hover:border-slate-300" 
                      asChild
                    >
                      <a href={profileData.socialLinks.researchGate} target="_blank" rel="noopener noreferrer" data-testid="link-researchgate">
                        <ExternalLink className="mr-2" size={16} />
                        ResearchGate
                      </a>
                    </Button>
                  )}
                  {profileData.socialLinks.linkedin !== '#' && (
                    <Button 
                      variant="outline" 
                      className="justify-start text-left border-slate-200 hover:bg-slate-50 hover:border-slate-300" 
                      asChild
                    >
                      <a href={profileData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" data-testid="link-linkedin">
                        <ExternalLink className="mr-2" size={16} />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {profileData.socialLinks.github !== '#' && (
                    <Button 
                      variant="outline" 
                      className="justify-start text-left border-slate-200 hover:bg-slate-50 hover:border-slate-300" 
                      asChild
                    >
                      <a href={profileData.socialLinks.github} target="_blank" rel="noopener noreferrer" data-testid="link-github">
                        <ExternalLink className="mr-2" size={16} />
                        GitHub
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Prospective Students CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-teal-600 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <CardHeader className="relative">
                  <CardTitle className="text-xl text-white">Prospective Students</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-white/90 mb-4">
                    Interested in joining our research group? Please email me with:
                  </p>
                  <ul className="space-y-2 text-white/90">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      Your CV/Resume
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      Research interests
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      Why our research aligns
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
