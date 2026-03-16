import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BookOpen, Users, Clock, CheckCircle, 
  XCircle, Loader2, GraduationCap, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const iconMap = {
  Database: BookOpen,
  GitBranch: BookOpen,
  Cpu: BookOpen
};

const colorMap = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  teal: 'from-teal-500 to-teal-600'
};

const CourseCatalog = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
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
      const response = await axios.get(`${API}/enrollments/available-courses`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    try {
      const response = await axios.post(`${API}/enrollments/enroll/${courseId}`);
      alert(response.data.message);
      fetchCourses();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to enroll');
    } finally {
      setEnrollingId(null);
    }
  };

  const handleUnenroll = async (courseId) => {
    if (!window.confirm('Are you sure you want to unenroll from this course?')) return;
    
    setEnrollingId(courseId);
    try {
      await axios.delete(`${API}/enrollments/unenroll/${courseId}`);
      fetchCourses();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to unenroll');
    } finally {
      setEnrollingId(null);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <Link 
            to="/coursework" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back to My Courses
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <GraduationCap className="h-8 w-8" />
              Course Catalog
            </h1>
            <p className="text-white/80 mt-1">Browse and enroll in available courses</p>
          </motion.div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-6xl mx-auto px-6 -mt-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 py-5 bg-white shadow-lg border-0 rounded-xl"
          />
        </div>
      </div>

      {/* Course Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const IconComponent = iconMap[course.icon] || BookOpen;
            const isEnrolled = course.is_enrolled;
            const isPending = course.enrollment_status === 'pending';
            const isRejected = course.enrollment_status === 'rejected';
            
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`h-full flex flex-col border-2 transition-all ${
                  isEnrolled ? 'border-green-200 bg-green-50/30' :
                  isPending ? 'border-yellow-200 bg-yellow-50/30' :
                  'border-slate-100 hover:border-slate-200 hover:shadow-lg'
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[course.color] || colorMap.blue} flex items-center justify-center text-white`}>
                        <IconComponent size={24} />
                      </div>
                      {isEnrolled && (
                        <Badge className="bg-green-100 text-green-700 gap-1">
                          <CheckCircle size={12} />
                          Enrolled
                        </Badge>
                      )}
                      {isPending && (
                        <Badge className="bg-yellow-100 text-yellow-700 gap-1">
                          <Clock size={12} />
                          Pending
                        </Badge>
                      )}
                      {isRejected && (
                        <Badge className="bg-red-100 text-red-700 gap-1">
                          <XCircle size={12} />
                          Rejected
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="mt-4">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Users size={16} />
                        {course.enrolled_count || 0} enrolled
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={16} />
                        {course.topics_data?.length || 0} topics
                      </span>
                    </div>
                    
                    {isEnrolled ? (
                      <div className="flex gap-2">
                        <Link to={`/coursework/${course.slug}`} className="flex-1">
                          <Button className="w-full">Go to Course</Button>
                        </Link>
                        <Button
                          variant="outline"
                          onClick={() => handleUnenroll(course.id)}
                          disabled={enrollingId === course.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {enrollingId === course.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            'Leave'
                          )}
                        </Button>
                      </div>
                    ) : isPending ? (
                      <Button disabled className="w-full">
                        <Clock size={16} className="mr-2" />
                        Awaiting Approval
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrollingId === course.id}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        {enrollingId === course.id ? (
                          <Loader2 size={16} className="mr-2 animate-spin" />
                        ) : (
                          <GraduationCap size={16} className="mr-2" />
                        )}
                        {isRejected ? 'Request Again' : 'Enroll Now'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">No Courses Found</h3>
              <p className="text-slate-500">Try adjusting your search query</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CourseCatalog;
