import React from 'react';
import { Mail, MapPin, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { profileData } from '../mockData';

const Contact = () => {
  return (
    <section id="contact" className="py-20 px-6 bg-gray-800">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">Contact</h2>
          <div className="w-24 h-1 bg-teal-500 mx-auto"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <Card className="border-none shadow-lg bg-gray-900">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-100">Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="text-teal-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-gray-300">Email</p>
                  <a href={`mailto:${profileData.email}`} className="text-teal-400 hover:text-teal-300">
                    {profileData.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="text-teal-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-gray-300">Office</p>
                  <p className="text-gray-400">{profileData.office}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="text-teal-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-gray-300">Office Hours</p>
                  <p className="text-gray-400">{profileData.officeHours}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Profiles & Prospective Students */}
          <div className="space-y-6">
            <Card className="border-none shadow-lg bg-gray-900">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-100">Academic Profiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profileData.socialLinks.googleScholar !== '#' && (
                  <Button variant="outline" className="w-full justify-start text-left border-gray-600 text-gray-300 hover:bg-gray-800" asChild>
                    <a href={profileData.socialLinks.googleScholar} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2" size={16} />
                      Google Scholar
                    </a>
                  </Button>
                )}
                {profileData.socialLinks.researchGate !== '#' && (
                  <Button variant="outline" className="w-full justify-start text-left border-gray-600 text-gray-300 hover:bg-gray-800" asChild>
                    <a href={profileData.socialLinks.researchGate} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2" size={16} />
                      ResearchGate
                    </a>
                  </Button>
                )}
                {profileData.socialLinks.linkedin !== '#' && (
                  <Button variant="outline" className="w-full justify-start text-left border-gray-600 text-gray-300 hover:bg-gray-800" asChild>
                    <a href={profileData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2" size={16} />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {profileData.socialLinks.github !== '#' && (
                  <Button variant="outline" className="w-full justify-start text-left border-gray-600 text-gray-300 hover:bg-gray-800" asChild>
                    <a href={profileData.socialLinks.github} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2" size={16} />
                      GitHub
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Prospective Students */}
            <Card className="border-none shadow-lg bg-teal-900/30 border border-teal-800">
              <CardHeader>
                <CardTitle className="text-xl text-gray-100">Prospective Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  If you are interested in working with me as a PhD or MS student, please email me with:
                </p>
                <ul className="mt-3 space-y-1 text-gray-300">
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
