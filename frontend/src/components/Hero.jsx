import React from 'react';
import { FileDown, Mail, GraduationCap } from 'lucide-react';
import { Button } from './ui/button';
import { profileData } from '../mockData';

const Hero = () => {
  return (
    <section id="home" className="pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500 rounded-full blur-2xl opacity-20"></div>
              <img
                src={profileData.profileImage}
                alt={profileData.name}
                className="relative w-64 h-64 rounded-full object-cover border-4 border-white shadow-xl"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-4">
              {profileData.name}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <GraduationCap className="text-teal-600" size={24} />
              <p className="text-2xl text-slate-600">{profileData.title}</p>
            </div>
            <p className="text-lg text-slate-500 mb-2">{profileData.department}</p>
            <p className="text-lg text-slate-500 mb-6">{profileData.university}</p>
            
            <p className="text-lg text-slate-700 leading-relaxed mb-8 max-w-2xl">
              {profileData.bio}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button 
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-6 text-base"
                onClick={() => window.open(profileData.cv, '_blank')}
              >
                <FileDown className="mr-2" size={18} />
                Download CV
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 px-6 py-6 text-base"
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
              >
                <Mail className="mr-2" size={18} />
                Contact Me
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;