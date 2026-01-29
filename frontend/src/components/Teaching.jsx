import React from 'react';
import { FileText, ExternalLink, Code } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { teachingData } from '../mockData';

const Teaching = () => {
  return (
    <section id="teaching" className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Teaching</h2>
          <div className="w-24 h-1 bg-teal-600 mx-auto"></div>
        </div>

        {/* Teaching Philosophy */}
        <Card className="mb-12 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800">{teachingData.philosophy.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed mb-4">
              {teachingData.philosophy.content}
            </p>
            <Button variant="link" className="text-teal-600 hover:text-teal-700 p-0">
              <FileText className="mr-2" size={16} />
              Download Full Teaching Statement (PDF)
            </Button>
          </CardContent>
        </Card>

        {/* Courses Taught */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-slate-800 mb-8">Courses Taught</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {teachingData.courses.map((course) => (
              <Card key={course.id} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <CardTitle className="text-xl text-slate-800">{course.title}</CardTitle>
                      <CardDescription className="text-base mt-1">{course.code}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                      {course.level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">{course.description}</p>
                  
                  <div className="mb-4">
                    <p className="font-semibold text-slate-700 mb-2">Topics Covered:</p>
                    <div className="flex flex-wrap gap-2">
                      {course.topics.map((topic, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="font-semibold text-slate-700 mb-2">Tools & Languages:</p>
                    <div className="flex flex-wrap gap-2">
                      {course.tools.map((tool, idx) => (
                        <Badge key={idx} className="bg-slate-200 text-slate-700">
                          <Code className="mr-1" size={12} />
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button variant="link" className="text-teal-600 hover:text-teal-700 p-0">
                    <FileText className="mr-2" size={16} />
                    View Syllabus
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Student Projects */}
        <div>
          <h3 className="text-3xl font-bold text-slate-800 mb-8">Student Projects & Outcomes</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {teachingData.studentProjects.map((project) => (
              <Card key={project.id} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <Badge className="w-fit bg-teal-600 text-white mb-2">{project.type}</Badge>
                  <CardTitle className="text-lg text-slate-800">{project.title}</CardTitle>
                  <CardDescription>
                    {project.student} • {project.year}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-3">{project.description}</p>
                  <Button variant="link" className="text-teal-600 hover:text-teal-700 p-0">
                    <ExternalLink className="mr-2" size={14} />
                    View Project
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mentoring Info */}
        <Card className="mt-12 border-none shadow-lg bg-teal-50">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800">Prospective Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">
              I am always looking for motivated PhD and MS students interested in [research areas]. 
              If you are interested in working with me, please send me an email with your CV, 
              research interests, and why you think our research goals align.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Teaching;