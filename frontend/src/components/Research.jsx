import React from 'react';
import { FileText, Code, Database, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { researchData } from '../mockData';

const Research = () => {
  return (
    <section id="research" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Research</h2>
          <div className="w-24 h-1 bg-teal-600 mx-auto"></div>
        </div>

        {/* Research Overview */}
        <Card className="mb-12 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800">Research Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 text-lg leading-relaxed">
              {researchData.overview}
            </p>
          </CardContent>
        </Card>

        {/* Research Areas */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-slate-800 mb-8">Research Areas</h3>
          <div className="space-y-6">
            {researchData.areas.map((area) => (
              <Card key={area.id} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-2xl text-slate-800">{area.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed mb-4">{area.description}</p>
                  
                  <div className="mb-4">
                    <p className="font-semibold text-slate-700 mb-2">Key Methods:</p>
                    <div className="flex flex-wrap gap-2">
                      {area.methods.map((method, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-slate-100">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-slate-500">
                    Representative publications: {area.publications.join(', ')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Ongoing Projects */}
        <div>
          <h3 className="text-3xl font-bold text-slate-800 mb-8">Ongoing Projects</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {researchData.ongoingProjects.map((project) => (
              <Card key={project.id} className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">{project.title}</CardTitle>
                  <CardDescription className="text-base">
                    {project.funding}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 mb-3">{project.description}</p>
                  
                  <div className="mb-3">
                    <p className="font-semibold text-slate-700 mb-1 text-sm">Collaborators:</p>
                    <p className="text-slate-600 text-sm">{project.collaborators.join(', ')}</p>
                  </div>

                  <div className="flex items-center text-sm text-slate-500">
                    <span className="font-semibold mr-2">Expected Completion:</span>
                    {project.expectedCompletion}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Research;