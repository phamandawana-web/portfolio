import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { newsData } from '../mockData';

const News = () => {
  return (
    <section id="news" className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Recent News</h2>
          <div className="w-24 h-1 bg-teal-600 mx-auto"></div>
        </div>

        {/* News Cards */}
        <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-8">
          {newsData.map((news) => (
            <Card key={news.id} className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <p className="text-sm text-teal-600 font-semibold mb-2">{news.date}</p>
                <CardTitle className="text-xl text-slate-800">{news.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4 leading-relaxed">{news.description}</p>
                
                {/* Diagram */}
                {news.diagram && (
                  <div className="mt-4">
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex justify-center p-4">
                      {news.diagram.endsWith('.pdf') ? (
                        <div className="w-full h-96 flex items-center justify-center bg-slate-100">
                          <a 
                            href={news.diagram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-teal-600 hover:text-teal-700 font-semibold flex flex-col items-center gap-2"
                          >
                            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            Click to view diagram (PDF)
                          </a>
                        </div>
                      ) : (
                        <img 
                          src={news.diagram} 
                          alt={`${news.title} diagram`}
                          className="max-w-3xl w-full h-auto object-contain"
                          style={{ maxHeight: '500px' }}
                        />
                      )}
                    </div>
                    {news.diagramCaption && (
                      <p className="text-sm text-slate-600 italic mt-3 leading-relaxed">
                        <span className="font-semibold text-slate-700">Figure: </span>
                        {news.diagramCaption}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default News;
