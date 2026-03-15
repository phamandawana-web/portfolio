import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const getStudentId = () => {
  let studentId = localStorage.getItem('studentId');
  if (!studentId) {
    studentId = 'student_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('studentId', studentId);
  }
  return studentId;
};

const CoursePage = () => {
  const { courseSlug } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
    fetchProgress();
  }, [courseSlug]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`${API}/courses/${courseSlug}`);
      setCourse(response.data);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const studentId = getStudentId();
      const response = await axios.get(`${API}/courses/progress/${studentId}`);
      setProgress(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const isTopicCompleted = (topicId) => {
    return progress.some(p => p.topic_id === topicId && p.completed);
  };

  const completedCount = course?.topics_data?.filter(t => isTopicCompleted(t.id)).length || 0;
  const totalTopics = course?.topics_data?.length || 0;
  const progressPercent = totalTopics > 0 ? (completedCount / totalTopics) * 100 : 0;

  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    teal: 'from-teal-500 to-teal-600'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className={`bg-gradient-to-r ${colorMap[course.color] || colorMap.blue} text-white py-16 px-6`}>
        <div className="max-w-6xl mx-auto">
          <Link 
            to="/coursework" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Coursework
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-white/90 mb-8">{course.description}</p>
            
            {/* Progress */}
            <div className="bg-white/20 backdrop-blur rounded-xl p-6 max-w-md">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Your Progress</span>
                <span className="text-sm">{completedCount} / {totalTopics} topics</span>
              </div>
              <Progress value={progressPercent} className="h-3 bg-white/30" />
              <p className="text-sm mt-2 text-white/80">
                {progressPercent === 100 ? 'Course completed! 🎉' : `${Math.round(progressPercent)}% complete`}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Topics List */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <BookOpen className="text-blue-600" />
          Course Topics
        </h2>

        <div className="space-y-4">
          {course.topics_data?.map((topic, index) => {
            const completed = isTopicCompleted(topic.id);
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/coursework/${courseSlug}/${topic.slug}`}>
                  <Card className={`border-2 hover:shadow-lg transition-all cursor-pointer ${
                    completed ? 'border-green-200 bg-green-50/50' : 'border-slate-100 hover:border-blue-200'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          completed ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {completed ? <CheckCircle2 size={20} /> : <span className="font-bold">{index + 1}</span>}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg text-slate-900">{topic.title}</CardTitle>
                        </div>
                        {completed && (
                          <Badge className="bg-green-100 text-green-700">Completed</Badge>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
