import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Users, Award, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { labData } from '../mockData';

const Lab = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="lab" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-sm font-semibold text-teal-600 tracking-wider uppercase mb-4">Our Team</span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Lab & Students</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Meet the talented individuals driving innovation in our research lab.</p>
        </motion.div>

        {/* Lab Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="mb-16 border-0 shadow-lg bg-gradient-to-br from-teal-50 to-blue-50 overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-teal-400/10 to-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-blue-600 flex items-center justify-center text-white">
                  <Users size={24} />
                </div>
                <CardTitle className="text-2xl text-slate-900">Our Lab Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-slate-700 text-lg leading-relaxed">
                {labData.mission}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Members */}
        <div className="mb-16">
          <motion.h3 
            className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="w-1.5 h-8 bg-gradient-to-b from-teal-500 to-blue-500 rounded-full" />
            Current Members
          </motion.h3>
          
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {labData.currentMembers.map((member) => (
              <motion.div key={member.id} variants={itemVariants}>
                <Card className="h-full border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 card-hover bg-white group overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-teal-500/10 to-blue-500/10" />
                  <CardHeader className="text-center relative pt-8">
                    <div className="relative inline-block mx-auto mb-4">
                      <Avatar className="w-28 h-28 border-4 border-white shadow-lg">
                        <AvatarImage src={member.image} alt={member.name} />
                        <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-500 text-white text-xl font-bold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                    <CardTitle className="text-lg text-slate-900">{member.name}</CardTitle>
                    <CardDescription>
                      <Badge className="bg-teal-100 text-teal-700 border-0 mt-2">
                        {member.role}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{member.interests}</p>
                    {member.website !== '#' && (
                      <a 
                        href={member.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        data-testid={`member-website-${member.id}`}
                      >
                        <ExternalLink size={14} className="mr-1" />
                        Website
                      </a>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Alumni */}
        <div className="mb-16">
          <motion.h3 
            className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="w-1.5 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
            Alumni
          </motion.h3>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border border-slate-100 shadow-sm bg-white">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {labData.alumni.map((alumnus, idx) => (
                    <motion.div 
                      key={idx} 
                      className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white hover:from-amber-50 hover:to-white transition-all duration-300 border border-transparent hover:border-amber-100"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
                        <Award size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{alumnus.name}</h4>
                        <p className="text-sm text-slate-500">{alumnus.degree}</p>
                        <p className="text-sm text-blue-600 mt-1 font-medium">{alumnus.currentPosition}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Lab Activities */}
        <div>
          <motion.h3 
            className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
            Lab Activities
          </motion.h3>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border border-slate-100 shadow-sm bg-white">
              <CardContent className="pt-6">
                <ul className="grid md:grid-cols-2 gap-4">
                  {labData.activities.map((activity, idx) => (
                    <motion.li 
                      key={idx} 
                      className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 hover:bg-purple-50 transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      <Sparkles className="text-purple-500 flex-shrink-0 mt-0.5" size={18} />
                      <span className="text-slate-700">{activity}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Lab;
