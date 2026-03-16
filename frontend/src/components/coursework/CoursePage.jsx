import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Clock, FileQuestion, MessageSquare, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const CoursePage = () => {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/coursework/login');
      return;
    }
    if (user) {
      fetchCourse();
      fetchProgress();
    }
  }, [courseSlug, user, authLoading, navigate]);

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
      const response = await axios.get(`${API}/courses/progress/${user?.user_id}`);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 transition-colors">
      {/* Header */}
      <div className={`bg-gradient-to-r ${colorMap[course.color] || colorMap.blue} text-white py-12 md:py-16 px-4 md:px-6`}>
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
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg md:text-xl text-white/90 mb-6">{course.description}</p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Link to={`/coursework/${courseSlug}/quizzes`}>
                <Button className="bg-white/20 hover:bg-white/30 text-white gap-2">
                  <FileQuestion size={18} />
                  Quizzes
                </Button>
              </Link>
              <Link to={`/coursework/${courseSlug}/forums`}>
                <Button className="bg-white/20 hover:bg-white/30 text-white gap-2">
                  <MessageSquare size={18} />
                  Forums
                </Button>
              </Link>
              {(user?.role === 'admin' || user?.role === 'instructor') && (
                <Link to={`/coursework/${courseSlug}/quiz-manager`}>
                  <Button className="bg-white/20 hover:bg-white/30 text-white gap-2">
                    <Settings size={18} />
                    Manage Quizzes
                  </Button>
                </Link>
              )}
            </div>
            
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
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
          <BookOpen className="text-blue-600 dark:text-blue-400" />
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
                    completed 
                      ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/30' 
                      : 'border-slate-100 hover:border-blue-200 dark:border-slate-700 dark:hover:border-blue-600 dark:bg-slate-800'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          completed 
                            ? 'bg-green-500 text-white' 
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {completed ? <CheckCircle2 size={20} /> : <span className="font-bold">{index + 1}</span>}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg text-slate-900 dark:text-white">{topic.title}</CardTitle>
                        </div>
                        {completed && (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Completed</Badge>
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
