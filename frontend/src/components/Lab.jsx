import React from 'react';
import { ExternalLink, Users, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { labData } from '../mockData';

const Lab = () => {
  return (
    <section id="lab" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Lab & Students</h2>
          <div className="w-24 h-1 bg-teal-600 mx-auto"></div>
        </div>

        {/* Lab Mission */}
        <Card className="mb-12 border-none shadow-lg bg-teal-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="text-teal-600" size={24} />
              <CardTitle className="text-2xl text-slate-800">Our Lab Mission</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 text-lg leading-relaxed">
              {labData.mission}
            </p>
          </CardContent>
        </Card>

        {/* Current Members */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-slate-800 mb-8">Current Members</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {labData.currentMembers.map((member) => (
              <Card key={member.id} className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader className="text-center">
                  <Avatar className="w-32 h-32 mx-auto mb-4">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg text-slate-800">{member.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                      {member.role}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 text-sm mb-3">{member.interests}</p>
                  {member.website !== '#' && (
                    <a 
                      href={member.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-700 text-sm inline-flex items-center"
                    >
                      <ExternalLink size={14} className="mr-1" />
                      Website
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Alumni */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-slate-800 mb-8">Alumni</h3>
          <Card className="border-none shadow-lg">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {labData.alumni.map((alumnus, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <Award className="text-teal-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <h4 className="font-semibold text-slate-800">{alumnus.name}</h4>
                      <p className="text-sm text-slate-600">{alumnus.degree}</p>
                      <p className="text-sm text-slate-500 mt-1">{alumnus.currentPosition}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lab Activities */}
        <div>
          <h3 className="text-3xl font-bold text-slate-800 mb-8">Lab Activities</h3>
          <Card className="border-none shadow-lg">
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {labData.activities.map((activity, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-700">{activity}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Lab;