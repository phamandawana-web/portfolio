import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Target, Cpu, FlaskConical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { researchData } from '../mockData';

const Research = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const icons = [Cpu, FlaskConical, Lightbulb, Target];

  return (
    <section id="research" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-sm font-semibold text-purple-600 tracking-wider uppercase mb-4">Exploration</span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Research</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Pushing the boundaries of knowledge in storage systems, big data, and machine learning.</p>
        </motion.div>

        {/* Research Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="mb-16 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50 overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white">
                  <Lightbulb size={24} />
                </div>
                <CardTitle className="text-2xl text-slate-900">Research Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-slate-700 text-lg leading-relaxed">
                {researchData.overview}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Research Areas */}
        <div className="mb-16">
          <motion.h3 
            className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
            Research Areas
          </motion.h3>
          
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {researchData.areas.map((area, index) => {
              const IconComponent = icons[index % icons.length];
              return (
                <motion.div key={area.id} variants={itemVariants}>
                  <Card className="border border-slate-100 shadow-sm hover:shadow-xl hover:border-purple-100 transition-all duration-500 bg-white overflow-hidden group">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-purple-600 group-hover:from-purple-500 group-hover:to-blue-500 group-hover:text-white transition-all duration-300">
                          <IconComponent size={28} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl text-slate-900 mb-2">{area.title}</CardTitle>
                          <p className="text-slate-600 leading-relaxed">{area.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="ml-[72px]">
                        <p className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wide">Key Methods</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {area.methods.map((method, idx) => (
                            <Badge key={idx} className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0">
                              {method}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-slate-500">
                          <span className="font-medium">Representative publications:</span> {area.publications.join(', ')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Ongoing Projects */}
        <div>
          <motion.h3 
            className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="w-1.5 h-8 bg-gradient-to-b from-teal-500 to-blue-500 rounded-full" />
            Ongoing Projects
          </motion.h3>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {researchData.ongoingProjects.map((project) => (
              <motion.div key={project.id} variants={itemVariants}>
                <Card className="h-full border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 card-hover bg-white">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="text-teal-600" size={20} />
                      <Badge className="bg-teal-100 text-teal-700 border-0">Active</Badge>
                    </div>
                    <CardTitle className="text-xl text-slate-900">{project.title}</CardTitle>
                    <CardDescription className="text-base text-blue-600 font-medium">
                      {project.funding}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">{project.description}</p>
                    
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                      <p className="font-semibold text-slate-700 mb-1 text-sm">Collaborators</p>
                      <p className="text-slate-600 text-sm">{project.collaborators.join(', ')}</p>
                    </div>

                    <div className="flex items-center text-sm">
                      <span className="font-semibold text-slate-700 mr-2">Expected Completion:</span>
                      <span className="text-slate-500">{project.expectedCompletion}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Research;
