import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar, ArrowRight } from 'lucide-react';
import { newsData } from '../mockData';

const News = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="news" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-sm font-semibold text-blue-600 tracking-wider uppercase mb-4">Latest Updates</span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Recent News</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Stay updated with my latest research activities, publications, and academic achievements.</p>
        </motion.div>

        {/* News Cards */}
        <motion.div 
          className="grid md:grid-cols-1 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {newsData.map((news, index) => (
            <motion.div key={news.id} variants={itemVariants}>
              <Card className="group border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-500 overflow-hidden bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-3">
                    <Calendar size={16} />
                    <span className="text-sm font-semibold">{news.date}</span>
                  </div>
                  <CardTitle className="text-xl lg:text-2xl text-slate-900 group-hover:text-blue-700 transition-colors duration-300">
                    {news.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-6 leading-relaxed text-base">{news.description}</p>
                  
                  {/* Diagram */}
                  {news.diagram && (
                    <div className="mt-6">
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex justify-center p-6">
                        {news.diagram.endsWith('.pdf') ? (
                          <a 
                            href={news.diagram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors"
                            data-testid={`news-diagram-pdf-${news.id}`}
                          >
                            <div className="w-20 h-20 rounded-xl bg-blue-50 flex items-center justify-center">
                              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="font-medium flex items-center gap-2">
                              View Diagram <ArrowRight size={16} />
                            </span>
                          </a>
                        ) : (
                          <img 
                            src={news.diagram} 
                            alt={`${news.title} diagram`}
                            className="max-w-3xl w-full h-auto object-contain rounded-lg"
                            style={{ maxHeight: '500px' }}
                            data-testid={`news-diagram-img-${news.id}`}
                          />
                        )}
                      </div>
                      {news.diagramCaption && (
                        <p className="text-sm text-slate-500 italic mt-4 leading-relaxed bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500">
                          <span className="font-semibold text-slate-700 not-italic">Figure: </span>
                          {news.diagramCaption}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default News;
