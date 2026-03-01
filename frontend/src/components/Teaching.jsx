import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ExternalLink, Code, BookOpen, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { teachingData } from '../mockData';

const Teaching = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="teaching" className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-sm font-semibold text-teal-600 tracking-wider uppercase mb-4">Education</span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Teaching</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Committed to educating the next generation of computer scientists and researchers.</p>
        </motion.div>

        {/* Teaching Philosophy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-16 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-teal-50 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-teal-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white">
                  <BookOpen size={24} />
                </div>
                <CardTitle className="text-2xl text-slate-900">{teachingData.philosophy.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-slate-700 leading-relaxed mb-6 text-lg">
                {teachingData.philosophy.content}
              </p>
              <Button 
                variant="outline" 
                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => window.open(teachingData.philosophy.statementPdf, '_blank')}
                data-testid="teaching-statement-btn"
              >
                <FileText className="mr-2" size={16} />
                Download Full Teaching Statement
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Courses Taught */}
        <div className="mb-16">
          <motion.h3 
            className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-teal-500 rounded-full" />
            Courses Taught
          </motion.h3>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {teachingData.courses.map((course) => (
              <motion.div key={course.id} variants={itemVariants}>
                <Card className="h-full border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 card-hover bg-white">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <CardTitle className="text-xl text-slate-900">{course.title}</CardTitle>
                        <CardDescription className="text-base mt-1 text-slate-500">{course.code}</CardDescription>
                      </div>
                      <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-200 border-0">
                        {course.level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-5">{course.description}</p>
                    
                    <div className="mb-5">
                      <p className="font-semibold text-slate-800 mb-2 text-sm uppercase tracking-wide">Topics</p>
                      <div className="flex flex-wrap gap-2">
                        {course.topics.map((topic, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs border-slate-200 text-slate-600 bg-slate-50">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mb-5">
                      <p className="font-semibold text-slate-800 mb-2 text-sm uppercase tracking-wide">Tools</p>
                      <div className="flex flex-wrap gap-2">
                        {course.tools.map((tool, idx) => (
                          <Badge key={idx} className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0">
                            <Code className="mr-1" size={12} />
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      variant="link" 
                      className="text-blue-600 hover:text-blue-700 p-0"
                      onClick={() => window.open(course.syllabus, '_blank')}
                      data-testid={`course-syllabus-${course.id}`}
                    >
                      <FileText className="mr-2" size={16} />
                      View Syllabus
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Student Projects */}
        <div className="mb-16">
          <motion.h3 
            className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
            Student Projects
          </motion.h3>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {teachingData.studentProjects.map((project) => (
              <motion.div key={project.id} variants={itemVariants}>
                <Card className="h-full border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 card-hover bg-white">
                  <CardHeader>
                    <Badge className="w-fit bg-gradient-to-r from-blue-600 to-blue-700 text-white mb-3">{project.type}</Badge>
                    <CardTitle className="text-lg text-slate-900">{project.title}</CardTitle>
                    <CardDescription className="text-slate-500">
                      {project.student} • {project.year}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4 text-sm">{project.description}</p>
                    <Button 
                      variant="link" 
                      className="text-blue-600 hover:text-blue-700 p-0 text-sm"
                      onClick={() => window.open(project.link, '_blank')}
                      data-testid={`student-project-${project.id}`}
                    >
                      <ExternalLink className="mr-2" size={14} />
                      View Project
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Prospective Students CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-teal-500 to-blue-600 text-white overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="text-white/90" size={28} />
                <CardTitle className="text-2xl text-white">Prospective Students</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 leading-relaxed text-lg">
                I am always looking for motivated PhD and MS students interested in storage systems, big data, and machine learning. 
                If you are interested in working with me, please send me an email with your CV, 
                research interests, and why you think our research goals align.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default Teaching;
