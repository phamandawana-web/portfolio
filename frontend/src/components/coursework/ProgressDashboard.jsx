import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BookOpen, Award, TrendingUp, CheckCircle, 
  Clock, FileQuestion, Download, Trophy, BarChart3,
  ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const colorMap = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  teal: 'from-teal-500 to-teal-600'
};

const ProgressDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState({});
  const [generating, setGenerating] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/coursework/login');
      return;
    }
    if (user) {
      fetchDashboard();
    }
  }, [user, authLoading, navigate]);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API}/progress/dashboard`);
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const generateCertificate = async (courseId) => {
    setGenerating(courseId);
    try {
      const response = await axios.post(`${API}/progress/certificate/${courseId}`);
      alert('Certificate generated! You can download it from the Certificates tab.');
      fetchDashboard();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to generate certificate');
    } finally {
      setGenerating(null);
    }
  };

  const downloadCertificate = (certId) => {
    window.open(`${API}/progress/certificate/${certId}/download`, '_blank');
  };

  const exportMyResults = (format) => {
    window.open(`${API}/progress/export/my-results?format=${format}`, '_blank');
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!dashboard) return null;

  const { overall_stats, courses } = dashboard;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <Link 
            to="/coursework" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back to Coursework
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <TrendingUp className="h-8 w-8" />
              My Progress
            </h1>
            <p className="text-white/80 mt-1">Track your learning journey and achievements</p>
          </motion.div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto px-6 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overall_stats.topics_completed}/{overall_stats.total_topics}</p>
                  <p className="text-sm text-slate-500">Topics Done</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overall_stats.courses_completed}/{overall_stats.courses_enrolled}</p>
                  <p className="text-sm text-slate-500">Courses Done</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileQuestion className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overall_stats.quizzes_passed}/{overall_stats.quizzes_taken}</p>
                  <p className="text-sm text-slate-500">Quizzes Passed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overall_stats.average_score}%</p>
                  <p className="text-sm text-slate-500">Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="courses">
          <TabsList className="mb-6">
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen size={16} />
              Course Progress
            </TabsTrigger>
            <TabsTrigger value="certificates" className="gap-2">
              <Award size={16} />
              Certificates
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2">
              <Download size={16} />
              Export
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <div className="space-y-4">
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Collapsible open={expandedCourses[course.id]} onOpenChange={() => toggleCourse(course.id)}>
                    <Card className={`border-2 ${course.is_completed ? 'border-green-200 bg-green-50/30' : 'border-slate-100'}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[course.color]} flex items-center justify-center text-white`}>
                              <BookOpen size={24} />
                            </div>
                            <div>
                              <CardTitle className="text-xl flex items-center gap-2">
                                {course.title}
                                {course.is_completed && (
                                  <Badge className="bg-green-100 text-green-700 gap-1">
                                    <CheckCircle size={12} />
                                    Completed
                                  </Badge>
                                )}
                                {course.certificate_earned && (
                                  <Badge className="bg-amber-100 text-amber-700 gap-1">
                                    <Trophy size={12} />
                                    Certified
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription>
                                {course.completed_topics} of {course.total_topics} topics completed
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-slate-900">{course.progress_percent}%</p>
                              <Progress value={course.progress_percent} className="w-32 h-2" />
                            </div>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm">
                                {expandedCourses[course.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CollapsibleContent>
                        <CardContent className="pt-4 border-t mt-2">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Topics */}
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <BookOpen size={16} />
                                Topics
                              </h4>
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {course.topics.map((topic, idx) => (
                                  <Link 
                                    key={topic.id} 
                                    to={`/coursework/${course.slug}/${topic.slug}`}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                  >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                      topic.completed 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-slate-200 text-slate-600'
                                    }`}>
                                      {topic.completed ? <CheckCircle size={14} /> : idx + 1}
                                    </div>
                                    <span className={`flex-1 ${topic.completed ? 'text-green-700' : 'text-slate-700'}`}>
                                      {topic.title}
                                    </span>
                                    <ExternalLink size={14} className="text-slate-400" />
                                  </Link>
                                ))}
                              </div>
                            </div>

                            {/* Quizzes */}
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <FileQuestion size={16} />
                                Quizzes
                              </h4>
                              {course.quizzes.length === 0 ? (
                                <p className="text-slate-500 text-sm">No quizzes available yet</p>
                              ) : (
                                <div className="space-y-2">
                                  {course.quizzes.map((quiz) => (
                                    <div 
                                      key={quiz.id}
                                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50"
                                    >
                                      <div>
                                        <p className="font-medium text-slate-900">{quiz.title}</p>
                                        <p className="text-xs text-slate-500">
                                          {quiz.attempts}/{quiz.max_attempts} attempts
                                        </p>
                                      </div>
                                      {quiz.best_score !== null ? (
                                        <Badge className={quiz.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                          {quiz.best_score}%
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline">Not taken</Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Certificate Button */}
                          {course.is_completed && !course.certificate_earned && (
                            <div className="mt-4 pt-4 border-t">
                              <Button
                                onClick={() => generateCertificate(course.id)}
                                disabled={generating === course.id}
                                className="gap-2 bg-amber-500 hover:bg-amber-600"
                              >
                                <Award size={18} />
                                {generating === course.id ? 'Generating...' : 'Get Certificate'}
                              </Button>
                            </div>
                          )}
                          
                          {course.certificate_id && (
                            <div className="mt-4 pt-4 border-t">
                              <Button
                                onClick={() => downloadCertificate(course.certificate_id)}
                                variant="outline"
                                className="gap-2"
                              >
                                <Download size={18} />
                                Download Certificate
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.filter(c => c.certificate_earned).map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
                    <CardContent className="pt-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-900">{course.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">Course Completed</p>
                      <Button
                        onClick={() => downloadCertificate(course.certificate_id)}
                        className="mt-4 gap-2"
                      >
                        <Download size={16} />
                        Download PDF
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              {courses.filter(c => c.certificate_earned).length === 0 && (
                <Card className="col-span-full text-center py-12">
                  <CardContent>
                    <Award className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900">No Certificates Yet</h3>
                    <p className="text-slate-500">Complete a course to earn your certificate!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileQuestion size={20} />
                    Quiz Results
                  </CardTitle>
                  <CardDescription>Export all your quiz submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Button onClick={() => exportMyResults('csv')} variant="outline" className="gap-2">
                      <Download size={16} />
                      Export CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award size={20} />
                    Certificates
                  </CardTitle>
                  <CardDescription>Download all earned certificates</CardDescription>
                </CardHeader>
                <CardContent>
                  {courses.filter(c => c.certificate_earned).length > 0 ? (
                    <div className="space-y-2">
                      {courses.filter(c => c.certificate_earned).map((course) => (
                        <Button
                          key={course.id}
                          onClick={() => downloadCertificate(course.certificate_id)}
                          variant="outline"
                          className="w-full justify-start gap-2"
                        >
                          <Download size={16} />
                          {course.title}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No certificates earned yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProgressDashboard;
