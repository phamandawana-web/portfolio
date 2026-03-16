import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Database, GitBranch, Cpu, BookOpen, ArrowRight, Search, GraduationCap, Shield, LogOut, User, FileQuestion, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const iconMap = {
  Database: Database,
  GitBranch: GitBranch,
  Cpu: Cpu
};

const colorMap = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  teal: 'from-teal-500 to-teal-600'
};

const bgColorMap = {
  blue: 'bg-blue-50 border-blue-100 hover:border-blue-200',
  purple: 'bg-purple-50 border-purple-100 hover:border-purple-200',
  teal: 'bg-teal-50 border-teal-100 hover:border-teal-200'
};

const CourseworkHome = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      navigate('/coursework/login');
      return;
    }
    if (user) {
      fetchCourses();
    }
  }, [user, authLoading, navigate]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API}/courses`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/coursework/login');
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await axios.get(`${API}/courses/search/topics?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 py-3 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-slate-600 hover:text-slate-900 text-sm">
            ← Back to Portfolio
          </Link>
          <div className="flex items-center gap-4">
            {/* Progress Dashboard Link */}
            <Link to="/coursework/progress" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
              <TrendingUp size={16} />
              My Progress
            </Link>
            {/* Admin/Instructor Links */}
            {(user.role === 'admin' || user.role === 'instructor') && (
              <Link to="/coursework/admin" className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700">
                <Shield size={16} />
                Admin
              </Link>
            )}
            {/* User Info */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User size={16} />
              <span>{user.username}</span>
              <Badge variant="outline" className="text-xs">
                {user.role}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-600"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium mb-6">
              <GraduationCap size={18} />
              <span>Learning Management System</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome, {user.first_name || user.username}!</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Explore structured course materials, take quizzes, and join discussions
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <Input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12 py-6 text-lg bg-white text-slate-900 border-0 shadow-xl rounded-xl"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Search Results */}
        {searchQuery.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Search Results {searching && <span className="text-sm font-normal text-slate-500">(searching...)</span>}
            </h2>
            {searchResults.length === 0 && !searching ? (
              <p className="text-slate-500">No results found for "{searchQuery}"</p>
            ) : (
              <div className="space-y-4">
                {searchResults.map((result, idx) => (
                  <Link
                    key={idx}
                    to={`/coursework/${result.course?.slug}/${result.topic?.slug}`}
                    className="block"
                  >
                    <Card className="border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`bg-${result.course?.color}-100 text-${result.course?.color}-700`}>
                            {result.course?.title}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{result.topic?.title}</CardTitle>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Courses Grid */}
        {searchQuery.length < 2 && (
          <>
            <motion.h2 
              className="text-3xl font-bold text-slate-900 mb-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Available Courses
            </motion.h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : (
              <motion.div
                className="grid md:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {courses.map((course) => {
                  const IconComponent = iconMap[course.icon] || BookOpen;
                  return (
                    <motion.div key={course.id} variants={itemVariants}>
                      <Link to={`/coursework/${course.slug}`}>
                        <Card className={`h-full border-2 ${bgColorMap[course.color]} shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer`}>
                          <CardHeader>
                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colorMap[course.color]} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                              <IconComponent size={32} />
                            </div>
                            <CardTitle className="text-2xl text-slate-900 group-hover:text-blue-700 transition-colors">
                              {course.title}
                            </CardTitle>
                            <CardDescription className="text-base text-slate-600">
                              {course.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="bg-white">
                                {course.topics?.length || 0} Topics
                              </Badge>
                              <ArrowRight className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseworkHome;
