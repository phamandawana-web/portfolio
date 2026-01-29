import React from 'react';
import { CheckCircle2, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { serviceData } from '../mockData';

const Service = () => {
  return (
    <section id="service" className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Service & Activities</h2>
          <div className="w-24 h-1 bg-teal-600 mx-auto"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Reviewing */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-800">Reviewing</CardTitle>
              <CardDescription>Peer review for journals and conferences</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {serviceData.reviewing.map((venue, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-slate-700">{venue}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Program Committees */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-800">Program Committees</CardTitle>
              <CardDescription>Conference and workshop organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceData.programCommittees.map((committee, idx) => (
                  <div key={idx} className="pb-4 border-b border-slate-200 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                        {committee.year}
                      </Badge>
                      <span className="font-semibold text-slate-800">{committee.role}</span>
                    </div>
                    <p className="text-slate-600 text-sm">{committee.venue}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Editorial Roles */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-800">Editorial Roles</CardTitle>
              <CardDescription>Journal editorial positions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceData.editorial.map((role, idx) => (
                  <div key={idx} className="pb-4 border-b border-slate-200 last:border-0">
                    <div className="flex items-start gap-2 mb-1">
                      <Calendar className="text-teal-600 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <span className="font-semibold text-slate-800 block">{role.role}</span>
                        <span className="text-slate-600 text-sm">{role.venue}</span>
                        <span className="text-slate-500 text-sm block">{role.period}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Departmental Service */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-800">Departmental Service</CardTitle>
              <CardDescription>University and department committees</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {serviceData.departmental.map((service, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-slate-700">{service}</span>
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

export default Service;