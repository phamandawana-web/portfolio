import React from 'react';
import { Mail, MapPin, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { profileData, newsData } from '../mockData';

const Contact = () => {
  return (
    <section id="contact" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Contact & News</h2>
          <div className="w-24 h-1 bg-teal-600 mx-auto"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div>
            <Card className="border-none shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-800">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="text-teal-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-slate-700">Email</p>
                    <a href={`mailto:${profileData.email}`} className="text-teal-600 hover:text-teal-700">
                      {profileData.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="text-teal-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-slate-700">Office</p>
                    <p className="text-slate-600">{profileData.office}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="text-teal-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-slate-700">Office Hours</p>
                    <p className="text-slate-600">{profileData.officeHours}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Profiles */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-800">Academic Profiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profileData.socialLinks.googleScholar !== '#' && (
                  <Button variant="outline" className="w-full justify-start text-left" asChild>
                    <a href={profileData.socialLinks.googleScholar} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2" size={16} />
                      Google Scholar
                    </a>
                  </Button>
                )}
                {profileData.socialLinks.researchGate !== '#' && (
                  <Button variant="outline" className="w-full justify-start text-left" asChild>
                    <a href={profileData.socialLinks.researchGate} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2" size={16} />
                      ResearchGate
                    </a>
                  </Button>
                )}
                {profileData.socialLinks.linkedin !== '#' && (
                  <Button variant="outline" className="w-full justify-start text-left" asChild>
                    <a href={profileData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2" size={16} />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {profileData.socialLinks.github !== '#' && (
                  <Button variant="outline" className="w-full justify-start text-left" asChild>
                    <a href={profileData.socialLinks.github} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2" size={16} />
                      GitHub
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent News */}
          <div>
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-800">Recent News</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {newsData.map((news) => (
                    <div key={news.id} className="pb-6 border-b border-slate-200 last:border-0">
                      <p className="text-sm text-teal-600 font-semibold mb-2">{news.date}</p>
                      <h4 className="font-semibold text-slate-800 mb-1">{news.title}</h4>
                      <p className="text-slate-600 text-sm">{news.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prospective Students */}
            <Card className="mt-6 border-none shadow-lg bg-teal-50">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Prospective Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">
                  If you are interested in working with me as a PhD or MS student, please email me with:
                </p>
                <ul className="mt-3 space-y-1 text-slate-700">
                  <li>• Your CV</li>
                  <li>• Research interests</li>
                  <li>• Why our research aligns</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;