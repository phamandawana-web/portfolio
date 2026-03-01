import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Shield, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { serviceData } from '../mockData';

const Service = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="service" className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-sm font-semibold text-indigo-600 tracking-wider uppercase mb-4">Community</span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Service & Activities</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Contributing to the academic community through peer review, editorial work, and committee service.</p>
        </motion.div>

        <motion.div 
          className="grid lg:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Reviewing */}
          <motion.div variants={itemVariants}>
            <Card className="h-full border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Shield className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900">Reviewing</CardTitle>
                    <CardDescription className="text-slate-500">Peer review for journals and conferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {serviceData.reviewing.map((venue, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                      <CheckCircle2 className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                      <span className="text-slate-700">{venue}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Program Committees */}
          <motion.div variants={itemVariants}>
            <Card className="h-full border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Users className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900">Program Committees</CardTitle>
                    <CardDescription className="text-slate-500">Conference and workshop organization</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceData.programCommittees.map((committee, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-purple-50/50 border border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-purple-100 text-purple-700 border-0">
                          {committee.year}
                        </Badge>
                        <span className="font-semibold text-slate-900">{committee.role}</span>
                      </div>
                      <p className="text-slate-600 text-sm">{committee.venue}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Editorial Roles */}
          <motion.div variants={itemVariants}>
            <Card className="h-full border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Calendar className="text-teal-600" size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900">Editorial Roles</CardTitle>
                    <CardDescription className="text-slate-500">Journal editorial positions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceData.editorial.map((role, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-teal-50/50 border border-teal-100">
                      <span className="font-semibold text-slate-900 block">{role.role}</span>
                      <span className="text-slate-600 text-sm">{role.venue}</span>
                      <Badge variant="outline" className="mt-2 text-xs border-teal-200 text-teal-700">{role.period}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Departmental Service */}
          <motion.div variants={itemVariants}>
            <Card className="h-full border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Users className="text-amber-600" size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900">Departmental Service</CardTitle>
                    <CardDescription className="text-slate-500">University and department committees</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {serviceData.departmental.map((service, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-amber-50 transition-colors">
                      <CheckCircle2 className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
                      <span className="text-slate-700">{service}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Service;
