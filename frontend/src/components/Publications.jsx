import React, { useState } from 'react';
import { FileText, ExternalLink, Code, Database, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { researchData } from '../mockData';

const Publications = () => {
  const [filter, setFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  const publications = researchData.publications;
  const years = [...new Set(publications.map(p => p.year))].sort((a, b) => b - a);

  const filteredPublications = publications.filter(pub => {
    const typeMatch = filter === 'all' || pub.type === filter;
    const yearMatch = yearFilter === 'all' || pub.year.toString() === yearFilter;
    return typeMatch && yearMatch;
  });

  const publicationTypes = [
    { value: 'all', label: 'All' },
    { value: 'journal', label: 'Journals' },
    { value: 'conference', label: 'Conferences' },
    { value: 'preprint', label: 'Preprints' }
  ];

  return (
    <section id="publications" className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Publications</h2>
          <div className="w-24 h-1 bg-teal-600 mx-auto"></div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-600" />
            <span className="font-semibold text-slate-700">Filter by:</span>
          </div>
          
          {/* Type Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {publicationTypes.map(type => (
              <Button
                key={type.value}
                variant={filter === type.value ? 'default' : 'outline'}
                className={filter === type.value ? 'bg-teal-600 hover:bg-teal-700' : ''}
                onClick={() => setFilter(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </div>

          {/* Year Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={yearFilter === 'all' ? 'default' : 'outline'}
              className={yearFilter === 'all' ? 'bg-teal-600 hover:bg-teal-700' : ''}
              onClick={() => setYearFilter('all')}
            >
              All Years
            </Button>
            {years.map(year => (
              <Button
                key={year}
                variant={yearFilter === year.toString() ? 'default' : 'outline'}
                className={yearFilter === year.toString() ? 'bg-teal-600 hover:bg-teal-700' : ''}
                onClick={() => setYearFilter(year.toString())}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>

        {/* Publications List */}
        <div className="space-y-6">
          {filteredPublications.map((pub) => (
            <Card key={pub.id} className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        className={
                          pub.type === 'journal' ? 'bg-blue-600' :
                          pub.type === 'conference' ? 'bg-purple-600' :
                          'bg-amber-600'
                        }
                      >
                        {pub.type.charAt(0).toUpperCase() + pub.type.slice(1)}
                      </Badge>
                      <Badge variant="outline">{pub.year}</Badge>
                    </div>
                    <CardTitle className="text-xl text-slate-800 mb-2">
                      {pub.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {pub.authors}
                    </CardDescription>
                    <p className="text-slate-600 italic mt-1">{pub.venue}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {pub.links.pdf && (
                    <Button variant="outline" size="sm" className="text-teal-600 hover:text-teal-700">
                      <FileText className="mr-2" size={14} />
                      PDF
                    </Button>
                  )}
                  {pub.links.arxiv && (
                    <Button variant="outline" size="sm" className="text-teal-600 hover:text-teal-700">
                      <ExternalLink className="mr-2" size={14} />
                      arXiv
                    </Button>
                  )}
                  {pub.links.code && (
                    <Button variant="outline" size="sm" className="text-teal-600 hover:text-teal-700">
                      <Code className="mr-2" size={14} />
                      Code
                    </Button>
                  )}
                  {pub.links.dataset && (
                    <Button variant="outline" size="sm" className="text-teal-600 hover:text-teal-700">
                      <Database className="mr-2" size={14} />
                      Dataset
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPublications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No publications found with the selected filters.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Publications;