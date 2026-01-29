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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsData.map((news) => (
            <Card key={news.id} className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <p className="text-sm text-teal-600 font-semibold mb-2">{news.date}</p>
                <CardTitle className="text-lg text-slate-800">{news.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{news.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default News;
